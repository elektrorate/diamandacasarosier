import Image from "next/image";
import { BlogDetail } from "@/components/blog/BlogDetail";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { BlogPost } from "@/data/types";
import { IdeaPromptSection } from "@/features/shared/contextual-sections/IdeaPromptSection";
import { SitePage } from "@/features/shared/layout/SitePage";
import { getBlogNeighbors, getPublicBlogData, getRelatedBlogPosts } from "@/lib/cms/blog-public";
import { formatDate } from "@/lib/utils";

export async function BlogPostPage({ post }: { post: BlogPost }) {
  const { published } = await getPublicBlogData();
  const adjacent = getBlogNeighbors(published, post);
  const relatedPosts = getRelatedBlogPosts(published, post, 3);
  const hero = post.hero;
  const heroVariant = hero?.heroVariant ?? "image";

  return (
    <SitePage
      bodyClass="blog-post-page"
      header={
        <HeaderInterno
          variant={heroVariant}
          hero={hero ?? undefined}
          image={hero?.heroImage || post.coverImage}
          height="small"
          overlayTitle
          heroMenuTone={hero?.heroMenuTone}
          heroMenuColor={hero?.heroMenuColor}
          heroMenuScale={hero?.heroMenuScale}
          heroLogoPositionX={hero?.heroLogoPositionX}
          heroLogoPositionY={hero?.heroLogoPositionY}
          heroLogoWidth={hero?.heroLogoWidth}
          heroLogoTabletPositionX={hero?.heroLogoTabletPositionX}
          heroLogoTabletPositionY={hero?.heroLogoTabletPositionY}
          heroLogoTabletWidth={hero?.heroLogoTabletWidth}
          heroLogoMobilePositionX={hero?.heroLogoMobilePositionX}
          heroLogoMobilePositionY={hero?.heroLogoMobilePositionY}
          heroLogoMobileWidth={hero?.heroLogoMobileWidth}
          heroMenuPositionY={hero?.heroMenuPositionY}
          heroMenuTabletPositionY={hero?.heroMenuTabletPositionY}
          heroMenuMobilePositionY={hero?.heroMenuMobilePositionY}
          heroTitleImageScale={hero?.titleImageScale}
          heroTitleImageScaleTablet={hero?.titleImageScaleTablet}
          heroTitleImageScaleMobile={hero?.titleImageScaleMobile}
          heroTitleImagePositionX={hero?.titleImagePositionX}
          heroTitleImagePositionY={hero?.titleImagePositionY}
          heroTitleImagePositionXTablet={hero?.titleImagePositionXTablet}
          heroTitleImagePositionYTablet={hero?.titleImagePositionYTablet}
          heroTitleImagePositionXMobile={hero?.titleImagePositionXMobile}
          heroTitleImagePositionYMobile={hero?.titleImagePositionYMobile}
          heroTitleImageSecondaryScale={hero?.titleImageSecondaryScale}
          heroTitleImageSecondaryScaleTablet={hero?.titleImageSecondaryScaleTablet}
          heroTitleImageSecondaryScaleMobile={hero?.titleImageSecondaryScaleMobile}
          heroTitleImageSecondaryPositionX={hero?.titleImageSecondaryPositionX}
          heroTitleImageSecondaryPositionY={hero?.titleImageSecondaryPositionY}
          heroTitleImageSecondaryPositionXTablet={hero?.titleImageSecondaryPositionXTablet}
          heroTitleImageSecondaryPositionYTablet={hero?.titleImageSecondaryPositionYTablet}
          heroTitleImageSecondaryPositionXMobile={hero?.titleImageSecondaryPositionXMobile}
          heroTitleImageSecondaryPositionYMobile={hero?.titleImageSecondaryPositionYMobile}
          heroTitlePositionY={hero?.heroTitlePositionY}
          heroTitlePositionYTablet={hero?.heroTitlePositionYTablet}
          heroTitlePositionYMobile={hero?.heroTitlePositionYMobile}
          heroTitleScale={hero?.heroTitleScale}
          heroTitleScaleTablet={hero?.heroTitleScaleTablet}
          heroTitleScaleMobile={hero?.heroTitleScaleMobile}
          presentationTextPositionX={hero?.presentationTextPositionX}
          presentationTextPositionY={hero?.presentationTextPositionY}
          presentationTextPositionXTablet={hero?.presentationTextPositionXTablet}
          presentationTextPositionYTablet={hero?.presentationTextPositionYTablet}
          presentationTextPositionXMobile={hero?.presentationTextPositionXMobile}
          presentationTextPositionYMobile={hero?.presentationTextPositionYMobile}
          presentationTextScale={hero?.presentationTextScale}
          presentationTextScaleTablet={hero?.presentationTextScaleTablet}
          presentationTextScaleMobile={hero?.presentationTextScaleMobile}
          presentationImagePositionX={hero?.presentationImagePositionX}
          presentationImagePositionY={hero?.presentationImagePositionY}
          presentationImagePositionXTablet={hero?.presentationImagePositionXTablet}
          presentationImagePositionYTablet={hero?.presentationImagePositionYTablet}
          presentationImagePositionXMobile={hero?.presentationImagePositionXMobile}
          presentationImagePositionYMobile={hero?.presentationImagePositionYMobile}
          presentationImageScale={hero?.presentationImageScale}
          presentationImageScaleTablet={hero?.presentationImageScaleTablet}
          presentationImageScaleMobile={hero?.presentationImageScaleMobile}
          className="blog-hero"
        />
      }
    >
      <BlogDetail post={post} adjacent={adjacent} relatedPosts={relatedPosts} />
      <IdeaPromptSection context="blog-post" />
    </SitePage>
  );
}
