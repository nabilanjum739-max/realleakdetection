#!/usr/bin/env python3
"""The 11-point validation gate (TEMPLATE.md) as checkable code, plus the
§3.3 checks (12–17: article-body budget, symptom + pricing tables,
N-section headings, banned claims words, no repeated cost line).

Checks a generated town page (Supabase row + page_html) and the site
scaffold. Prints PASS/FAIL per rule. Exits non-zero on ANY failure —
the GitHub Action stops and the page never publishes.

Usage:
    python scripts/validate.py --metro houston --town katy
    python scripts/validate.py --metro houston --town katy \
        --html-file /tmp/katy.html --row-json /tmp/katy-row.json
        # local fixture mode: no Supabase access, same checks
"""
import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

from common import PROJECT_ROOT, RESEARCH_COLUMNS, get_supabase, get_town_row

# The Next.js site lives at the REPO ROOT in git (schema builder:
# lib/schema.ts — the Actions runner checks the repo out with scripts/
# at its root, so the builder is scripts/../lib/schema.ts). The local
# workspace keeps its copy of the app under site/ instead, so resolve
# the builder by trying the repo-root layout first, then site/.
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
SITE_DIR = PROJECT_ROOT / "site"


def schema_builder_path(root: Path | None = None) -> Path:
    """Locate the site's schema builder (lib/schema.ts).

    Prefers <root>/lib/schema.ts (repo layout, what the gate runs
    against in Actions); falls back to <root>/site/lib/schema.ts
    (local workspace layout). Returns the repo-layout path when
    neither exists, so the failure detail names the expected file.
    """
    root = root if root is not None else REPO_ROOT
    for cand in (root / "lib" / "schema.ts",
                 root / "site" / "lib" / "schema.ts"):
        if cand.exists():
            return cand
    return root / "lib" / "schema.ts"

# ---- mirrors site/lib/site.ts buildTitle/buildMetaDescription (TEMPLATE.md §1)
def build_title(town: str) -> str:
    base = f"Leak Detection in {town}, TX"
    full = base + " | Slab, Sewer & Gas"
    return full if len(full) <= 60 else base

def build_meta(row: dict) -> str:
    town = row["town"]
    hoods = [h.strip() for h in (row.get("neighborhoods") or "").split(";")]
    hoods = [h for h in hoods if h][:2]
    price = (row.get("price_leak_detection") or "").strip()
    low = ""
    m = re.search(r"\$([\d,]+)", price)
    if m:
        low = f" from ${m.group(1)}"
    parts = [f"Leak detection in {town}, TX{low}.",
             "Slab, sewer, gas & pool leak guide"]
    if hoods:
        parts.append(f"serving {', '.join(hoods)} & more.")
    parts.append("Compare local pros.")
    meta = " ".join(parts)
    return meta if len(meta) <= 155 else meta[:152] + "..."

SERVICE_H2_KEYS = [
    "slab leak", "yard line", "water main", "sewer line",
    "sewer camera", "septic", "gas line", "pool leak",
    "tankless", "sprinkler",
]
BANNED_PHRASES = [
    "delve", "tapestry", "in today's fast-paced world", "look no further",
    "top-notch", "unparalleled", "when it comes to", "it's important to note",
    "moreover", "furthermore", "vibrant", "bustling", "nestled",
    "in conclusion",
]
PLACEHOLDERS = ["[town]", "{{", "}}", "lorem", "xxx",
                "your town here", "xyz plumbing"]

# §3.3 banned claims — must not appear anywhere in article text. (The
# generation prompt bans the same words; the gate is the backstop.)
# "free" alone is too broad (e.g. "feel free"); only the claim phrases.
BANNED_CLAIMS = [
    ("specialist", re.compile(r"\bspecialist\b", re.I)),
    ("expert", re.compile(r"\bexpert\b", re.I)),
    ("same-day", re.compile(r"\bsame[\s-]?day\b", re.I)),
    ("free assessment", re.compile(r"\bfree assessment\b", re.I)),
    ("free quotes", re.compile(r"\bfree quotes?\b", re.I)),
    ("single visit", re.compile(r"\bsingle visit\b", re.I)),
]

