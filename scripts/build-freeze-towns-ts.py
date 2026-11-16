#!/usr/bin/env python3
"""Regenerate site/lib/freeze-towns.ts from scripts/freeze-coords.json.

Order follows towns-100.csv (not the JSON's insertion order), so the
list matches site/lib/towns.ts. Coordinates come from the Open-Meteo
geocoding API — see scripts/geocode-freeze-towns.py for how new towns
are added to freeze-coords.json.

Usage:
    python scripts/build-freeze-towns-ts.py

Stdlib only. Run from the workspace root.
"""
import csv
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from common import slugify  # noqa: E402

COORDS_FILE = PROJECT_ROOT / "scripts" / "freeze-coords.json"
TOWNS_CSV = PROJECT_ROOT / "towns-100.csv"
OUT_PATH = PROJECT_ROOT / "site" / "lib" / "freeze-towns.ts"


def main() -> int:
    coords = json.loads(COORDS_FILE.read_text())
    with open(TOWNS_CSV, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["town"].strip()]

    missing = [slugify(r["town"]) for r in rows if slugify(r["town"]) not in coords]
    if missing:
        print(f"ERROR: {len(missing)} town(s) missing from freeze-coords.json: {', '.join(missing)}")
        print("Run: python scripts/geocode-freeze-towns.py")
        return 1

    lines = [
        "// Generated from scripts/freeze-coords.json — do not edit by hand.",
        "// Open-Meteo geocoding API (free, no key), verified Texas results, Nov 2026.",
        "// Regenerate: python scripts/build-freeze-towns-ts.py",
        "export interface FreezeTown { slug: string; town: string; metro: string; metroSlug: string; lat: number; lon: number; }",
        "",
        "export const FREEZE_TOWNS: FreezeTown[] = [",
    ]
    for r in rows:
        slug = slugify(r["town"])
        c = coords[slug]
        lines.append(
            f"  {{ slug: '{slug}', town: '{c['town']}', metro: '{c['metro']}', "
            f"metroSlug: '{c['metro_slug']}', lat: {c['lat']}, lon: {c['lon']} }},"
        )
    lines.append("];")
    OUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {OUT_PATH} ({len(rows)} towns)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
