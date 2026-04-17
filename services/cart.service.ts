import axiosInstance from "@/lib/axios";
import { CartResponse } from "@/types/cart";

export const addToCartAPI = (variantId: number, quantity = 1) => {
  return axiosInstance.post("/v1/user/cart/items", {
    variantId,
    quantity,
  });
};

export const getCartAPI = async (): Promise<CartResponse> => {
  const res = await axiosInstance.get("/v1/user/cart");
  return res.data;
};

export const updateCartItemAPI = (variantId: number, quantity: number) => {
  return axiosInstance.patch(`/v1/user/cart/items/${variantId}`, {
    quantity,
  });
};

export const removeCartItemAPI = (variantId: number) => {
  return axiosInstance.delete(`/v1/user/cart/items/${variantId}`);
};

export const moveAllWishlistToCartAPI = () => {
  return axiosInstance.post("/v1/user/wishlist/wishlist/add-all-to-cart");
};