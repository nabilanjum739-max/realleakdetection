#!/usr/bin/env python3
"""Mark a town page as published. Runs ONLY as the final step of the
GitHub Action, after validate.py has passed (a failing gate stops
the job before this ever runs).

Usage:
    python scripts/mark-published.py --metro houston --town katy
"""
import argparse

from common import get_supabase, get_town_row


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--metro", required=True)
    ap.add_argument("--town", required=True)
    args = ap.parse_args()

    sb = get_supabase()
    row = get_town_row(sb, args.metro, args.town)
    if row.get("page_status") != "validated":
        print(f"note: page_status is '{row.get('page_status')}', "
              "expected 'validated' — publishing anyway (gate passed)")
    sb.table("towns").update({"page_status": "published"}) \
        .eq("id", row["id"]).execute()
    print(f"published {row['town']} ({args.metro})")


if __name__ == "__main__":
    main()
