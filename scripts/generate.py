#!/usr/bin/env python3
"""Generate one town page with the Groq API (OpenAI-compatible, free tier).

Builds the prompt EXACTLY from TEMPLATE.md's "Grok system prompt" section:
the town's Supabase row is the ONLY source of local facts. The model must
return JSON: {"html": "<article>…</article>", "omission_log": {...}}.
Stores page_html + omission_log, sets page_status='draft'.

Validation happens separately (validate.py) — nothing publishes
without passing the gate.

Usage:
    python scripts/generate.py --metro houston --town katy [--model openai/gpt-oss-120b]

Env: GROQ_API_KEY (required), GROQ_MODEL (optional, overrides --model).
"""
import argparse
import json
import os
import re
import sys

import requests

from common import RESEARCH_COLUMNS, get_supabase, get_town_row

API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a local-service copywriter. You receive ONE JSON object: a town's
18-field data row plus this template. Rules:
1. Write ONLY from the JSON. Every local claim (soil, utility, era, price,
   neighborhood) must trace to a field. If a field is blank, omit its
   section — never invent, never use generic filler.
2. Prices: copy the metro range verbatim, prefix with "typically", attribute
   to "{Metro} area". Never state a town-exact price.
3. Gas section: safety box first, 911 + utility before us. No exceptions.
4. No reviews, testimonials, or case studies. "Typical job" examples must be
   labeled "Example:" explicitly.
5. Tone: plain, direct, local. Short sentences. No AI-tell phrases (list
   appended). Write like the teacher's sites: facts first, no fluff.
6. Emit the omission log: every blank field and every skipped section.
7. FAQ answers: direct answer in sentence one, 50–70 words total.

BANNED AI-TELL PHRASES (never use): delve, tapestry, "in today's fast-paced
world", "look no further", "top-notch", "unparalleled", "when it comes to",
"it's important to note", "moreover", "furthermore", "vibrant", "bustling",
"nestled", "in conclusion", "moreover/furthermore stacking".

TEMPLATE — write these 16 sections as one <article> of clean HTML:
1. Hero: <h1>Leak Detection in {Town}, TX</h1> + 2-paragraph intro (soil hook
   + housing era), 150–200 words. Name all 10 services once.
2. Trust bar: 4 bullets (published pricing · utility confirmed by address ·
   detection-only specialists · free quotes).
3. "Why {Town} pipes fail" <h2>: three short paragraphs — SOIL (soil_type +
   soil_leak_note), WATER (water_utility), HOUSING (housing_era +
   common_pipe_materials + foundation_types). 250–350 words.
4. Symptom checker <h2>: HTML table Symptom | What it usually means |
   Urgency | What to do. Gas row FIRST, always red urgency with 911-first
   language ("Leave the building, call 911, then your gas utility").
5. Ten service <h2> sections, 200–400 words EACH, in this order: Slab leak
   detection, Underground / yard line leak detection, Water main leak
   detection, Sewer line leak detection, Sewer camera inspection & diagnosis,
   Septic tank leak detection, Gas line leak detection (safety box FIRST),
   Pool leak detection, Tankless water heater leak detection,
   Irrigation / sprinkler leak detection. H2 pattern: "{Service} in {Town},
   TX". Each: what it is (2–3 sentences) + how detection works + ONE
   {Town}-angle paragraph traced to data fields + "What it costs" line
   ("Detection typically {price} in the {Metro} area") + when-to-call CTA.
6. Seasonal leak calendar <h2> (omit if seasonal_angle blank): 4-season
   strip from climate_note + seasonal_angle, 200–250 words.
7. Pricing table <h2> "Leak detection prices in the {Metro} area": table of
   the 3 price fields with framing line "Metro-level ranges, honestly
   labeled". Omit rows with blank fields.
8. "How it works" <h2>: 4 numbered steps (call → confirm setup by address →
   non-invasive detection → you decide the fix + insurance documentation).
9. Insurance-claim documentation <h2>: written report helps claims; we
   document, never promise payouts.
10. "What to ask any leak company in {Town}" <h2>: 8–10 checkbox questions
    (published pricing? detection-only option? utility confirmed by address?
    written report with photos? license + insurance verifiable?).
