import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopItemPage as ShopItemScreen } from "@/features/shop/ShopItemPage";
import {
  generateShopItemMetadata,
  generateShopStaticParams,
  getShopRouteItem
} from "@/features/shop/shopRouting";

export function generateStaticParams() {
  return generateShopStaticParams();
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return generateShopItemMetadata(params);
}

export default async function ShopDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = await getShopRouteItem(params);
  if (!item) notFound();
  return <ShopItemScreen item={item} />;
}
