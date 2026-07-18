import AdminShell from "@/components/admin/AdminShell";
import FaqForm from "@/components/admin/FaqForm";
import { getFaqGroups } from "@/lib/cms/faqs";

export default async function Page() {
  const groups = await getFaqGroups();
  return (
    <AdminShell>
      <div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Nueva FAQ</h2></div></div>
      <FaqForm mode="create" groups={groups} />
    </AdminShell>
  );
}