11. Permits & utilities box <h2> — ONLY if permit_note is non-blank.
12. Neighborhoods served <h2>: the neighborhoods list, 1 line each.
    Never invent names.
13. Property managers & home buyers <h2>: two short audience blocks.
14. FAQ <h2>: 12–15 questions, each answer 50–70 words, direct answer in
    sentence one. Wrap as <div class="faq"><h3>Q…</h3><p>A…</p>…</div>.
15. Final CTA: call button + "serving {neighborhoods short list}".
16. Do NOT write schema/JSON-LD (the site template adds it), do NOT write
    <title> or meta description (the site builds those from data fields).

Total: 3,500–5,000 words. Respond in EXACTLY this format (no markdown fences):

<ARTICLE>
<article>…full html…</article>
</ARTICLE>
<OMISSION>
{"used": ["town", …], "blank": ["permit_note", …],
 "skipped_sections": ["Permits & utilities box", …]}
</OMISSION>
The omission log MUST account for all 18 fields."""


def build_user_message(row: dict) -> str:
    data = {c: (row.get(c) or "") for c in RESEARCH_COLUMNS}
    data["parent_metro_full"] = row.get("parent_metro", "")
    # enrichment figures Grok may cite (all verified API values)
    for c in ("census_median_year_built", "census_homes_pre1980_pct",
              "rainfall_annual_in", "freeze_days_per_year",
              "days_over_100f", "soil_clay_pct"):
        if row.get(c) is not None:
            data[c] = row[c]
    return ("Write the town page for this data row. Every local claim must "
            "trace to these fields:\n" + json.dumps(data, indent=2))


def call_llm(system: str, user: str, model: str) -> dict:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")
    r = requests.post(API_URL, headers={
        "Authorization": f"Bearer {key}", "Content-Type": "application/json",
    }, json={
        "model": model,
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": user}],
        "temperature": 0.4,
        "max_tokens": 16000,
    }, timeout=300)
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    content = re.sub(r"^```(?:json|html)?|```$", "", content.strip(),
                     flags=re.MULTILINE).strip()
    # New delimiter format: <ARTICLE>…</ARTICLE><OMISSION>…</OMISSION>
    m_art = re.search(r"<ARTICLE>(.*?)</ARTICLE>", content, re.DOTALL)
    m_omi = re.search(r"<OMISSION>(.*?)</OMISSION>", content, re.DOTALL)
    if m_art and m_omi:
        html = m_art.group(1).strip()
        try:
            omission = json.loads(m_omi.group(1).strip())
        except json.JSONDecodeError:
            omission = {"used": [], "blank": [], "skipped_sections": [],
                        "parse_note": "omission JSON malformed"}
        return {"html": html, "omission_log": omission}
    # Fallback: legacy JSON object format
    return json.loads(content)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--metro", required=True)
    ap.add_argument("--town", required=True)
    ap.add_argument("--model", default=os.environ.get("GROQ_MODEL") or DEFAULT_MODEL,
                    help="Groq model id (env GROQ_MODEL overrides default)")
    args = ap.parse_args()

    sb = get_supabase()
    row = get_town_row(sb, args.metro, args.town)
    print(f"generating {row['town']} ({args.metro}) with {args.model} …")

    try:
        out = call_llm(SYSTEM_PROMPT, build_user_message(row), args.model)
        html, omission = out["html"], out["omission_log"]
    except Exception as e:  # noqa: BLE001
        print(f"GROK CALL FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)

    if not html or not isinstance(omission, dict):
        print("GROK RETURNED UNUSABLE OUTPUT", file=sys.stderr)
        raise SystemExit(1)

    sb.table("towns").update({
        "page_html": html,
        "omission_log": omission,
        "page_status": "draft",
    }).eq("id", row["id"]).execute()
    words = len(re.findall(r"\w+", re.sub(r"<[^>]+>", " ", html)))
    print(f"stored draft: ~{words} words, "
          f"{len(omission.get('blank', []))} blank fields logged")


if __name__ == "__main__":
    main()
