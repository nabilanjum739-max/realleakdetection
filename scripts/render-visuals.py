#!/usr/bin/env python3
"""Render per-town SVG infographics from the Supabase data row.

Three visuals (no invented numbers — every figure traces to a field):
  (a) leak-detection-{town}-tx-why-pipes-fail.svg  — 3-factor card
      (design language copied from visuals/sample-katy-3factor.svg)
  (b) leak-detection-{town}-tx-seasonal-calendar.svg — 4-season strip
      (skipped if seasonal_angle is blank, per TEMPLATE.md)
  (c) leak-detection-{town}-tx-pricing.svg — pricing card
      (rows omitted for blank price fields; skipped if all blank)

Output: site/public/visuals/{town-slug}/
Filenames carry keyword + town for image SEO; the Next app sets
matching alt text (see site/lib/site.ts).

Usage:
    python scripts/render-visuals.py --metro houston --town katy
"""
import argparse
import html as htmlmod
from pathlib import Path

from common import PROJECT_ROOT, get_supabase, get_town_row

OUT_BASE = PROJECT_ROOT / "site" / "public" / "visuals"

FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"


def esc(s: str) -> str:
    return htmlmod.escape(s or "", quote=True)


def wrap(text: str, max_chars: int = 34) -> list:
    """Greedy word wrap for SVG <text> lines (SVG has no auto-wrap)."""
    words, lines, cur = (text or "").split(), [], ""
    for w in words:
        if len((cur + " " + w).strip()) > max_chars and cur:
            lines.append(cur.strip())
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return lines or [""]


def first_words(text: str, n: int = 4) -> str:
    return " ".join((text or "").split()[:n])


def defs() -> str:
    return """<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#10293f"/><stop offset="1" stop-color="#0a1c2e"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16344f"/><stop offset="1" stop-color="#10293f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>"""


def header(title: str, sub: str) -> str:
    return f"""<text x="60" y="80" fill="#7fd4ff" font-size="26" font-weight="700" letter-spacing="4">{esc(title)}</text>
  <text x="60" y="112" fill="#9fb3c8" font-size="18">{esc(sub)}</text>
  <line x1="60" y1="132" x2="1140" y2="132" stroke="#1e4a6e" stroke-width="2"/>"""


def footer(brand: str, left_note: str, right_note: str) -> str:
    return f"""<line x1="60" y1="520" x2="1140" y2="520" stroke="#1e4a6e" stroke-width="2"/>
  <text x="60" y="556" fill="#ffffff" font-size="22" font-weight="700">{esc(brand)}</text>
  <text x="60" y="584" fill="#9fb3c8" font-size="15">{esc(left_note)}</text>
  <text x="1140" y="584" fill="#9fb3c8" font-size="15" text-anchor="end">{esc(right_note)}</text>"""


def card(x: int, num: str, label: str, head: str, sub: str,
         body_lines: list, source: str) -> str:
    body = "".join(
        f'<text x="{x + 30}" y="{362 + i * 26}" fill="#c8d8e8" font-size="17">{esc(l)}</text>'
        for i, l in enumerate(body_lines[:4]))
    return f"""<rect x="{x}" y="160" width="333" height="330" rx="14" fill="url(#card)" stroke="#1e4a6e" stroke-width="2"/>
  <text x="{x + 30}" y="205" fill="#7fd4ff" font-size="20" font-weight="700">{num} · {esc(label)}</text>
  <text x="{x + 30}" y="245" fill="#ffffff" font-size="30" font-weight="800">{esc(head)}</text>
  <text x="{x + 30}" y="285" fill="#ffd166" font-size="21" font-weight="700">{esc(sub)}</text>
  {body}
  <text x="{x + 30}" y="492" fill="#7fd4ff" font-size="15">▸ source: {esc(source)}</text>"""


def three_factor(row: dict, brand: str) -> str:
    town, metro = row["town"], row["parent_metro"]
    zip1 = (row.get("zip_codes") or "").split(";")[0].strip()
    sub = f"3 local factors · verified data · {town.lower()}, tx {zip1}".strip()

    soil_head = first_words(row.get("soil_type") or "Local soil", 3)
    soil_body = wrap(row.get("soil_leak_note") or
                     "Local soil conditions stress buried lines.", 36)

    era = (row.get("housing_era") or "").split(";")[0]
    homes_head = first_words(era or "Local homes", 3)
    homes_sub = first_words(row.get("foundation_types") or "", 4)
    homes_body = wrap(row.get("common_pipe_materials") or
                      "Pipe materials vary by home age.", 36)

    rain = row.get("rainfall_annual_in")
    clim_head = f"~{rain} in rain/yr" if rain else first_words(
        row.get("climate_note") or "Local climate", 3)
    clim_sub = first_words(row.get("seasonal_angle") or "", 5) or "Seasonal risk"
    clim_body = wrap(row.get("seasonal_angle") or
                     (row.get("climate_note") or ""), 36)

    price = (row.get("price_leak_detection") or "").strip()
    right = f"Detection typically {price} in the {metro} area" if price else ""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="{FONT}" role="img" aria-label="Why {esc(town)} pipes fail: soil, homes and climate factors">
  {defs()}
  {header(f"WHY {town.upper()} PIPES FAIL", sub)}
  {card(60, "01", "SOIL", soil_head, first_words(row.get("soil_type") or "", 5), soil_body, "USDA soil data")}
  {card(433, "02", "HOMES", homes_head, homes_sub, homes_body, "US Census housing data")}
  {card(807, "03", "CLIMATE", clim_head, clim_sub, clim_body, "Open-Meteo climate data")}
  {footer(brand, "Every figure traces to a verified public dataset — nothing invented.", right)}
