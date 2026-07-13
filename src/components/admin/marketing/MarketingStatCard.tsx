export default function MarketingStatCard({ label, value, icon, trend }: { label: string; value: string | number; icon: string; trend?: { value: string; positive: boolean } }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-white px-5 py-4 shadow-[0_12px_28px_rgba(11,28,48,0.05)] transition-shadow hover:shadow-[0_16px_34px_rgba(11,28,48,0.08)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-secondary-container" aria-hidden="true" />
      <div className="flex items-center justify-between">
        <span className="text-label-md font-semibold text-on-surface-variant">{label}</span>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-container-low text-secondary" aria-hidden="true">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </span>
      </div>
      <p className="mt-1 text-headline-lg font-bold tabular-nums text-on-surface">{value}</p>
      {trend ? (
        <span className={`mt-1 inline-flex items-center gap-1 text-label-sm font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">{trend.positive ? "trending_up" : "trending_down"}</span>
          {trend.value}
        </span>
      ) : null}
    </div>
  );
}
