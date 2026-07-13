import AdminShell from "@/components/admin/AdminShell";
import StudioPageEditor from "@/components/admin/StudioPageEditor";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getPublicSocialGallery } from "@/lib/cms/public-content";
import { getSettings } from "@/lib/cms/settings";
import { getStudioPageSettings } from "@/lib/cms/studio-page";
import { getTeachers } from "@/lib/cms/teachers";

export default async function StudioAdminPage() {
  const [page, teachers, navigationItems, settings, socialGallery] = await Promise.all([
    getStudioPageSettings(),
    getTeachers(),
    getPublicNavigationItems("main"),
    getSettings(),
    getPublicSocialGallery(),
  ]);

  return (
    <AdminShell>
      <StudioPageEditor page={page} teachers={teachers} navigationItems={navigationItems} menuSettings={settings.menu} socialGallery={socialGallery} />
    </AdminShell>
  );
}
