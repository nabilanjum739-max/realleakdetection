#!/usr/bin/env python3
"""Geocode towns missing from scripts/freeze-coords.json via the
Open-Meteo geocoding API (free, no key) and append them.

Source of truth for the town list: towns-100.csv. For each missing
town slug it queries "{town}, Texas", keeps only US/Texas results,
and picks the first exact-name match (falling back to the first
Texas result). Prints a review table before writing so the pick can
be eyeballed — ambiguous Texas names (Mission, Portland, Alice,
Canyon, ...) are exactly why the table exists.

Usage:
    python scripts/geocode-freeze-towns.py            # append missing towns
    python scripts/geocode-freeze-towns.py --dry-run  # print picks, write nothing

Stdlib only.
"""
import argparse
import csv
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from common import slugify  # noqa: E402

COORDS_FILE = PROJECT_ROOT / "scripts" / "freeze-coords.json"
TOWNS_CSV = PROJECT_ROOT / "towns-100.csv"
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
UA = {"User-Agent": "realleakdetection-freeze-geocode/1.0"}


def geocode(name: str) -> dict:
    q = urllib.parse.urlencode({"name": f"{name}, Texas", "count": 5, "language": "en", "format": "json"})
    req = urllib.request.Request(f"{GEOCODE_URL}?{q}", headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
    cands = [x for x in data.get("results", [])
             if x.get("country_code") == "US" and x.get("admin1") == "Texas"]
    if not cands:
        raise RuntimeError(f"no Texas geocode result for {name}")
    exact = [x for x in cands if x.get("name", "").lower() == name.lower()]
    pick = exact[0] if exact else cands[0]
    # Keep the vocabulary already used in freeze-coords.json:
    # "first-texas" when the pick is the first Texas result, "exact-name"
    # when a later Texas result matched the name exactly.
    return {
        "name": pick.get("name"),
        "county": pick.get("admin2"),
        "lat": round(pick["latitude"], 4),
        "lon": round(pick["longitude"], 4),
        "geocode_match": "first-texas" if pick is cands[0] else "exact-name",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    coords = json.loads(COORDS_FILE.read_text())
    with open(TOWNS_CSV, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["town"].strip()]

    missing = []
    for r in rows:
        slug = slugify(r["town"])
        if slug not in coords:
            missing.append((slug, r["town"].strip(), r["parent_metro"].strip()))
    print(f"{len(missing)} town(s) missing from freeze-coords.json")
    if not missing:
        return 0

    picks = []
    for slug, town, metro in missing:
        g = geocode(town)
        picks.append((slug, town, metro, g))
        print(f"  {slug:16} {town:16} -> {g['name']} ({g['county']}), "
              f"{g['lat']}, {g['lon']} [{g['geocode_match']}]")
        time.sleep(0.3)

    if args.dry_run:
        print("dry-run: wrote nothing")
        return 0

    for slug, town, metro, g in picks:
        coords[slug] = {
            "town": town,
            "metro": metro,
            "metro_slug": slugify(metro),
            "lat": g["lat"],
            "lon": g["lon"],
            "county": g["county"],
            "timezone": "America/Chicago",
            "geocode_match": g["geocode_match"],
        }
    COORDS_FILE.write_text(json.dumps(coords, indent=1) + "\n", encoding="utf-8")
    print(f"appended {len(picks)} towns; freeze-coords.json now has {len(coords)} towns")
    return 0


if __name__ == "__main__":
    sys.exit(main())
