// services/profile.service.ts

import axiosInstance from "@/lib/axios";
import { ProfileResponse } from "@/types/profile";

// 🔹 GET PROFILE
export const getProfileAPI = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get("/v1/auth/profile");
  return res.data;
};

export const updateProfileAPI = async (data: {
  name: string;
  phone: string;
}) => {
  const res = await axiosInstance.patch("/v1/customer-auth/profile", data);
  return res.data;
};