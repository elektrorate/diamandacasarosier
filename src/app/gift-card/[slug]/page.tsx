import { redirect } from "next/navigation";

export default async function GiftCardDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  redirect(`/gift-cards/${(await params).slug}`);
}
