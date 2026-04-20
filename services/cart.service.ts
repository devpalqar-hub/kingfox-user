import type { AxiosRequestConfig } from "axios";

import { api, withAuth } from "@/lib/api";
import { CartResponse } from "@/types/cart";

export const addToCartAPI = (variantId: number, quantity = 1) => {
  return api.post(
    "/v1/user/cart/items",
    {
      variantId,
      quantity,
    },
    withAuth(),
  );
};

export const getCartAPI = async (
  config?: AxiosRequestConfig,
): Promise<CartResponse> => {
  const res = await api.get("/v1/user/cart", withAuth(config));
  return res.data;
};

export const updateCartItemAPI = (variantId: number, quantity: number) => {
  return api.patch(
    `/v1/user/cart/items/${variantId}`,
    {
      quantity,
    },
    withAuth(),
  );
};

export const removeCartItemAPI = (variantId: number) => {
  return api.delete(`/v1/user/cart/items/${variantId}`, withAuth());
};

export const moveAllWishlistToCartAPI = () => {
  return api.post(
    "/v1/user/wishlist/add-all-to-cart",
    undefined,
    withAuth(),
  );
};
