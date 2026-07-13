"use client";

import type { CSSProperties, ReactNode } from "react";
import { NavbarGlobal } from "@/components/layout/NavbarGlobal";
import type { NavigationItem } from "@/data/types";
import { assetPath } from "@/lib/assets";
import type { SiteSettings } from "@/lib/cms/settings";
import type { CmsHeroSettings } from "@/lib/cms/types";

export default function CmsPublicHeroPreview({
  hero,
  navigationItems,
  menuSettings,
  height = "medium",
  className = "",
  children,
}: {
  hero: CmsHeroSettings;
  navigationItems: NavigationItem[];
  menuSettings: SiteSettings["menu"];
  height?: "small" | "medium" | "large";
  className?: string;
  children?: ReactNode;
}) {
  const variant = hero.heroVariant ?? "text";
  const isImageLike = variant === "image" || variant === "presentation";
  const heroMenuTone = hero.heroMenuTone ?? (isImageLike ? "light" : "dark");
  const heroMenuColor = hero.heroMenuColor || (heroMenuTone === "light" ? "#ffffff" : "#3f3933");
  const scrollThreshold = Number.parseInt(hero.heroMenuPositionY ?? "", 10) || 132;
  const tabletScrollThreshold = Number.parseInt(hero.heroMenuTabletPositionY ?? "", 10) || scrollThreshold;
  const mobileScrollThreshold = Number.parseInt(hero.heroMenuMobilePositionY ?? "", 10) || 96;
  const style = {
    "--page-hero-image": `url("${assetPath(hero.heroImage || "/img/hero-bg.jpg")}")`,
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
    "--hero-menu-color": heroMenuColor,
    "--hero-menu-scale": hero.heroMenuScale ?? 1,
  } as CSSProperties;

  return (
    <header
      className={[
        "header-interno page-hero header-interno--ready header-interno--center header-interno--overlay-warm",
        isImageLike ? "header-interno--image-hero" : "header-interno--text-hero",
        variant === "presentation" ? "header-interno--presentation-hero" : "",
        `header-interno--menu-${heroMenuTone}`,
        `header-interno--${height}`,
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      data-header-height={height}
      data-header-alignment="center"
      data-header-overlay="warm"
    >
      <NavbarGlobal
        navigationItems={navigationItems}
        logoUrl={menuSettings.header_logo_url}
        scrollMenuBackgroundColor={menuSettings.scroll_menu_background_color}
        scrollMenuTextColor={menuSettings.scroll_menu_text_color}
        scrollMenuIconColor={menuSettings.scroll_menu_icon_color}
        scrollMenuLogoTintEnabled={menuSettings.scroll_menu_logo_tint_enabled}
        scrollMenuLogoTintColor={menuSettings.scroll_menu_logo_tint_color}
        scrollThreshold={scrollThreshold}
        tabletScrollThreshold={tabletScrollThreshold}
        mobileScrollThreshold={mobileScrollThreshold}
        heroMenuColor={heroMenuColor}
        heroMenuScale={hero.heroMenuScale}
      />
      <div className="header-interno__inner page-hero__inner container" aria-hidden="true">
        {children}
      </div>
    </header>
  );
}
