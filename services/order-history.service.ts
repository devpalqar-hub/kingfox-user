import axiosInstance from "@/lib/axios";
import { OrderHistoryResponse } from "@/types/order-history";

export const getOrdersAPI = async (
  page = 1,
  limit = 5
): Promise<OrderHistoryResponse> => {
  const res = await axiosInstance.get(
    `/v1/user/orders?page=${page}&limit=${limit}`
  );
  return res.data;
};