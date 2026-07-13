import AdminShell from "@/components/admin/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";
import { getMenuByLocation } from "@/lib/cms/menus";
import { getSettings } from "@/lib/cms/settings";

export default async function SettingsPage() {
  const [settings, mainMenu] = await Promise.all([
    getSettings(),
    getMenuByLocation("main"),
  ]);

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Configuración global</h2>
          <p className="muted">Ajustes generales del sitio Casa Rosier.</p>
        </div>
      </div>

      <SettingsForm initial={settings} initialMenu={mainMenu} />
    </AdminShell>
  );
}
