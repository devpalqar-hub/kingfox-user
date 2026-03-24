import axiosInstance from "@/lib/axios";
import { OrderDetailsResponse } from "@/types/order-details";

export const getOrderDetailsAPI = async (
  id: string
): Promise<OrderDetailsResponse> => {
  const res = await axiosInstance.get(`/v1/user/orders/${id}`);
  return res.data;
};