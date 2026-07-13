import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { Cart } from "@/components/shop/Cart";
import { SitePage } from "@/features/shared/layout/SitePage";

export function CartPage() {
  return (
    <SitePage
      bodyClass="cart-page"
      header={<HeaderInterno eyebrow="Resumen del pedido" title="Carrito" />}
    >
      <section className="cart section">
        <div className="container cart__container">
          <Cart />
        </div>
      </section>
    </SitePage>
  );
}