# N-section H2 headings the §3.3 spec requires (tolerant wording — match
# on the distinctive phrase, not an exact title).
N_HEADINGS = [
    ("N1 local factor", re.compile(r"(why .* pipes fail|local factor)", re.I)),
    ("N3 neighbourhoods", re.compile(r"neighbourhood|neighborhood", re.I)),
    ("N6 insurance", re.compile(r"insurance", re.I)),
    ("N7 city water / MUD", re.compile(r"(city water or mud|who bills you|leak adjustment)", re.I)),
    ("N8 seasonal", re.compile(r"by season|seasonal", re.I)),
    ("N9 questions to ask", re.compile(r"(questions to ask|what to ask any)", re.I)),
    ("N11 real questions", re.compile(r"real .* questions", re.I)),
    ("N12 how we compare", re.compile(r"(how we compare|what to demand)", re.I)),
]

# Article-body budget (§3.3): hard cap, measured on the same article text
# the prompt produces (all text inside <article>, tables + FAQ included).
BODY_MIN, BODY_MAX = 3700, 4100


def tables(html: str) -> list[str]:
    """Plain-text contents of every <table> in the article."""
    out = []
    for m in re.finditer(r"<table.*?</table>", html, re.DOTALL | re.I):
        out.append(re.sub(r"<[^>]+>", " ", m.group(0)))
    return out


def dollar_ranges(s: str) -> list[str]:
    """Normalised $ ranges in a text fragment, e.g. '$150-$400'.

    Normalises en/em dashes and hyphen-minus to '-', strips spaces and
    commas, so '$150–$400' and '$150 - $400' count as the same range.
    """
    found = []
    for m in re.finditer(r"\$\s*([\d,]+)\s*[–—\-]\s*\$?\s*([\d,]+)", s):
        found.append(f"${m.group(1).replace(',', '')}-${m.group(2).replace(',', '')}")
    return found


def amounts(s: str) -> list[str]:
    """Bare dollar amounts in a text fragment, normalised ('$150')."""
    return [f"${m.group(1).replace(',', '')}"
            for m in re.finditer(r"\$\s*([\d,]+)", s)]


class SectionParser(HTMLParser):
    """Collect (h2_text, body_text) pairs and the FAQ block."""
    def __init__(self):
        super().__init__()
        self.sections = []          # list of [h2, text]
        self._h2 = None
        self._buf = []
        self._in_h2 = False
        self.faq_qas = []           # list of (question, answer)
        self._in_faq = False
        self._faq_depth = 0
        self._in_h3 = False
        self._in_p = False
        self._q, self._a = "", ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h2":
            if self._h2 is not None:
                self.sections.append((self._h2, " ".join(self._buf)))
            self._h2, self._buf, self._in_h2 = "", [], True
        elif tag == "div" and "faq" in (attrs.get("class") or ""):
            self._in_faq, self._faq_depth = True, 1
        elif self._in_faq and tag == "div":
            self._faq_depth += 1
        elif self._in_faq and tag == "h3":
            self._in_h3 = True
            self._q = ""
        elif self._in_faq and tag == "p":
            self._in_p = True
            self._a = ""

    def handle_endtag(self, tag):
        if tag == "h2":
            self._in_h2 = False
        elif self._in_faq and tag == "div":
            self._faq_depth -= 1
            if self._faq_depth <= 0:
                self._in_faq = False
        elif tag == "h3" and self._in_h3:
            self._in_h3 = False
        elif tag == "p" and self._in_p:
            self._in_p = False
            if self._q.strip() and self._a.strip():
                self.faq_qas.append((self._q.strip(), self._a.strip()))
            self._q, self._a = "", ""

    def handle_data(self, data):
        if self._in_h2:
            self._h2 += data
        elif self._in_faq and self._in_h3:
            self._q += data
        elif self._in_faq and self._in_p:
            self._a += data
        elif self._h2 is not None:
            self._buf.append(data)

    def close(self):
        if self._h2 is not None:
            self.sections.append((self._h2, " ".join(self._buf)))
        super().close()


def words(s: str) -> int:
    return len(re.findall(r"\w+", s))


