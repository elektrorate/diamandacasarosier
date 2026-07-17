import type { CmsHeroSettings } from "./types";

export const DEFAULT_HERO_IMAGE = "/img/hero-bg.jpg";

export const defaultHeroSettings: CmsHeroSettings = {
  heroVariant: "text",
  heroTitle: "",
  heroSubtitle: "",
  heroPresentationText: "",
  heroPresentationTextColor: "#FFFFFF",
  heroPresentationImage: "",
  heroPresentationCtaEnabled: false,
  heroPresentationCtaLabel: "Descubrir",
  heroPresentationCtaHref: "",
  heroPresentationCtaNewTab: false,
  heroPresentationCtaBackgroundColor: "#FFFFFF",
  heroPresentationCtaTextColor: "#3f3933",
  heroMenuTone: "dark",
  heroMenuColor: "#3f3933",
  heroMenuScale: 1,
  heroLogoPositionX: "50%",
  heroLogoPositionY: "46px",
  heroLogoWidth: "118px",
  heroLogoTabletPositionX: "50%",
  heroLogoTabletPositionY: "42px",
  heroLogoTabletWidth: "106px",
  heroLogoMobilePositionX: "50%",
  heroLogoMobilePositionY: "34px",
  heroLogoMobileWidth: "92px",
  heroMenuPositionY: "132px",
  heroMenuTabletPositionY: "118px",
  heroMenuMobilePositionY: "96px",
  heroImage: DEFAULT_HERO_IMAGE,
  heroImageMobile: "",
  titleImage: "",
  titleImageSecondary: "",
  titleImageScale: 1,
  titleImageScaleTablet: 1,
  titleImageScaleMobile: 1,
  titleImagePositionX: "50%",
  titleImagePositionY: "50%",
  titleImagePositionXTablet: "50%",
  titleImagePositionYTablet: "50%",
  titleImagePositionXMobile: "50%",
  titleImagePositionYMobile: "50%",
  titleImageSecondaryScale: 1,
  titleImageSecondaryScaleTablet: 1,
  titleImageSecondaryScaleMobile: 1,
  titleImageSecondaryPositionX: "50%",
  titleImageSecondaryPositionY: "50%",
  titleImageSecondaryPositionXTablet: "50%",
  titleImageSecondaryPositionYTablet: "50%",
  titleImageSecondaryPositionXMobile: "50%",
  titleImageSecondaryPositionYMobile: "50%",
  heroTitlePositionX: "50%",
  heroTitlePositionXTablet: "50%",
  heroTitlePositionXMobile: "50%",
  heroTitlePositionY: "50%",
  heroTitlePositionYTablet: "50%",
  heroTitlePositionYMobile: "50%",
  heroTitleScale: 1,
  heroTitleScaleTablet: 1,
  heroTitleScaleMobile: 1,
  presentationTextPositionX: "8%",
  presentationTextPositionY: "50%",
  presentationTextPositionXTablet: "8%",
  presentationTextPositionYTablet: "50%",
  presentationTextPositionXMobile: "8%",
  presentationTextPositionYMobile: "50%",
  presentationTextScale: 1,
  presentationTextScaleTablet: 1,
  presentationTextScaleMobile: 1,
  presentationImagePositionX: "70%",
  presentationImagePositionY: "50%",
  presentationImagePositionXTablet: "70%",
  presentationImagePositionYTablet: "50%",
  presentationImagePositionXMobile: "70%",
  presentationImagePositionYMobile: "50%",
  presentationImageScale: 1,
  presentationImageScaleTablet: 1,
  presentationImageScaleMobile: 1,
};

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return "";
}

function numOr(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 1;
}

