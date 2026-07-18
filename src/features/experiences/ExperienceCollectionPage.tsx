import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { IdeaPromptSection } from "@/features/shared/contextual-sections/IdeaPromptSection";
import PublicFaqSection from "@/features/shared/contextual-sections/PublicFaqSection";
import { getPublicPageFaqSectionBySlug } from "@/lib/cms/page-faqs";
import { SitePage } from "@/features/shared/layout/SitePage";
import type { ExperienceCollectionConfig } from "@/features/experiences/experienceRoutes";

export async function ExperienceCollectionPage({
  config
}: {
  config: ExperienceCollectionConfig;
}) {
  const faqSection = await getPublicPageFaqSectionBySlug(config.pageSlug);
  return (
    <SitePage
      bodyClass={config.bodyClass}
      header={<HeaderInterno eyebrow={config.eyebrow} title={config.title} />}
    >
      <CollectionGrid items={config.items} lede={config.lede} />
      <PublicFaqSection pageSection={faqSection} eyebrow="" />
      <IdeaPromptSection context="experience-list" />
    </SitePage>
  );
}
