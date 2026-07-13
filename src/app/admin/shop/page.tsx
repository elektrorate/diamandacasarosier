import AdminShell from "@/components/admin/AdminShell";
import ShopPageEditor from "@/components/admin/ShopPageEditor";
import { getPublicNavigationItems } from "@/lib/cms/navigation-public";
import { getCategories } from "@/lib/cms/product-categories";
import { getProducts } from "@/lib/cms/products";
import { getSettings } from "@/lib/cms/settings";
import { getShopPageSettings } from "@/lib/cms/shop-page";
import { getPublicShopData } from "@/lib/cms/shop-public";

type ShopSearchParams = { tab?: string };

export default async function ShopPage({ searchParams }: { searchParams?: Promise<ShopSearchParams> }) {
  const params = await searchParams;
  const [page, products, categories, shopData, navigationItems, settings] = await Promise.all([
    getShopPageSettings(),
    getProducts(),
    getCategories(),
    getPublicShopData(),
    getPublicNavigationItems("main"),
    getSettings(),
  ]);
  const activeProducts = products.filter((product) => product.status !== "deleted");
  const initialTab = params?.tab === "items" ? "items" : params?.tab === "preview" ? "preview" : "hero";

  return (
    <AdminShell>
      <ShopPageEditor
        page={page}
        products={activeProducts}
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
