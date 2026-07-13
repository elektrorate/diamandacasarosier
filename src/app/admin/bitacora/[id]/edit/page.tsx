import AdminShell from "@/components/admin/AdminShell";
import BlogForm from "@/components/admin/BlogForm";
import { getBlogPostById } from "@/lib/cms/blog";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";
import { notFound } from "next/navigation";

export default async function EditBitacora({ params }: { params: Promise<{ id: string }> }) {
  const [item, navigationItems, settings] = await Promise.all([
    getBlogPostById((await params).id),
    getPublicNavigationItems("main"),
    getSettings(),
  ]);
  if (!item) notFound();
  return (
    <AdminShell>
      <BlogForm mode="edit" item={item} navigationItems={navigationItems} menuSettings={settings.menu} />
    </AdminShell>
  );
}
