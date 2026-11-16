#!/usr/bin/env python3
"""Nightly freeze-risk forecast for all 50 towns.

Fetches the Open-Meteo forecast (free, no API key) for every town in
scripts/freeze-coords.json, computes tonight's pipe freeze-burst risk
(18:00 today -> 09:00 tomorrow, America/Chicago), and writes
public/data/freeze-risk.json, which the FreezeRiskTonight tool reads.

Risk bands (published on the tool page — keep in sync with
site/components/FreezeRiskTonight.tsx):
  low   — no hours below 32F tonight
  watch — below 32F but above 28F, and fewer than 4 hours below freezing
  high  — 28F or below, OR 4+ hours below 32F
  hard freeze flag — low at or below 20F (Univ. of Illinois Building
  Research Council, 1996, pipe-freeze alert threshold).

The workflow commits the JSON back to the repo; the tool prefers it
when its forecast_date is today (America/Chicago) and falls back to a
live client-side Open-Meteo fetch when stale or missing.

Fails loudly: if more than 5 towns fail, exit non-zero so the workflow
goes red instead of silently publishing a partial file. Stdlib only.
"""
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

PROJECT_ROOT = Path(__file__).resolve().parent.parent
COORDS_FILE = PROJECT_ROOT / "scripts" / "freeze-coords.json"
DEFAULT_OUT = PROJECT_ROOT / "public" / "data" / "freeze-risk.json"
CT = ZoneInfo("America/Chicago")
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
UA = {"User-Agent": "realleakdetection-freeze-risk/1.0 (nightly forecast refresh)"}
MAX_FAILED_TOWNS = 5
BATCH = 10


def band(low_f, freeze_hours):
    """Shared with FreezeRiskTonight.tsx — change both together."""
    if freeze_hours == 0:
        return "low"
    if low_f is not None and low_f > 28 and freeze_hours < 4:
        return "watch"
    return "high"


def tonight_window(now_ct):
    """Tonight = 18:00 today -> 09:00 tomorrow, America/Chicago."""
    start = now_ct.replace(hour=18, minute=0, second=0, microsecond=0)
    end = (now_ct + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    return start, end


def assess(times, temps, start, end):
    """Hourly (time, tempF) -> tonight's risk numbers. Window is inclusive."""
    window = [(t, v) for t, v in zip(times, temps)
              if v is not None and start <= t <= end]
    if len(window) < 12:
        raise ValueError(f"only {len(window)} hourly readings in tonight's window")
    vals = [v for _, v in window]
    low = min(vals)
    freeze_hours = sum(1 for v in vals if v < 32)
    hard_hours = sum(1 for v in vals if v <= 20)
    return {
        "low_f": round(low, 1),
        "freeze_hours": freeze_hours,
        "hard_freeze_hours": hard_hours,
        "hard_freeze": low <= 20,
        "band": band(low, freeze_hours),
        "readings": len(window),
    }


def fetch_json(url, attempts=3):
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"fetch failed after {attempts} attempts: {url} ({last})")


def fetch_forecast_batch(items):
    """items: list of (slug, lat, lon). Returns {slug: hourly dict}."""
    lats = ",".join(str(lat) for _, lat, _ in items)
    lons = ",".join(str(lon) for _, _, lon in items)
    q = urllib.parse.urlencode({
        "latitude": lats, "longitude": lons,
        "hourly": "temperature_2m", "forecast_days": 2,
        "temperature_unit": "fahrenheit", "timezone": "America/Chicago",
    })
    data = fetch_json(f"{FORECAST_URL}?{q}")
    results = data if isinstance(data, list) else [data]
    if len(results) != len(items):
        raise RuntimeError(f"forecast returned {len(results)} locations for {len(items)} towns")
    return {slug: res.get("hourly", {}) for (slug, _, _), res in zip(items, results)}


def geocode_town(name):
    """Open-Meteo geocoding fallback for a town missing from the cache."""
    q = urllib.parse.urlencode({"name": f"{name}, Texas", "count": 5, "language": "en", "format": "json"})
    data = fetch_json(f"{GEOCODE_URL}?{q}")
    cands = [r for r in data.get("results", [])
             if r.get("country_code") == "US" and r.get("admin1") == "Texas"]
    if not cands:
        raise RuntimeError(f"no Texas geocode result for {name}")
    return round(cands[0]["latitude"], 4), round(cands[0]["longitude"], 4)


def main():
    out_path = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else DEFAULT_OUT
    coords = json.loads(COORDS_FILE.read_text())
    now_ct = datetime.now(CT)
    start, end = tonight_window(now_ct)
    forecast_date = start.strftime("%Y-%m-%d")

    towns = {}
    failed = []
    slugs = sorted(coords)
    for i in range(0, len(slugs), BATCH):
        batch = [(s, coords[s]["lat"], coords[s]["lon"]) for s in slugs[i:i + BATCH]]
        try:
            hourly = fetch_forecast_batch(batch)
        except Exception as e:
            print(f"  batch {i // BATCH + 1} failed: {e}")
            failed.extend(s for s, _, _ in batch)
            continue
        for slug, lat, lon in batch:
            try:
                h = hourly[slug]
                times = [datetime.fromisoformat(t).replace(tzinfo=CT) for t in h["time"]]
                res = assess(times, h["temperature_2m"], start, end)
                towns[slug] = {
                    "town": coords[slug]["town"],
                    "metro": coords[slug]["metro"],
                    **res,
                }
            except Exception as e:
                print(f"  {slug} failed: {e}")
                failed.append(slug)
        time.sleep(0.5)

    print(f"towns updated: {len(towns)} / {len(slugs)}; failed: {failed or 'none'}")
    if len(failed) > MAX_FAILED_TOWNS:
        print(f"ERROR: {len(failed)} towns failed (limit {MAX_FAILED_TOWNS}) — not writing partial file")
        return 1

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "forecast_date": forecast_date,
        "forecast_night": f"Night of {start.strftime('%b %-d, %Y')} (6pm-9am Central)",
        "source": "Open-Meteo forecast API (https://open-meteo.com)",
        "timezone": "America/Chicago",
        "window": "18:00-09:00 local, inclusive",
        "towns": towns,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {out_path} ({len(towns)} towns, night of {forecast_date})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
