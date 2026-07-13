import type { Metadata } from "next";
import { CartPage as CartScreen } from "@/features/cart/CartPage";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Resumen del pedido de Casa Rosier."
};

export default function CartPage() {
  return <CartScreen />;
}
