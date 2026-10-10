#!/usr/bin/env python3
"""STEP 0 — enrich town rows with TRUE figures from free public APIs.

For each town (or one town via --metro/--town):
  1. Census Geocoder  -> lat/lon (+ Census place FIPS code)
  2. Open-Meteo archive -> annual rainfall (in), freeze days/yr,
     days over 100F/yr  (trailing 365 days, fahrenheit/inches)
  3. US Census API (ACS 5-year) -> median year structure built
     (B25035_001E) + % homes built pre-1980 (B25034 buckets)
  4. USDA Soil Data Access -> dominant soil / clay %   [STUB — see below]
  5. EPA Envirofacts (SDWIS) -> public water systems  [STUB — see below]

Writes ONLY to the enrichment columns. Never overwrites a
human-verified research field: if the EPA water system conflicts with
the researched `water_utility`, the human value wins and the conflict
is printed + stored in the omission_log JSON under "_conflicts".

Usage:
    python scripts/enrich.py [--metro houston] [--town katy]
"""
import argparse
import datetime as dt
import sys

import requests

from common import get_supabase, get_town_row

UA = {"User-Agent": "leak-detection-seo-pipeline/1.0 (research enrichment)"}

# ---------------------------------------------------------------- USDA stub
def usda_soil(lat: float, lon: float) -> dict:
    """STUB — USDA Soil Data Access (most technical of the free APIs).

    Exact query pattern (works today, needs a SOAP envelope):
      Endpoint: POST https://sdmdataaccess.sc.egov.usda.gov/Tabular/SDMTabularService.asmx
      Action:   RunQuery
      Body:     <RunQuery xmlns="http://SDMDataAccess.nrcs.usda.gov/Tabular/">
                  <Query>SELECT TOP 1 c.compname, c.claytotal_r
                         FROM component c
                         JOIN mapunit mu ON mu.mukey = c.mukey
                         WHERE mu.mukey IN (
                           SELECT mukey FROM SDA_Get_Mukey_from_LatLon(?, ?)
                         ) ORDER BY c.comppct_r DESC</Query>
                </RunQuery>
      (SDA_Get_Mukey_from_LatLon is available via the spatial service:
       https://sdmdataaccess.sc.egov.usda.gov/Spatial/SDMNAD83UTM.wfs —
       or pre-resolve mukey with the "SDA_Get_Mukey_from_LatLonWGS84"
       table-valued function.)

    TODO: implement when the pipeline needs clay % per town. The
    researched `soil_type` field already covers the copy angle; this
    only adds a numeric clay % for the infographic.
    """
    raise NotImplementedError(
        "USDA Soil Data Access not implemented yet — see docstring for "
        "the exact RunQuery pattern. soil_type research field is used instead."
    )

# ---------------------------------------------------------------- EPA stub
def epa_water_systems(lat: float, lon: float) -> list:
    """STUB — EPA Envirofacts SDWIS (public water systems near a point).

    Exact query pattern:
      GET https://data.epa.gov/dmapservice/sdwis/PWS
          ?p_lat={lat}&p_long={lon}&p_radius=10
      (radius in miles; returns JSON rows with PWS_NAME, PWSID, etc.)
    Docs: https://www.epa.gov/enviro/web-services  ("SDWIS" service)

    TODO: implement to cross-check `water_utility`. Keep the
    human-verified value on conflict (log it) — a nearby system is
    not proof it serves the town.
    """
    raise NotImplementedError(
        "EPA Envirofacts not implemented yet — see docstring for the "
        "exact dmapservice pattern. water_utility research field is used."
    )

# ---------------------------------------------------------------- 1. geocode
# NOTE: the Census Geocoder "onelineaddress" endpoint is for STREET
# addresses — "Katy, TX" returns zero matches. For place names we use
# the Census place gazetteer (every incorporated place + CDP in Texas,
# with lat/lon + GEOID), falling back to Nominatim for unincorporated
# communities like Cypress.
_GAZETTEER_URL = ("https://www2.census.gov/geo/docs/maps-data/data/"
                  "gazetteer/2023_Gazetteer/2023_gaz_place_48.txt")
