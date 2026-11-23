/**
 * Shared section eyebrow — small-caps teal label with a short rule
 * before it (Lovable design port, Nov 2026). Used above homepage
 * section headings; `tone="dark"` for navy backgrounds.
 */
export default function Eyebrow({
  children,
  tone = "light",
  center = false,
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  center?: boolean;
  className?: string;
}) {
  const textCls = tone === "dark" ? "text-teal-300" : "text-teal-700";
  const lineCls = tone === "dark" ? "bg-teal-300/70" : "bg-teal-500";
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] ${textCls} ${
        center ? "justify-center" : ""
      } ${className}`}
    >
      <span aria-hidden="true" className={`h-px w-8 shrink-0 ${lineCls}`} />
      <span>{children}</span>
    </p>
  );
}
