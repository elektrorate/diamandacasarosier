import AdminShell from "@/components/admin/AdminShell";
import HomePageEditor from "@/components/admin/HomePageEditor";
import { getPublicExperienceItems } from "@/features/experiences/experienceDetailRouting";
import { getHomePageSettings } from "@/lib/cms/home-page";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";
import type { GiftCardItem } from "@/data/types";

export default async function HomeAdminPage() {
  const [page, experienceItems, navigationItems, settings] = await Promise.all([
    getHomePageSettings(),
    getPublicExperienceItems(),
    getPublicNavigationItems("main"),
    getSettings(),
  ]);
  const classes = experienceItems.filter((item) => item.kind === "class");
  const workshops = experienceItems.filter((item) => item.kind === "workshop");
  const giftCards = experienceItems.filter((item): item is GiftCardItem => item.kind === "gift-card");

  return (
    <AdminShell>
      <HomePageEditor
        page={page}
        classes={classes}
        workshops={workshops}
        giftCards={giftCards}
        navigationItems={navigationItems}
        previewMenu={{
          headerLogoUrl: settings.menu.header_logo_url,
          scrollMenuBackgroundColor: settings.menu.scroll_menu_background_color,
          scrollMenuTextColor: settings.menu.scroll_menu_text_color,
          scrollMenuIconColor: settings.menu.scroll_menu_icon_color,
          scrollMenuLogoTintEnabled: settings.menu.scroll_menu_logo_tint_enabled,
          scrollMenuLogoTintColor: settings.menu.scroll_menu_logo_tint_color,
        }}
      />
    </AdminShell>
  );
}