_gaz_cache = None


def _load_gazetteer() -> dict:
    """Texas place gazetteer -> {'katy': {lat, lon, place_fips}, ...}."""
    global _gaz_cache
    if _gaz_cache is None:
        r = requests.get(_GAZETTEER_URL, headers=UA, timeout=60)
        r.raise_for_status()
        lines = r.text.splitlines()
        cols = lines[0].split("\t")
        idx = {h.strip(): i for i, h in enumerate(cols)}
        places = {}
        for line in lines[1:]:
            parts = line.split("\t")
            # "Katy city, Texas" -> "katy"; "The Woodlands CDP, Texas"
            # -> "the woodlands"
            short = parts[idx["NAME"]].split(",")[0].strip().lower()
            for suffix in (" city", " town", " village", " cdp"):
                if short.endswith(suffix):
                    short = short[: -len(suffix)]
                    break
            geoid = parts[idx["GEOID"]]
            places[short] = {
                "lat": float(parts[idx["INTPTLAT"]]),
                "lon": float(parts[idx["INTPTLONG"]]),
                "place_fips": geoid[2:],  # drop 2-digit state prefix
            }
        _gaz_cache = places
    return _gaz_cache


def _nominatim(town: str, state: str = "TX") -> dict | None:
    """Fallback geocoder for unincorporated communities (no place FIPS)."""
    import time
    time.sleep(1)  # Nominatim usage policy: max 1 req/sec
    r = requests.get("https://nominatim.openstreetmap.org/search", params={
        "q": f"{town}, {state}, USA", "format": "json", "limit": 1,
    }, headers=UA, timeout=30)
    r.raise_for_status()
    data = r.json()
    if not data:
        return None
    return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"]),
            "place_fips": None}


def geocode(town: str, state: str = "TX"):
    """'Katy' -> (lat, lon, place_fips). Gazetteer first, Nominatim fallback."""
    hit = _load_gazetteer().get(town.strip().lower())
    if hit:
        return hit
    try:
        return _nominatim(town, state)
    except Exception:
        return None

# ---------------------------------------------------------------- 2. climate
def climate(lat: float, lon: float) -> dict:
    """Open-Meteo archive: trailing-365-day rainfall, freeze days, 100F+ days."""
    end = dt.date.today() - dt.timedelta(days=2)  # archive lags ~2 days
    start = end - dt.timedelta(days=364)
    r = requests.get("https://archive-api.open-meteo.com/v1/archive", params={
        "latitude": lat, "longitude": lon,
        "start_date": start.isoformat(), "end_date": end.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "temperature_unit": "fahrenheit", "precipitation_unit": "inch",
        "timezone": "auto",
    }, headers=UA, timeout=60)
    r.raise_for_status()
    d = r.json()["daily"]
    rain = sum(x or 0 for x in d["precipitation_sum"])
    freeze = sum(1 for x in d["temperature_2m_min"] if x is not None and x < 32)
    hot = sum(1 for x in d["temperature_2m_max"] if x is not None and x > 100)
    return {"rainfall_annual_in": round(rain, 1),
            "freeze_days_per_year": freeze, "days_over_100f": hot}

# ---------------------------------------------------------------- 3. census
B25034_PRE1980 = ["B25034_008E", "B25034_009E", "B25034_010E",
                  "B25034_011E", "B25034_012E"]  # 1970s, 60s, 50s, 40s, pre-1940

