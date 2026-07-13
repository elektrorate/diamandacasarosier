import Link from "@/components/admin/AdminLink";

export default function EmptyMarketingState({ title, description, actionLabel, actionHref }: { title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-white px-6 py-16 text-center shadow-[0_12px_28px_rgba(11,28,48,0.04)]">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-surface-container-low text-secondary" aria-hidden="true">
        <span className="material-symbols-outlined text-3xl">analytics</span>
      </span>
      <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
      <p className="mt-1 max-w-md text-body-md text-on-surface-variant">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-label-md font-semibold text-on-secondary transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary-container">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
