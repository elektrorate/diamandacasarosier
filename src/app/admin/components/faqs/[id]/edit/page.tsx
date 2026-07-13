import AdminShell from "@/components/admin/AdminShell"; import FaqForm from "@/components/admin/FaqForm"; import SectionEmptyState from "@/components/admin/SectionEmptyState"; import { getFaqById } from "@/lib/cms/faqs";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const item = await getFaqById((await params).id);
  if (!item) return (<AdminShell><SectionEmptyState title="No encontrada" description="La FAQ no existe." actionHref="/admin/components/faqs" actionLabel="Volver" /></AdminShell>);
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Editar FAQ</h2></div></div><FaqForm mode="edit" item={item} /></AdminShell>);
}
