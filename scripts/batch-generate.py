#!/usr/bin/env python3
"""Batch-generate town pages, sequentially, one town at a time.

Loops over Supabase `towns` rows for the selected metros whose
page_status is NOT validated/published and runs the SAME steps as
the single-town generate.yml for each, in the same order:
    generate.py -> validate.py -> mark validated
    -> render-visuals.py -> mark-published.py

Design for the Groq free tier: towns run SEQUENTIALLY in one job
(no parallel matrix) with a pause between towns. A per-town failure
never kills the batch — it is logged, the batch continues, and the
run ends with a summary (succeeded count + every failed town with
the step that failed) so failures can be re-run individually.

Usage (from the repo root; env SUPABASE_URL / SUPABASE_SERVICE_KEY /
GROQ_API_KEY must be set — the generate-all-towns workflow sets them):
    python scripts/batch-generate.py --metros all
    python scripts/batch-generate.py --metros houston,el-paso
    python scripts/batch-generate.py --metros el-paso --town socorro
    python scripts/batch-generate.py --metros all --dry-run   # list only, no Supabase writes
    python scripts/batch-generate.py --summarize              # print batch-summary.json, exit 1 if failures

Writes batch-summary.json in the repo root. Exit code: 0 when every
town succeeded, 1 when any town failed (the workflow's summary step
runs with `if: always()` so the summary is printed either way).
Stdlib only, apart from the pipeline scripts it shells out to.
"""
import argparse
import csv
import json
import os
import subprocess
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

SUMMARY_PATH = PROJECT_ROOT / "batch-summary.json"
TOWNS_CSV = PROJECT_ROOT / "towns-100.csv"

# Steps mirror .github/workflows/generate.yml, in the same order.
# Each step is (label, argv) — argv is built per town.
STEP_LABELS = ["generate", "validate", "mark-validated", "render-visuals", "mark-published"]


def step_argv(step: str, metro: str, town: str) -> list[str]:
    if step == "generate":
        return [sys.executable, "scripts/generate.py", "--metro", metro, "--town", town]
    if step == "validate":
        return [sys.executable, "scripts/validate.py", "--metro", metro, "--town", town]
    if step == "mark-validated":
        return [sys.executable, "-c",
                "import sys; sys.path.insert(0, 'scripts'); "
                "from common import get_supabase, get_town_row; "
                f"sb = get_supabase(); row = get_town_row(sb, '{metro}', '{town}'); "
                "sb.table('towns').update({'page_status': 'validated'}).eq('id', row['id']).execute(); "
                f"print('validated {metro}/{town}')"]
    if step == "render-visuals":
        return [sys.executable, "scripts/render-visuals.py", "--metro", metro, "--town", town]
    if step == "mark-published":
        return [sys.executable, "scripts/mark-published.py", "--metro", metro, "--town", town]
    raise ValueError(step)


def all_metros() -> list[str]:
    with open(TOWNS_CSV, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["town"].strip()]
    sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
    from common import slugify
    seen: list[str] = []
    for r in rows:
        m = slugify(r["parent_metro"])
        if m not in seen:
            seen.append(m)
    return seen


def parse_metros(raw: str) -> list[str]:
    raw = (raw or "all").strip().lower()
    if raw == "all":
        return all_metros()
    metros = [m.strip() for m in raw.split(",") if m.strip()]
    known = set(all_metros())
    unknown = [m for m in metros if m not in known]
    if unknown:
        raise ValueError(f"unknown metro slug(s): {', '.join(unknown)} (known: {', '.join(sorted(known))})")
    return metros


def pending_towns(metros: list[str], town: str) -> list[dict]:
    """Supabase rows for the metros whose page_status is not validated/published."""
    from common import get_supabase
    sb = get_supabase()
    res = sb.table("towns").select("metro_slug,town_slug,town,page_status").execute()
    rows = [r for r in (res.data or []) if r.get("metro_slug") in metros]
    if town:
        rows = [r for r in rows if r.get("town_slug") == town]
    pending = [r for r in rows if r.get("page_status") not in ("validated", "published")]
    return sorted(pending, key=lambda r: (r.get("metro_slug", ""), r.get("town_slug", "")))


