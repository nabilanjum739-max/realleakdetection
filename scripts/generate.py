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
   targets in the template below sum to ~4,080 at minimum service/FAQ
   sizes — there is NO slack: keep services near 200 words each and the
   FAQ at 12 Q&As unless you cut elsewhere first. If you are over budget,
   cut in this order first: N12, N10, N9, N7, N4, N8.
   NEVER cut a service section below 200 words, never cut the N2 or N5
   tables, never cut the FAQ below 12 Q&As.
   LENGTH MINIMUMS (mechanical — a validator counts every word): each of
   the 10 service sections ≥200 words; each FAQ answer ≥50 words; the
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
18. FAQ <h2>: 12–15 questions, each answer 50–70 words, direct answer in
    sentence one. 50 words per answer is a HARD MINIMUM (repeated from
    rule 7): an answer under 50 words mechanically fails validation.
    The set MUST include at least one question about cost or
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


def call_groq_text(system: str, user: str, model: str) -> str:
    """One raw Groq chat call; returns the message content, fences stripped."""
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
    return re.sub(r"^```(?:json|html)?|```$", "", content.strip(),
                  flags=re.MULTILINE).strip()


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
    return json.loads(content)


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
# =====================================================================
import validate as gate  # same directory; gate logic is the source of truth

SEC_MIN, SEC_MAX = 200, 400        # gate check 3b
FAQ_MIN, FAQ_MAX = 50, 80          # gate check 5
BODY_FLOOR, BODY_CEIL = gate.BODY_MIN, gate.BODY_MAX   # gate check 12
TOTAL_AIM = 3900                   # land mid-band, not on an edge
TOTAL_SOFT_MAX = 4050              # trim backstop engages above this

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


def measure_article(html: str, metro: str, town: str) -> dict:
    """Measure a draft with the gate's own parser and counters.

    Returns total words, per-service-section word counts (with the
    segment index to splice), FAQ answer word counts, and the sibling
    link count — exactly as validate.py checks 3b/5/11/12 see them.
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
    return {
        "total": gate.words(_strip(html)),
        "services": services,
        "faqs": [{"q": q, "words": gate.words(a)}
                 for q, a in parser.faq_qas],
        "siblings": sibs,
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


def expand_service_section(seg: dict, lo: int, hi: int, row: dict,
                           model: str, call) -> str | None:
    """One focused expansion call for a service section body."""
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
    out = call(EXPAND_SYSTEM, user, model)
    reason = _expansion_rejected(out, service=True,
                                 original_html=seg["body"])
    if reason:
        print(f"    expansion rejected ({reason})")
        return None
    return _ensure_gas_safety(seg["body"], out)


def expand_faq_answer(faq: dict, lo: int, hi: int, row: dict,
                      model: str, call) -> str | None:
    """One focused expansion call for a single FAQ answer (plain text)."""
    user = (
        f"TOWN DATA — the only source of local facts:\n"
        f"{_grounding_json(row)}\n\n"
        f"QUESTION: {faq['q']}\n"
        f"Expand the answer to this question to {lo}–{hi} words of "
        f"plain text (no HTML, no markdown). Keep a direct answer in "
        f"the first sentence, then add the reasoning and one concrete "
        f"action the homeowner can take. Use only the data above. "
        f"Return ONLY the answer text.")
    out = _strip(call(EXPAND_SYSTEM, user, model)).strip()
    out = re.sub(r"\s+", " ", out)
    reason = _expansion_rejected(out, service=False, original_html="")
    if reason:
        print(f"    FAQ expansion rejected ({reason})")
        return None
    if gate.words(out) <= faq["words"]:
        print("    FAQ expansion did not grow the answer")
        return None
    return out


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


def _trim_section_body(body: str, target_words: int,
                       floor: int = 0) -> str:
    """Drop trailing <p> blocks until the body fits (never tables, never
    a block containing '911', never the injected nearby-guides
    paragraph, always keep at least one paragraph, and never drop a
    paragraph that would take the body under `floor`)."""
    while gate.words(_strip(body)) > target_words:
        paras = list(re.finditer(r"<p\b[^>]*>.*?</p>", body,
                                 re.DOTALL | re.I))
        removable = [m for m in paras
                     if "911" not in _strip(m.group(0))
                     and "nearby-guides" not in m.group(0)]
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
    ~202), longest FAQ answer (sentence trims, floor ~51), then the
    longest other section's paragraphs (floor ~45). The gate's ceiling
    is never a reason to fail if words can come out — but no trim may
    push an item under its own gate floor.
    """
    m = measure_article(html, metro, town)
    guard = 0
    while m["total"] > TOTAL_SOFT_MAX and guard < 60:
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
                segments[idx]["body"], target, floor=201)
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
        # Tier 3: longest other sections (never the FAQ segment).
        if not changed:
            service_idx = {s["index"] for s in m["services"].values()}
            others = []
            for i, seg in enumerate(segments):
                if i in service_idx or 'class="faq"' in seg["body"]:
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
        if not changed:
            break
        m = measure_article(html, metro, town)
    return html


def repair_article(html: str, row: dict, siblings: list[dict],
                   model: str, call=call_groq_text) -> str:
    """Measure-and-repair a generated draft before it is stored.

    Order: inject sibling links → up to 2 expansion rounds for
    deficient service sections / FAQ answers → trim backstop if the
    body overshoots the ceiling → top-up if it is still under the
    floor. Every step re-measures with the gate's own counters.
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
        for key, s in bad_secs.items():
            seg = segments[s["index"]]
            try:
                new_body = expand_service_section(
                    seg, sec_t, sec_t + 30, row, model, call)
            except Exception as e:  # noqa: BLE001 — keep original on failure
                print(f"    {key}: expansion call failed ({e})")
                new_body = None
            if new_body:
                segments[s["index"]]["body"] = "\n" + new_body + "\n"
                print(f"    {key}: {s['words']} → "
                      f"{gate.words(_strip(new_body))} words")
        html = join_article(prefix, segments)
        for i in bad_faqs:
            m_now = measure_article(html, metro, town)
            if i >= len(m_now["faqs"]):
                break
            try:
                new_text = expand_faq_answer(
                    m_now["faqs"][i], faq_t, faq_t + 12, row, model, call)
            except Exception as e:  # noqa: BLE001
                print(f"    FAQ {i}: expansion call failed ({e})")
                new_text = None
            if new_text:
                html = _replace_faq_answer(html, i, new_text)
                print(f"    FAQ {i}: {m_now['faqs'][i]['words']} → "
                      f"{gate.words(new_text)} words")

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
                    seg, 300, 350, row, model, call)
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
          f"sections out of range: {short_secs or 'none'}, "
          f"FAQ answers out of range: {short_faqs or 'none'}")
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

    try:
        out = call_llm(SYSTEM_PROMPT, build_user_message(row, sb), args.model)
        html, omission = out["html"], out["omission_log"]
    except Exception as e:  # noqa: BLE001
        print(f"GROK CALL FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)

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
