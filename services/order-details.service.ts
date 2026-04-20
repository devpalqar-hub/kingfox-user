import type { AxiosRequestConfig } from "axios";

import { api, withAuth } from "@/lib/api";
import { OrderDetailsResponse } from "@/types/order-details";

export const getOrderDetailsAPI = async (
  id: string,
  config?: AxiosRequestConfig,
): Promise<OrderDetailsResponse> => {
  const res = await api.get(`/v1/user/orders/${id}`, withAuth(config));
  return res.data;
};
