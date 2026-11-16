#!/usr/bin/env python3
"""Regenerate site/lib/towns.ts from towns-100.csv.

Usage:
    python scripts/build-towns-ts.py

The CSV is the skeleton town list (town, parent_metro, state — the
15 research columns stay blank here; the researched data lives in
research-csvs/*-towns.csv and is imported into Supabase separately).
Slugs use scripts/common.py:slugify, so towns.ts slugs always match
the research CSVs and the Supabase town_slug values.

Stdlib only. Run from the workspace root.
"""
import csv
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from common import slugify  # noqa: E402

CSV_PATH = PROJECT_ROOT / "towns-100.csv"
OUT_PATH = PROJECT_ROOT / "site" / "lib" / "towns.ts"


def main() -> int:
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["town"].strip()]

    seen: set[str] = set()
    lines = [
        "// Generated from towns-100.csv — do not edit by hand.",
        "// Regenerate: python scripts/build-towns-ts.py",
        "export interface TownRef { town: string; metro: string; townSlug: string; metroSlug: string; }",
        "export const TOWNS: TownRef[] = [",
    ]
    for r in rows:
        town = r["town"].strip()
        metro = r["parent_metro"].strip()
        town_slug = slugify(town)
        metro_slug = slugify(metro)
        if town_slug in seen:
            print(f"ERROR: duplicate town slug {town_slug}")
            return 1
        seen.add(town_slug)
        lines.append(
            f"  {{ town: '{town}', metro: '{metro}', "
            f"townSlug: '{town_slug}', metroSlug: '{metro_slug}' }},"
        )
    lines.append("];")
    lines.append("export const METROS = [...new Set(TOWNS.map(t => t.metroSlug))];")
    OUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {OUT_PATH} ({len(rows)} towns, {len(set(slugify(r['parent_metro']) for r in rows))} metros)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
