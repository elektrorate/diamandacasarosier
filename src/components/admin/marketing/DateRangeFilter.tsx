"use client";

const presets = [
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
  { label: "Este año", days: 365 },
] as const;

export default function DateRangeFilter({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2 shadow-[0_8px_20px_rgba(11,28,48,0.04)]">
      <span className="material-symbols-outlined text-lg text-secondary" aria-hidden="true">calendar_today</span>
      <div className="flex gap-1">
        {presets.map((p) => (
          <button key={p.days} type="button" onClick={() => onChange(p.days)} className={`min-h-9 rounded-md px-3 py-1 text-label-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container ${value === p.days ? "bg-secondary text-on-secondary" : "text-on-surface-variant hover:bg-surface-container-high"}`} aria-pressed={value === p.days}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
