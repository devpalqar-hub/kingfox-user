import axiosInstance from "@/lib/axios";
import {
  OrderPreviewResponse,
  CheckoutPayload,
  OrderResponse,
  PreviewPayload,
} from "@/types/order";

// 🔹 PREVIEW
export const previewOrderAPI = async (
  body: PreviewPayload
): Promise<OrderPreviewResponse> => {
  const res = await axiosInstance.post("/v1/user/orders/preview", body);
  return res.data;
};

// 🔹 CHECKOUT
export const checkoutAPI = async (
  body: CheckoutPayload
): Promise<OrderResponse> => {
  const res = await axiosInstance.post("/v1/user/orders/checkout", body);
  return res.data;
};