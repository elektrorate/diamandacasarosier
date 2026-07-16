import { HomeHeroView } from "@/components/layout/HomeHeroView";
import { getHomePageSettings } from "@/lib/cms/home-page";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";

export async function HeaderHome() {
  const [navigationItems, settings, homePage] = await Promise.all([
    getPublicNavigationItems("main"),
    getSettings(),
    getHomePageSettings(),
  ]);

  return (
    <HomeHeroView
      hero={homePage.hero}
      navigationItems={navigationItems}
      menu={{
        headerLogoUrl: settings.menu.header_logo_url,
        scrollMenuBackgroundColor: settings.menu.scroll_menu_background_color,
        scrollMenuTextColor: settings.menu.scroll_menu_text_color,
        scrollMenuIconColor: settings.menu.scroll_menu_icon_color,
        scrollMenuLogoTintEnabled: settings.menu.scroll_menu_logo_tint_enabled,
        scrollMenuLogoTintColor: settings.menu.scroll_menu_logo_tint_color,
      }}
    />
  );
}
