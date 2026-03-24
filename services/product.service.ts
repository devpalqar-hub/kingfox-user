import { ProductResponse } from "@/types/product";
import { ProductDetail } from "@/types/product";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const getProducts = async (params: {
  page?: number;
  limit?: number;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  tag?: string;
  sortBy?: "newly_arrived" | "low_to_high" | "high_to_low";
}) => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.size) query.append("size", params.size);
  if (params.minPrice) query.append("minPrice", params.minPrice.toString());
  if (params.maxPrice) query.append("maxPrice", params.maxPrice.toString());
  if (params.categoryId) query.append("categoryId", params.categoryId.toString());
  if (params.color) query.append("color", params.color);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  const res = await fetch(`${BASE_URL}/v1/user/products?${query}`);
  

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json() as Promise<ProductResponse>;
};

export const getProductById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/v1/user/products/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json() as Promise<ProductDetail>;
};

export const getNewArrivals = async (params?: {
  size?: string | null;
  categoryId?: number | null;
}) => {
  const query = new URLSearchParams();

  if (params?.size) query.append("size", params.size);
  if (params?.categoryId) {
    query.append("categoryId", params.categoryId.toString());
  }

  query.append("tags", "NEW ARRIVALS");

  const res = await fetch(`${BASE_URL}/v1/products?${query}`);

  if (!res.ok) {
    throw new Error("Failed to fetch new arrivals");
  }

  return res.json();
};


