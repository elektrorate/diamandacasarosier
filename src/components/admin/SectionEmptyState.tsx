import Link from "@/components/admin/AdminLink";

export default function SectionEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link className="primary-btn inline" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