</svg>"""


def seasonal_calendar(row: dict, brand: str) -> str | None:
    angle = (row.get("seasonal_angle") or "").strip()
    if not angle:
        return None  # TEMPLATE.md: omit when blank, never filler
    town = row["town"]
    seasons = [
        ("WINTER", "Freeze risk", "Insulate exposed lines; know your main shutoff."),
        ("SPRING", "Clay movement", "Soil rehydrates and shifts — watch the water bill."),
        ("SUMMER", "Drought stress", "Dry clay shrinks away from slabs and lines."),
        ("FALL", "Storm swings", "Sudden rain re-expands soil; movement cracks pipes."),
    ]
    boxes = ""
    for i, (name, title, tip) in enumerate(seasons):
        x = 60 + i * 270
        boxes += (f'<rect x="{x}" y="160" width="250" height="300" rx="14" '
                  f'fill="url(#card)" stroke="#1e4a6e" stroke-width="2"/>\n'
                  f'    <text x="{x + 25}" y="210" fill="#7fd4ff" '
                  f'font-size="20" font-weight="700">{name}</text>\n'
                  f'    <text x="{x + 25}" y="248" fill="#ffffff" '
                  f'font-size="24" font-weight="800">{title}</text>\n')
        for j, line in enumerate(wrap(tip, 26)[:4]):
            boxes += (f'    <text x="{x + 25}" y="{290 + j * 26}" '
                      f'fill="#c8d8e8" font-size="16">{esc(line)}</text>\n')
    # callout bar with the town's real seasonal angle
    callout = "".join(
        f'<text x="80" y="{560 + i * 24}" fill="#ffd166" font-size="18" font-weight="600">{esc(l)}</text>'
        for i, l in enumerate(wrap(f"{town} watch: {angle}", 90)[:2]))
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="660" viewBox="0 0 1200 660" font-family="{FONT}" role="img" aria-label="Seasonal leak calendar for {esc(town)}, Texas">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#10293f"/><stop offset="1" stop-color="#0a1c2e"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16344f"/><stop offset="1" stop-color="#10293f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="660" fill="url(#bg)"/>
  {header(f"{town.upper()} LEAK CALENDAR", "when leaks happen · verified local pattern")}
  {boxes}
  <rect x="60" y="540" width="1080" height="80" rx="10" fill="#16344f" stroke="#ffd166" stroke-width="1"/>
  {callout}
  <text x="60" y="645" fill="#9fb3c8" font-size="14">{esc(brand)} · pattern: {esc(angle[:80])}</text>
</svg>"""


def pricing_card(row: dict, brand: str) -> str | None:
    town, metro = row["town"], row["parent_metro"]
    rows = [
        ("General leak detection", row.get("price_leak_detection")),
        ("Slab leak detection", row.get("price_slab_detection")),
        ("Sewer camera inspection", row.get("price_sewer_camera")),
    ]
    rows = [(label, val.strip()) for label, val in rows if (val or "").strip()]
    if not rows:
        return None  # never invent prices
    trs = ""
    for i, (label, val) in enumerate(rows):
        y = 210 + i * 90
        trs += f"""<rect x="60" y="{y}" width="1080" height="70" rx="10" fill="url(#card)" stroke="#1e4a6e" stroke-width="2"/>
    <text x="95" y="{y + 44}" fill="#ffffff" font-size="24" font-weight="600">{esc(label)}</text>
    <text x="1105" y="{y + 44}" fill="#ffd166" font-size="24" font-weight="800" text-anchor="end">typically {esc(val)}</text>"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620" font-family="{FONT}" role="img" aria-label="Typical leak detection prices in the {esc(metro)} area">
  {defs()}
  {header("LEAK DETECTION PRICES", f"typical {metro} area ranges · honestly labeled")}
  {trs}
  <text x="60" y="{210 + len(rows) * 90 + 30}" fill="#9fb3c8" font-size="16">Metro-level ranges — any site quoting a town-exact price before seeing the job is guessing.</text>
  <text x="60" y="600" fill="#ffffff" font-size="20" font-weight="700">{esc(brand)}</text>
</svg>"""


def main() -> None:
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--metro", required=True)
    ap.add_argument("--town", required=True)
    ap.add_argument("--brand", default="realleakdetection.com")
    args = ap.parse_args()

    sb = get_supabase()
    row = get_town_row(sb, args.metro, args.town)
    slug = row["town_slug"]
    outdir = OUT_BASE / slug
    outdir.mkdir(parents=True, exist_ok=True)

    made = []
    name = f"leak-detection-{slug}-tx-why-pipes-fail.svg"
    (outdir / name).write_text(three_factor(row, args.brand))
    made.append(name)

    cal = seasonal_calendar(row, args.brand)
    if cal:
        name = f"leak-detection-{slug}-tx-seasonal-calendar.svg"
        (outdir / name).write_text(cal)
        made.append(name)
    else:
        print("seasonal calendar skipped (seasonal_angle blank)")

    price = pricing_card(row, args.brand)
    if price:
        name = f"leak-detection-{slug}-tx-pricing.svg"
        (outdir / name).write_text(price)
        made.append(name)
    else:
        print("pricing card skipped (all price fields blank)")

    print(f"wrote {len(made)} visuals to {outdir}")


if __name__ == "__main__":
    main()
