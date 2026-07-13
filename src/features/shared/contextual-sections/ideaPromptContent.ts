import {
  defaultSocialGalleryPosts,
  type SocialGalleryPost
} from "@/components/home/SocialGallery";

export type IdeaPromptContext =
  | "home"
  | "experience-list"
  | "experience-detail"
  | "blog"
  | "blog-post"
  | "studio";

export interface IdeaPromptContent {
  id: string;
  title: string;
  subtitle: string;
  posts: readonly SocialGalleryPost[];
  ariaLabel: string;
  sourceHref: string;
}

const defaultIdeaPromptContent: IdeaPromptContent = {
  id: "galeria-social",
  title: "Y tu, cuando tuviste\ntu ultima idea?",
  subtitle: "siguenos en instagram - @casarosier",
  posts: defaultSocialGalleryPosts,
  ariaLabel: "Galeria continua de Instagram",
  sourceHref: "https://www.facebook.com/casarosier"
};

const ideaPromptByContext: Partial<Record<IdeaPromptContext, IdeaPromptContent>> = {
  home: defaultIdeaPromptContent,
  "experience-list": defaultIdeaPromptContent,
  "experience-detail": defaultIdeaPromptContent,
  blog: defaultIdeaPromptContent,
  "blog-post": defaultIdeaPromptContent,
  studio: defaultIdeaPromptContent
};

export function getIdeaPromptContent(
  context: IdeaPromptContext
): IdeaPromptContent {
  return ideaPromptByContext[context] ?? defaultIdeaPromptContent;
}
