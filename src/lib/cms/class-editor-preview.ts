import type { NavigationItem } from "@/data/types";
import { getPublicFooter } from "@/lib/cms/footers";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getPublicSocialGallery } from "@/lib/cms/public-content";
import { getSettings, type SiteSettings } from "@/lib/cms/settings";
import type { FooterComponent, SocialGallery } from "@/lib/cms/types";

export interface ClassEditorPreviewChrome {
  navigationItems: NavigationItem[];
  menuSettings: SiteSettings["menu"];
  socialGallery: SocialGallery | null;
  footer: FooterComponent | null;
}

export async function getClassEditorPreviewChrome(): Promise<ClassEditorPreviewChrome> {
  const [navigationItems, settings, socialGallery, footer] = await Promise.all([
    getPublicNavigationItems("main"),
    getSettings(),
    getPublicSocialGallery(),
    getPublicFooter(),
  ]);

  return {
    navigationItems,
    menuSettings: settings.menu,
    socialGallery,
    footer,
  };
}
