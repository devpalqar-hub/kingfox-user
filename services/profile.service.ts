import { api, withAuth } from "@/lib/api";
import { ProfileResponse } from "@/types/profile";

export const getProfileAPI = async (): Promise<ProfileResponse> => {
  const res = await api.get("/v1/auth/profile", withAuth());
  return res.data;
};

export const updateProfileAPI = async (data: {
  name: string;
  phone: string;
}) => {
  const res = await api.patch("/v1/customer-auth/profile", data, withAuth());
  return res.data;
};
