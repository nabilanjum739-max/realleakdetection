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
   section — never invent, never use generic filler. A missing data slot
   renders NOTHING — never an invented neighborhood, ZIP, MUD name,
   utility, price, or rule. (MUD names/rules: use only what water_utility
   or competitor_gap names; otherwise state the rule is MUD-specific and
   point the reader at the MUD directory — do not invent a MUD name.)
2. Prices: copy the metro range verbatim, prefix with "typically", attribute
   to "{Metro} area". Never state a town-exact price.
3. Gas section: safety box FIRST with the literal text "call 911" and "gas utility" — the digits 911 MUST appear in the gas section. No exceptions.
4. No reviews, testimonials, or case studies. "Typical job" examples must be
   labeled "Example:" explicitly.
5. Tone: plain, direct, local. Short sentences. No AI-tell phrases (list
   appended). Write like the teacher's sites: facts first, no fluff.
6. Emit the omission log: every blank field and every skipped section.
7. FAQ answers: direct answer in sentence one, 50–70 words total.
8. BANNED CLAIMS — never use anywhere in the article: specialist, expert,
   same-day, free assessment, free quotes, single visit, 24/7, any
   under-60-minutes arrival promise. Never claim a licence number, an
   address, years in business, or reviews. No availability promise of any
   kind.
9. ARTICLE-BODY BUDGET — HARD CAP 3,700–4,100 words. "Article body" means
   ALL text inside the <article>, tables and FAQ included. Do NOT pad to
   hit the number; the cap is a ceiling with a floor, not a quota. If a
   section must grow, another must shrink. Priority order for words:
   services → N2 symptom table → N5 pricing table → N6 insurance → N1
   local factor → N3 neighbourhoods → FAQ → everything else. The section
   targets in the template below sum to ~4,080 at minimum service/FAQ
   sizes — there is NO slack: keep services near 200 words each and the
   FAQ at 12 Q&As unless you cut elsewhere first. If you are over budget,
   cut in this order first: N12, N10, N9, N7, N4, N8.
   NEVER cut a service section below 200 words, never cut the N2 or N5
   tables, never cut the FAQ below 12 Q&As.
10. CARDS SHOW, ARTICLE INTERPRETS: the page displays data cards with the
    exact soil type, prices and stats above the article — do NOT restate
    those figures as a list; interpret what they mean for the reader
    (angles, consequences, what to do). Never restate a card value in
    prose without adding an interpretation.
11. competitor_gap: use EXACTLY ONCE, in the intro, as the contrast
    (what most {Town} pages lack that this guide provides). Never repeat
    it elsewhere.
12. ERA-PIPE VARIANT: the galvanised end-of-life angle applies ONLY to
    towns whose housing_era / common_pipe_materials show pre-1980s stock.
    For newer-build towns omit it entirely — never warn about galvanised
    pipe in a town built after it stopped being used.
13. NO PER-SECTION COST LINE: service sections contain NO price line.
    All pricing lives in the single N5 pricing table. Never repeat a
    price range in more than one place.
14. MARKERS — emit exactly these HTML comments, each on its own line:
    `<!-- meter-test -->` immediately after the N2 symptom table;
    `<!-- visual:soil -->` at the end of N1; `<!-- visual:pricing -->`
    at the end of N5; `<!-- visual:seasonal -->` at the end of N8.
    Do not write any other HTML comments.

BANNED AI-TELL PHRASES (never use): delve, tapestry, "in today's fast-paced
world", "look no further", "top-notch", "unparalleled", "when it comes to",
"it's important to note", "moreover", "furthermore", "vibrant", "bustling",
"nestled", "in conclusion", "moreover/furthermore stacking".

TEMPLATE — write these sections as one <article> of clean HTML:
1. Intro: 2 paragraphs (soil hook + housing era), ~90 words. Do NOT
   write an <h1> — the page template renders the H1 itself; start with the
   paragraphs. Do NOT write an opening "welcome to {Town}" paragraph — it
   duplicates the template hero. Name all 10 services once. Use
   competitor_gap here, exactly once (rule 11).
2. Trust bar: 3 bullets (published pricing · utility confirmed by address ·
   detection-only — we pinpoint it; you choose who fixes it). Never claim
   anything is free.
3. N1 "Why {Town} pipes fail" <h2>: three named causes, each 2–3 sentences
   + one symptom tie: (a) soil (soil_type + soil_leak_note), (b) water
   chemistry + pipe eras (water_utility + common_pipe_materials +
   housing_era), (c) flood/freeze (climate_note + seasonal_angle). End
   with the diagnostic tell (a leak means moisture in one spot year-round,
   indifferent to season). ~140 words. Emit `<!-- visual:soil -->` after
   it. The old standalone soil/water/housing section is folded into N1 —
   do not write it separately.
