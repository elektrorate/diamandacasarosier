import Image from "next/image";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { SitePage } from "@/features/shared/layout/SitePage";
import { getShopPageSettings } from "@/lib/cms/shop-page";
import { getPublicShopData } from "@/lib/cms/shop-public";
import type { CmsHeroSettings } from "@/lib/cms/types";

function ShopHeroContent({ hero }: { hero: CmsHeroSettings }) {
  const variant = hero.heroVariant ?? "text";

  if (variant === "presentation") {
    return (
      <div className="page-hero__presentation">
        <div className="page-hero__presentation-text" style={{ color: hero.heroPresentationTextColor || "#FFFFFF" }}>
          <MarkdownContent source={hero.heroPresentationText || hero.heroTitle || "Shop"} className="page-hero__presentation-copy" />
        </div>
        {hero.heroPresentationImage ? (
          <div className="page-hero__presentation-image">
            <Image src={hero.heroPresentationImage} alt={hero.heroTitle || "Shop"} fill sizes="420px" className="object-contain" unoptimized />
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "image") {
    return (
      <div className="page-hero__script-stack">
        {hero.titleImage ? (
          <Image src={hero.titleImage} alt={hero.heroTitle || "Shop"} fill sizes="520px" className="page-hero__script-image page-hero__script-image--back" unoptimized />
        ) : null}
        {hero.titleImageSecondary ? (
          <Image src={hero.titleImageSecondary} alt={hero.heroTitle || "Shop"} fill sizes="520px" className="page-hero__script-image page-hero__script-image--front" unoptimized />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="page-hero__eyebrow">{hero.heroSubtitle || "Casa Rosier"}</p>
      <h1 className="page-hero__title">{hero.heroTitle || "Shop"}</h1>
    </div>
  );
}

export async function ShopIndexPage() {
  const [{ published, shopCategories }, page] = await Promise.all([
    getPublicShopData(),
    getShopPageSettings(),
  ]);
  const hero = page.hero;
  const heroVariant = hero.heroVariant ?? "text";
  const isImageLikeHero = heroVariant === "image" || heroVariant === "presentation";

  return (
    <SitePage
      bodyClass="shop-page"
      header={(
        <HeaderInterno
          image={hero.heroImage || "/img/social-2.jpg"}
          variant={heroVariant}
          hero={hero}
          height={isImageLikeHero ? "large" : "medium"}
          eyebrow={hero.heroSubtitle}
          title={hero.heroTitle || "Shop"}
          overlayTitle={isImageLikeHero}
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
      )}
    >
      <ShopGrid published={published} shopCategories={shopCategories} />
    </SitePage>
  );
}
