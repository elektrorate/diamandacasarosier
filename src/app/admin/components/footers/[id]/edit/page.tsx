import AdminShell from "@/components/admin/AdminShell"; import FooterForm from "@/components/admin/FooterForm"; import SectionEmptyState from "@/components/admin/SectionEmptyState"; import { getFooterById } from "@/lib/cms/footers";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const item = await getFooterById((await params).id);
  if (!item) return (<AdminShell><SectionEmptyState title="No encontrado" description="El footer no existe." actionHref="/admin/components/footers" actionLabel="Volver" /></AdminShell>);
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Editar footer</h2></div></div><FooterForm mode="edit" item={item} /></AdminShell>);
}