4. N2 "What is your {Town} home telling you?" <h2>: 2-line intro, then a
   12-row HTML table Symptom | What it likely means | Urgency (Today /
   This week / Soon / 911 first). Gas row FIRST, always 911-first language
   ("Leave the building, call 911, then your gas utility"). Each "Today"
   row points the reader at the meter test below the table. Table text
   ~180 words. Emit `<!-- meter-test -->` immediately after the table.
5. Ten service <h2> sections, 200–210 words EACH — 200 is a HARD MINIMUM:
   a section under 200 words fails validation and the whole page is
   rejected, so write every section in full (never compress the later
   ones), in this order: Slab leak
   detection, Underground / yard line leak detection, Water main leak
   detection, Sewer line leak detection, Sewer camera inspection & diagnosis,
   Septic tank leak detection, Gas line leak detection (safety box FIRST),
   Pool leak detection, Tankless water heater leak detection,
   Irrigation / sprinkler leak detection. H2 pattern: "{Service} in {Town},
   TX". Each: what it is (customer language first, jargon in parentheses)
   + symptoms + how detection works + ONE {Town}-angle paragraph traced
   to data fields + when-to-call CTA. NO cost line (rule 13).
6. N3 "{Town} neighbourhoods, era by era" <h2>: 3 mini-blocks (H3s),
   ~60 words each: oldest stock (era + pipe material + #1 risk + one
   "watch for"), mid-era master-planned, newest stock. Only neighborhoods
   from the row; never invent names. ~180 words.
7. N4 "How a leak-detection visit works" <h2>: 4 steps (meter test +
   shutoff isolation → acoustic listening + thermal imaging → pinpoint
   marked on the floor → written report you keep: meter readings, thermal
   result, marked spot). State the evidence promise explicitly; state "no
   concrete is broken before pinpointing". ~60 words.
8. N5 "What leak detection costs in {Town}" <h2>: a pricing TABLE
   (Service | Typically in the {Metro} area) with detection from
   price_leak_detection, slab from price_slab_detection, camera from
   price_sewer_camera. Omit rows with blank fields. Then: what drives cost
   (access, method, after-hours multiplier — label the multiplier a Texas
   guide figure); detection billed separately from repair (state this);
   repair ranges labelled NATIONAL (Angi $630–$4,400) with a method table
   (spot repair / reroute / epoxy lining / repipe); and the question "ask
   in writing whether the detection fee is credited toward repair".
   Framing line: "typically / {Metro} area, not a quote". ~150 words
   including the tables.
   Emit `<!-- visual:pricing -->` after it.
9. N6 "Does insurance cover a slab leak in {Town}?" <h2>: the split in
   plain words — pipe itself almost never covered (maintenance) vs
   tear-out/access + resulting damage often covered; sudden-and-accidental
   vs gradual; timing kills claims (continuous/repeating exclusion);
   verbatim adjuster script: "I need to open a claim" — not "is this
   covered?"; documentation checklist (detection report, itemised
   invoices, dated photos, bill screenshots from first symptom);
   service-line endorsement (~$30–$60/yr — label as a national figure);
   Texas HO-B vs HO-3 distinction; "not legal/insurance advice"
   disclaimer. ~160 words.
10. N7 "City water or MUD? Who bills you — and the leak adjustment" <h2>:
    who serves the address (City water in-city vs MUDs outside, from
    water_utility); that a leak adjustment exists and is
    documentation-gated; deadline + what to file ONLY if researched,
    otherwise state the rule is MUD-specific; winter averaging warning (a
    leak in Dec–Feb inflates sewer charges for a year); Eye On Water /
    smart-meter alerts as a trigger. ~60 words. Omit if water_utility
    is blank.
11. N8 "{Town} plumbing by season" <h2>: 4 seasons, each risk + mechanism
    + most-common calls + one "Prevent it" action (Nov–Feb freeze;
    Mar–May clay movement — run the meter test in March; Jun–Aug drought;
    Sep–Oct pre-winter prep). ~90 words. Emit `<!-- visual:seasonal -->`
    after it.
12. N9 "Questions to ask any company — including us" <h2>: checklist
    (itemised written quote with separate lines; licence number verified
    on the TSBPE site; evidence shown — meter readings, thermal result —
    not just a verdict; "what happens if the leak isn't found"; is the
    detection fee credited toward repair; a second opinion is normal).
    Plus the red-flag line: "If anyone wants to break concrete before
    pinpointing, get a second opinion." Frame as standards any company
    must meet — never as claims about us. ~50 words.
13. N10 "Call now, call today, or can it wait?" <h2>: 4 bands — 911/utility
    now (smell gas: leave, don't touch switches, call from outside;
    sewage backing up; burst line flooding); call today (bill spike +
    meter moving, warm spot, sound of water); book this week (slow drain
    + damp smell, second slab leak); safe to monitor (one high bill with
    an explained cause — rate change, estimated read, houseguest —
    re-check with the meter test). ~40 words.
