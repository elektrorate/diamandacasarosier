import AdminShell from "@/components/admin/AdminShell";
import MenuForm from "@/components/admin/MenuForm";

export default function NewMenuPage() {
  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Nuevo menú</h2>
        </div>
      </div>
      <MenuForm mode="create" />
    </AdminShell>
  );
}
