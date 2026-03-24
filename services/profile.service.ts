// services/profile.service.ts

import axiosInstance from "@/lib/axios";
import { ProfileResponse } from "@/types/profile";

// 🔹 GET PROFILE
export const getProfileAPI = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get("/v1/auth/profile");
  return res.data;
};