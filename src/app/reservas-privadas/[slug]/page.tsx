import { redirect } from "next/navigation";

export default async function PrivateExperienceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  redirect(`/experiencias/${(await params).slug}`);
}
