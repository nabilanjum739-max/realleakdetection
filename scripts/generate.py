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
import time

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
7. FAQ answers: direct answer in sentence one, 50–70 words total. 50 is a
   HARD FLOOR, not a target — an answer under 50 words mechanically fails
   validation and the whole page is rejected.
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
   targets in the template below sum to ~4,100 at minimum service/FAQ
   sizes — there is NO slack: keep services near 200 words each and the
   FAQ at exactly 13 Q&As unless you cut elsewhere first. If you are over budget,
   cut in this order first: N12, N10, N9, N7, N4, N8.
   NEVER cut a service section below 200 words, never cut the N2 or N5
   tables, never cut the FAQ below 13 Q&As.
   LENGTH MINIMUMS (mechanical — a validator counts every word): each of
   the 10 service sections ≥200 words; the FAQ contains EXACTLY 13
   Q&As (the count is mechanical too — 12 or fewer risks failing the
   page on a short count); each FAQ answer ≥50 words; the
   article body ≥3,700 words in total. These minimums are stated again
   in the template because under-length sections are the most common
   failure: when many sections compete, do NOT compress the later ones
   — every section gets its full minimum, in order, every time.
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
   ones). 200 words is roughly 12–14 full sentences — count as you go,
   and if a section feels finished before 200 words, add the homeowner
   steps and detection detail the template asks for below rather than
   stopping early. Write the sections in this order: Slab leak
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
18. FAQ <h2>: EXACTLY 13 questions — count them as you write and stop
    at 13; the count is a HARD mechanical requirement, not a range
    (run #15 wrote 11 and failed validation on the count alone). Each
    answer 50–70 words, direct answer in sentence one.
    50 words per answer is a HARD MINIMUM (repeated from rule 7): an answer under 50 words mechanically fails validation.
    The set MUST include at least one question about cost or
    price and at least one about homeowners insurance coverage. Wrap as
    <div class="faq"><h3>Q…</h3><p>A…</p>…</div>. 13 Q&As at 50–60
    words each is ~700 words; rule 9's budget is planned around
    exactly 13.
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


def fetch_siblings(sb, row: dict) -> list[dict]:
    """Real sibling towns in the same metro from the DB (best-effort).

    Used for the prompt's LINK TARGETS list and for the programmatic
    sibling-link injection in the repair pass — one source of truth.
    """
    if sb is None:
        return []
    try:
        res = (sb.table("towns").select("town, town_slug")
               .eq("metro_slug", row["metro_slug"])
               .neq("town_slug", row["town_slug"]).execute())
        return res.data or []
    except Exception:  # noqa: BLE001 — link targets are best-effort
        return []


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
    siblings = fetch_siblings(sb, row)
    lines = ["", "LINK TARGETS — the ONLY URLs you may link to:"]
    lines.append(f"Metro hub: /tx/{row['metro_slug']}/")
    lines.append("Service pillars:")
    lines += [f"- {name}: {url}" for name, url in SERVICE_PILLARS]
    if siblings:
        lines.append("Sibling town guides:")
        lines += [f"- {s['town']}: /tx/{row['metro_slug']}/{s['town_slug']}/"
                  for s in siblings]
    return msg + "\n" + "\n".join(lines)


MAX_429_RETRIES = 4          # retries per call after the first attempt
BACKOFF_BASE_S = 15          # 15s → 30s → 60s → 120s when no Retry-After
RETRY_AFTER_CAP_S = 300      # never sleep longer than this on one retry
BAD_RESPONSE_RETRIES = 3     # retries when Groq answers 200 but empty/garbled (run #16)
QUOTA_RETRY_AFTER_S = 600    # Retry-After above this = daily quota gone, fail fast (run #19)


def _retry_after_seconds(response) -> float | None:
    """Parse the Retry-After header (seconds form) from a response."""
    if response is None:
        return None
    raw = response.headers.get("Retry-After")
    if not raw:
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None  # HTTP-date form — caller falls back to backoff


def call_groq_text(system: str, user: str, model: str) -> str:
    """One raw Groq chat call; returns the message content, fences stripped.

    HTTP 429 (rate limited) is retried with backoff: the Retry-After
    header wins when present, otherwise 15s → 30s → 60s → 120s, up to
    MAX_429_RETRIES retries. Run #14 showed why this matters: the main
    generation call exhausts the free tier's per-minute budget, so
    follow-up calls bounce instantly unless they wait. Every other
    error keeps the old behaviour (raise on the first attempt).
    """
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")
    retries = 0
    bad = 0
    while True:
        r = requests.post(API_URL, headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }, json={
            "model": model,
            "messages": [{"role": "system", "content": system},
                         {"role": "user", "content": user}],
            "temperature": 0.4,
            "max_tokens": 32000,
        }, timeout=300)
        if r.status_code == 429 and retries < MAX_429_RETRIES:
            ra = _retry_after_seconds(r)
            if ra is not None and ra > QUOTA_RETRY_AFTER_S:
                # A Retry-After of many minutes means the free tier's
                # DAILY quota is gone, not the per-minute limit — run
                # #19 crawled for ~2 hours because every repair call
                # burned its full backoff against a dead quota. Fail
                # the call fast; the run ends in minutes with a clear
                # log instead of hanging until the job timeout.
                raise RuntimeError(
                    f"Groq daily quota exhausted (Retry-After "
                    f"{ra:g}s) — try again after the quota resets")
            retries += 1
            wait = ra
            if wait is None:
                wait = BACKOFF_BASE_S * (2 ** (retries - 1))
            wait = min(max(wait, 1), RETRY_AFTER_CAP_S)
            print(f"    Groq 429 rate limit — retry {retries}/"
                  f"{MAX_429_RETRIES} after {wait:g}s")
            time.sleep(wait)
            continue
        r.raise_for_status()
        # Run #16: Groq can answer 200 with an empty body, a non-JSON
        # body, or a message whose content is empty — r.json() then
        # raises "Expecting value: line 1 column 1 (char 0)" and the
        # whole run dies. Treat an empty/unparseable response as a
        # retryable bad response instead of a fatal error.
        try:
            raw = r.json()["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError):
            raw = ""
        cleaned = re.sub(r"^```(?:json|html)?|```$", "", (raw or "").strip(),
                         flags=re.MULTILINE).strip()
        if cleaned:
            return cleaned
        bad += 1
        if bad > BAD_RESPONSE_RETRIES:
            raise RuntimeError(
                f"Groq returned empty/unparseable content "
                f"{BAD_RESPONSE_RETRIES + 1} times in a row")
        print(f"    Groq returned empty/unparseable content — retry "
              f"{bad}/{BAD_RESPONSE_RETRIES} after 20s")
        time.sleep(20)


def call_llm(system: str, user: str, model: str) -> dict:
    content = call_groq_text(system, user, model)
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
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Run #16 salvage: the model sometimes returns the article as
        # raw HTML without the <ARTICLE> tags. That is a judgeable
        # draft, not a fatal error — the repair pass and the gate will
        # shape and judge it. Only a non-JSON, non-HTML reply is fatal.
        if "<p>" in content or "<h2" in content or "<h3" in content:
            return {"html": content,
                    "omission_log": {"used": [], "blank": [],
                                     "skipped_sections": [],
                                     "parse_note": "salvaged raw HTML "
                                     "without ARTICLE/OMISSION tags"}}
        raise


# =====================================================================
# MEASURE-AND-REPAIR PASS
#
# Run #13 (El Paso pilot) proved the model under-writes when ~30
# sections compete: service sections landed at 72–93 words (gate needs
# 200–400), FAQ answers at 16–31 (gate needs 50–80), body at 2,561
# (gate needs 3,700–4,100), and the model wrote 0 sibling links.
# Rather than weakening the gate, generate.py now measures the draft
# with validate.py's OWN parser/counters, expands each deficient
# section/answer with a focused follow-up call grounded in the same
# town data, injects sibling links programmatically, and trims if the
# expansions overshoot the body ceiling. validate.py still runs after
# this in the workflow and remains the final arbiter.
#
# Run #14 proved the repair mechanics right (checks 10/11 fixed, gate
# failed only on length) but every one of its ~44 expansion calls
# bounced off Groq's per-minute limit (HTTP 429, all inside one
# second): the calls fired back-to-back with no pacing and no retry.
# The pass now batches deficient items (up to 3 sections / 6 FAQ
# answers per call), paces calls a few seconds apart, and
# call_groq_text retries 429s with backoff — a round costs ~6 calls
# instead of ~22.
#
# Run #15 proved the length repair works (3,796 → 4,044 words, all
# sections and answers in range, 15/17 checks) but exposed two count
# variances: the model wrote 11 FAQ Q&As (gate needs 12–15) and only
# 2 in-article pillar links (gate needs ≥4 distinct /services/…
# slugs). Both are now killed deterministically, the same way
# sibling links were: the prompt demands EXACTLY 13 Q&As and the
# repair pass tops the FAQ count up to 13 in one batched call when
# it lands under 12, and pillar links are injected programmatically
# (first natural mention of each service's name inside its own
# section, wrapped in an anchor; a short "More on …" line when a
# section never names itself).
#
# Run #17 proved the batched rounds work (FAQ count 13 ✓, pillar
# links 10 ✓, body 4,055 ✓, 14/17 checks) but the loop still stopped
# after its fixed 2 rounds with items it could measure as deficient:
# one section (sewer camera) stuck at 124 words, one FAQ answer at
# 38, and no cost question the gate's 5b detection recognises. The
# pass therefore ends with a gate-aligned FINAL SWEEP: a bounded
# fix-measure loop (max 4 iterations, only while the previous
# iteration changed something) that keeps applying targeted fixes —
# per-item retries with the rejection reason fed back, a $-strip
# fallback for price-heavy service sections, and a 5b topic top-up
# whose cost answer may use only the row's researched range — until
# every item it can measure is in gate range, then logs a final
# self-measurement verdict in the gate's own FAIL-line format.
# =====================================================================
import validate as gate  # same directory; gate logic is the source of truth

SEC_MIN, SEC_MAX = 200, 400        # gate check 3b
FAQ_MIN, FAQ_MAX = 50, 80          # gate check 5
FAQ_COUNT_FLOOR = 12               # gate check 5: 12–15 Q&As
FAQ_COUNT_TARGET = 13              # prompt demands exactly 13; the
                                   # repair top-up aims here so one
                                   # malformed Q&A can't sink the page
FAQ_COUNT_MAX = 15                 # gate check 5 ceiling
# Gate check 5b keyword lists, verbatim from validate.py: the gate
# scans the FAQ *questions* (lowercased, joined) for these substrings.
COST_QUESTION_KEYS = ("cost", "price", "how much", "charge")
INSURANCE_QUESTION_KEYS = ("insurance", "claim", "covered")
SWEEP_MAX_ITERS = 4                # final-sweep fix-measure bound
SWEEP_ITEM_ATTEMPTS = 3            # dedicated attempts per deficient item
BODY_FLOOR, BODY_CEIL = gate.BODY_MIN, gate.BODY_MAX   # gate check 12
TOTAL_AIM = 4100                   # land mid-band, not on an edge
TOTAL_SOFT_MAX = 4400              # trim backstop engages above this

EXPAND_SYSTEM = """You expand ONE part of a local leak-detection town guide.
You receive the town's data row (JSON) and the current text. Rules:
1. Use ONLY local facts from the data row or the current text. Never
   invent a local fact: no new neighbourhood names, ZIP codes, prices,
   utilities, MUD names, licence numbers, addresses, or reviews. You MAY
   expand general explanations — symptoms, how detection works, what a
   homeowner should check — in plain language.
2. NEVER use: specialist, expert, same-day, free assessment, free
   quotes, single visit, 24/7, or the AI-tell phrases delve, tapestry,
   moreover, furthermore, "look no further", "top-notch", "in conclusion".
3. Service sections contain NO prices and NO $ ranges — all pricing
   lives in a separate table elsewhere in the article.
4. Length is counted mechanically: your output MUST land inside the
   requested word range. Count as you write; short output fails the
   whole page.
5. If the current text begins with a safety box containing "call 911",
   reproduce that box FIRST, word for word, before anything else."""


def _strip(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html)


def split_article(html: str) -> tuple[str, list[dict]]:
    """Split article HTML at <h2> boundaries for splicing.

    Returns (prefix, segments); each segment is {h2_html, h2_text,
    body}. prefix + ''.join(h2_html + body) reproduces the input
    exactly, so splicing a body never disturbs the rest.
    """
    matches = list(re.finditer(r"<h2\b[^>]*>.*?</h2>", html,
                               re.DOTALL | re.I))
    if not matches:
        return html, []
    segments = []
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(html)
        segments.append({
            "h2_html": m.group(0),
            "h2_text": _strip(m.group(0)).strip(),
            "body": html[m.end():end],
        })
    return html[:matches[0].start()], segments


def join_article(prefix: str, segments: list[dict]) -> str:
    return prefix + "".join(s["h2_html"] + s["body"] for s in segments)


def _pillar_slugs_in(html: str) -> set:
    """Distinct /services/… slugs linked in the article — exactly what
    gate check 11 counts."""
    slugs = set()
    for h in re.findall(r'href="([^"]+)"', html):
        m = re.search(r"/services/([a-z0-9-]+)/?$", h)
        if m:
            slugs.add(m.group(1))
    return slugs


def measure_article(html: str, metro: str, town: str) -> dict:
    """Measure a draft with the gate's own parser and counters.

    Returns total words, per-service-section word counts (with the
    segment index to splice), FAQ answer word counts, and the sibling
    and pillar link counts — exactly as validate.py checks 3b/5/11/12
    see them.
    """
    parser = gate.SectionParser()
    parser.feed(html)
    parser.close()
    _, segments = split_article(html)
    aligned = len(parser.sections) == len(segments)
    services = {}
    for key in gate.SERVICE_H2_KEYS:
        for i, (h, b) in enumerate(parser.sections):
            if key in h.lower():
                services[key] = {"index": i, "words": gate.words(b)}
                break
    sibs = set()
    for h in re.findall(r'href="([^"]+)"', html):
        m = re.search(r"/tx/([a-z0-9-]+)/([a-z0-9-]+)/?$", h)
        if m and m.group(1) == metro and m.group(2) != town:
            sibs.add(m.group(2))
    faqs = [{"q": q, "words": gate.words(a)}
            for q, a in parser.faq_qas]
    # Gate check 5b, verbatim: topic presence across the questions.
    questions = " ".join(f["q"].lower() for f in faqs)
    return {
        "total": gate.words(_strip(html)),
        "services": services,
        "faqs": faqs,
        "has_cost": any(k in questions for k in COST_QUESTION_KEYS),
        "has_insurance": any(k in questions
                             for k in INSURANCE_QUESTION_KEYS),
        "siblings": sibs,
        "pillars": _pillar_slugs_in(html),
        "aligned": aligned,
    }


def _faq_span(html: str) -> tuple[int, int] | None:
    """(start, end) of the <div class="faq">…</div> block, depth-aware."""
    m = re.search(r'<div\b[^>]*class="[^"]*\bfaq\b[^"]*"[^>]*>', html, re.I)
    if not m:
        return None
    depth = 1
    for t in re.finditer(r"<div\b[^>]*>|</div>", html[m.end():], re.I):
        depth += -1 if t.group(0).startswith("</") else 1
        if depth == 0:
            return m.start(), m.end() + t.end()
    return None


def _faq_pairs(inner: str) -> list[re.Match]:
    """<h3>Q</h3><p>A</p> pairs inside the FAQ div, in order.

    Group 1 is the <h3>…</h3> part (kept verbatim on replacement);
    group 2 is the answer's inner HTML.
    """
    return list(re.finditer(
        r"(<h3\b[^>]*>.*?</h3>\s*)<p\b[^>]*>(.*?)</p>", inner,
        re.DOTALL | re.I))


def _replace_faq_answer(html: str, pair_index: int, new_text: str) -> str:
    span = _faq_span(html)
    if not span:
        return html
    inner = html[span[0]:span[1]]
    pairs = _faq_pairs(inner)
    if pair_index >= len(pairs):
        return html
    m = pairs[pair_index]
    new_inner = (inner[:m.start()] + m.group(1) + "<p>" +
                 _html_escape(new_text) + "</p>" + inner[m.end():])
    return html[:span[0]] + new_inner + html[span[1]:]


def _html_escape(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;"))


def _expansion_rejected(new_html: str, service: bool,
                        original_html: str) -> str | None:
    """Deterministic guards on expansion output; returns a reason or None."""
    if not new_html or len(new_html.strip()) < 40:
        return "empty/short output"
    if "<h2" in new_html.lower():
        return "contains an <h2> (structure would corrupt)"
    text = _strip(new_html).lower()
    bad = [p for p in gate.BANNED_PHRASES if p in text]
    if bad:
        return f"AI-tell phrase(s): {bad}"
    claims = [label for label, pat in gate.BANNED_CLAIMS if pat.search(text)]
    if claims:
        return f"banned claim(s): {claims}"
    if service and gate.dollar_ranges(text) \
            and not gate.dollar_ranges(_strip(original_html).lower()):
        return "introduces a $ range into a service section"
    return None


def _ensure_gas_safety(original_body: str, new_body: str) -> str:
    """The gas safety box must survive expansion (gate check 6)."""
    if "911" in _strip(original_body) and "911" not in _strip(new_body):
        for m in re.finditer(r"<div\b[^>]*>.*?</div>|<p\b[^>]*>.*?</p>",
                             original_body, re.DOTALL | re.I):
            if "911" in _strip(m.group(0)):
                return m.group(0) + "\n" + new_body
    return new_body


def _grounding_json(row: dict) -> str:
    data = {c: (row.get(c) or "") for c in RESEARCH_COLUMNS}
    data["parent_metro_full"] = row.get("parent_metro", "")
    return json.dumps(data, indent=2)


def _strip_dollar_sentences(html: str) -> str:
    """Remove sentences containing a $ figure from HTML paragraphs.

    Fallback for service-section expansions rejected ONLY for
    introducing a $ range: pricing belongs in the N5 table, so the
    price sentences can come out and the explanatory text stays.
    Paragraphs left empty are dropped; non-paragraph blocks (the gas
    safety box) are returned untouched. Never used on FAQ answers —
    prices are legitimate there.
    """
    def clean(block: str) -> str:
        m = re.match(r"(<p\b[^>]*>)(.*)(</p>)\s*$", block,
                     re.DOTALL | re.I)
        if not m:
            return block
        sentences = re.split(r"(?<=[.!?])\s+", m.group(2))
        kept = [s for s in sentences if "$" not in s]
        if len(kept) == len(sentences):
            return block
        inner = " ".join(kept).strip()
        return m.group(1) + inner + m.group(3) if inner else ""

    return re.sub(r"<p\b[^>]*>.*?</p>",
                  lambda mm: clean(mm.group(0)), html,
                  flags=re.DOTALL | re.I)


def _expand_service_section(seg: dict, lo: int, hi: int, row: dict,
                            model: str, call,
                            hint: str | None = None
                            ) -> tuple[str | None, str | None]:
    """One focused expansion call for a service section body.

    Returns (new_body, None) on success or (None, reason) on any
    failure — guard rejection (with the guard's reason), call failure,
    or a $-strip fallback that still doesn't land. `hint` (the sweep
    passes the measured deficiency / last rejection reason) is
    appended as a REPAIR NOTE so the model knows exactly what to fix.
    """
    user = (
        f"TOWN DATA — the only source of local facts:\n"
        f"{_grounding_json(row)}\n\n"
        f"SECTION HEADING: {seg['h2_text']}\n"
        f"CURRENT SECTION BODY HTML:\n{seg['body']}\n\n"
        f"Expand this section body to {lo}–{hi} words. Keep every fact "
        f"already present; add depth on symptoms, how detection works "
        f"and the steps a homeowner should take, using only the data "
        f"above. Keep the same HTML structure (paragraphs, any safety "
        f"box first). Return ONLY the expanded body HTML — no heading, "
        f"no markdown fences.")
    if hint:
        user += f"\n\nREPAIR NOTE: {hint}"
    try:
        out = call(EXPAND_SYSTEM, user, model)
    except Exception as e:  # noqa: BLE001 — reason returned to caller
        print(f"    section expansion call failed ({e})")
        return None, f"call failure: {e}"
    reason = _expansion_rejected(out, service=True,
                                 original_html=seg["body"])
    if reason == "introduces a $ range into a service section":
        # Likely a price-heavy section (sewer camera): the model keeps
        # inserting the researched price. Strip the $ sentences and
        # re-run every guard on what remains.
        stripped = _strip_dollar_sentences(out)
        reason2 = _expansion_rejected(stripped, service=True,
                                      original_html=seg["body"])
        w = gate.words(_strip(stripped))
        if reason2 is None and SEC_MIN <= w <= SEC_MAX:
            print(f"    $-strip fallback: removed the $ sentences — "
                  f"{w} words, accepted")
            return _ensure_gas_safety(seg["body"], stripped), None
        reason = (f"$ range introduced; $-strip still rejected "
                  f"({reason2})" if reason2 else
                  f"$ range introduced; $-stripped text landed at "
                  f"{w} words (need {SEC_MIN}–{SEC_MAX})")
    if reason:
        print(f"    expansion rejected ({reason})")
        return None, reason
    return _ensure_gas_safety(seg["body"], out), None


def expand_service_section(seg: dict, lo: int, hi: int, row: dict,
                           model: str, call) -> str | None:
    """One focused expansion call for a service section body."""
    body, _reason = _expand_service_section(seg, lo, hi, row, model,
                                            call)
    return body


def _expand_faq_answer(faq: dict, lo: int, hi: int, row: dict,
                       model: str, call,
                       hint: str | None = None
                       ) -> tuple[str | None, str | None]:
    """One focused expansion call for a single FAQ answer.

    Returns (new_text, None) on success or (None, reason) — same
    contract as _expand_service_section. The candidate must be
    guard-clean AND longer than the current answer; landing in the
    gate's 50–80 range is the caller's check (the sweep retries with
    the landed length as the next hint).
    """
    user = (
        f"TOWN DATA — the only source of local facts:\n"
        f"{_grounding_json(row)}\n\n"
        f"QUESTION: {faq['q']}\n"
        f"Expand the answer to this question to {lo}–{hi} words of "
        f"plain text (no HTML, no markdown). Keep a direct answer in "
        f"the first sentence, then add the reasoning and one concrete "
        f"action the homeowner can take. Use only the data above. "
        f"Return ONLY the answer text.")
    if hint:
        user += f"\n\nREPAIR NOTE: {hint}"
    try:
        out = call(EXPAND_SYSTEM, user, model)
    except Exception as e:  # noqa: BLE001 — reason returned to caller
        print(f"    FAQ expansion call failed ({e})")
        return None, f"call failure: {e}"
    out = re.sub(r"\s+", " ", _strip(out)).strip()
    reason = _expansion_rejected(out, service=False, original_html="")
    if reason:
        print(f"    FAQ expansion rejected ({reason})")
        return None, reason
    if gate.words(out) <= faq["words"]:
        print("    FAQ expansion did not grow the answer")
        return None, (f"did not grow the answer "
                      f"({gate.words(out)} words, current "
                      f"{faq['words']})")
    return out, None


def expand_faq_answer(faq: dict, lo: int, hi: int, row: dict,
                      model: str, call) -> str | None:
    """One focused expansion call for a single FAQ answer (plain text)."""
    text, _reason = _expand_faq_answer(faq, lo, hi, row, model, call)
    return text


# ---------------------------------------------------------------------
# Batched expansion. Run #14 fired ~44 repair calls back-to-back and
# Groq's per-minute limit rejected every one. Batching cuts a round
# to a handful of calls: up to BATCH_SEC_SIZE service sections per
# call, up to BATCH_FAQ_SIZE FAQ answers per call, each item wrapped
# in unique markers so it can be parsed back out and run through the
# SAME per-item guards as a single-item expansion. Any item a batch
# misses, corrupts or gets rejected falls back to the single-item
# call for that item.
# ---------------------------------------------------------------------
BATCH_SEC_SIZE = 3
BATCH_FAQ_SIZE = 6
REPAIR_PACE_S = 4            # pause between repair-pass Groq calls


def _parse_marked_blocks(text: str, tag: str, count: int) -> dict:
    """Extract <<<TAG n>>> … <<<END TAG n>>> blocks → {n: content}."""
    blocks = {}
    for n in range(1, count + 1):
        m = re.search(rf"<<<{tag} {n}>>>(.*?)<<<END {tag} {n}>>>",
                      text, re.DOTALL)
        if m:
            blocks[n] = m.group(1).strip()
    return blocks


def expand_service_batch(segs: list[dict], lo: int, hi: int, row: dict,
                         model: str, call) -> list:
    """Expand a batch of service sections in ONE Groq call.

    Returns a list aligned with `segs`: the new body HTML per section,
    or None where both the batch output and the single-item fallback
    failed or were rejected by the guards.
    """
    parts = [
        "TOWN DATA — the only source of local facts:\n"
        f"{_grounding_json(row)}\n",
        f"Expand EACH section body below to {lo}–{hi} words. Keep "
        "every fact already present in each section; add depth on "
        "symptoms, how detection works and the steps a homeowner "
        "should take, using only the data above. Keep each section's "
        "HTML structure (paragraphs; any safety box first, word for "
        "word). Return ONLY the expanded bodies, each wrapped "
        "EXACTLY in the markers shown — no headings, no markdown "
        "fences, nothing outside the markers.",
    ]
    for i, seg in enumerate(segs, 1):
        parts.append(f"<<<SECTION {i}>>>\nHEADING: {seg['h2_text']}\n"
                     f"CURRENT BODY HTML:\n{seg['body']}\n"
                     f"<<<END SECTION {i}>>>")
    blocks = {}
    try:
        out = call(EXPAND_SYSTEM, "\n\n".join(parts), model)
        blocks = _parse_marked_blocks(out, "SECTION", len(segs))
    except Exception as e:  # noqa: BLE001 — singles below are the fallback
        print(f"    batch call failed ({e}) — single-item fallback")
    results = []
    for i, seg in enumerate(segs, 1):
        new_body = None
        block = blocks.get(i)
        if block:
            reason = _expansion_rejected(block, service=True,
                                         original_html=seg["body"])
            if reason:
                print(f"    batch section {i} rejected ({reason}) — "
                      "single-item fallback")
            else:
                new_body = _ensure_gas_safety(seg["body"], block)
        else:
            print(f"    batch section {i}: missing from batch output "
                  "(parse failure) — single-item fallback")
        if new_body is None:
            try:
                new_body = expand_service_section(seg, lo, hi, row,
                                                  model, call)
            except Exception as e:  # noqa: BLE001 — keep original
                print(f"    section {i}: fallback call failed ({e})")
        results.append(new_body)
    return results


def expand_faq_batch(faqs: list[dict], lo: int, hi: int, row: dict,
                     model: str, call) -> list:
    """Expand a batch of FAQ answers in ONE Groq call.

    Returns a list aligned with `faqs`: the new answer text per item,
    or None where both the batch output and the single-item fallback
    failed or were rejected by the guards.
    """
    parts = [
        "TOWN DATA — the only source of local facts:\n"
        f"{_grounding_json(row)}\n",
        f"For EACH question below, write an expanded answer of "
        f"{lo}–{hi} words of plain text (no HTML, no markdown): a "
        "direct answer in the first sentence, then the reasoning and "
        "one concrete action the homeowner can take. Use only the "
        "data above. Return ONLY the answers, each wrapped EXACTLY "
        "in the markers shown — nothing outside the markers.",
    ]
    for i, faq in enumerate(faqs, 1):
        parts.append(f"<<<QUESTION {i}>>>\n{faq['q']}\n"
                     f"<<<END QUESTION {i}>>>")
    blocks = {}
    try:
        out = call(EXPAND_SYSTEM, "\n\n".join(parts), model)
        blocks = _parse_marked_blocks(out, "ANSWER", len(faqs))
    except Exception as e:  # noqa: BLE001 — singles below are the fallback
        print(f"    FAQ batch call failed ({e}) — single-item fallback")
    results = []
    for i, faq in enumerate(faqs, 1):
        new_text = None
        block = blocks.get(i)
        if block:
            text = re.sub(r"\s+", " ", _strip(block)).strip()
            reason = _expansion_rejected(text, service=False,
                                         original_html="")
            if reason:
                print(f"    batch FAQ {i} rejected ({reason}) — "
                      "single-item fallback")
            elif gate.words(text) <= faq["words"]:
                print(f"    batch FAQ {i} did not grow the answer — "
                      "single-item fallback")
            else:
                new_text = text
        else:
            print(f"    batch FAQ {i}: missing from batch output "
                  "(parse failure) — single-item fallback")
        if new_text is None:
            try:
                new_text = expand_faq_answer(faq, lo, hi, row, model,
                                             call)
            except Exception as e:  # noqa: BLE001 — keep original
                print(f"    FAQ {i}: fallback call failed ({e})")
        results.append(new_text)
    return results


def _text_rejected(text: str) -> str | None:
    """Banned-phrase / banned-claims guard for short plain texts
    (questions, single answers) — _expansion_rejected's length and
    structure checks don't apply to them."""
    low = text.lower()
    bad = [p for p in gate.BANNED_PHRASES if p in low]
    if bad:
        return f"AI-tell phrase(s): {bad}"
    claims = [label for label, pat in gate.BANNED_CLAIMS
              if pat.search(low)]
    if claims:
        return f"banned claim(s): {claims}"
    return None


def _parse_qa_blocks(text: str, count: int) -> dict:
    """Extract <<<QA n>>> QUESTION:/ANSWER: blocks → {n: (q, a)}."""
    out = {}
    for n in range(1, count + 1):
        m = re.search(
            rf"<<<QA {n}>>>\s*QUESTION:\s*(.+?)\s*ANSWER:\s*(.+?)"
            rf"\s*<<<END QA {n}>>>", text, re.DOTALL)
        if m:
            out[n] = (re.sub(r"\s+", " ", m.group(1)).strip(),
                      re.sub(r"\s+", " ", _strip(m.group(2))).strip())
    return out


def generate_faq_topups(existing_qs: list[str], need: int, row: dict,
                        model: str, call) -> list:
    """ONE batched call writing `need` brand-new FAQ Q&As.

    Run #15's draft had 11 Q&As against the gate's 12–15 — pure model
    count variance. The new pairs must be natural homeowner questions
    NOT already in the article, grounded only in the town row, with
    answers of 55–75 words in the same shape as the existing Q&As.
    Every returned pair passes deterministic guards (duplicate of an
    existing question, off-length answer, banned words, any $ figure
    — top-up answers never introduce pricing); pairs that fail are
    dropped, so the result may be shorter than `need`.
    """
    have = "\n".join(f"- {q}" for q in existing_qs) or "- (none)"
    markers = "\n".join(
        f"<<<QA {n}>>>\nQUESTION: <the question>\n"
        f"ANSWER: <the answer>\n<<<END QA {n}>>>"
        for n in range(1, need + 1))
    user = (
        "TOWN DATA — the only source of local facts:\n"
        f"{_grounding_json(row)}\n\n"
        "The FAQ section of this town guide already answers these "
        "questions — do NOT repeat, rephrase or overlap any of them:\n"
        f"{have}\n\n"
        f"Write {need} NEW question-and-answer pairs for that FAQ. "
        "Pick natural homeowner questions from topics like: whether a "
        "permit is needed for the repair that follows detection, how "
        "to prepare the home before a detection visit, how long "
        "detection takes, what happens right after a leak is "
        "pinpointed, what a renter should do versus a homeowner, how "
        "to re-check the water meter afterwards. Each answer: 55–75 "
        "words of plain text (no HTML, no markdown), a direct answer "
        "in the first sentence, then the reasoning and one concrete "
        "action the homeowner can take. Ground every local detail in "
        "the data above; where the data says nothing, keep the answer "
        "general and say what to check locally. No prices and no $ "
        "figures anywhere. Return ONLY the pairs, each wrapped "
        "EXACTLY in the markers shown:\n"
        f"{markers}")
    blocks = _parse_qa_blocks(call(EXPAND_SYSTEM, user, model), need)
    seen = {re.sub(r"[^a-z0-9]+", " ", q.lower()).strip()
            for q in existing_qs}
    pairs = []
    for n in range(1, need + 1):
        if n not in blocks:
            print(f"    FAQ top-up {n}: missing from batch output")
            continue
        q, a = blocks[n]
        norm = re.sub(r"[^a-z0-9]+", " ", q.lower()).strip()
        reason = None
        if not q.endswith("?") or gate.words(q) < 3 or "<" in q:
            reason = "malformed question"
        elif norm in seen or any(norm in s or s in norm for s in seen):
            reason = "duplicates an existing question"
        elif _text_rejected(q):
            reason = _text_rejected(q)
        elif not FAQ_MIN <= gate.words(a) <= FAQ_MAX:
            reason = f"answer {gate.words(a)} words (need 50–80)"
        elif "$" in a:
            reason = "answer introduces a $ figure"
        elif _expansion_rejected(a, service=False, original_html=""):
            reason = _expansion_rejected(a, service=False,
                                         original_html="")
        if reason:
            print(f"    FAQ top-up {n} rejected ({reason})")
            continue
        seen.add(norm)
        pairs.append((q, a))
    return pairs


def append_faq_qas(html: str, pairs: list) -> str:
    """Append (question, answer) pairs inside the FAQ div, in the
    exact <h3>Q</h3><p>A</p> shape gate check 5 parses."""
    span = _faq_span(html)
    if not span or not pairs:
        return html
    close = html.rfind("</div>", span[0], span[1])
    if close < 0:
        return html
    block = "".join(f"<h3>{_html_escape(q)}</h3>"
                    f"<p>{_html_escape(a)}</p>" for q, a in pairs)
    return html[:close] + block + html[close:]


def _topic_answer_rejected(text: str, allowed_amounts: list) -> str | None:
    """Guards for a 5b topic-top-up answer: gate length, banned
    words, and $ discipline — every $ amount in the answer must come
    from `allowed_amounts` (the row's researched range; empty list
    means no $ figure is allowed at all)."""
    w = gate.words(text)
    if not FAQ_MIN <= w <= FAQ_MAX:
        return f"answer {w} words (need {FAQ_MIN}–{FAQ_MAX})"
    reason = _expansion_rejected(text, service=False, original_html="")
    if reason:
        return reason
    bad = [a for a in gate.amounts(text) if a not in allowed_amounts]
    if bad:
        return (f"$ figure(s) outside the researched range: {bad} "
                f"(allowed: {allowed_amounts or 'none'})")
    return None


def generate_topic_faq(kind: str, row: dict, model: str,
                       call) -> tuple[str, str] | None:
    """Write ONE gate-recognisable topic Q&A for check 5b.

    Run #17's 13 questions contained an insurance question but none
    the gate's cost detection recognises — topic presence is too
    important to leave to the model's topic choice, so the QUESTION
    is constructed deterministically (it carries the gate's own
    keywords) and the model writes only the answer. For "cost", the
    answer may use ONLY the row's researched detection range: the
    exact range string goes into the prompt and its amounts into the
    guard as the only allowed $ figures. For "insurance", the answer
    is general and honest and carries no $ figure at all. Up to 2
    attempts, the rejection reason fed back into the second.
    """
    town = row["town"]
    if kind == "cost":
        question = f"How much does leak detection cost in {town}?"
        rng = (row.get("price_leak_detection") or "").strip()
        allowed = gate.amounts(rng)
        if rng:
            figure_rule = (
                f"You may use ONLY this researched range, copied "
                f"exactly: {rng}. Any other $ figure fails "
                f"validation. Use the word 'typically' and name the "
                f"{row.get('parent_metro', '')} area.")
        else:
            figure_rule = (
                "Do NOT use any $ figure at all — no researched "
                "range is on file for this town. Explain what the "
                "price depends on instead (access, line length, "
                "equipment time).")
    else:
        question = (f"Does homeowners insurance cover leak detection "
                    f"in {town}?")
        allowed = []
        figure_rule = ("Do NOT use any $ figure. Be honest and "
                       "general: cover what policies typically pay "
                       "for (sudden, accidental water damage) versus "
                       "what they usually exclude (the leak itself, "
                       "wear, slow damage), and tell the homeowner to "
                       "read their own policy wording.")
    hint = ""
    for attempt in (1, 2):
        user = (
            "TOWN DATA — the only source of local facts:\n"
            f"{_grounding_json(row)}\n\n"
            "Write ONE answer for this exact FAQ question:\n"
            f"QUESTION: {question}\n\n"
            "Write the ANSWER only: 55–75 words of plain text (no "
            "HTML, no markdown), a direct answer in the first "
            "sentence, then the reasoning and one concrete action "
            f"the homeowner can take. {figure_rule} Ground every "
            "local detail in the data above; where the data says "
            f"nothing, keep the answer general and honest.{hint}")
        try:
            out = call(EXPAND_SYSTEM, user, model)
        except Exception as e:  # noqa: BLE001 — gate judges the draft
            print(f"    5b {kind} top-up: call failed ({e})")
            return None
        out = re.sub(r"\s+", " ", _strip(out)).strip()
        reason = _topic_answer_rejected(out, allowed)
        if reason is None:
            return question, out
        print(f"    5b {kind} top-up attempt {attempt} rejected "
              f"({reason})")
        hint = (f"\nA previous attempt was rejected because: "
                f"{reason}. Avoid that.")
    return None


def _replace_faq_pair(html: str, pair_index: int, q: str,
                      a: str) -> str:
    """Replace the whole <h3>Q</h3><p>A</p> pair at pair_index."""
    span = _faq_span(html)
    if not span:
        return html
    inner = html[span[0]:span[1]]
    pairs = _faq_pairs(inner)
    if pair_index >= len(pairs):
        return html
    m = pairs[pair_index]
    new_inner = (inner[:m.start()]
                 + f"<h3>{_html_escape(q)}</h3>"
                   f"<p>{_html_escape(a)}</p>"
                 + inner[m.end():])
    return html[:span[0]] + new_inner + html[span[1]:]


def _ensure_faq_topics(html: str, row: dict, model: str,
                       call) -> str:
    """Guarantee gate check 5b: a recognisable cost AND insurance
    question in the FAQ. Appends the missing topic pair (count
    permitting); at the 15-Q&A ceiling it replaces the last pair
    that holds neither topic instead, so check 5's count stays
    valid. The ceiling backstop runs after the sweep, so appended
    words are trimmed there if the body overshoots."""
    metro, town = row["metro_slug"], row["town_slug"]
    for kind in ("cost", "insurance"):
        m = measure_article(html, metro, town)
        present = m["has_cost"] if kind == "cost" else m["has_insurance"]
        if present:
            continue
        pair = generate_topic_faq(kind, row, model, call)
        if pair is None:
            print(f"    5b top-up: no usable {kind} Q&A — gate will "
                  "judge the draft as-is")
            continue
        q, a = pair
        if len(m["faqs"]) < FAQ_COUNT_MAX:
            html = append_faq_qas(html, [(q, a)])
            print(f"    5b top-up: added {kind} Q&A — “{q}”")
            continue
        # At the count ceiling: swap out the last pair holding
        # neither topic (never the sole holder of the other topic).
        def holds(f: dict) -> tuple[bool, bool]:
            low = f["q"].lower()
            return (any(k in low for k in COST_QUESTION_KEYS),
                    any(k in low for k in INSURANCE_QUESTION_KEYS))
        cands = [i for i, f in enumerate(m["faqs"])
                 if holds(f) == (False, False)]
        if not cands:
            # Every pair holds the other topic. The missing topic is
            # held by none (that's why we're here), so any pair is a
            # candidate as long as the other topic survives the swap.
            theirs = 1 if kind == "cost" else 0
            if sum(1 for f in m["faqs"] if holds(f)[theirs]) > 1:
                cands = list(range(len(m["faqs"])))
        if not cands:
            print(f"    5b top-up: FAQ full at {FAQ_COUNT_MAX} and "
                  f"no swappable pair for {kind} — leaving as-is")
            continue
        idx = cands[-1]
        html = _replace_faq_pair(html, idx, q, a)
        print(f"    5b top-up: replaced FAQ {idx} with the {kind} "
              f"Q&A (count stays {FAQ_COUNT_MAX})")
    return html


def inject_sibling_links(html: str, row: dict,
                         siblings: list[dict]) -> str:
    """Programmatically add sibling-town links (gate check 11).

    The model wrote 0 sibling links in run #13 despite being given the
    targets, so this no longer relies on the model. Inserts one natural
    paragraph just before the FAQ section (the article's closing area),
    linking real sibling towns from the DB, in the exact href format
    check 11 parses.
    """
    metro, town = row["metro_slug"], row["town_slug"]
    have = measure_article(html, metro, town)["siblings"]
    picks = [s for s in siblings if s["town_slug"] not in have][:4 - len(have)]
    if len(have) >= 4 or not picks:
        return html
    links = []
    for s in picks:
        links.append(f'<a href="/tx/{metro}/{s["town_slug"]}/">'
                     f'{s["town"]} leak detection</a>')
    if len(links) == 1:
        joined = links[0]
    else:
        joined = ", ".join(links[:-1]) + f" and {links[-1]}"
    para = (f'<p class="nearby-guides">Nearby leak guides: {joined}. '
            f"Soil, water systems and "
            f"housing stock do not stop at town lines, so the checks in "
            f"this guide are a useful starting point across the "
            f"{row.get('parent_metro', '')} area — each town's own guide "
            f"covers its soil, utility and pricing notes.</p>")
    prefix, segments = split_article(html)
    faq_idx = next((i for i, s in enumerate(segments)
                    if 'class="faq"' in s["body"]), None)
    if faq_idx is not None and faq_idx > 0:
        segments[faq_idx - 1]["body"] += "\n" + para
        return join_article(prefix, segments)
    if faq_idx == 0:
        segments[0]["body"] = para + "\n" + segments[0]["body"]
        return join_article(prefix, segments)
    if "</article>" in html:
        return html.replace("</article>", para + "\n</article>", 1)
    return html + "\n" + para


# Anchor phrases per service key (gate.SERVICE_H2_KEYS maps 1:1 onto
# SERVICE_PILLARS). The first phrase — in reading order — found in a
# section's body is the one wrapped; longer phrases win ties so the
# anchor is the full service name where the text offers it.
PILLAR_ANCHORS = {
    "slab leak": ["slab leak detection", "slab leaks", "slab leak"],
    "yard line": ["yard line leak detection", "yard line",
                  "underground line"],
    "water main": ["water main leak detection", "water main"],
    "sewer line": ["sewer line leak detection", "sewer lines",
                   "sewer line"],
    "sewer camera": ["sewer camera inspection", "camera inspection",
                     "sewer camera"],
    "septic": ["septic tank leak detection", "septic tank",
               "septic system", "septic"],
    "gas line": ["gas line leak detection", "gas lines", "gas line"],
    "pool leak": ["pool leak detection", "pool leaks", "pool leak"],
    "tankless": ["tankless water heater leak detection",
                 "tankless water heater", "tankless unit", "tankless"],
    "sprinkler": ["irrigation / sprinkler leak detection",
                  "sprinkler leak detection",
                  "irrigation leak detection", "sprinkler system",
                  "sprinkler", "irrigation"],
}


def _link_first_mention(body: str, phrases: list[str],
                        url: str) -> str | None:
    """Wrap the first natural mention of any phrase in an anchor.

    Walks the body's <p> blocks in order; inside a block it walks
    text chunks (tags split out) tracking <a> nesting, so an existing
    link is never nested or broken and no tag is ever cut. Protected
    blocks are skipped: the 911 safety text and the injected
    nearby-guides / pillar-more paragraphs. Anchor text is the
    existing words, unchanged. Returns the new body, or None when no
    matchable mention exists.
    """
    for pm in re.finditer(r"<p\b[^>]*>.*?</p>", body, re.DOTALL | re.I):
        block = pm.group(0)
        if ("911" in _strip(block) or "nearby-guides" in block
                or "pillar-more" in block):
            continue
        m = re.match(r"(<p\b[^>]*>)(.*)(</p>)\s*$", block,
                     re.DOTALL | re.I)
        if not m:
            continue
        chunks = re.split(r"(<[^>]+>)", m.group(2))
        depth = 0
        for ci, chunk in enumerate(chunks):
            if chunk.startswith("<"):
                tag = chunk.lower()
                if re.match(r"<a\b", tag):
                    depth += 1
                elif tag.startswith("</a"):
                    depth = max(0, depth - 1)
                continue
            if depth:
                continue
            best = None  # (position, -length, phrase)
            for phrase in phrases:
                hit = re.search(r"\b" + re.escape(phrase) + r"\b",
                                chunk.lower())
                if hit:
                    cand = (hit.start(), -len(phrase), phrase)
                    if best is None or cand < best:
                        best = cand
            if best:
                pos, _, phrase = best
                matched = chunk[pos:pos + len(phrase)]
                chunks[ci] = (chunk[:pos]
                              + f'<a href="{url}">{matched}</a>'
                              + chunk[pos + len(phrase):])
                new_block = m.group(1) + "".join(chunks) + m.group(3)
                return body[:pm.start()] + new_block + body[pm.end():]
    return None


def inject_pillar_links(html: str, row: dict) -> str:
    """Programmatically link service pillar pages (gate check 11).

    The model linked only 2 of the 10 pillars in run #15 despite
    being given the targets — the same variance that sibling
    injection fixed for town links. For each service section whose
    pillar is not yet linked anywhere in the article, wrap the first
    natural mention of the service's name inside its own section; a
    section that never names itself gets one short "More on …" line
    appended (class pillar-more, protected from the trim backstop).
    Targets all 10; the gate needs ≥4 distinct.
    """
    m = measure_article(html, row["metro_slug"], row["town_slug"])
    have = set(m["pillars"])
    if len(have) >= len(SERVICE_PILLARS) or not m["aligned"]:
        return html
    prefix, segments = split_article(html)
    for key, (_name, url) in zip(gate.SERVICE_H2_KEYS, SERVICE_PILLARS):
        slug = url.rstrip("/").rsplit("/", 1)[-1]
        if slug in have:
            continue
        svc = m["services"].get(key)
        if svc is None:
            continue
        seg = segments[svc["index"]]
        new_body = _link_first_mention(seg["body"],
                                       PILLAR_ANCHORS[key], url)
        if new_body is None:
            new_body = (seg["body"]
                        + f'\n<p class="pillar-more">More on '
                          f'<a href="{url}">'
                          f'{PILLAR_ANCHORS[key][0]}</a>.</p>')
            print(f"    {key}: no mention to wrap — appended "
                  "'More on' line")
        if new_body != seg["body"]:
            seg["body"] = new_body
            have.add(slug)
    print(f"  pillar links: {len(have)} of {len(SERVICE_PILLARS)} "
          "pillar pages linked in the article")
    return join_article(prefix, segments)


def _trim_section_body(body: str, target_words: int,
                       floor: int = 0, allow_pillar: bool = False) -> str:
    """Drop trailing <p> blocks until the body fits (never tables, never
    a block containing '911', never the injected nearby-guides or
    pillar-more paragraphs, always keep at least one paragraph, and
    never drop a paragraph that would take the body under `floor`).
    Paragraphs carrying a /services/ pillar link are protected too,
    unless `allow_pillar` — set by the ceiling when the article holds
    enough distinct pillar links (≥7) that losing one anchor still
    leaves the gate's ≥4 with margin (run #18: protected paragraphs
    were one reason the ceiling stalled at 4,375 words)."""
    while gate.words(_strip(body)) > target_words:
        paras = list(re.finditer(r"<p\b[^>]*>.*?</p>", body,
                                 re.DOTALL | re.I))
        removable = [m for m in paras
                     if "911" not in _strip(m.group(0))
                     and "nearby-guides" not in m.group(0)
                     and "pillar-more" not in m.group(0)
                     and (allow_pillar
                          or 'href="/services/' not in m.group(0))]
        if len(paras) <= 1 or not removable:
            break
        m = removable[-1]
        if gate.words(_strip(body)) - gate.words(_strip(m.group(0))) < floor:
            break
        body = body[:m.start()] + body[m.end():]
    return body


def _trim_text(text: str, target_words: int, floor: int = 0) -> str:
    """Trim plain text to a word target at a sentence boundary; if the
    only fitting cut would breach `floor`, return the text unchanged."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    out = ""
    for s in sentences:
        if out and gate.words(out + " " + s) > target_words:
            break
        out = (out + " " + s).strip()
    if not out or gate.words(out) < floor:
        return text
    return out


def _word_trim_text(text: str, target_words: int) -> str:
    """Last-resort word-level trim: cut plain text at a word boundary
    and close the sentence. Only used when whole-paragraph/sentence
    trims stall on granularity a few words above the ceiling."""
    words = text.split()
    if len(words) <= target_words:
        return text
    out = " ".join(words[:target_words]).rstrip(",;:")
    if not out.endswith((".", "!", "?")):
        out += "."
    return out


def _budgeted_targets(m: dict) -> tuple[int, int]:
    """Per-item expansion targets that respect the total body budget.

    The §3.3 budget is tight: at template-size N-sections, service
    sections at the 200 floor + FAQ answers at the 50 floor already
    total ~4,050 of the 4,100 ceiling. So plan against the expected
    LANDING size (asks are ranges; models land mid-range), aim high
    only when the rest of the article leaves room, and step down to
    the floors before planning past the ceiling. Any residual
    overshoot is removed by the trim backstop, never by the gate.
    """
    rest = (m["total"]
            - sum(s["words"] for s in m["services"].values())
            - sum(f["words"] for f in m["faqs"]))

    def projected(sec_t: int, faq_t: int) -> int:
        secs = sum(sec_t + 12 if s["words"] < sec_t else s["words"]
                   for s in m["services"].values())
        faqs = sum(faq_t + 6 if f["words"] < faq_t else f["words"]
                   for f in m["faqs"])
        return rest + secs + faqs

    sec_t, faq_t = 270, 60
    while projected(sec_t, faq_t) > TOTAL_SOFT_MAX and sec_t > SEC_MIN:
        sec_t -= 5
    while projected(sec_t, faq_t) > TOTAL_SOFT_MAX and faq_t > FAQ_MIN:
        faq_t -= 1
    return sec_t, faq_t


def _enforce_ceiling(html: str, metro: str, town: str) -> str:
    """Trim backstop: bring the body under TOTAL_SOFT_MAX by removing
    words, in order: longest service section (paragraph drops, floor
    ~202), longest FAQ answer (sentence trims, floor ~51), the longest
    other section's paragraphs and the article prefix (floor ~45),
    word-level micro-trims, and finally raw sentence cuts inside
    markup-bearing paragraphs. The gate's ceiling is never a reason
    to fail if words can come out — but no trim may push an item
    under its own gate floor. Run #18 stalled at 4,375 with every
    item in range: the tiers that existed could not touch protected
    or single-paragraph content and the prefix, so tiers 3/5 now
    cover both, pillar paragraphs unlock when ≥7 distinct pillar
    links are present, and a stall prints the full size breakdown so
    the log explains itself.
    """
    m = measure_article(html, metro, town)
    start_total = m["total"]
    guard = 0
    while m["total"] > TOTAL_SOFT_MAX and guard < 200:
        guard += 1
        excess = m["total"] - 4030
        prefix, segments = split_article(html)
        changed = False
        # Tier 1: longest service sections first.
        long_secs = sorted(
            ((s["words"], k, s["index"])
             for k, s in m["services"].items() if s["words"] > 212),
            reverse=True)
        for _, key, idx in long_secs:
            target = max(202, m["services"][key]["words"] - excess - 5)
            new_body = _trim_section_body(
                segments[idx]["body"], target, floor=201,
                allow_pillar=len(m["pillars"]) >= 7)
            if new_body != segments[idx]["body"]:
                segments[idx]["body"] = new_body
                html = join_article(prefix, segments)
                changed = True
                break
        # Tier 2: longest FAQ answers.
        if not changed:
            long_faqs = sorted(
                ((f["words"], i) for i, f in enumerate(m["faqs"])
                 if f["words"] > 54), reverse=True)
            for w, i in long_faqs:
                parser = gate.SectionParser()
                parser.feed(html)
                parser.close()
                q, a = parser.faq_qas[i]
                new_html = _replace_faq_answer(
                    html, i, _trim_text(a, max(51, w - excess - 2),
                                        floor=FAQ_MIN))
                if new_html != html:
                    html = new_html
                    changed = True
                    break
        # Tier 3: the article prefix first (intro before the first
        # H2 — no other tier can touch it), then the longest other
        # sections (never the FAQ segment).
        if not changed and gate.words(_strip(prefix)) > 60:
            pw = gate.words(_strip(prefix))
            new_prefix = _trim_section_body(
                prefix, max(45, pw - excess - 5), floor=44)
            if new_prefix != prefix:
                html = join_article(new_prefix, segments)
                changed = True
        if not changed:
            service_idx = {s["index"] for s in m["services"].values()}
            others = []
            for i, seg in enumerate(segments):
                if i in service_idx or 'class="faq"' in seg["body"] \
                        or "<h3" in seg["body"]:
                    continue
                w = gate.words(_strip(seg["body"]))
                if w > 60:
                    others.append((w, i))
            for w, idx in sorted(others, reverse=True):
                new_body = _trim_section_body(
                    segments[idx]["body"], max(45, w - excess - 5),
                    floor=44)
                if new_body != segments[idx]["body"]:
                    segments[idx]["body"] = new_body
                    html = join_article(prefix, segments)
                    changed = True
                    break
        # Tier 4 (micro-trim): word-level trim of a single item. Fires
        # only when whole-paragraph/sentence trims stall on granularity
        # just above the ceiling; floors still apply (FAQ >= 51 words,
        # service sections >= 202).
        if not changed:
            faq_cands = sorted(
                ((f["words"], i) for i, f in enumerate(m["faqs"])
                 if f["words"] > FAQ_MIN + 1), reverse=True)
            for w, i in faq_cands:
                parser = gate.SectionParser()
                parser.feed(html)
                parser.close()
                q, a = parser.faq_qas[i]
                cut = min(excess + 5, w - (FAQ_MIN + 1))
                if cut <= 0:
                    continue
                new_html = _replace_faq_answer(
                    html, i, _word_trim_text(a, w - cut))
                if new_html != html:
                    html = new_html
                    changed = True
                    break
        if not changed:
            sec_cands = sorted(
                ((s["words"], k, s["index"])
                 for k, s in m["services"].items()
                 if s["words"] > SEC_MIN + 2), reverse=True)
            for w, key, idx in sec_cands:
                body = segments[idx]["body"]
                paras = list(re.finditer(r"<p\b[^>]*>(.*?)</p>", body,
                                         re.DOTALL | re.I))
                plain = [pm for pm in paras
                         if "<" not in pm.group(1)
                         and "911" not in pm.group(1)
                         and "nearby-guides" not in pm.group(0)]
                if not plain:
                    continue
                pm = plain[-1]
                cur = gate.words(pm.group(1))
                cut = min(excess + 5, w - (SEC_MIN + 2), cur - 5)
                if cut <= 0:
                    continue
                new_p = ("<p>" + _word_trim_text(pm.group(1), cur - cut)
                         + "</p>")
                segments[idx]["body"] = (body[:pm.start()] + new_p
                                         + body[pm.end():])
                html = join_article(prefix, segments)
                changed = True
                break
        # Tier 5 (run #18): raw sentence cut — drop the LAST sentence
        # of a trailing paragraph in the longest segment. Fires only
        # when every drop/trim above stalls (single-paragraph
        # sections, markup-bearing or pillar-carrying paragraphs).
        # A cut is accepted only when the dropped tail is tag-free,
        # the kept head has balanced angle brackets and balanced
        # inline tags, the paragraph keeps ≥15 words, and the
        # segment stays above its floor (service 205, other 50).
        if not changed:
            service_idx = {s["index"] for s in m["services"].values()}
            cands = []
            for i, seg in enumerate(segments):
                if 'class="faq"' in seg["body"] or "<h3" in seg["body"]:
                    continue
                if i in service_idx:
                    key = next(k for k, s in m["services"].items()
                               if s["index"] == i)
                    cands.append((m["services"][key]["words"], i, 205))
                else:
                    cands.append((gate.words(_strip(seg["body"])), i, 50))
            for w, idx, floor in sorted(cands, reverse=True):
                body = segments[idx]["body"]
                paras = list(re.finditer(r"(<p\b[^>]*>)(.*?)(</p>)",
                                         body, re.DOTALL | re.I))
                applied = False
                for pm in reversed(paras):
                    inner = pm.group(2)
                    if ("911" in _strip(inner)
                            or "nearby-guides" in pm.group(0)
                            or "pillar-more" in pm.group(0)):
                        continue
                    cut_head = None
                    for sm in re.finditer(r"[.!?]\s+", inner):
                        tail = inner[sm.end():]
                        if "<" in tail:
                            continue
                        head = inner[:sm.start() + 1]
                        if head.count("<") != head.count(">"):
                            continue
                        if any(head.count(f"<{t}") != head.count(f"</{t}>")
                               for t in ("strong", "em", "a", "b", "i",
                                         "span")):
                            continue
                        if gate.words(_strip(head)) < 15:
                            continue
                        cut_head = (head, tail)
                    if cut_head is None:
                        continue
                    head, tail = cut_head
                    saved = gate.words(_strip(tail))
                    if saved <= 0 or w - saved < floor:
                        continue
                    segments[idx]["body"] = (
                        body[:pm.start()] + pm.group(1) + head
                        + pm.group(3) + body[pm.end():])
                    html = join_article(prefix, segments)
                    changed = True
                    applied = True
                    break
                if applied:
                    break
        if not changed:
            break
        m = measure_article(html, metro, town)
    if m["total"] > TOTAL_SOFT_MAX:
        prefix, segments = split_article(html)
        others = {i: gate.words(_strip(s["body"]))
                  for i, s in enumerate(segments)
                  if i not in {v["index"] for v in m["services"].values()}
                  and 'class="faq"' not in s["body"]
                  and "<h3" not in s["body"]}
        print(f"    ceiling STALLED at {m['total']} words "
              f"(soft max {TOTAL_SOFT_MAX}): prefix "
              f"{gate.words(_strip(prefix))}, services "
              f"{ {k: s['words'] for k, s in m['services'].items()} }, "
              f"faq answers {[f['words'] for f in m['faqs']]}, "
              f"others {others}, pillars {len(m['pillars'])}")
    elif start_total > TOTAL_SOFT_MAX:
        print(f"    ceiling: trimmed {start_total} → {m['total']} words")
    return html


# ---------------------------------------------------------------------
# Gate-aligned final sweep (run #17). The batched rounds stop after
# 2 iterations by design; run #17 still stored a draft the repair
# itself measured as deficient (one section at 124 words, one FAQ
# answer at 38, no gate-recognisable cost question). The sweep is a
# bounded fix-measure loop over exactly the items the gate checks
# and generate.py can already measure: it runs while any of them is
# deficient AND the previous iteration changed something, applying
# the targeted fix per item — deterministic trims for over-length
# items, the FAQ count top-up, the 5b topic top-up, and dedicated
# single-item expansion attempts (up to SWEEP_ITEM_ATTEMPTS per
# item) that carry the last rejection reason into the next prompt.
# ---------------------------------------------------------------------
def _deficiencies(m: dict) -> dict:
    """What the sweep can still fix, from a measure_article result."""
    return {
        "sections": {k: s for k, s in m["services"].items()
                     if not SEC_MIN <= s["words"] <= SEC_MAX},
        "missing_sections": [k for k in gate.SERVICE_H2_KEYS
                             if k not in m["services"]],
        "faq_answers": [i for i, f in enumerate(m["faqs"])
                        if not FAQ_MIN <= f["words"] <= FAQ_MAX],
        "faq_count": not FAQ_COUNT_FLOOR <= len(m["faqs"])
                         <= FAQ_COUNT_MAX,
        "cost": not m["has_cost"],
        "insurance": not m["has_insurance"],
    }


def _any_deficient(d: dict) -> bool:
    """Missing sections are reported in the verdict but cannot be
    repaired here (there is no segment to expand), so they don't
    keep the loop alive on their own."""
    return bool(d["sections"] or d["faq_answers"] or d["faq_count"]
                or d["cost"] or d["insurance"])


def _faq_answer_text(html: str, idx: int) -> str | None:
    parser = gate.SectionParser()
    parser.feed(html)
    parser.close()
    if idx >= len(parser.faq_qas):
        return None
    return parser.faq_qas[idx][1]


def _trim_overlong(html: str, row: dict, m: dict) -> str:
    """Deterministic trims for over-length items (no Groq calls):
    service sections over SEC_MAX lose trailing paragraphs (floor
    SEC_MIN+1, pillar-link paragraphs protected by
    _trim_section_body); FAQ answers over FAQ_MAX are cut at a
    sentence boundary (floor FAQ_MIN)."""
    metro, town = row["metro_slug"], row["town_slug"]
    prefix, segments = split_article(html)
    changed = False
    for key, s in m["services"].items():
        if s["words"] <= SEC_MAX:
            continue
        seg = segments[s["index"]]
        new_body = _trim_section_body(seg["body"], SEC_MAX - 5,
                                      floor=SEC_MIN + 1)
        if new_body != seg["body"]:
            seg["body"] = new_body
            changed = True
            print(f"    sweep trim: {key} {s['words']} → "
                  f"{gate.words(_strip(new_body))} words")
    if changed:
        html = join_article(prefix, segments)
    for i, f in enumerate(m["faqs"]):
        if f["words"] <= FAQ_MAX:
            continue
        a = _faq_answer_text(html, i)
        if a is None:
            continue
        t = _trim_text(a, FAQ_MAX - 2, floor=FAQ_MIN)
        if t != a and FAQ_MIN <= gate.words(t) <= FAQ_MAX:
            html = _replace_faq_answer(html, i, t)
            print(f"    sweep trim: FAQ {i} {f['words']} → "
                  f"{gate.words(t)} words")
    return html


def _fix_section_sweep(html: str, key: str, row: dict, model: str,
                       call, lo: int, hi: int) -> str:
    """Up to SWEEP_ITEM_ATTEMPTS dedicated single-item expansions
    for one deficient service section. Each attempt's prompt states
    the exact target range; a failed attempt's rejection reason (or
    the landed word count) becomes the next attempt's REPAIR NOTE.
    A guard-clean candidate that grows the section but is still
    short is kept as the new base; one that overshoots is trimmed
    deterministically before giving up on it."""
    metro, town = row["metro_slug"], row["town_slug"]
    hint = None
    for attempt in range(1, SWEEP_ITEM_ATTEMPTS + 1):
        m = measure_article(html, metro, town)
        s = m["services"].get(key)
        if s is None:
            print(f"    sweep {key}: section missing — cannot repair")
            return html
        if SEC_MIN <= s["words"] <= SEC_MAX:
            return html
        if hint is None:
            hint = (f"the section currently has {s['words']} words; "
                    f"it must land between {SEC_MIN} and {SEC_MAX} "
                    f"words")
        prefix, segments = split_article(html)
        seg = segments[s["index"]]
        body, reason = _expand_service_section(seg, lo, hi, row,
                                               model, call, hint=hint)
        if body is None:
            hint = reason
            print(f"    sweep {key}: attempt "
                  f"{attempt}/{SWEEP_ITEM_ATTEMPTS} failed ({reason})")
            continue
        w = gate.words(_strip(body))
        if SEC_MIN <= w <= SEC_MAX:
            segments[s["index"]]["body"] = "\n" + body + "\n"
            print(f"    sweep {key}: attempt {attempt} fixed it — "
                  f"{s['words']} → {w} words")
            return join_article(prefix, segments)
        if w > SEC_MAX:
            trimmed = _trim_section_body(body, SEC_MAX - 5,
                                         floor=SEC_MIN + 1)
            tw = gate.words(_strip(trimmed))
            if SEC_MIN <= tw <= SEC_MAX:
                segments[s["index"]]["body"] = "\n" + trimmed + "\n"
                print(f"    sweep {key}: attempt {attempt} overshot "
                      f"({w} words) — trimmed to {tw}")
                return join_article(prefix, segments)
            hint = (f"the expansion landed at {w} words (need "
                    f"{SEC_MIN}–{SEC_MAX}) and trimming could not "
                    f"bring it into range")
        elif w > s["words"]:
            segments[s["index"]]["body"] = "\n" + body + "\n"
            html = join_article(prefix, segments)
            hint = (f"the expansion landed at {w} words (need "
                    f"{SEC_MIN}–{SEC_MAX}) — keep everything already "
                    f"there and expand further")
            print(f"    sweep {key}: attempt {attempt} grew it to "
                  f"{w} words — still short, retrying")
            continue
        else:
            hint = (f"the expansion landed at {w} words (need "
                    f"{SEC_MIN}–{SEC_MAX})")
        print(f"    sweep {key}: attempt "
              f"{attempt}/{SWEEP_ITEM_ATTEMPTS} not in range ({hint})")
    return html


def _fix_faq_sweep(html: str, idx: int, row: dict, model: str,
                   call, lo: int, hi: int) -> str:
    """Up to SWEEP_ITEM_ATTEMPTS dedicated single-item expansions
    for one deficient FAQ answer — same contract as
    _fix_section_sweep (over-length answers are _trim_overlong's
    job; this fixes short ones)."""
    metro, town = row["metro_slug"], row["town_slug"]
    hint = None
    for attempt in range(1, SWEEP_ITEM_ATTEMPTS + 1):
        m = measure_article(html, metro, town)
        if idx >= len(m["faqs"]):
            return html
        f = m["faqs"][idx]
        if FAQ_MIN <= f["words"] <= FAQ_MAX:
            return html
        if f["words"] > FAQ_MAX:
            return html  # deterministic trim territory, not calls
        if hint is None:
            hint = (f"the answer currently has {f['words']} words; "
                    f"it must land between {FAQ_MIN} and {FAQ_MAX} "
                    f"words")
        text, reason = _expand_faq_answer(f, lo, hi, row, model,
                                          call, hint=hint)
        if text is None:
            hint = reason
            print(f"    sweep FAQ {idx}: attempt "
                  f"{attempt}/{SWEEP_ITEM_ATTEMPTS} failed ({reason})")
            continue
        w = gate.words(text)
        if FAQ_MIN <= w <= FAQ_MAX:
            html = _replace_faq_answer(html, idx, text)
            print(f"    sweep FAQ {idx}: attempt {attempt} fixed "
                  f"it — {f['words']} → {w} words")
            return html
        if w > FAQ_MAX:
            t = _trim_text(text, FAQ_MAX - 2, floor=FAQ_MIN)
            if FAQ_MIN <= gate.words(t) <= FAQ_MAX:
                html = _replace_faq_answer(html, idx, t)
                print(f"    sweep FAQ {idx}: attempt {attempt} "
                      f"overshot ({w} words) — trimmed to "
                      f"{gate.words(t)}")
                return html
            hint = (f"the answer landed at {w} words (need "
                    f"{FAQ_MIN}–{FAQ_MAX}) and trimming could not "
                    f"bring it into range")
        elif w > f["words"]:
            html = _replace_faq_answer(html, idx, text)
            hint = (f"the answer landed at {w} words (need "
                    f"{FAQ_MIN}–{FAQ_MAX}) — keep the same content "
                    f"and expand further")
            print(f"    sweep FAQ {idx}: attempt {attempt} grew it "
                  f"to {w} words — still short, retrying")
            continue
        else:
            hint = (f"the answer landed at {w} words (need "
                    f"{FAQ_MIN}–{FAQ_MAX})")
        print(f"    sweep FAQ {idx}: attempt "
              f"{attempt}/{SWEEP_ITEM_ATTEMPTS} not in range ({hint})")
    return html


def _final_sweep(html: str, row: dict, model: str, call) -> str:
    """Bounded fix-measure loop: while anything measurable is still
    deficient and the previous iteration changed something, apply
    the targeted fixes and re-measure (max SWEEP_MAX_ITERS)."""
    metro, town = row["metro_slug"], row["town_slug"]
    for it in range(1, SWEEP_MAX_ITERS + 1):
        m = measure_article(html, metro, town)
        d = _deficiencies(m)
        if not _any_deficient(d):
            print(f"  final sweep: iteration {it} — nothing "
                  "deficient")
            return html
        print(f"  final sweep {it}/{SWEEP_MAX_ITERS}: "
              f"{len(d['sections'])} sections, "
              f"{len(d['faq_answers'])} FAQ answers, "
              f"count {'ok' if not d['faq_count'] else 'deficient'}, "
              f"cost {'ok' if not d['cost'] else 'missing'}, "
              f"insurance {'ok' if not d['insurance'] else 'missing'}")
        before = html
        # Deterministic trims first — over-length items cost no calls.
        html = _trim_overlong(html, row,
                              measure_article(html, metro, town))
        # FAQ count (same batched top-up as before the rounds).
        m = measure_article(html, metro, town)
        if len(m["faqs"]) < FAQ_COUNT_FLOOR:
            need = FAQ_COUNT_TARGET - len(m["faqs"])
            print(f"    sweep FAQ count top-up: {len(m['faqs'])} "
                  f"Q&As — generating {need} more")
            try:
                pairs = generate_faq_topups(
                    [f["q"] for f in m["faqs"]], need, row, model,
                    call)
            except Exception as e:  # noqa: BLE001
                print(f"    sweep FAQ top-up call failed ({e})")
                pairs = []
            if pairs:
                html = append_faq_qas(html, pairs)
        # 5b topics (cost / insurance presence).
        html = _ensure_faq_topics(html, row, model, call)
        # Per-item dedicated attempts for what is still short.
        sec_t, faq_t = _budgeted_targets(
            measure_article(html, metro, town))
        m = measure_article(html, metro, town)
        for key in [k for k, s in m["services"].items()
                    if s["words"] < SEC_MIN]:
            html = _fix_section_sweep(html, key, row, model, call,
                                      sec_t, sec_t + 30)
        m = measure_article(html, metro, town)
        for i in [i for i, f in enumerate(m["faqs"])
                  if f["words"] < FAQ_MIN]:
            html = _fix_faq_sweep(html, i, row, model, call,
                                  faq_t, faq_t + 12)
        if html == before:
            print(f"  final sweep {it}: no change — stopping")
            break
    return html


def _print_final_verdict(m: dict) -> None:
    """Final self-measurement, logged before the draft is stored.
    Deficient items are printed in the gate's own FAIL-line formats
    (validate.py checks 3b / 5 / 5b) so the run log reads exactly
    like the gate will."""
    bad_secs = [f"{k}: h2 missing" for k in gate.SERVICE_H2_KEYS
                if k not in m["services"]]
    bad_secs += [f"{k}: {s['words']} words"
                 for k, s in m["services"].items()
                 if not SEC_MIN <= s["words"] <= SEC_MAX]
    bad_faqs = [(f["q"][:40], f["words"]) for f in m["faqs"]
                if not FAQ_MIN <= f["words"] <= FAQ_MAX]
    n = len(m["faqs"])
    ok_secs = sum(1 for s in m["services"].values()
                  if SEC_MIN <= s["words"] <= SEC_MAX)
    ok_faqs = sum(1 for f in m["faqs"]
                  if FAQ_MIN <= f["words"] <= FAQ_MAX)
    print(f"  final self-measurement: sections {ok_secs}/10 in "
          f"range, FAQ answers {ok_faqs}/{n} in range, FAQ count "
          f"{n} (gate {FAQ_COUNT_FLOOR}–{FAQ_COUNT_MAX}), cost "
          f"question: {'yes' if m['has_cost'] else 'NO'}, insurance "
          f"question: {'yes' if m['has_insurance'] else 'NO'}")
    deficient = []
    if bad_secs:
        deficient.append("3b — " + "; ".join(bad_secs))
    if bad_faqs or not FAQ_COUNT_FLOOR <= n <= FAQ_COUNT_MAX:
        line = f"5 — {n} Q&As"
        if bad_faqs:
            line += f"; bad lengths: {bad_faqs}"
        deficient.append(line)
    if not (m["has_cost"] and m["has_insurance"]):
        deficient.append(
            f"5b — cost question: {m['has_cost']}, insurance "
            f"question: {m['has_insurance']}")
    if not BODY_FLOOR <= m["total"] <= BODY_CEIL:
        deficient.append(
            f"12 — body {m['total']} words (gate "
            f"{BODY_FLOOR}–{BODY_CEIL})")
    for line in deficient:
        print(f"  final self-measurement: STILL DEFICIENT — {line}")
    if not deficient:
        print("  final self-measurement: every sweep check in gate "
              "range")
    else:
        print(f"  final self-measurement: body {m['total']} words "
              f"(gate {BODY_FLOOR}–{BODY_CEIL})")


def repair_article(html: str, row: dict, siblings: list[dict],
                   model: str, call=call_groq_text) -> str:
    """Measure-and-repair a generated draft before it is stored.

    Order: inject sibling links → FAQ count top-up (one batched call,
    only when the count landed under the gate floor) → up to 2
    expansion rounds for deficient service sections / FAQ answers →
    gate-aligned final sweep (bounded fix-measure loop: trims, 5b
    topic top-up, per-item retries with rejection reasons) → pillar-
    link injection → trim backstop if the body overshoots the
    ceiling → top-up if it is still under the floor → final
    self-measurement verdict. Every step re-measures with the gate's
    own counters. Expansion calls are batched and paced (run #14:
    ~44 unpaced calls all bounced off Groq's per-minute 429 limit).
    The FAQ top-up runs before the rounds so a short appended answer
    can still be expanded, and before the ceiling backstop so its
    words are counted there; the sweep runs before pillar injection
    so a re-expanded section can't lose its anchors, and pillar
    injection runs before the backstop so any appended "More on"
    words are counted there too.
    """
    metro, town = row["metro_slug"], row["town_slug"]
    html = inject_sibling_links(html, row, siblings)
    m = measure_article(html, metro, town)
    print(f"  repair pass: draft {m['total']} words, "
          f"{len(m['siblings'])} sibling links")
    if not m["aligned"]:
        print("  repair pass: section alignment mismatch — skipping "
              "splice-based repair (gate will judge the raw draft)")
        return html

    # Pace every repair-pass Groq call a few seconds apart so a
    # town's calls spread over minutes instead of one second.
    made = {"n": 0}

    def paced(system: str, user: str, model: str) -> str:
        if made["n"]:
            time.sleep(REPAIR_PACE_S)
        made["n"] += 1
        return call(system, user, model)

    # FAQ count top-up (run #15: 11 Q&As against the gate's 12–15).
    # One batched call, appended into the FAQ div, aimed at
    # FAQ_COUNT_TARGET so the count stops depending on the model's
    # arithmetic. Runs before the expansion rounds and the ceiling.
    m = measure_article(html, metro, town)
    if len(m["faqs"]) < FAQ_COUNT_FLOOR:
        need = FAQ_COUNT_TARGET - len(m["faqs"])
        print(f"  FAQ count top-up: {len(m['faqs'])} Q&As — "
              f"generating {need} more (target {FAQ_COUNT_TARGET})")
        try:
            pairs = generate_faq_topups(
                [f["q"] for f in m["faqs"]], need, row, model, paced)
        except Exception as e:  # noqa: BLE001 — gate judges the draft
            print(f"    FAQ top-up call failed ({e})")
            pairs = []
        if pairs:
            html = append_faq_qas(html, pairs)
            print(f"    FAQ count top-up: added {len(pairs)} Q&As")

    for rnd in (1, 2):
        m = measure_article(html, metro, town)
        bad_secs = {k: s for k, s in m["services"].items()
                    if s["words"] < SEC_MIN}
        bad_faqs = [i for i, f in enumerate(m["faqs"])
                    if f["words"] < FAQ_MIN]
        under_total = m["total"] < BODY_FLOOR + 50
        if not bad_secs and not bad_faqs and not under_total:
            break
        sec_t, faq_t = _budgeted_targets(m)
        print(f"  round {rnd}: {len(bad_secs)} short sections, "
              f"{len(bad_faqs)} short FAQ answers, total {m['total']} "
              f"(targets: sections {sec_t}, FAQ {faq_t})")
        prefix, segments = split_article(html)
        sec_items = list(bad_secs.items())
        for start in range(0, len(sec_items), BATCH_SEC_SIZE):
            chunk = sec_items[start:start + BATCH_SEC_SIZE]
            bodies = expand_service_batch(
                [segments[s["index"]] for _, s in chunk],
                sec_t, sec_t + 30, row, model, paced)
            for (key, s), new_body in zip(chunk, bodies):
                if new_body:
                    segments[s["index"]]["body"] = "\n" + new_body + "\n"
                    print(f"    {key}: {s['words']} → "
                          f"{gate.words(_strip(new_body))} words")
        html = join_article(prefix, segments)
        if bad_faqs:
            m_now = measure_article(html, metro, town)
            for start in range(0, len(bad_faqs), BATCH_FAQ_SIZE):
                idxs = [i for i in bad_faqs[start:start + BATCH_FAQ_SIZE]
                        if i < len(m_now["faqs"])]
                if not idxs:
                    continue
                answers = expand_faq_batch(
                    [m_now["faqs"][i] for i in idxs],
                    faq_t, faq_t + 12, row, model, paced)
                for i, new_text in zip(idxs, answers):
                    if new_text:
                        html = _replace_faq_answer(html, i, new_text)
                        print(f"    FAQ {i}: {m_now['faqs'][i]['words']} "
                              f"→ {gate.words(new_text)} words")

    # Gate-aligned final sweep (run #17): the rounds stop after 2
    # iterations even when an item they can measure is still
    # deficient, and 5b topic presence was never repaired at all.
    # The sweep keeps fixing — per item, with reasons — until the
    # draft measures clean or stops changing. Runs before pillar
    # injection so a re-expanded section can't lose its anchors.
    html = _final_sweep(html, row, model, paced)

    # Pillar links (run #15: only 2 of 10 linked by the model; the
    # gate needs ≥4 distinct). Deterministic injection, after the
    # rounds so expansions can't strip the anchors, before the
    # ceiling backstop so appended words are counted there.
    html = inject_pillar_links(html, row)

    # Trim backstop: expansions overshot the body ceiling.
    html = _enforce_ceiling(html, metro, town)

    # Top-up backstop: still under the body floor after both rounds.
    m = measure_article(html, metro, town)
    if m["total"] < BODY_FLOOR:
        print(f"  top-up: total {m['total']} under the {BODY_FLOOR} floor")
        prefix, segments = split_article(html)
        longest = sorted(m["services"].items(),
                         key=lambda kv: kv[1]["words"], reverse=True)
        for key, s in longest[:3]:
            if m["total"] >= BODY_FLOOR:
                break
            seg = segments[s["index"]]
            try:
                new_body = expand_service_section(
                    seg, 300, 350, row, model, paced)
            except Exception as e:  # noqa: BLE001
                print(f"    {key}: top-up call failed ({e})")
                new_body = None
            if new_body:
                segments[s["index"]]["body"] = "\n" + new_body + "\n"
                m = measure_article(join_article(prefix, segments),
                                    metro, town)
        html = join_article(prefix, segments)
        # A top-up can overshoot the ceiling; trim again if it did.
        html = _enforce_ceiling(html, metro, town)

    m = measure_article(html, metro, town)
    short_secs = [f"{k}: {s['words']}" for k, s in m["services"].items()
                  if not SEC_MIN <= s["words"] <= SEC_MAX]
    short_faqs = [f"{f['words']}" for f in m["faqs"]
                  if not FAQ_MIN <= f["words"] <= FAQ_MAX]
    print(f"  repair pass done: {m['total']} words "
          f"(gate {BODY_FLOOR}–{BODY_CEIL}), "
          f"{len(m['siblings'])} sibling links, "
          f"{len(m['pillars'])} pillar links, "
          f"{len(m['faqs'])} FAQ Q&As, "
          f"sections out of range: {short_secs or 'none'}, "
          f"FAQ answers out of range: {short_faqs or 'none'}")
    _print_final_verdict(m)
    return html


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

    # The model occasionally returns an unusable reply (run #16:
    # empty content killed the run in 21s). Retry the whole call a
    # couple of times before giving up — a fresh call usually lands
    # in the tagged format.
    out = None
    for attempt in range(3):
        try:
            out = call_llm(SYSTEM_PROMPT, build_user_message(row, sb),
                           args.model)
            break
        except Exception as e:  # noqa: BLE001
            print(f"GROK CALL FAILED (attempt {attempt + 1}/3): {e}",
                  file=sys.stderr)
            if attempt < 2:
                time.sleep(20)
    if out is None:
        raise SystemExit(1)
    html, omission = out["html"], out["omission_log"]

    if not html or not isinstance(omission, dict):
        print("GROK RETURNED UNUSABLE OUTPUT", file=sys.stderr)
        raise SystemExit(1)

    # Measure-and-repair: the model under-writes sections/FAQs and
    # skips sibling links (run #13), so fix the draft up to gate shape
    # here. A repair failure must not lose the draft — store it raw
    # and let the validation gate judge it.
    try:
        html = repair_article(html, row, fetch_siblings(sb, row),
                              args.model)
    except Exception as e:  # noqa: BLE001
        print(f"REPAIR PASS FAILED ({e}) — storing raw draft",
              file=sys.stderr)

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
