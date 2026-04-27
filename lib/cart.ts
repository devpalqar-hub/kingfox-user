import { CartItem } from "@/types/cart";

const CART_KEY = "guest_cart";

export const getGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
};

export const getGuestCartCount = () => {
  return getGuestCart().reduce((total, item) => total + item.quantity, 0);
};

export const addToGuestCart = (item: CartItem) => {
  const cart = getGuestCart();

  const existing = cart.find((i) => i.variantId === item.variantId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const updateGuestCart = (variantId: number, quantity: number) => {
  const cart = getGuestCart().map((item) =>
    item.variantId === variantId ? { ...item, quantity } : item
  );

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const removeGuestCartItem = (variantId: number) => {
  const cart = getGuestCart().filter((i) => i.variantId !== variantId);

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
};
