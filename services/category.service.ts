import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // ✅ IMPORTANT FIX
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("Category error:", error.response?.data || error);
    return [];
  }
};