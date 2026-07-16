import AdminShell from "@/components/admin/AdminShell";
import TestimonialsTable from "@/components/admin/TestimonialsTable";
import { getTestimonials } from "@/lib/cms/testimonials";

const filters = [
  { value: "all", label: "Todos", href: "/admin/components/testimonials" },
  { value: "draft", label: "Borrador", href: "/admin/components/testimonials?status=draft" },
  { value: "published", label: "Publicado", href: "/admin/components/testimonials?status=published" },
] as const;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const rawStatus = (await searchParams)?.status;
  const status = rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";
  const items = await getTestimonials();
  const filtered = items
    .filter((item) => item.status !== "deleted" && item.status !== "archived")
    .filter((item) => status === "all" || item.status === status)
    .sort((a, b) => a.sort_order - b.sort_order || +new Date(b.updated_at) - +new Date(a.updated_at));

  return (
    <AdminShell>
      <TestimonialsTable
        key={`${status}:${filtered.map((item) => `${item.id}:${item.sort_order}:${item.status}:${item.updated_at}`).join("|")}`}
        items={filtered}
        filters={filters}
        status={status}
      />
    </AdminShell>
  );
}
