import type { AxiosRequestConfig } from "axios";

import { api, withAuth } from "@/lib/api";
import {
  CheckoutPayload,
  OrderPreviewResponse,
  OrderResponse,
  PreviewPayload,
} from "@/types/order";

export const previewOrderAPI = async (
  body: PreviewPayload,
  config?: AxiosRequestConfig,
): Promise<OrderPreviewResponse> => {
  const res = await api.post("/v1/user/orders/preview", body, withAuth(config));
  return res.data;
};

export const checkoutAPI = async (
  body: CheckoutPayload,
  config?: AxiosRequestConfig,
): Promise<OrderResponse> => {
  const res = await api.post("/v1/user/orders/checkout", body, withAuth(config));
  return res.data;
};
