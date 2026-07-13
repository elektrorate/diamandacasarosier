import AdminShell from "@/components/admin/AdminShell"; import FaqForm from "@/components/admin/FaqForm";

export default function Page() { return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Nueva FAQ</h2></div></div><FaqForm mode="create" /></AdminShell>); }
