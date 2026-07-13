import AdminShell from "@/components/admin/AdminShell";
import UsersManager from "@/components/admin/UsersManager";
import TopBar from "@/components/layout/TopBar";

export default function UsersPage() {
  return (
    <AdminShell>
      <TopBar
        title="Usuarios"
        subtitle="Crea administradores, actualiza contraseñas y elimina accesos del CMS."
      />
      <div className="page-card">
        <div className="page-header">
          <div>
            <p className="auth-kicker">Accesos CMS</p>
            <h2>Administradores visibles</h2>
            <p className="muted">
              El super admin definido en el entorno no se muestra ni se puede modificar desde esta vista.
            </p>
          </div>
        </div>
        <UsersManager initialUsers={[]} />
      </div>
    </AdminShell>
  );
}
