import type { CartItem } from "@/data/types";

export const CART_STORAGE_KEY = "casarosier_cart_v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]"
    );
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("casarosier:cart"));
  } catch {
    // Storage can be unavailable in private browsing or strict browser modes.
  }
}

export function addCartItem(item: CartItem) {
  writeCart([...readCart(), item]);
}

export function removeCartItem(cartItemId: string) {
  writeCart(readCart().filter((item) => item.cartItemId !== cartItemId));
}

export function clearCart() {
  writeCart([]);
}
