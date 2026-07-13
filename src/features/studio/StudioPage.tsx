import Image from "next/image";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { IdeaPromptSection } from "@/features/shared/contextual-sections/IdeaPromptSection";
import { SitePage } from "@/features/shared/layout/SitePage";
import { StudioProfileBlock } from "@/features/studio/StudioProfileBlock";
import { getPublicTestimonials } from "@/lib/cms/public-content";
import { getStudioPageSettings } from "@/lib/cms/studio-page";
import { getTeachers } from "@/lib/cms/teachers";
import { assetPath } from "@/lib/assets";

export async function StudioPage() {
  const [cmsTestimonials, teachers, pageSettings] = await Promise.all([
    getPublicTestimonials(),
    getTeachers(),
    getStudioPageSettings(),
  ]);
  const testimonials = cmsTestimonials
    .map((item) => ({
      image: item.avatar_id || "/img/avatar-1.jpg",
      alt: `Foto de ${item.name}`,
      quote: item.text,
      author: item.role ? `${item.name} — ${item.role}` : item.name,
    }));
  const specialists = teachers
    .filter((teacher) => teacher.status === "published" && teacher.deleted_at === null)
    .sort((a, b) => a.sort_order - b.sort_order);
  const hero = pageSettings.hero;

  return (
    <SitePage
      bodyClass="studio-page"
      header={
        <HeaderInterno
          variant={hero.heroVariant}
          hero={hero}
          image={hero.heroImage}
          height="large"
          overlayTitle
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
      }
    >
      <section
        className="studio-editorial-intro section is-visible"
        aria-label="Introducción del estudio"
      >
        <div className="studio-editorial-intro__inner">
          <MarkdownContent className="studio-editorial-intro__lede" source={pageSettings.introContent} />
        </div>
      </section>
      <section
        className="studio-narrative section"
        aria-label="Equipo del estudio"
      >
        <div className="container studio-narrative__container">
          {specialists.map((specialist) => (
            <StudioProfileBlock
              key={specialist.id}
              name={specialist.name}
              role={specialist.specialty}
              image={assetPath(specialist.image_id || "/img/social-1.jpg")}
              intro={specialist.bio}
            />
          ))}
        </div>
      </section>
      {pageSettings.showIdeaPromptSection ? <IdeaPromptSection context="studio" /> : null}
      <TestimonialSlider testimonials={testimonials} />
    </SitePage>
  );
}
