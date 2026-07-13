import AdminShell from "@/components/admin/AdminShell"; import PromoBannerForm from "@/components/admin/PromoBannerForm"; import SectionEmptyState from "@/components/admin/SectionEmptyState"; import { getPromoBannerById } from "@/lib/cms/promo-banners";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const item = await getPromoBannerById((await params).id);
  if (!item) return (<AdminShell><SectionEmptyState title="No encontrado" description="El banner no existe." actionHref="/admin/components/promo-banners" actionLabel="Volver" /></AdminShell>);
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Editar banner</h2></div></div><PromoBannerForm mode="edit" item={item} /></AdminShell>);
}
