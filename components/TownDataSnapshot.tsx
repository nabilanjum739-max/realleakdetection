import type { TownRow } from "@/lib/supabase";

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{label}</p>
      <div className="mt-3 text-[15px] leading-7 text-slate-700">{children}</div>
    </div>
  );
}

function has(v: string | null | undefined): v is string {
  return !!v && v.trim().length > 0;
}

/**
 * Renders the hyper-local researched fields straight from Supabase —
 * visible even before the Grok article exists. Blank fields are skipped
 * (never shown as "unknown" or invented).
 */
export default function TownDataSnapshot({ row }: { row: TownRow }) {
  const name = row.town;
  const hoods = (row.neighborhoods || "").split(";").map((h) => h.trim()).filter(Boolean);

  const prices: { label: string; value: string }[] = [];
  if (has(row.price_leak_detection)) prices.push({ label: "Leak detection", value: row.price_leak_detection! });
  if (has(row.price_slab_detection)) prices.push({ label: "Slab leak detection", value: row.price_slab_detection! });
  if (has(row.price_sewer_camera)) prices.push({ label: "Sewer camera inspection", value: row.price_sewer_camera! });

  const homeBits: string[] = [];
  if (has(row.foundation_types)) homeBits.push(`Foundations: ${row.foundation_types}`);
  if (has(row.housing_era)) homeBits.push(`Homes: ${row.housing_era}`);
  if (has(row.common_pipe_materials)) homeBits.push(`Pipes: ${row.common_pipe_materials}`);

  const climateBits: string[] = [];
  if (has(row.water_utility)) climateBits.push(`Water: ${row.water_utility}`);
  if (has(row.climate_note)) climateBits.push(row.climate_note!);
  if (has(row.seasonal_angle)) climateBits.push(row.seasonal_angle!);

  return (
    <section className="bg-slate-50" aria-label={`${name} local research data`}>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-blue-950 md:text-3xl">
          {name}: the local picture
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Researched facts about {name} — the ground, the homes and the pipes
          behind local leaks. No generic advice.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {has(row.soil_type) && (
            <Card label="Soil & why pipes fail">
              <p className="font-bold text-blue-950">{row.soil_type}</p>
              {has(row.soil_leak_note) && <p className="mt-1">{row.soil_leak_note}</p>}
            </Card>
          )}

          {homeBits.length > 0 && (
            <Card label="Homes & pipes">
              <ul className="space-y-1.5">
                {homeBits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Card>
          )}

          {hoods.length > 0 && (
            <Card label="Neighborhoods served">
              <div className="flex flex-wrap gap-2">
                {hoods.map((h) => (
                  <span key={h} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-900">
                    {h}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {prices.length > 0 && (
            <Card label="Typical local pricing">
              <p className="mb-2 text-xs text-slate-500">Metro-area ranges, honestly labeled — not quotes.</p>
              <ul className="space-y-2">
                {prices.map((p) => (
                  <li key={p.label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                    <span className="font-semibold text-slate-600">{p.label}</span>
                    <span className="font-extrabold text-blue-950">{p.value}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {climateBits.length > 0 && (
            <Card label="Water & climate">
              <ul className="space-y-1.5">
                {climateBits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </Card>
          )}

          {has(row.permit_note) && (
            <Card label="Permits">
              <p>{row.permit_note}</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
