"""Shared helpers for the leak-detection data pipeline.

Conventions:
- Env vars are read from the process environment, falling back to a local
  `.env` file in the project root (simple KEY=VALUE lines, no quoting magic).
- All Supabase access uses the SERVICE key (server-side only — never ship it
  to the browser).
- Slugs: lowercase, spaces/underscores -> hyphens, strip anything else.
"""
import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def load_dotenv(path: Path | None = None) -> None:
    """Minimal .env loader (stdlib only). Never overrides real env vars."""
    p = path or (PROJECT_ROOT / ".env")
    if not p.exists():
        return
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip("'\"")
        os.environ.setdefault(key, value)


load_dotenv()


def slugify(text: str) -> str:
    text = text.lower().strip().replace("_", "-")
    text = re.sub(r"[^a-z0-9\- ]", "", text)
    text = re.sub(r"\s+", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-")


def get_supabase():
    """Return a supabase client, or raise a clear error if env is missing."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    missing = [n for n, v in (("SUPABASE_URL", url),
                              ("SUPABASE_SERVICE_KEY", key)) if not v]
    if missing:
        raise RuntimeError(
            f"Missing env vars: {', '.join(missing)}. "
            "Set them in .env or your shell (see README)."
        )
    from supabase import create_client
    return create_client(url, key)


def get_town_row(sb, metro_slug: str, town_slug: str) -> dict:
    """Fetch one town row; raise if not found."""
    res = (sb.table("towns")
             .select("*")
             .eq("metro_slug", metro_slug)
             .eq("town_slug", town_slug)
             .limit(1)
             .execute())
    if not res.data:
        raise RuntimeError(f"Town not found: {metro_slug}/{town_slug}")
    return res.data[0]


# The 18 researched columns, in CSV order. The omission log must account
# for every one of these (TEMPLATE.md validation gate, rule 1).
RESEARCH_COLUMNS = [
    "town", "parent_metro", "state", "zip_codes", "soil_type",
    "soil_leak_note", "foundation_types", "housing_era",
    "common_pipe_materials", "neighborhoods", "price_leak_detection",
    "price_slab_detection", "price_sewer_camera", "permit_note",
    "water_utility", "climate_note", "seasonal_angle", "competitor_gap",
]
