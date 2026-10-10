#!/usr/bin/env python3
"""Load the 5 researched batch CSVs into the Supabase `towns` table.

Usage:
    python scripts/import-csv.py [--dir .]

Finds houston-batch1-towns.csv, dallas-batch2-towns.csv,
sanantonio-batch3-towns.csv, austin-batch4-towns.csv,
fortworth-batch5-towns.csv in the project root and upserts each row
(matched on metro_slug + town_slug). Verified research fields are
never blanked by a re-import: empty CSV cells do not overwrite
existing non-empty values.
"""
import argparse
import csv
import glob
import os

from common import PROJECT_ROOT, RESEARCH_COLUMNS, get_supabase, slugify


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=str(PROJECT_ROOT),
                    help="directory containing *-towns.csv files")
    args = ap.parse_args()

    sb = get_supabase()
    files = sorted(glob.glob(os.path.join(args.dir, "*-towns.csv")))
    if not files:
        raise SystemExit(f"No *-towns.csv files found in {args.dir}")

    total = 0
    for path in files:
        with open(path, newline="", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        for r in rows:
            town, metro = r["town"].strip(), r["parent_metro"].strip()
            record = {
                "town": town,
                "parent_metro": metro,
                "state": (r.get("state") or "TX").strip(),
                "town_slug": slugify(town),
                "metro_slug": slugify(metro),
            }
            for col in RESEARCH_COLUMNS:
                if col in ("town", "parent_metro", "state"):
                    continue
                val = (r.get(col) or "").strip()
                if val:  # never overwrite a verified value with a blank
                    record[col] = val
            sb.table("towns").upsert(
                record, on_conflict="metro_slug,town_slug").execute()
            total += 1
        print(f"imported {len(rows)} towns from {os.path.basename(path)}")
    print(f"done: {total} town rows upserted")


if __name__ == "__main__":
    main()