14. N11 "Real {Town} questions" <h2>: 2 Q&As in the homeowner's voice
    (H3 + paragraph each, NOT inside the FAQ div), each answer giving a
    specific local reason + one action. ~110 words.
15. N12 "How we compare — what to demand from any leak-detection company"
    <h2>: a standards TABLE (What matters | What to demand: licensed +
    verifiable on TSBPE; electronic detection before cutting; pinpoint
    marked in writing; itemised quote approved before work; written report
    for insurance/MUD; no commission upselling; detection-fee credit in
    writing). Every row a standard, never a claim about our company.
    ~30 words.
16. Permits & utilities box <h2> — ONLY if permit_note is non-blank.
    ~25 words.
17. Property managers & home buyers <h2>: two short audience blocks.
    ~40 words.
18. FAQ <h2>: 12–15 questions, each answer 50–70 words, direct answer in
    sentence one. The set MUST include at least one question about cost or
    price and at least one about homeowners insurance coverage. Wrap as
    <div class="faq"><h3>Q…</h3><p>A…</p>…</div>. Prefer 12 Q&As — the
    budget only fits 12–13 at 50–60 words each (~600 words).
19. Final CTA: call button + "serving {neighborhoods short list}".
20. Do NOT write schema/JSON-LD (the site template adds it), do NOT write
    <title> or meta description (the site builds those from data fields).
21. Internal links: the user message ends with a LINK TARGETS list — those
    are the ONLY URLs you may link to; never invent a URL. Inside the
    article body, link contextually to at least 4 service pillar pages
    (from within the matching service sections) and at least 3 sibling
    town guides (where a neighboring town is naturally relevant, e.g.
    shared soil or water systems). A page with fewer links fails
    validation.

Total: article body 3,700–4,100 words — HARD CAP (rule 9). Respond in EXACTLY this format (no markdown fences):

<ARTICLE>
<article>…full html…</article>
</ARTICLE>
<OMISSION>
{"used": ["town", …], "blank": ["permit_note", …],
 "skipped_sections": ["Permits & utilities box", …]}
</OMISSION>
The omission log MUST account for all 18 fields."""


# Mirrors site/lib/services.ts — the only pillar URLs the model may link to.
SERVICE_PILLARS = [
    ("Slab leak detection", "/services/slab-leak-detection/"),
    ("Underground / yard line leak detection", "/services/underground-yard-line-leak-detection/"),
    ("Water main leak detection", "/services/water-main-leak-detection/"),
    ("Sewer line leak detection", "/services/sewer-line-leak-detection/"),
    ("Sewer camera inspection & diagnosis", "/services/sewer-camera-inspection/"),
    ("Septic tank leak detection", "/services/septic-tank-leak-detection/"),
    ("Natural gas line leak detection", "/services/gas-line-leak-detection/"),
    ("Pool leak detection", "/services/pool-leak-detection/"),
    ("Tankless water heater leak detection", "/services/tankless-water-heater-leak-detection/"),
    ("Irrigation / sprinkler leak detection", "/services/irrigation-sprinkler-leak-detection/"),
]


def build_user_message(row: dict, sb=None) -> str:
    data = {c: (row.get(c) or "") for c in RESEARCH_COLUMNS}
    data["parent_metro_full"] = row.get("parent_metro", "")
    # enrichment figures Grok may cite (all verified API values)
    for c in ("census_median_year_built", "census_homes_pre1980_pct",
              "rainfall_annual_in", "freeze_days_per_year",
              "days_over_100f", "soil_clay_pct"):
        if row.get(c) is not None:
            data[c] = row[c]
    msg = ("Write the town page for this data row. Every local claim must "
           "trace to these fields:\n" + json.dumps(data, indent=2))
    # LINK TARGETS (prompt §17): real sibling slugs from the DB + the fixed
    # pillar list, so the model links only to URLs that exist.
    siblings = []
    if sb is not None:
        try:
            res = (sb.table("towns").select("town, town_slug")
                   .eq("metro_slug", row["metro_slug"])
                   .neq("town_slug", row["town_slug"]).execute())
            siblings = res.data or []
        except Exception:  # noqa: BLE001 — link targets are best-effort
            siblings = []
    lines = ["", "LINK TARGETS — the ONLY URLs you may link to:"]
    lines.append(f"Metro hub: /tx/{row['metro_slug']}/")
    lines.append("Service pillars:")
    lines += [f"- {name}: {url}" for name, url in SERVICE_PILLARS]
    if siblings:
        lines.append("Sibling town guides:")
        lines += [f"- {s['town']}: /tx/{row['metro_slug']}/{s['town_slug']}/"
                  for s in siblings]
    return msg + "\n" + "\n".join(lines)


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
        "max_tokens": 32000,
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
        out = call_llm(SYSTEM_PROMPT, build_user_message(row, sb), args.model)
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
