import AdminShell from "@/components/admin/AdminShell";
import BlogPageEditor from "@/components/admin/BlogPageEditor";
import { getBlogPosts } from "@/lib/cms/blog";
import { getBlogPageSettings } from "@/lib/cms/blog-page";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getPublicSocialGallery } from "@/lib/cms/public-content";
import { getSettings } from "@/lib/cms/settings";

export default async function BitacoraPage() {
  const [page, posts, navigationItems, settings, socialGallery] = await Promise.all([
    getBlogPageSettings(),
    getBlogPosts(),
    getPublicNavigationItems("main"),
    getSettings(),
    getPublicSocialGallery(),
  ]);

  return (
    <AdminShell>
      <BlogPageEditor page={page} posts={posts} navigationItems={navigationItems} menuSettings={settings.menu} socialGallery={socialGallery} />
    </AdminShell>
  );
}
