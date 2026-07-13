import type { Metadata } from "next";
import { getPublicShopData, getPublicShopItemBySlug } from "@/lib/cms/shop-public";

export async function generateShopStaticParams() {
  const { published } = await getPublicShopData();
  return published.map((item) => ({ slug: item.slug }));
}

export async function generateShopItemMetadata(
  params: Promise<{ slug: string }>
): Promise<Metadata> {
  const item = await getPublicShopItemBySlug((await params).slug);
  return item
    ? {
        title: { absolute: item.seoTitle },
        description: item.seoDescription
      }
    : {};
}

export async function getShopRouteItem(params: Promise<{ slug: string }>) {
  return getPublicShopItemBySlug((await params).slug);
}
