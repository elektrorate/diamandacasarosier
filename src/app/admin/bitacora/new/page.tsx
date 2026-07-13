import AdminShell from "@/components/admin/AdminShell";
import BlogForm from "@/components/admin/BlogForm";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";

export default async function NewBitacora() {
  const [navigationItems, settings] = await Promise.all([
    getPublicNavigationItems("main"),
    getSettings(),
  ]);

  return (
    <AdminShell>
      <BlogForm mode="create" navigationItems={navigationItems} menuSettings={settings.menu} />
    </AdminShell>
  );
}
