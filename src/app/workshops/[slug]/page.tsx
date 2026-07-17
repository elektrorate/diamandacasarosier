import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceDetailPage } from "@/features/experiences/ExperienceDetailPage";
import {
  generateExperienceMetadata,
  generateExperienceStaticParams,
  getExperienceRouteItem
} from "@/features/experiences/experienceDetailRouting";

export const revalidate = 900;

export async function generateStaticParams() {
  return generateExperienceStaticParams("workshop");
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return generateExperienceMetadata(params);
}

export default async function WorkshopDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = await getExperienceRouteItem(params, "workshop");
  if (!item) notFound();
  return <ExperienceDetailPage item={item} />;
}
