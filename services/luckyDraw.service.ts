import axios from "axios";

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
    const response = await axios.get(
      `${BASE_URL}/v1/lucky-draw/campaigns/${id}`, // ✅ FIXED
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ FIXED
        },
      }
    );

    return response.data; // ✅ matches your API response
  } catch (error: any) {
    console.error("Error fetching campaign:", error.response?.data || error);
    return null;
  }
};