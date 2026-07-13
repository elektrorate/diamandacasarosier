import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage as BlogPostScreen } from "@/features/blog/BlogPostPage";
import {
  generateBlogPostMetadata,
  generateBlogStaticParams,
  getBlogPostRouteItem
} from "@/features/blog/blogRouting";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return generateBlogStaticParams();
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return generateBlogPostMetadata(params);
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getBlogPostRouteItem(params);
  if (!post) notFound();

  return <BlogPostScreen post={post} />;
}
