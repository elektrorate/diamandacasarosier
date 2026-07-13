import AdminShell from "@/components/admin/AdminShell";
import PublicMenuEditor from "@/components/admin/PublicMenuEditor";
import { getMenuByLocation } from "@/lib/cms/menus";
import { getPublicNavigationItems, invalidatePublicNavigationCache } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";

export default async function MenuPage() {
  invalidatePublicNavigationCache();

  const [menu, settings, navigationItems] = await Promise.all([
    getMenuByLocation("main"),
    getSettings(),
    getPublicNavigationItems("main"),
  ]);

  return (
    <AdminShell>
      <PublicMenuEditor initialMenu={menu} initialSettings={settings} availableNavigationItems={navigationItems} />
    </AdminShell>
  );
}
