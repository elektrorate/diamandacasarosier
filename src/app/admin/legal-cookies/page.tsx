import AdminShell from "@/components/admin/AdminShell";
import LegalForm from "@/components/admin/LegalForm";

export default function PrivacyPolicyAdminPage() {
  return (
    <AdminShell>
      <div className="page-card">
        <div className="page-header">
          <div>
            <p className="auth-kicker">CMS</p>
            <h2>Políticas de privacidad</h2>
            <p className="muted">Edita el contenido Markdown que alimenta la página pública de privacidad.</p>
          </div>
        </div>
        <LegalForm />
      </div>
    </AdminShell>
  );
}
