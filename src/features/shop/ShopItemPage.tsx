import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { ShopDetail } from "@/components/shop/ShopDetail";
import type { ShopItem } from "@/data/types";
import { SitePage } from "@/features/shared/layout/SitePage";

export function ShopItemPage({ item }: { item: ShopItem }) {
  return (
    <SitePage
      bodyClass="shop-detail-page"
      header={
        <HeaderInterno
          image={item.image}
          eyebrow={item.categoryLabel}
          title={item.name}
        />
      }
    >
      <ShopDetail item={item} />
    </SitePage>
  );
}
