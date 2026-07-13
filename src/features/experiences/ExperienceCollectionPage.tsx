import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { IdeaPromptSection } from "@/features/shared/contextual-sections/IdeaPromptSection";
import { SitePage } from "@/features/shared/layout/SitePage";
import type { ExperienceCollectionConfig } from "@/features/experiences/experienceRoutes";

export function ExperienceCollectionPage({
  config
}: {
  config: ExperienceCollectionConfig;
}) {
  return (
    <SitePage
      bodyClass={config.bodyClass}
      header={<HeaderInterno eyebrow={config.eyebrow} title={config.title} />}
    >
      <CollectionGrid items={config.items} lede={config.lede} />
      <IdeaPromptSection context="experience-list" />
    </SitePage>
  );
}
