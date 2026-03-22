const CART_KEY = "guest_cart";

export const getGuestCart = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
};

export const addToGuestCart = (item: any) => {
  const cart = getGuestCart();

  const existing = cart.find((i: any) => i.variantId === item.variantId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const updateGuestCart = (variantId: number, quantity: number) => {
  const cart = getGuestCart().map((item: any) =>
    item.variantId === variantId ? { ...item, quantity } : item
  );
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const removeGuestCartItem = (variantId: number) => {
  const cart = getGuestCart().filter((i: any) => i.variantId !== variantId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};