import { DetailPage } from "@/components/collections/DetailPage";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import type { ExperienceItem } from "@/data/types";
import { IdeaPromptSection } from "@/features/shared/contextual-sections/IdeaPromptSection";
import { SitePage } from "@/features/shared/layout/SitePage";
import { normalizeHeroSettings } from "@/lib/cms/hero-settings";
import type { CmsHeroSettings } from "@/lib/cms/types";

export function ExperienceDetailPage({ item }: { item: ExperienceItem }) {
  const promoPage =
    item.kind === "private-booking" ? undefined : item.kind.replace("-card", "");

  const hero: CmsHeroSettings = normalizeHeroSettings({
    heroVariant: item.heroVariant ?? "text",
    heroTitle: item.heroTitle,
    heroSubtitle: item.subtitle ?? "",
    heroPresentationText: item.heroPresentationText ?? "",
    heroPresentationTextColor: item.heroPresentationTextColor ?? "#FFFFFF",
    heroPresentationImage: item.heroPresentationImage ?? "",
    heroPresentationCtaEnabled: item.heroPresentationCtaEnabled ?? false,
    heroPresentationCtaLabel: item.heroPresentationCtaLabel ?? "Descubrir",
    heroPresentationCtaHref: item.heroPresentationCtaHref ?? "",
    heroPresentationCtaNewTab: item.heroPresentationCtaNewTab ?? false,
    heroPresentationCtaBackgroundColor: item.heroPresentationCtaBackgroundColor ?? "#FFFFFF",
    heroPresentationCtaTextColor: item.heroPresentationCtaTextColor ?? "#3f3933",
    heroMenuTone: item.heroMenuTone,
    heroMenuColor: item.heroMenuColor,
    heroMenuScale: item.heroMenuScale ?? 1,
    heroLogoPositionX: item.heroLogoPositionX,
    heroLogoPositionY: item.heroLogoPositionY,
    heroLogoWidth: item.heroLogoWidth,
    heroLogoTabletPositionX: item.heroLogoTabletPositionX,
    heroLogoTabletPositionY: item.heroLogoTabletPositionY,
    heroLogoTabletWidth: item.heroLogoTabletWidth,
    heroLogoMobilePositionX: item.heroLogoMobilePositionX,
    heroLogoMobilePositionY: item.heroLogoMobilePositionY,
    heroLogoMobileWidth: item.heroLogoMobileWidth,
    heroMenuPositionY: item.heroMenuPositionY,
    heroMenuTabletPositionY: item.heroMenuTabletPositionY,
    heroMenuMobilePositionY: item.heroMenuMobilePositionY,
    heroImage: item.heroImage,
    heroImageMobile: item.heroImageMobile ?? "",
    titleImage: item.heroTitleImage ?? "",
    titleImageSecondary: item.heroTitleImageSecondary ?? "",
    titleImageScale: item.titleImageScale,
    titleImageScaleTablet: item.titleImageScaleTablet,
    titleImageScaleMobile: item.titleImageScaleMobile,
    titleImagePositionX: item.titleImagePositionX,
    titleImagePositionY: item.titleImagePositionY,
    titleImagePositionXTablet: item.titleImagePositionXTablet,
    titleImagePositionYTablet: item.titleImagePositionYTablet,
    titleImagePositionXMobile: item.titleImagePositionXMobile,
    titleImagePositionYMobile: item.titleImagePositionYMobile,
    titleImageSecondaryScale: item.titleImageSecondaryScale,
    titleImageSecondaryScaleTablet: item.titleImageSecondaryScaleTablet,
    titleImageSecondaryScaleMobile: item.titleImageSecondaryScaleMobile,
    titleImageSecondaryPositionX: item.titleImageSecondaryPositionX,
    titleImageSecondaryPositionY: item.titleImageSecondaryPositionY,
    titleImageSecondaryPositionXTablet: item.titleImageSecondaryPositionXTablet,
    titleImageSecondaryPositionYTablet: item.titleImageSecondaryPositionYTablet,
    titleImageSecondaryPositionXMobile: item.titleImageSecondaryPositionXMobile,
    titleImageSecondaryPositionYMobile: item.titleImageSecondaryPositionYMobile,
    heroTitlePositionX: item.heroTitlePositionX,
    heroTitlePositionXTablet: item.heroTitlePositionXTablet,
    heroTitlePositionXMobile: item.heroTitlePositionXMobile,
    heroTitlePositionY: item.heroTitlePositionY,
    heroTitlePositionYTablet: item.heroTitlePositionYTablet,
    heroTitlePositionYMobile: item.heroTitlePositionYMobile,
    heroTitleScale: item.heroTitleScale,
    heroTitleScaleTablet: item.heroTitleScaleTablet,
    heroTitleScaleMobile: item.heroTitleScaleMobile,
    presentationTextPositionX: item.presentationTextPositionX,
    presentationTextPositionY: item.presentationTextPositionY,
    presentationTextPositionXTablet: item.presentationTextPositionXTablet,
    presentationTextPositionYTablet: item.presentationTextPositionYTablet,
    presentationTextPositionXMobile: item.presentationTextPositionXMobile,
    presentationTextPositionYMobile: item.presentationTextPositionYMobile,
    presentationTextScale: item.presentationTextScale,
    presentationTextScaleTablet: item.presentationTextScaleTablet,
    presentationTextScaleMobile: item.presentationTextScaleMobile,
    presentationImagePositionX: item.presentationImagePositionX,
    presentationImagePositionY: item.presentationImagePositionY,
    presentationImagePositionXTablet: item.presentationImagePositionXTablet,
    presentationImagePositionYTablet: item.presentationImagePositionYTablet,
    presentationImagePositionXMobile: item.presentationImagePositionXMobile,
    presentationImagePositionYMobile: item.presentationImagePositionYMobile,
    presentationImageScale: item.presentationImageScale,
    presentationImageScaleTablet: item.presentationImageScaleTablet,
    presentationImageScaleMobile: item.presentationImageScaleMobile,
  });

  return (
    <SitePage
      bodyClass="class-detail-page"
      bodyData={promoPage ? { promoPage } : undefined}
      header={
        <HeaderInterno
          className="experience-detail-hero"
          variant={hero.heroVariant}
          image={hero.heroImage || item.heroImage}
          mobileImage={hero.heroImageMobile || undefined}
          hero={hero}
          heroMenuTone={hero.heroMenuTone}
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
          heroTitleImageScale={hero.titleImageScale}
          heroTitleImageScaleTablet={hero.titleImageScaleTablet}
          heroTitleImageScaleMobile={hero.titleImageScaleMobile}
          heroTitleImagePositionX={hero.titleImagePositionX}
          heroTitleImagePositionY={hero.titleImagePositionY}
          heroTitleImagePositionXTablet={hero.titleImagePositionXTablet}
          heroTitleImagePositionYTablet={hero.titleImagePositionYTablet}
          heroTitleImagePositionXMobile={hero.titleImagePositionXMobile}
          heroTitleImagePositionYMobile={hero.titleImagePositionYMobile}
          heroTitleImageSecondaryScale={hero.titleImageSecondaryScale}
          heroTitleImageSecondaryScaleTablet={hero.titleImageSecondaryScaleTablet}
          heroTitleImageSecondaryScaleMobile={hero.titleImageSecondaryScaleMobile}
          heroTitleImageSecondaryPositionX={hero.titleImageSecondaryPositionX}
          heroTitleImageSecondaryPositionY={hero.titleImageSecondaryPositionY}
          heroTitleImageSecondaryPositionXTablet={hero.titleImageSecondaryPositionXTablet}
          heroTitleImageSecondaryPositionYTablet={hero.titleImageSecondaryPositionYTablet}
          heroTitleImageSecondaryPositionXMobile={hero.titleImageSecondaryPositionXMobile}
          heroTitleImageSecondaryPositionYMobile={hero.titleImageSecondaryPositionYMobile}
          heroTitlePositionX={hero.heroTitlePositionX}
          heroTitlePositionXTablet={hero.heroTitlePositionXTablet}
          heroTitlePositionXMobile={hero.heroTitlePositionXMobile}
          heroTitlePositionY={hero.heroTitlePositionY}
          heroTitlePositionYTablet={hero.heroTitlePositionYTablet}
          heroTitlePositionYMobile={hero.heroTitlePositionYMobile}
          heroTitleScale={hero.heroTitleScale}
          heroTitleScaleTablet={hero.heroTitleScaleTablet}
          heroTitleScaleMobile={hero.heroTitleScaleMobile}
          presentationTextPositionX={hero.presentationTextPositionX}
          presentationTextPositionY={hero.presentationTextPositionY}
          presentationTextPositionXTablet={hero.presentationTextPositionXTablet}
          presentationTextPositionYTablet={hero.presentationTextPositionYTablet}
          presentationTextPositionXMobile={hero.presentationTextPositionXMobile}
          presentationTextPositionYMobile={hero.presentationTextPositionYMobile}
          presentationTextScale={hero.presentationTextScale}
          presentationTextScaleTablet={hero.presentationTextScaleTablet}
          presentationTextScaleMobile={hero.presentationTextScaleMobile}
          presentationImagePositionX={hero.presentationImagePositionX}
          presentationImagePositionY={hero.presentationImagePositionY}
          presentationImagePositionXTablet={hero.presentationImagePositionXTablet}
          presentationImagePositionYTablet={hero.presentationImagePositionYTablet}
          presentationImagePositionXMobile={hero.presentationImagePositionXMobile}
          presentationImagePositionYMobile={hero.presentationImagePositionYMobile}
          presentationImageScale={hero.presentationImageScale}
          presentationImageScaleTablet={hero.presentationImageScaleTablet}
          presentationImageScaleMobile={hero.presentationImageScaleMobile}
        />
      }
    >
      <DetailPage item={item} titleLevel={hero.heroVariant === "text" ? "h2" : "h1"} />
      {item.showIdeaPromptSection ?? true ? <IdeaPromptSection context="experience-detail" /> : null}
    </SitePage>
  );
}