def census_housing(state_fips: str, place_fips: str) -> dict | None:
    """ACS 5-year: median year built (B25035) + pre-1980 share (B25034).

    The Census API now requires a free key (api.census.gov/data/key_signup.html).
    Without CENSUS_API_KEY the API 302-redirects to missing_key.html.
    """
    import os
    fields = ["NAME", "B25035_001E", "B25034_001E"] + B25034_PRE1980
    params = {
        "get": ",".join(fields),
        "for": f"place:{place_fips}",
        "in": f"state:{state_fips}",
    }
    key = os.environ.get("CENSUS_API_KEY")
    if not key:
        print("   WARNING: CENSUS_API_KEY env var is EMPTY — the repo secret "
              "is not set or not reaching this workflow")
        return None
    params["key"] = key
    r = requests.get("https://api.census.gov/data/2023/acs/acs5", params=params,
                     headers=UA, timeout=30)
    if r.status_code != 200:
        print(f"   census API HTTP {r.status_code} (key valid?)")
        return None
    try:
        rows = r.json()
    except ValueError:
        print("   WARNING: Census API returned non-JSON — CENSUS_API_KEY is "
              "probably missing or invalid (free key: "
              "https://api.census.gov/data/key_signup.html)")
        return None
    if len(rows) < 2:
        return None
    row = dict(zip(rows[0], rows[1]))
    try:
        total = float(row["B25034_001E"] or 0)
        pre = sum(float(row[c] or 0) for c in B25034_PRE1980)
        return {
            "census_median_year_built": int(float(row["B25035_001E"])),
            "census_homes_pre1980_pct": round(100 * pre / total, 1) if total else None,
        }
    except (TypeError, ValueError):
        return None

# ---------------------------------------------------------------- driver
def enrich_town(sb, metro_slug: str, town_slug: str) -> None:
    row = get_town_row(sb, metro_slug, town_slug)
    town = row["town"]
    print(f"== enriching {town} ({metro_slug})")
    patch, conflicts = {}, []

    geo = geocode(town)
    if geo:
        patch["lat"], patch["lon"] = geo["lat"], geo["lon"]
        print(f"   geocoded: {geo['lat']:.4f}, {geo['lon']:.4f}")
        for attempt in range(3):  # Open-Meteo archive can time out; retry
            try:
                patch.update(climate(geo["lat"], geo["lon"]))
                print(f"   climate: {patch['rainfall_annual_in']}in rain, "
                      f"{patch['freeze_days_per_year']} freeze days, "
                      f"{patch['days_over_100f']} days>100F")
                break
            except Exception as e:  # noqa: BLE001 - enrichment is best-effort
                print(f"   climate API attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    print("   climate skipped after 3 attempts")
        if geo.get("place_fips"):
            try:
                housing = census_housing("48", geo["place_fips"])
                if housing:
                    patch.update({k: v for k, v in housing.items()
                                  if v is not None})
                    print(f"   census: median built "
                          f"{patch.get('census_median_year_built')}, "
                          f"pre-1980 {patch.get('census_homes_pre1980_pct')}%")
            except Exception as e:  # noqa: BLE001
                print(f"   census API failed (skipped): {e}")
    else:
        print("   geocode failed — skipping API enrichment for this town")

    # USDA + EPA are stubs for now (documented above); they would write
    # soil_clay_pct and water_system_epa here when implemented.
    # Conflict rule lives here: API values never overwrite verified fields.

    if patch:
        sb.table("towns").update(patch).eq("id", row["id"]).execute()
        print(f"   wrote {len(patch)} enrichment fields")
    else:
        print("   nothing to write")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--metro", default=None)
    ap.add_argument("--town", default=None)
    args = ap.parse_args()

    sb = get_supabase()
    if args.metro and args.town:
        targets = [(args.metro, args.town)]
    else:
        q = sb.table("towns").select("metro_slug,town_slug")
        if args.metro:
            q = q.eq("metro_slug", args.metro)
        targets = [(r["metro_slug"], r["town_slug"])
                   for r in q.execute().data]
    for metro_slug, town_slug in targets:
        try:
            enrich_town(sb, metro_slug, town_slug)
        except Exception as e:  # noqa: BLE001 - keep the batch moving
            print(f"   ERROR {metro_slug}/{town_slug}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
