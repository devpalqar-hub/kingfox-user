import axios from "axios";
import axiosInstance from "@/lib/axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllCampaigns = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/lucky-draw/campaigns`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    // Skip logging for 401 - let interceptor handle it
    if (error?.response?.status === 401) {
      return [];
    }

    console.error("FULL ERROR:", error.response?.data || error);
    return [];
  }
};

export const getCampaignById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/v1/lucky-draw/campaigns/${id}`, {
      headers: {
        "Skip-Auth-Error": "true", 
      },
    });
    return response.data?.data ?? response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;
    }
    return null;
  }
}
