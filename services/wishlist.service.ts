import axiosInstance from "@/lib/axios";

// ✅ Add
export const addToWishlist = async (productId: number) => {
  const res = await axiosInstance.post("/v1/user/wishlist", {
    productId,
  });
  return res.data;
};

// ✅ Get
export const getWishList = async () => {
  const res = await axiosInstance.get("/v1/user/wishlist");
  return res.data;
};

export const removeFromWishlist = async (productId: number) => {
  const res = await axiosInstance.delete(`/v1/user/wishlist/${productId}`);
  return res.data;
};