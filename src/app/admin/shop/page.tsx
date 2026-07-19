import AdminShell from "@/components/admin/AdminShell";
import ShopPageEditor from "@/components/admin/ShopPageEditor";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getCategories } from "@/lib/cms/product-categories";
import { getProductsPage } from "@/lib/cms/products";
import { getSettings } from "@/lib/cms/settings";
import { getShopPageSettings } from "@/lib/cms/shop-page";
import { getPublicShopData } from "@/lib/cms/shop-public";

type ShopSearchParams = { tab?: string; q?: string; page?: string };

export default async function ShopPage({ searchParams }: { searchParams?: Promise<ShopSearchParams> }) {
  const params = await searchParams;
  const productQuery = (params?.q ?? "").trim();
  const productPage = Math.max(1, Number(params?.page ?? 1) || 1);
  const [page, productsPage, categories, shopData, navigationItems, settings] = await Promise.all([
    getShopPageSettings(),
    getProductsPage({ page: productPage, pageSize: 12, q: productQuery }),
    getCategories(),
    getPublicShopData(),
    getPublicNavigationItems("main"),
    getSettings(),
  ]);
  const initialTab = params?.tab === "items" ? "items" : params?.tab === "preview" ? "preview" : "hero";

  return (
    <AdminShell>
      <ShopPageEditor
        page={page}
        products={productsPage.items}
        productsPage={{
          page: productsPage.page,
          total: productsPage.total,
          totalPages: productsPage.totalPages,
          prevHref: productsPage.page > 1 ? "/admin/shop?tab=items" + (productQuery ? "&q=" + encodeURIComponent(productQuery) : "") + "&page=" + (productsPage.page - 1) : undefined,
          nextHref: productsPage.page < productsPage.totalPages ? "/admin/shop?tab=items" + (productQuery ? "&q=" + encodeURIComponent(productQuery) : "") + "&page=" + (productsPage.page + 1) : undefined,
          q: productQuery,
        }}
        categories={categories}
        published={shopData.published}
        shopCategories={shopData.shopCategories}
        navigationItems={navigationItems}
        menuSettings={settings.menu}
        initialTab={initialTab}
      />
    </AdminShell>
  );
}
