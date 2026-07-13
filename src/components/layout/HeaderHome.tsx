import { NavbarGlobal } from "@/components/layout/NavbarGlobal";
import { PublicHeroContent, PublicHeroTitle } from "@/components/hero/PublicHeroContent";
import { getHomePageSettings } from "@/lib/cms/home-page";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";
import { classNames } from "@/lib/utils";
import type { CSSProperties } from "react";

export async function HeaderHome() {
  const [navigationItems, settings, homePage] = await Promise.all([
    getPublicNavigationItems("main"),
    getSettings(),
    getHomePageSettings(),
  ]);
  const hero = homePage.hero;
  const scrollThreshold = Number.parseInt(hero.heroMenuPositionY ?? "", 10) || 132;
  const tabletScrollThreshold = Number.parseInt(hero.heroMenuTabletPositionY ?? "", 10) || scrollThreshold;
  const mobileScrollThreshold = Number.parseInt(hero.heroMenuMobilePositionY ?? "", 10) || 96;
  const heroStyle: CSSProperties = {
    "--hero-logo-position-x": hero.heroLogoPositionX || "50%",
    "--hero-logo-position-y": hero.heroLogoPositionY || "46px",
    "--hero-logo-width": hero.heroLogoWidth || "118px",
    "--hero-logo-tablet-position-x": hero.heroLogoTabletPositionX || hero.heroLogoPositionX || "50%",
    "--hero-logo-tablet-position-y": hero.heroLogoTabletPositionY || hero.heroLogoPositionY || "42px",
    "--hero-logo-tablet-width": hero.heroLogoTabletWidth || hero.heroLogoWidth || "106px",
    "--hero-logo-mobile-position-x": hero.heroLogoMobilePositionX || hero.heroLogoPositionX || "50%",
    "--hero-logo-mobile-position-y": hero.heroLogoMobilePositionY || "34px",
    "--hero-logo-mobile-width": hero.heroLogoMobileWidth || "92px",
    "--hero-menu-position-y": hero.heroMenuPositionY || "132px",
    "--hero-menu-tablet-position-y": hero.heroMenuTabletPositionY || hero.heroMenuPositionY || "118px",
    "--hero-menu-mobile-position-y": hero.heroMenuMobilePositionY || "96px",
    "--hero-menu-scale": hero.heroMenuScale ?? 1,
    "--hero-scroll-threshold": `${scrollThreshold}px`,
    "--title-image-scale": hero.titleImageScale ?? 1,
    "--title-image-scale-tablet": hero.titleImageScaleTablet ?? hero.titleImageScale ?? 1,
    "--title-image-scale-mobile": hero.titleImageScaleMobile ?? hero.titleImageScale ?? 1,
    "--title-image-position-x": hero.titleImagePositionX || "50%",
    "--title-image-position-y": hero.titleImagePositionY || "50%",
    "--title-image-position-x-tablet": hero.titleImagePositionXTablet ?? hero.titleImagePositionX ?? "50%",
    "--title-image-position-y-tablet": hero.titleImagePositionYTablet ?? hero.titleImagePositionY ?? "50%",
    "--title-image-position-x-mobile": hero.titleImagePositionXMobile ?? hero.titleImagePositionX ?? "50%",
    "--title-image-position-y-mobile": hero.titleImagePositionYMobile || "50%",
    "--title-image-secondary-scale": hero.titleImageSecondaryScale ?? 1,
    "--title-image-secondary-scale-tablet": hero.titleImageSecondaryScaleTablet ?? hero.titleImageSecondaryScale ?? 1,
    "--title-image-secondary-scale-mobile": hero.titleImageSecondaryScaleMobile ?? hero.titleImageSecondaryScale ?? 1,
    "--title-image-secondary-position-x": hero.titleImageSecondaryPositionX || "50%",
    "--title-image-secondary-position-y": hero.titleImageSecondaryPositionY || "50%",
    "--title-image-secondary-position-x-tablet": hero.titleImageSecondaryPositionXTablet ?? hero.titleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y-tablet": hero.titleImageSecondaryPositionYTablet ?? hero.titleImageSecondaryPositionY ?? "50%",
    "--title-image-secondary-position-x-mobile": hero.titleImageSecondaryPositionXMobile ?? hero.titleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y-mobile": hero.titleImageSecondaryPositionYMobile || "50%",
    "--hero-title-position-y": hero.heroTitlePositionY || "50%",
    "--hero-title-position-y-tablet": hero.heroTitlePositionYTablet ?? hero.heroTitlePositionY ?? "50%",
    "--hero-title-position-y-mobile": hero.heroTitlePositionYMobile || "50%",
    "--hero-title-scale": hero.heroTitleScale ?? 1,
    "--hero-title-scale-tablet": hero.heroTitleScaleTablet ?? hero.heroTitleScale ?? 1,
    "--hero-title-scale-mobile": hero.heroTitleScaleMobile ?? 1,
    "--presentation-text-position-x": hero.presentationTextPositionX || "8%",
    "--presentation-text-position-y": hero.presentationTextPositionY || "50%",
    "--presentation-text-position-x-tablet": hero.presentationTextPositionXTablet ?? hero.presentationTextPositionX ?? "8%",
    "--presentation-text-position-y-tablet": hero.presentationTextPositionYTablet ?? hero.presentationTextPositionY ?? "50%",
    "--presentation-text-position-x-mobile": hero.presentationTextPositionXMobile ?? hero.presentationTextPositionX ?? "8%",
    "--presentation-text-position-y-mobile": hero.presentationTextPositionYMobile || "50%",
    "--presentation-text-scale": hero.presentationTextScale ?? 1,
    "--presentation-text-scale-tablet": hero.presentationTextScaleTablet ?? hero.presentationTextScale ?? 1,
    "--presentation-text-scale-mobile": hero.presentationTextScaleMobile ?? 1,
    "--presentation-image-position-x": hero.presentationImagePositionX || "70%",
    "--presentation-image-position-y": hero.presentationImagePositionY || "50%",
    "--presentation-image-position-x-tablet": hero.presentationImagePositionXTablet ?? hero.presentationImagePositionX ?? "70%",
    "--presentation-image-position-y-tablet": hero.presentationImagePositionYTablet ?? hero.presentationImagePositionY ?? "50%",
    "--presentation-image-position-x-mobile": hero.presentationImagePositionXMobile ?? hero.presentationImagePositionX ?? "70%",
    "--presentation-image-position-y-mobile": hero.presentationImagePositionYMobile || "50%",
    "--presentation-image-scale": hero.presentationImageScale ?? 1,
    "--presentation-image-scale-tablet": hero.presentationImageScaleTablet ?? hero.presentationImageScale ?? 1,
    "--presentation-image-scale-mobile": hero.presentationImageScaleMobile ?? 1,
  } as CSSProperties;

  return (
    <header
      id="hero"
      className={classNames(
        "hero header-home header-home--ready",
        hero.heroVariant === "text" && "header-home--text-hero",
        hero.heroVariant === "image" && "header-home--image-hero",
        hero.heroVariant === "presentation" && "header-home--presentation-hero",
      )}
      data-header-component="HeaderHome"
      style={heroStyle}
    >
      <div
        className="hero__bg"
        style={(hero.heroVariant === "image" || hero.heroVariant === "presentation") && hero.heroImage ? {
          backgroundImage: `url("${hero.heroImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        } as CSSProperties : undefined}
      />
      <NavbarGlobal
        home
        navigationItems={navigationItems}
        logoUrl={settings.menu.header_logo_url}
        scrollMenuBackgroundColor={settings.menu.scroll_menu_background_color}
        scrollMenuTextColor={settings.menu.scroll_menu_text_color}
        scrollMenuIconColor={settings.menu.scroll_menu_icon_color}
        scrollMenuLogoTintEnabled={settings.menu.scroll_menu_logo_tint_enabled}
        scrollMenuLogoTintColor={settings.menu.scroll_menu_logo_tint_color}
        scrollThreshold={scrollThreshold}
        tabletScrollThreshold={tabletScrollThreshold}
        mobileScrollThreshold={mobileScrollThreshold}
        heroMenuColor={hero.heroMenuColor}
        heroMenuScale={hero.heroMenuScale}
        heroLogoPositionX={hero.heroLogoPositionX}
        heroLogoPositionY={hero.heroLogoPositionY}
        heroLogoWidth={hero.heroLogoWidth}
        heroLogoTabletPositionX={hero.heroLogoTabletPositionX}
        heroLogoTabletPositionY={hero.heroLogoTabletPositionY}
        heroLogoTabletWidth={hero.heroLogoTabletWidth}
        heroLogoMobilePositionX={hero.heroLogoMobilePositionX}
        heroLogoMobilePositionY={hero.heroLogoMobilePositionY}
        heroLogoMobileWidth={hero.heroLogoMobileWidth}
        heroMenuPositionY={hero.heroMenuPositionY}
        heroMenuTabletPositionY={hero.heroMenuTabletPositionY}
        heroMenuMobilePositionY={hero.heroMenuMobilePositionY}
      />
      {hero.heroVariant === "image" || hero.heroVariant === "presentation" ? (
        <PublicHeroContent hero={hero} />
      ) : hero.heroVariant === "text" && hero.heroTitle ? (
        <PublicHeroTitle hero={hero} title={hero.heroTitle} subtitle={hero.heroSubtitle} />
      ) : (
        <>
          <h1 className="hero__title">Casa Rosier</h1>
          <div className="hero__overlays" aria-hidden="true">
            <img
              className="hero__overlay hero__overlay--1"
              src="/img/hero-overlay-1.png"
              alt=""
              width={578}
              height={224}
              decoding="async"
            />
            <img
              className="hero__overlay hero__overlay--2"
              src="/img/hero-overlay-2.png"
              alt=""
              width={501}
              height={235}
              decoding="async"
            />
          </div>
        </>
      )}
    </header>
  );
}
