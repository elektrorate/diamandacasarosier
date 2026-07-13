import AdminShell from "@/components/admin/AdminShell"; import TestimonialForm from "@/components/admin/TestimonialForm";

export default function Page() { return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Nuevo testimonio</h2></div></div><TestimonialForm mode="create" /></AdminShell>); }