class Gate:
    def __init__(self):
        self.failures = []

    def check(self, name: str, ok: bool, detail: str = ""):
        print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" — {detail}" if detail and not ok else ""))
        if not ok:
            self.failures.append(name)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--metro", required=True)
    ap.add_argument("--town", required=True)
    ap.add_argument("--html-file", default=None,
                    help="Local fixture: read page_html from this file "
                         "instead of Supabase (with --row-json).")
    ap.add_argument("--row-json", default=None,
                    help="Local fixture: town row as JSON (town, "
                         "metro_slug, town_slug, parent_metro, "
                         "neighborhoods, price_* fields, omission_log, "
                         "page_status). Required with --html-file.")
    args = ap.parse_args()
    g = Gate()

    if args.html_file:
        import json
        if not args.row_json:
            print("--html-file requires --row-json", file=sys.stderr)
            raise SystemExit(2)
        html = Path(args.html_file).read_text()
        row = json.loads(Path(args.row_json).read_text())
    else:
        sb = get_supabase()
        row = get_town_row(sb, args.metro, args.town)
        html = row.get("page_html") or ""
    omission = row.get("omission_log") or {}
    text = re.sub(r"<[^>]+>", " ", html).lower()

    # 1. omission log accounts for all 18 fields
    logged = set(omission.get("used", [])) | set(omission.get("blank", []))
    missing = [c for c in RESEARCH_COLUMNS if c not in logged]
    g.check("1. omission log covers all 18 fields", not missing,
            f"unaccounted: {missing}")

    # 2. zero placeholders
    found = [p for p in PLACEHOLDERS if p in text]
    g.check("2. no placeholders", not found, f"found: {found}")

    # 3. word counts (TEMPLATE.md budget: sections 200–400; total ceiling
    # raised to 6,500 because 10 sections at up to 400 words + 15 FAQs at
    # up to 80 words can legitimately total ~6,600)
    total = words(text)
    g.check("3a. total words 2,000–6,500", 2000 <= total <= 6500, f"{total}")
    parser = SectionParser()
    parser.feed(html)
    parser.close()
    sec_failed = []
    for key in SERVICE_H2_KEYS:
        match = next(((h, b) for h, b in parser.sections
                      if key in h.lower()), None)
        if not match:
            sec_failed.append(f"{key}: h2 missing")
            continue
        w = words(match[1])
        if not 200 <= w <= 400:
            sec_failed.append(f"{key}: {w} words")
    g.check("3b. 10 service sections 200–400 words each", not sec_failed,
            "; ".join(sec_failed))

    # 4. title/meta (built from data fields, same logic as the site)
    title, meta = build_title(row["town"]), build_meta(row)
    g.check("4a. title ≤60 chars with Town, TX",
            len(title) <= 60 and f"{row['town']}, TX" in title, title)
    g.check("4b. meta ≤155 chars", len(meta) <= 155, f"{len(meta)} chars")

    # 5. FAQ: 12–15 Q&As, answers 50–80 words (TEMPLATE.md §14: 50–70
    # target, gate allows up to 80)
    n = len(parser.faq_qas)
    bad = [(q[:40], words(a)) for q, a in parser.faq_qas
           if not 50 <= words(a) <= 80]
    g.check("5. FAQ 12–15 Q&As, answers 50–80 words",
            12 <= n <= 15 and not bad,
            f"{n} Q&As" + (f"; bad lengths: {bad}" if bad else ""))

    # 5b. FAQ must cover the two top customer topics: cost and insurance
    questions = " ".join(q.lower() for q, _ in parser.faq_qas)
    has_cost = any(k in questions for k in
                   ("cost", "price", "how much", "charge"))
    has_insurance = any(k in questions for k in
                        ("insurance", "claim", "covered"))
    g.check("5b. FAQ includes cost + insurance questions",
            has_cost and has_insurance,
            f"cost question: {has_cost}, insurance question: {has_insurance}")

    # 6. gas safety box: 911-first language in the gas section
    gas = next((b for h, b in parser.sections if "gas line" in h.lower()), "")
    g.check("6. gas section has 911/utility-first safety language",
            "911" in gas, "no '911' in gas section")

    # 7. no reviews / testimonials / case studies
    bad_tokens = [t for t in ("testimonial", "★★★★★", "case study")
                  if t in text]
    # "review" alone is too common; flag only review-ish blocks
    if re.search(r"customer reviews?|what (our )?customers say", text):
        bad_tokens.append("review block")
    g.check("7. no reviews/testimonials/case studies", not bad_tokens,
            f"found: {bad_tokens}")

    # 8. pricing honesty: "typically" + metro attribution near prices
    has_typ = "typically" in text
    has_metro = row["parent_metro"].lower() in text
    g.check("8. pricing says 'typically' + metro area", has_typ and has_metro,
            "'typically' or metro name missing")

    # 9. banned AI-tell phrases
    bad_ph = [p for p in BANNED_PHRASES if p in text]
    g.check("9. no AI-tell phrases", not bad_ph, f"found: {bad_ph}")

    # 10. schema: all six types present in the site's schema builder
    # (Service + Organization replaced LocalBusiness per the pre-launch plan)
    schema_file = schema_builder_path()
    schema_ok, schema_detail = False, "lib/schema.ts missing"
    if schema_file.exists():
        src = schema_file.read_text()
        need = ["Service", "Organization", "FAQPage", "HowTo",
                "BreadcrumbList", "Speakable"]
        missing_t = [t for t in need if t not in src]
        schema_ok = not missing_t
        schema_detail = f"missing: {missing_t}" if missing_t else \
            "all six types in schema builder"
    g.check("10. schema stack (6 types) in site builder", schema_ok,
            schema_detail)

    # 11. internal links: parse the REAL links inside the article HTML
    # (TEMPLATE.md §16) — ≥3 sibling town guides + ≥4 service pillars,
    # linked contextually in the body, not just present in some table.
    hrefs = re.findall(r'href="([^"]+)"', html)
    sib_slugs, pillar_slugs = set(), set()
    for h in hrefs:
        m = re.search(r"/tx/([a-z0-9-]+)/([a-z0-9-]+)/?$", h)
        if m and m.group(1) == args.metro and m.group(2) != args.town:
            sib_slugs.add(m.group(2))
        m = re.search(r"/services/([a-z0-9-]+)/?$", h)
        if m:
            pillar_slugs.add(m.group(1))
    links_ok = len(sib_slugs) >= 3 and len(pillar_slugs) >= 4
    g.check("11. internal links in article (≥3 siblings, ≥4 pillars)",
            links_ok,
            f"{len(sib_slugs)} sibling links, {len(pillar_slugs)} pillar links")

    # 12. article-body budget (§3.3 hard cap, same body the prompt
    # produces — all text inside <article>, tables + FAQ included).
    # Check 3a's 2,000–6,500 range is kept as-is; this is the tighter cap.
    g.check(f"12. article body {BODY_MIN:,}–{BODY_MAX:,} words",
            BODY_MIN <= total <= BODY_MAX, f"{total} words")

    # 13. symptom table (N2): a table carrying urgency values.
    tbls = tables(html)
    urg_words = ("today", "this week", "soon", "911")
    sym_ok = any("urgency" in t.lower() and
                 sum(w in t.lower() for w in urg_words) >= 2 for t in tbls)
    g.check("13. symptom table present (N2, with urgency values)", sym_ok,
            "no table with 'Urgency' + urgency values found" if not sym_ok else "")

    # 14. pricing table (N5): a table carrying the researched detection
    # and camera ranges from the town row.
    det_amounts = amounts(row.get("price_leak_detection") or "")
    cam_amounts = amounts(row.get("price_sewer_camera") or "")
    price_ok = False
    if det_amounts and cam_amounts:
        price_ok = any(det_amounts[0].lower() in t.lower() and
                       cam_amounts[0].lower() in t.lower() for t in tbls)
    g.check("14. pricing table present (N5, researched detection/camera ranges)",
            price_ok,
            f"detection {det_amounts[:1]}, camera {cam_amounts[:1]} not both in one table"
            if not price_ok else "")

    # 15. N-section headings present (H2 match, tolerant wording).
    h2_texts = [h for h, _ in parser.sections]
    missing_n = [label for label, pat in N_HEADINGS
                 if not any(pat.search(h) for h in h2_texts)]
    g.check("15. N1/N3/N6/N7/N8/N9/N11/N12 headings present", not missing_n,
            f"missing: {missing_n}")

    # 16. banned claims words nowhere in article text.
    found_claims = [label for label, pat in BANNED_CLAIMS if pat.search(text)]
    g.check("16. no banned claims words (specialist/expert/same-day/"
            "free assessment/free quotes/single visit)", not found_claims,
            f"found: {found_claims}")

    # 17. no repeated cost-line pattern: the same $ range appearing in
    # >3 service sections means the per-section cost line is back.
    range_sections: dict[str, int] = {}
    for key in SERVICE_H2_KEYS:
        match = next(((h, b) for h, b in parser.sections
                      if key in h.lower()), None)
        if not match:
            continue
        for r in set(dollar_ranges(match[1])):
            range_sections[r] = range_sections.get(r, 0) + 1
    worst = max(range_sections.items(), key=lambda kv: kv[1],
                default=(None, 0))
    g.check("17. no repeated cost line (same $ range in ≤3 service sections)",
            worst[1] <= 3,
            f"{worst[0]} appears in {worst[1]} service sections"
            if worst[1] > 3 else "")

    print(f"\n{len(g.failures)} check(s) failed.")
    raise SystemExit(1 if g.failures else 0)


if __name__ == "__main__":
    main()
