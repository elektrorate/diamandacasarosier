import type { CSSProperties, ReactNode } from "react";
import { NavbarGlobal } from "@/components/layout/NavbarGlobal";
import { PublicHeroContent, PublicHeroTitle } from "@/components/hero/PublicHeroContent";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getSettings } from "@/lib/cms/settings";
import { assetPath } from "@/lib/assets";
import { classNames } from "@/lib/utils";
import type { CmsHeroSettings } from "@/lib/cms/types";

interface HeaderInternoProps {
  image?: string;
  mobileImage?: string;
  variant?: "image" | "text" | "presentation";
  hero?: CmsHeroSettings;
  eyebrow?: string;
  title?: string;
  height?: "small" | "medium" | "large";
  overlayTitle?: boolean;
  heroMenuTone?: "light" | "dark";
  heroMenuColor?: string;
  heroMenuScale?: number;
  heroLogoPositionX?: string;
  heroLogoPositionY?: string;
  heroLogoWidth?: string;
  heroLogoTabletPositionX?: string;
  heroLogoTabletPositionY?: string;
  heroLogoTabletWidth?: string;
  heroLogoMobilePositionX?: string;
  heroLogoMobilePositionY?: string;
  heroLogoMobileWidth?: string;
  heroMenuPositionY?: string;
  heroMenuTabletPositionY?: string;
  heroMenuMobilePositionY?: string;
  heroTitleImageScale?: number;
  heroTitleImageScaleTablet?: number;
  heroTitleImageScaleMobile?: number;
  heroTitleImagePositionX?: string;
  heroTitleImagePositionY?: string;
  heroTitleImagePositionXTablet?: string;
  heroTitleImagePositionYTablet?: string;
  heroTitleImagePositionXMobile?: string;
  heroTitleImagePositionYMobile?: string;
  heroTitleImageSecondaryScale?: number;
  heroTitleImageSecondaryScaleTablet?: number;
  heroTitleImageSecondaryScaleMobile?: number;
  heroTitleImageSecondaryPositionX?: string;
  heroTitleImageSecondaryPositionY?: string;
  heroTitleImageSecondaryPositionXTablet?: string;
  heroTitleImageSecondaryPositionYTablet?: string;
  heroTitleImageSecondaryPositionXMobile?: string;
  heroTitleImageSecondaryPositionYMobile?: string;
  heroTitlePositionX?: string;
  heroTitlePositionXTablet?: string;
  heroTitlePositionXMobile?: string;
  heroTitlePositionY?: string;
  heroTitlePositionYTablet?: string;
  heroTitlePositionYMobile?: string;
  heroTitleScale?: number;
  heroTitleScaleTablet?: number;
  heroTitleScaleMobile?: number;
  presentationTextPositionX?: string;
  presentationTextPositionY?: string;
  presentationTextPositionXTablet?: string;
  presentationTextPositionYTablet?: string;
  presentationTextPositionXMobile?: string;
  presentationTextPositionYMobile?: string;
  presentationTextScale?: number;
  presentationTextScaleTablet?: number;
  presentationTextScaleMobile?: number;
  presentationImagePositionX?: string;
  presentationImagePositionY?: string;
  presentationImagePositionXTablet?: string;
  presentationImagePositionYTablet?: string;
  presentationImagePositionXMobile?: string;
  presentationImagePositionYMobile?: string;
  presentationImageScale?: number;
  presentationImageScaleTablet?: number;
  presentationImageScaleMobile?: number;
  className?: string;
  children?: ReactNode;
}

