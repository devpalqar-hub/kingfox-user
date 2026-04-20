import { api, withAuth } from "@/lib/api";
import { OrderHistoryResponse } from "@/types/order-history";

export const getOrdersAPI = async (
  page = 1,
  limit = 5,
): Promise<OrderHistoryResponse> => {
  const res = await api.get(
    `/v1/user/orders?page=${page}&limit=${limit}`,
    withAuth(),
  );
  return res.data;
};
