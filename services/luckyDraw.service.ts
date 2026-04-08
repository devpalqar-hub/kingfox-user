import axios from "axios";
import axiosInstance from "@/lib/axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllCampaigns = async () => {
  try {
    console.log("BASE_URL:", BASE_URL);

    const response = await axios.get(`${BASE_URL}/v1/lucky-draw/campaigns`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error("FULL ERROR:", error.response?.data || error);
    return [];
  }
};

export const getCampaignById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/v1/lucky-draw/campaigns/${id}`);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Error fetching campaign:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    return null;
  }
};