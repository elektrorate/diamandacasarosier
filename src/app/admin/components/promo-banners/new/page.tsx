import AdminShell from "@/components/admin/AdminShell"; import PromoBannerForm from "@/components/admin/PromoBannerForm";

export default function Page() { return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Nuevo banner</h2></div></div><PromoBannerForm mode="create" /></AdminShell>); }