export function normalizeHeroSettings(input: unknown, fallback?: Partial<CmsHeroSettings>): CmsHeroSettings {
  const source = input && typeof input === "object" ? input as Partial<CmsHeroSettings> : {};
  const merged = { ...defaultHeroSettings, ...fallback, ...source };
  const heroVariant = merged.heroVariant === "image" || merged.heroVariant === "presentation" || merged.heroVariant === "text"
    ? merged.heroVariant
    : "text";
  const heroMenuTone = merged.heroMenuTone === "light" || merged.heroMenuTone === "dark"
    ? merged.heroMenuTone
    : heroVariant === "image" || heroVariant === "presentation" ? "light" : "dark";

  return {
    ...defaultHeroSettings,
    ...merged,
    heroVariant,
    heroTitle: firstText(merged.heroTitle, fallback?.heroTitle),
    heroSubtitle: firstText(merged.heroSubtitle, fallback?.heroSubtitle),
    heroPresentationText: firstText(merged.heroPresentationText),
    heroPresentationTextColor: firstText(merged.heroPresentationTextColor, defaultHeroSettings.heroPresentationTextColor),
    heroPresentationCtaEnabled: Boolean(merged.heroPresentationCtaEnabled),
    heroPresentationCtaLabel: firstText(merged.heroPresentationCtaLabel, defaultHeroSettings.heroPresentationCtaLabel),
    heroPresentationCtaHref: firstText(merged.heroPresentationCtaHref),
    heroPresentationCtaNewTab: Boolean(merged.heroPresentationCtaNewTab),
    heroPresentationCtaBackgroundColor: firstText(merged.heroPresentationCtaBackgroundColor, defaultHeroSettings.heroPresentationCtaBackgroundColor),
    heroPresentationCtaTextColor: firstText(merged.heroPresentationCtaTextColor, defaultHeroSettings.heroPresentationCtaTextColor),
    heroPresentationImage: firstText(merged.heroPresentationImage),
    heroMenuTone,
    heroMenuColor: firstText(
      merged.heroMenuColor,
      heroMenuTone === "light" ? "#ffffff" : "#3f3933",
    ),
    heroMenuScale: numOr(merged.heroMenuScale, 1),
    heroLogoPositionX: firstText(merged.heroLogoPositionX, defaultHeroSettings.heroLogoPositionX),
    heroLogoPositionY: firstText(merged.heroLogoPositionY, defaultHeroSettings.heroLogoPositionY),
    heroLogoWidth: firstText(merged.heroLogoWidth, defaultHeroSettings.heroLogoWidth),
    heroLogoTabletPositionX: firstText(merged.heroLogoTabletPositionX, merged.heroLogoPositionX, defaultHeroSettings.heroLogoTabletPositionX),
    heroLogoTabletPositionY: firstText(merged.heroLogoTabletPositionY, merged.heroLogoPositionY, defaultHeroSettings.heroLogoTabletPositionY),
    heroLogoTabletWidth: firstText(merged.heroLogoTabletWidth, merged.heroLogoWidth, defaultHeroSettings.heroLogoTabletWidth),
    heroLogoMobilePositionX: firstText(merged.heroLogoMobilePositionX, merged.heroLogoPositionX, defaultHeroSettings.heroLogoMobilePositionX),
    heroLogoMobilePositionY: firstText(merged.heroLogoMobilePositionY, defaultHeroSettings.heroLogoMobilePositionY),
    heroLogoMobileWidth: firstText(merged.heroLogoMobileWidth, defaultHeroSettings.heroLogoMobileWidth),
    heroMenuPositionY: firstText(merged.heroMenuPositionY, defaultHeroSettings.heroMenuPositionY),
    heroMenuTabletPositionY: firstText(merged.heroMenuTabletPositionY, merged.heroMenuPositionY, defaultHeroSettings.heroMenuTabletPositionY),
    heroMenuMobilePositionY: firstText(merged.heroMenuMobilePositionY, defaultHeroSettings.heroMenuMobilePositionY),
    heroImage: firstText(merged.heroImage, defaultHeroSettings.heroImage),
    heroImageMobile: firstText(merged.heroImageMobile),
    titleImage: firstText(merged.titleImage),
    titleImageSecondary: firstText(merged.titleImageSecondary),
    titleImageScale: numOr(merged.titleImageScale, 1),
    titleImageScaleTablet: numOr(merged.titleImageScaleTablet, merged.titleImageScale, 1),
    titleImageScaleMobile: numOr(merged.titleImageScaleMobile, merged.titleImageScale, 1),
    titleImagePositionX: firstText(merged.titleImagePositionX, defaultHeroSettings.titleImagePositionX),
    titleImagePositionY: firstText(merged.titleImagePositionY, defaultHeroSettings.titleImagePositionY),
    titleImagePositionXTablet: firstText(merged.titleImagePositionXTablet, merged.titleImagePositionX, defaultHeroSettings.titleImagePositionXTablet),
    titleImagePositionYTablet: firstText(merged.titleImagePositionYTablet, merged.titleImagePositionY, defaultHeroSettings.titleImagePositionYTablet),
    titleImagePositionXMobile: firstText(merged.titleImagePositionXMobile, merged.titleImagePositionX, defaultHeroSettings.titleImagePositionXMobile),
    titleImagePositionYMobile: firstText(merged.titleImagePositionYMobile, defaultHeroSettings.titleImagePositionYMobile),
    titleImageSecondaryScale: numOr(merged.titleImageSecondaryScale, 1),
    titleImageSecondaryScaleTablet: numOr(merged.titleImageSecondaryScaleTablet, merged.titleImageSecondaryScale, 1),
    titleImageSecondaryScaleMobile: numOr(merged.titleImageSecondaryScaleMobile, merged.titleImageSecondaryScale, 1),
    titleImageSecondaryPositionX: firstText(merged.titleImageSecondaryPositionX, defaultHeroSettings.titleImageSecondaryPositionX),
    titleImageSecondaryPositionY: firstText(merged.titleImageSecondaryPositionY, defaultHeroSettings.titleImageSecondaryPositionY),
    titleImageSecondaryPositionXTablet: firstText(merged.titleImageSecondaryPositionXTablet, merged.titleImageSecondaryPositionX, defaultHeroSettings.titleImageSecondaryPositionXTablet),
    titleImageSecondaryPositionYTablet: firstText(merged.titleImageSecondaryPositionYTablet, merged.titleImageSecondaryPositionY, defaultHeroSettings.titleImageSecondaryPositionYTablet),
    titleImageSecondaryPositionXMobile: firstText(merged.titleImageSecondaryPositionXMobile, merged.titleImageSecondaryPositionX, defaultHeroSettings.titleImageSecondaryPositionXMobile),
    titleImageSecondaryPositionYMobile: firstText(merged.titleImageSecondaryPositionYMobile, defaultHeroSettings.titleImageSecondaryPositionYMobile),
    heroTitlePositionX: firstText(merged.heroTitlePositionX, defaultHeroSettings.heroTitlePositionX),
    heroTitlePositionXTablet: firstText(merged.heroTitlePositionXTablet, merged.heroTitlePositionX, defaultHeroSettings.heroTitlePositionXTablet),
    heroTitlePositionXMobile: firstText(merged.heroTitlePositionXMobile, defaultHeroSettings.heroTitlePositionXMobile),
    heroTitlePositionY: firstText(merged.heroTitlePositionY, defaultHeroSettings.heroTitlePositionY),
    heroTitlePositionYTablet: firstText(merged.heroTitlePositionYTablet, merged.heroTitlePositionY, defaultHeroSettings.heroTitlePositionYTablet),
    heroTitlePositionYMobile: firstText(merged.heroTitlePositionYMobile, defaultHeroSettings.heroTitlePositionYMobile),
    heroTitleScale: numOr(merged.heroTitleScale, 1),
    heroTitleScaleTablet: numOr(merged.heroTitleScaleTablet, merged.heroTitleScale, 1),
    heroTitleScaleMobile: numOr(merged.heroTitleScaleMobile, merged.heroTitleScale, 1),
    presentationTextPositionX: firstText(merged.presentationTextPositionX, defaultHeroSettings.presentationTextPositionX),
    presentationTextPositionY: firstText(merged.presentationTextPositionY, defaultHeroSettings.presentationTextPositionY),
    presentationTextPositionXTablet: firstText(merged.presentationTextPositionXTablet, merged.presentationTextPositionX, defaultHeroSettings.presentationTextPositionXTablet),
    presentationTextPositionYTablet: firstText(merged.presentationTextPositionYTablet, merged.presentationTextPositionY, defaultHeroSettings.presentationTextPositionYTablet),
    presentationTextPositionXMobile: firstText(merged.presentationTextPositionXMobile, merged.presentationTextPositionX, defaultHeroSettings.presentationTextPositionXMobile),
    presentationTextPositionYMobile: firstText(merged.presentationTextPositionYMobile, defaultHeroSettings.presentationTextPositionYMobile),
    presentationTextScale: numOr(merged.presentationTextScale, 1),
    presentationTextScaleTablet: numOr(merged.presentationTextScaleTablet, merged.presentationTextScale, 1),
    presentationTextScaleMobile: numOr(merged.presentationTextScaleMobile, merged.presentationTextScale, 1),
    presentationImagePositionX: firstText(merged.presentationImagePositionX, defaultHeroSettings.presentationImagePositionX),
    presentationImagePositionY: firstText(merged.presentationImagePositionY, defaultHeroSettings.presentationImagePositionY),
    presentationImagePositionXTablet: firstText(merged.presentationImagePositionXTablet, merged.presentationImagePositionX, defaultHeroSettings.presentationImagePositionXTablet),
    presentationImagePositionYTablet: firstText(merged.presentationImagePositionYTablet, merged.presentationImagePositionY, defaultHeroSettings.presentationImagePositionYTablet),
    presentationImagePositionXMobile: firstText(merged.presentationImagePositionXMobile, merged.presentationImagePositionX, defaultHeroSettings.presentationImagePositionXMobile),
    presentationImagePositionYMobile: firstText(merged.presentationImagePositionYMobile, defaultHeroSettings.presentationImagePositionYMobile),
    presentationImageScale: numOr(merged.presentationImageScale, 1),
    presentationImageScaleTablet: numOr(merged.presentationImageScaleTablet, merged.presentationImageScale, 1),
    presentationImageScaleMobile: numOr(merged.presentationImageScaleMobile, merged.presentationImageScale, 1),
  };
}
