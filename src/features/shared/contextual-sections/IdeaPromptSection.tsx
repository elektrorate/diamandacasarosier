import { SocialGallery } from "@/components/home/SocialGallery";
import {
  getIdeaPromptContent,
  type IdeaPromptContext
} from "@/features/shared/contextual-sections/ideaPromptContent";
import { getPublicSocialGallery } from "@/lib/cms/public-content";

export async function IdeaPromptSection({
  context
}: {
  context: IdeaPromptContext;
}) {
  const content = getIdeaPromptContent(context);
  const gallery = await getPublicSocialGallery();

  const posts = gallery?.items
    .filter((item) => item.is_visible !== false && item.image_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      image: item.image_url,
      title: item.title,
      body: item.description,
      instagramUrl: item.instagram_url,
    }));

  return (
    <SocialGallery
      id={content.id}
      title={gallery?.title || content.title}
      subtitle={gallery?.description || content.subtitle}
      posts={posts?.length ? posts : content.posts}
      ariaLabel={content.ariaLabel}
      sourceHref={gallery ? gallery.cta_url : content.sourceHref}
    />
  );
}
