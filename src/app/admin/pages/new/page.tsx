import AdminShell from "@/components/admin/AdminShell";
import PageForm from "@/components/admin/PageForm";

export default function NewPagePage() {
  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Nueva página</h2>
        </div>
      </div>
      <PageForm mode="create" />
    </AdminShell>
  );
}