export async function HeaderInterno({
  image = "img/hero-bg.jpg",
  mobileImage,
  variant = "text",
  hero,
  eyebrow,
  title,
  height = "medium",
  overlayTitle = false,
  heroMenuTone,
  heroMenuColor,
  heroMenuScale,
  heroLogoPositionX,
  heroLogoPositionY,
  heroLogoWidth,
  heroLogoTabletPositionX,
  heroLogoTabletPositionY,
  heroLogoTabletWidth,
  heroLogoMobilePositionX,
  heroLogoMobilePositionY,
  heroLogoMobileWidth,
  heroMenuPositionY,
  heroMenuTabletPositionY,
  heroMenuMobilePositionY,
  heroTitleImageScale,
  heroTitleImageScaleTablet,
  heroTitleImageScaleMobile,
  heroTitleImagePositionX,
  heroTitleImagePositionY,
  heroTitleImagePositionXTablet,
  heroTitleImagePositionYTablet,
  heroTitleImagePositionXMobile,
  heroTitleImagePositionYMobile,
  heroTitleImageSecondaryScale,
  heroTitleImageSecondaryScaleTablet,
  heroTitleImageSecondaryScaleMobile,
  heroTitleImageSecondaryPositionX,
  heroTitleImageSecondaryPositionY,
  heroTitleImageSecondaryPositionXTablet,
  heroTitleImageSecondaryPositionYTablet,
  heroTitleImageSecondaryPositionXMobile,
  heroTitleImageSecondaryPositionYMobile,
  heroTitlePositionX,
  heroTitlePositionXTablet,
  heroTitlePositionXMobile,
  heroTitlePositionY,
  heroTitlePositionYTablet,
  heroTitlePositionYMobile,
  heroTitleScale,
  heroTitleScaleTablet,
  heroTitleScaleMobile,
  presentationTextPositionX,
  presentationTextPositionY,
  presentationTextPositionXTablet,
  presentationTextPositionYTablet,
  presentationTextPositionXMobile,
  presentationTextPositionYMobile,
  presentationTextScale,
  presentationTextScaleTablet,
  presentationTextScaleMobile,
  presentationImagePositionX,
  presentationImagePositionY,
  presentationImagePositionXTablet,
  presentationImagePositionYTablet,
  presentationImagePositionXMobile,
  presentationImagePositionYMobile,
  presentationImageScale,
  presentationImageScaleTablet,
  presentationImageScaleMobile,
  className,
  children
}: HeaderInternoProps) {
  const [navigationItems, settings] = await Promise.all([
    getPublicNavigationItems("main"),
    getSettings(),
  ]);
  const style = {
    "--page-hero-image": `url("${assetPath(image)}")`,
    "--page-hero-image-mobile": `url("${assetPath(mobileImage || image)}")`,
    "--hero-logo-position-x": heroLogoPositionX ?? "50%",
    "--hero-logo-position-y": heroLogoPositionY ?? "46px",
    "--hero-logo-width": heroLogoWidth ?? "118px",
    "--hero-logo-tablet-position-x": heroLogoTabletPositionX ?? heroLogoPositionX ?? "50%",
    "--hero-logo-tablet-position-y": heroLogoTabletPositionY ?? heroLogoPositionY ?? "42px",
    "--hero-logo-tablet-width": heroLogoTabletWidth ?? heroLogoWidth ?? "106px",
    "--hero-logo-mobile-position-x": heroLogoMobilePositionX ?? heroLogoPositionX ?? "50%",
    "--hero-logo-mobile-position-y": heroLogoMobilePositionY ?? "34px",
    "--hero-logo-mobile-width": heroLogoMobileWidth ?? "92px",
    "--hero-menu-position-y": heroMenuPositionY ?? "132px",
    "--hero-menu-tablet-position-y": heroMenuTabletPositionY ?? heroMenuPositionY ?? "118px",
    "--hero-menu-mobile-position-y": heroMenuMobilePositionY ?? "96px",
    "--hero-menu-color": heroMenuColor ?? (heroMenuTone === "light" ? "#ffffff" : "#3f3933"),
    "--hero-menu-scale": heroMenuScale ?? 1,
    /* Hero con imagen */
    "--title-image-scale": heroTitleImageScale ?? 1,
    "--title-image-scale-tablet": heroTitleImageScaleTablet ?? heroTitleImageScale ?? 1,
    "--title-image-scale-mobile": heroTitleImageScaleMobile ?? heroTitleImageScale ?? 1,
    "--title-image-position-x": heroTitleImagePositionX ?? "50%",
    "--title-image-position-y": heroTitleImagePositionY ?? "50%",
    "--title-image-position-x-tablet": heroTitleImagePositionXTablet ?? heroTitleImagePositionX ?? "50%",
    "--title-image-position-y-tablet": heroTitleImagePositionYTablet ?? heroTitleImagePositionY ?? "50%",
    "--title-image-position-x-mobile": heroTitleImagePositionXMobile ?? heroTitleImagePositionX ?? "50%",
    "--title-image-position-y-mobile": heroTitleImagePositionYMobile ?? "50%",
    "--title-image-secondary-scale": heroTitleImageSecondaryScale ?? 1,
    "--title-image-secondary-scale-tablet": heroTitleImageSecondaryScaleTablet ?? heroTitleImageSecondaryScale ?? 1,
    "--title-image-secondary-scale-mobile": heroTitleImageSecondaryScaleMobile ?? heroTitleImageSecondaryScale ?? 1,
    "--title-image-secondary-position-x": heroTitleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y": heroTitleImageSecondaryPositionY ?? "50%",
    "--title-image-secondary-position-x-tablet": heroTitleImageSecondaryPositionXTablet ?? heroTitleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y-tablet": heroTitleImageSecondaryPositionYTablet ?? heroTitleImageSecondaryPositionY ?? "50%",
    "--title-image-secondary-position-x-mobile": heroTitleImageSecondaryPositionXMobile ?? heroTitleImageSecondaryPositionX ?? "50%",
    "--title-image-secondary-position-y-mobile": heroTitleImageSecondaryPositionYMobile ?? "50%",
    /* Hero tipográfico */
    "--hero-title-position-x": heroTitlePositionX ?? "50%",
    "--hero-title-position-x-tablet": heroTitlePositionXTablet ?? heroTitlePositionX ?? "50%",
    "--hero-title-position-x-mobile": heroTitlePositionXMobile ?? "50%",
    "--hero-title-position-y": heroTitlePositionY ?? "50%",
    "--hero-title-position-y-tablet": heroTitlePositionYTablet ?? heroTitlePositionY ?? "50%",
    "--hero-title-position-y-mobile": heroTitlePositionYMobile ?? "50%",
    "--hero-title-scale": heroTitleScale ?? 1,
    "--hero-title-scale-tablet": heroTitleScaleTablet ?? heroTitleScale ?? 1,
    "--hero-title-scale-mobile": heroTitleScaleMobile ?? 1,
    /* Hero con presentación */
    "--presentation-text-position-x": presentationTextPositionX ?? "8%",
    "--presentation-text-position-y": presentationTextPositionY ?? "50%",
    "--presentation-text-position-x-tablet": presentationTextPositionXTablet ?? presentationTextPositionX ?? "8%",
    "--presentation-text-position-y-tablet": presentationTextPositionYTablet ?? presentationTextPositionY ?? "50%",
    "--presentation-text-position-x-mobile": presentationTextPositionXMobile ?? presentationTextPositionX ?? "8%",
    "--presentation-text-position-y-mobile": presentationTextPositionYMobile ?? "50%",
    "--presentation-text-scale": presentationTextScale ?? 1,
    "--presentation-text-scale-tablet": presentationTextScaleTablet ?? presentationTextScale ?? 1,
    "--presentation-text-scale-mobile": presentationTextScaleMobile ?? 1,
    "--presentation-image-position-x": presentationImagePositionX ?? "70%",
    "--presentation-image-position-y": presentationImagePositionY ?? "50%",
    "--presentation-image-position-x-tablet": presentationImagePositionXTablet ?? presentationImagePositionX ?? "70%",
    "--presentation-image-position-y-tablet": presentationImagePositionYTablet ?? presentationImagePositionY ?? "50%",
    "--presentation-image-position-x-mobile": presentationImagePositionXMobile ?? presentationImagePositionX ?? "70%",
    "--presentation-image-position-y-mobile": presentationImagePositionYMobile ?? "50%",
    "--presentation-image-scale": presentationImageScale ?? 1,
    "--presentation-image-scale-tablet": presentationImageScaleTablet ?? presentationImageScale ?? 1,
    "--presentation-image-scale-mobile": presentationImageScaleMobile ?? 1,
  } as CSSProperties;
  const scrollThreshold = Number.parseInt(heroMenuPositionY ?? "", 10) || 132;
  const tabletScrollThreshold = Number.parseInt(heroMenuTabletPositionY ?? "", 10) || scrollThreshold;
  const mobileScrollThreshold = Number.parseInt(heroMenuMobilePositionY ?? "", 10) || 96;
  const titleContent =
    children ??
    (title ? (
      <div>
        {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
        <h1 className="page-hero__title">{title}</h1>
      </div>
    ) : null);

  return (
    <div style={style}>
      <header
        className={classNames(
          "header-interno page-hero header-interno--ready header-interno--center header-interno--overlay-warm",
          variant === "image" || variant === "presentation" ? "header-interno--image-hero" : "header-interno--text-hero",
          variant === "presentation" && "header-interno--presentation-hero",
          `header-interno--menu-${heroMenuTone ?? (variant === "image" || variant === "presentation" ? "light" : "dark")}`,
          `header-interno--${height}`,
          !hero && !overlayTitle && Boolean(titleContent) && "page-hero--nav-only",
          className
        )}
        data-header-height={height}
        data-header-alignment="center"
        data-header-overlay="warm"
      >
        <NavbarGlobal
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
          heroMenuColor={heroMenuColor}
          heroMenuScale={heroMenuScale}
          heroLogoPositionX={heroLogoPositionX}
          heroLogoPositionY={heroLogoPositionY}
          heroLogoWidth={heroLogoWidth}
          heroLogoTabletPositionX={heroLogoTabletPositionX}
          heroLogoTabletPositionY={heroLogoTabletPositionY}
          heroLogoTabletWidth={heroLogoTabletWidth}
          heroLogoMobilePositionX={heroLogoMobilePositionX}
          heroLogoMobilePositionY={heroLogoMobilePositionY}
          heroLogoMobileWidth={heroLogoMobileWidth}
          heroMenuPositionY={heroMenuPositionY}
          heroMenuTabletPositionY={heroMenuTabletPositionY}
          heroMenuMobilePositionY={heroMenuMobilePositionY}
        />
        {hero && (hero.heroVariant === "image" || hero.heroVariant === "presentation") ? (
          <PublicHeroContent hero={hero} />
        ) : null}
        {hero && hero.heroVariant === "text" ? (
          <PublicHeroTitle hero={hero} title={hero.heroTitle || title || ""} subtitle={hero.heroSubtitle || eyebrow} />
        ) : null}
        {!hero && overlayTitle && titleContent && (
          <div
            className="header-interno__inner page-hero__inner container"
            aria-hidden="true"
          >
            {titleContent}
          </div>
        )}
        {!hero && !titleContent && (
          <div
            className="header-interno__inner page-hero__inner container"
            aria-hidden="true"
          />
        )}
      </header>
      {!hero && !overlayTitle && titleContent && (
        <section
          className={classNames(
            "page-title-block page-title-block--center",
            variant === "text" && "page-title-block--typographic",
            `page-title-block--${height}`
          )}
        >
          <div className="page-title-block__inner container">{titleContent}</div>
        </section>
      )}
    </div>
  );
}
