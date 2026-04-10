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
  tags?: string[];
  sortBy?: "newly_arrived" | "low_to_high" | "high_to_low";
}) => {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.limit !== undefined) query.append("limit", params.limit.toString());
  if (params.size) query.append("size", params.size);
  if (params.minPrice !== undefined) query.append("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined) query.append("maxPrice", params.maxPrice.toString());
  if (params.categoryId !== undefined) query.append("categoryId", params.categoryId.toString());
  if (params.color) query.append("color", params.color);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.tags) { params.tags.forEach((tag) => query.append("tags", tag)); }
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

  const res = await fetch(`${BASE_URL}/v1/user/products?${query}`); // ✅ FIX

  if (!res.ok) {
    throw new Error("Failed to fetch new arrivals");
  }

  return res.json();
};


export const getColorsBySize = async (size: string) => {
  const res = await fetch(
    `${BASE_URL}/v1/products/variants/colors?size=${size}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch colors");
  }

  return res.json();
};

