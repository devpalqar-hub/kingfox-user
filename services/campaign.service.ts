import { api } from "@/lib/api";

export type Campaign = {
  id: number;
  name: string;
  description: string;
  image: string;
  totalVouchers: number;
  vouchersLeft: number;
  startDate: string;
  endDate: string;
};

export const getCampaignsAPI = async (): Promise<Campaign[]> => {
  const res = await api.get("/v1/lucky-draw/public/campaigns");
  return res.data;
};
