import type { AxiosRequestConfig } from "axios";

import { api, withAuth } from "@/lib/api";

export const addToWishlist = async (variantId: number) => {
  const res = await api.post(
    "/v1/user/wishlist",
    {
      variantId,
    },
    withAuth(),
  );
  return res.data;
};

export const getWishList = async (config?: AxiosRequestConfig) => {
  const res = await api.get("/v1/user/wishlist", withAuth(config));
  const payload = res.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return payload?.items || payload?.data || [];
};

export const removeFromWishlist = async (productId: number) => {
  const res = await api.delete(`/v1/user/wishlist/${productId}`, withAuth());
  return res.data;
};

export const clearWishlist = async () => {
  const res = await api.delete("/v1/user/wishlist/clear", withAuth());
  return res.data;
};