def dry_run_towns(metros: list[str], town: str) -> list[dict]:
    """Same selection as pending_towns but from towns-100.csv (no Supabase)."""
    with open(TOWNS_CSV, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["town"].strip()]
    from common import slugify
    out = []
    for r in rows:
        m, t = slugify(r["parent_metro"]), slugify(r["town"])
        if m not in metros:
            continue
        if town and t != town:
            continue
        out.append({"metro_slug": m, "town_slug": t, "town": r["town"].strip(), "page_status": "unknown (dry-run)"})
    return sorted(out, key=lambda r: (r["metro_slug"], r["town_slug"]))


def run_step(step: str, metro: str, town: str) -> tuple[bool, str]:
    argv = step_argv(step, metro, town)
    proc = subprocess.run(argv, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=1800)
    tail = (proc.stdout + proc.stderr).strip().splitlines()[-3:]
    return proc.returncode == 0, " | ".join(tail)


def write_summary(succeeded: list[dict], failed: list[dict]) -> None:
    payload = {
        "succeeded": [{"metro": s["metro_slug"], "town": s["town_slug"]} for s in succeeded],
        "failed": [{"metro": f["metro_slug"], "town": f["town_slug"], "step": f["step"], "detail": f["detail"]} for f in failed],
        "succeeded_count": len(succeeded),
        "failed_count": len(failed),
    }
    SUMMARY_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def print_summary() -> int:
    if not SUMMARY_PATH.exists():
        print("no batch-summary.json found — did the batch step run?")
        return 1
    data = json.loads(SUMMARY_PATH.read_text())
    lines = [f"## Batch generate summary",
             f"Succeeded: **{data['succeeded_count']}** · Failed: **{data['failed_count']}**", ""]
    if data["failed"]:
        lines.append("| metro | town | failed step | detail |")
        lines.append("|---|---|---|---|")
        for f in data["failed"]:
            lines.append(f"| {f['metro']} | {f['town']} | {f['step']} | {f['detail'][:160]} |")
        lines.append("")
        lines.append("Re-run failures individually with the generate-town-page workflow.")
    else:
        lines.append("All towns generated and published.")
    text = "\n".join(lines)
    print(text)
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "a", encoding="utf-8") as f:
            f.write(text + "\n")
    return 1 if data["failed_count"] else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--metros", default="all",
                    help="'all' or comma-separated metro slugs")
    ap.add_argument("--town", default="",
                    help="optional single town slug (empty = all towns in the metros)")
    ap.add_argument("--sleep", type=int, default=15,
                    help="seconds to pause between towns (Groq free-tier pacing)")
    ap.add_argument("--dry-run", action="store_true",
                    help="list the towns that would be processed; run nothing")
    ap.add_argument("--summarize", action="store_true",
                    help="print batch-summary.json and exit 1 if any town failed")
    args = ap.parse_args()

    if args.summarize:
        return print_summary()

    try:
        metros = parse_metros(args.metros)
    except ValueError as e:
        print(f"ERROR: {e}")
        return 2

    if args.dry_run:
        towns = dry_run_towns(metros, args.town)
        print(f"dry-run: {len(towns)} town(s) selected in metros {', '.join(metros)}")
        for t in towns:
            print(f"  {t['metro_slug']}/{t['town_slug']} ({t['town']})")
        return 0

    towns = pending_towns(metros, args.town)
    print(f"batch: {len(towns)} town(s) pending in metros {', '.join(metros)}"
          + (f" (town filter: {args.town})" if args.town else ""))
    if not towns:
        write_summary([], [])
        print("nothing to generate — all selected towns are already validated/published.")
        return 0

    succeeded, failed = [], []
    for i, t in enumerate(towns):
        metro, town = t["metro_slug"], t["town_slug"]
        print(f"\n[{i + 1}/{len(towns)}] {metro}/{town} ...", flush=True)
        ok_town = True
        for step in STEP_LABELS:
            ok, detail = run_step(step, metro, town)
            print(f"  {step}: {'OK' if ok else 'FAILED'}", flush=True)
            if not ok:
                print(f"    {detail}", flush=True)
                failed.append({"metro_slug": metro, "town_slug": town, "step": step, "detail": detail})
                ok_town = False
                break
        if ok_town:
            succeeded.append(t)
        if i < len(towns) - 1:
            time.sleep(args.sleep)

    write_summary(succeeded, failed)
    print(f"\nbatch done: {len(succeeded)} succeeded, {len(failed)} failed")
    for f in failed:
        print(f"  FAILED {f['metro_slug']}/{f['town_slug']} at step {f['step']}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
