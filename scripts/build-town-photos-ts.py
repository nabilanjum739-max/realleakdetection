#!/usr/bin/env python3
"""Generate site/lib/town-photos.ts from the researched town CSVs.

STREET_VIEW: first named neighbourhood per town (the Street View embed
slot on the town page). Towns with no named neighbourhood get NO entry —
the template renders no slot for them. Neighbourhoods are taken verbatim
from research-csvs/*-towns.csv; nothing is invented.

COMMONS_PHOTOS: starts EMPTY ({}). A separate audit agent fills it with
verified Wikimedia Commons photos (url, title, author, licence,
sourceUrl) — one entry per town only where a verified, usable photo
exists. Never fill it from a guess.

Usage:
    python scripts/build-town-photos-ts.py [--commons-json PATH]
Regenerates site/lib/town-photos.ts in place. Slugs are cross-checked
against site/lib/towns.ts; mismatches are reported, not silently added.
With --commons-json, COMMONS_PHOTOS is populated from the audit file
(goal files/commons-audit-2026-11-16.json): TIFF originals use the JPEG
thumbUrl; titles come from the file title (never the long description).
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import PROJECT_ROOT, slugify

CSV_DIR = PROJECT_ROOT / "research-csvs"
OUT = PROJECT_ROOT / "site" / "lib" / "town-photos.ts"


NAME_RE = re.compile(r"^[A-Z][A-Za-z'&.-]*( [A-Z][A-Za-z'&.-]*)*$")
BANNED_SUBSTRINGS = (
    "UNVERIFIED", "generic area name", "no verified", "homes on",
    "homes near", "is the town", "along", "older core", "residential streets",
)


def _is_name(part: str) -> bool:
    """A clean neighbourhood name: short, Title Case words only, no
    prose, parentheses, or research-gap notes. Descriptive fragments
    ("Downtown X along US 87", "homes on the ... grid") are NOT names —
    the rows that carry them explicitly say no named subdivision was
    verified, so those towns get no entry."""
    if not part or len(part.split()) > 4:
        return False
    if any(b.lower() in part.lower() for b in BANNED_SUBSTRINGS):
        return False
    if any(c in part for c in "().;"):
        return False
    return bool(NAME_RE.match(part))


def first_neighbourhood(raw: str) -> str | None:
    if not raw:
        return None
    # Neighbourhoods are comma-separated; some rows use semicolons.
    # Try each part in order and take the first one that is a clean name.
    parts = [p.strip() for p in re.split(r"[,;]", raw)]
    for part in parts:
        if _is_name(part):
            return part
    return None


def _clean_url(u: str) -> str:
    """Strip tracking query strings from a Wikimedia URL."""
    parts = urlsplit(u)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def _title_from_file(file_title: str) -> str:
    """Short caption title from a Commons file title: strip the 'File:'
    prefix and extension, underscores to spaces."""
    t = file_title.strip()
    if t.lower().startswith("file:"):
        t = t[5:]
    t = re.sub(r"\.[A-Za-z0-9]+$", "", t)
    return t.replace("_", " ").strip()


def load_commons(path: Path, known: set[str]) -> tuple[dict[str, dict[str, str]], list[str]]:
    """Read the Commons audit JSON; return (entries, warnings). TIFF
    originals use the JPEG thumbUrl for web use."""
    audit = json.loads(path.read_text())
    towns = audit.get("towns", {})
    entries: dict[str, dict[str, str]] = {}
    warnings: list[str] = []
    for slug in sorted(towns):
        rec = towns[slug]
        if rec is None:
            continue
        if slug not in known:
            warnings.append(f"commons slug not in towns.ts (skipped): {slug}")
            continue
        url = _clean_url(rec.get("imageUrl", ""))
        if re.search(r"\.tiff?$", url, re.IGNORECASE):
            url = _clean_url(rec.get("thumbUrl", "") or url)
        if not url:
            warnings.append(f"commons {slug}: no usable URL (skipped)")
            continue
        entries[slug] = {
            "url": url,
            "title": _title_from_file(rec.get("fileTitle", slug)),
            "author": rec.get("author", "Unknown"),
            "licence": rec.get("licence", "Unknown"),
            "sourceUrl": rec.get("filePageUrl", ""),
        }
    return entries, warnings


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--commons-json", default=None,
                    help="Wikimedia Commons audit JSON to populate COMMONS_PHOTOS")
    args = ap.parse_args()

    # Known town slugs (towns.ts is the authority for URL slugs).
    towns_ts = (PROJECT_ROOT / "site" / "lib" / "towns.ts").read_text()
    known = set(re.findall(r"townSlug: '([a-z0-9-]+)'", towns_ts))

    street_view: dict[str, dict[str, str]] = {}
    seen_towns: dict[str, str] = {}
    no_hood: list[str] = []
    unknown_slugs: list[str] = []
    for csv_path in sorted(CSV_DIR.glob("*-towns.csv")):
        with open(csv_path, newline="") as f:
            for row in csv.DictReader(f):
                town = (row.get("town") or "").strip()
                if not town:
                    continue
                slug = slugify(town)
                seen_towns[slug] = town
                hood = first_neighbourhood(row.get("neighborhoods") or "")
                if not hood:
                    no_hood.append(town)
                    continue
                if slug not in known:
                    unknown_slugs.append(f"{town} ({slug})")
                    continue
                street_view[slug] = {"neighborhood": hood}

    lines = [
        "/**",
        " * Per-town photo data — GENERATED, do not edit by hand.",
        " * Regenerate: python scripts/build-town-photos-ts.py [--commons-json PATH]",
        " *",
        " * STREET_VIEW: first named neighbourhood per town, taken verbatim",
        " * from research-csvs/*-towns.csv. The town template embeds a live",
        " * Google Street View panorama of that neighbourhood (no API key:",
        " * the basic maps embed). Towns with no named neighbourhood get NO",
        " * entry here, and the template renders no Street View slot for them.",
        " *",
        " * COMMONS_PHOTOS: verified Wikimedia Commons photos, one entry per",
        " * town where a usable photo exists (from the audit JSON passed via",
        " * --commons-json). Titles come from the file title; TIFF originals",
        " * use the JPEG thumbUrl. Never fill it from a guess, and never",
        " * substitute a stock photo of another town.",
        " */",
        "",
        "export interface StreetViewEntry {",
        "  neighborhood: string;",
        "}",
        "",
        "export const STREET_VIEW: Record<string, StreetViewEntry> = {",
    ]
    for slug in sorted(street_view):
        hood = street_view[slug]["neighborhood"].replace("\\", "\\\\").replace("'", "\\'")
        lines.append(f"  '{slug}': {{ neighborhood: '{hood}' }},")
    lines += [
        "};",
        "",
        "export interface CommonsPhoto {",
        "  url: string;",
        "  title: string;",
        "  author: string;",
        "  licence: string;",
        "  sourceUrl: string;",
        "}",
        "",
    ]
    commons: dict[str, dict[str, str]] = {}
    commons_warnings: list[str] = []
    if args.commons_json:
        commons, commons_warnings = load_commons(Path(args.commons_json), known)
    lines.append("export const COMMONS_PHOTOS: Record<string, CommonsPhoto> = {")
    for slug in sorted(commons):
        e = commons[slug]
        esc = lambda s: s.replace("\\", "\\\\").replace("'", "\\'")
        lines.append(
            f"  '{slug}': {{ url: '{esc(e['url'])}', title: '{esc(e['title'])}', "
            f"author: '{esc(e['author'])}', licence: '{esc(e['licence'])}', "
            f"sourceUrl: '{esc(e['sourceUrl'])}' }},"
        )
    lines.append("};")
    lines.append("")
    OUT.write_text("\n".join(lines))
    print(f"wrote {OUT}: {len(street_view)} STREET_VIEW entries, "
          f"{len(commons)} COMMONS_PHOTOS")
    if commons_warnings:
        for w in commons_warnings:
            print(f"WARNING — {w}")
    if no_hood:
        print(f"towns with no named neighbourhood (no entry): {no_hood}")
    if unknown_slugs:
        print(f"WARNING — slugs not in site/lib/towns.ts (skipped): {unknown_slugs}")
    missing = sorted(known - set(seen_towns))
    if missing:
        print(f"WARNING — towns.ts slugs with no research CSV row: {missing}")


if __name__ == "__main__":
    main()
