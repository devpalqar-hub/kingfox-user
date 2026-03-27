import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getReviewsByProductId = async (productId: number) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/v1/user/products/${productId}/reviews`
    );

    return response.data; // ✅ contains total + averageRating
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return null;
  }
};