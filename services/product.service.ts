import { ProductResponse } from "@/types/product";
import { ProductDetail } from "@/types/product";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
type ProductFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const getRequestHeaders = (headers?: HeadersInit) => {
  const requestHeaders = new Headers(headers);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  return requestHeaders;
};

const fetchJson = async <T>(
  url: string,
  init?: ProductFetchInit,
  errorMessage = "Request failed",
) => {
  const res = await fetch(url, {
    ...init,
    headers: getRequestHeaders(init?.headers),
  });

  if (!res.ok) {
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
};

export class ProductNotFoundError extends Error {
  constructor(message = "Product not found") {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

const fetchProductDetail = async (path: string, init?: ProductFetchInit) => {
  const res = await fetch(`${BASE_URL}/v1/user/products/${path}`, {
    ...init,
    headers: getRequestHeaders(init?.headers),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json() as Promise<ProductDetail>;
};

export const getProducts = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  tags?: string[];
  sortBy?: "newly_arrived" | "low_to_high" | "high_to_low";
}) => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.size) query.append("size", params.size);
  if (params.minPrice) query.append("minPrice", params.minPrice.toString());
  if (params.maxPrice) query.append("maxPrice", params.maxPrice.toString());
  if (params.categoryId) query.append("categoryId", params.categoryId.toString());
  if (params.color) query.append("color", params.color);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.tags) {
    params.tags.forEach((tag) => query.append("tags", tag));
  }
  return fetchJson<ProductResponse>(
    `${BASE_URL}/v1/user/products?${query}`,
    undefined,
    "Failed to fetch products",
  );
};

export const findProductById = (id: string, init?: ProductFetchInit) => {
  return fetchProductDetail(id, init);
};

export const getProductById = async (id: string, init?: ProductFetchInit) => {
  const product = await findProductById(id, init);

  if (!product) {
    throw new ProductNotFoundError();
  }

  return product;
};

export const findProductBySlug = (slug: string, init?: ProductFetchInit) => {
  return fetchProductDetail(`slug/${encodeURIComponent(slug)}`, init);
};

export const getProductBySlug = async (
  slug: string,
  init?: ProductFetchInit,
) => {
  const product = await findProductBySlug(slug, init);

  if (!product) {
    throw new ProductNotFoundError();
  }

  return product;
};

export const findProductByIdentifier = async (
  identifier: string,
  init?: ProductFetchInit,
) => {
  try {
    return await getProductBySlug(identifier, init);
  } catch (error) {
    const isNumericIdentifier = /^\d+$/.test(identifier);

    if (error instanceof ProductNotFoundError && isNumericIdentifier) {
      return getProductById(identifier, init);
    }

    throw error;
  }
};

export const getProductByIdentifier = async (
  identifier: string,
  init?: ProductFetchInit,
) => {
  const product = await findProductByIdentifier(identifier, init);

  if (!product) {
    throw new ProductNotFoundError();
  }

  return product;
};

export const isProductNotFoundError = (
  error: unknown,
): error is ProductNotFoundError => error instanceof ProductNotFoundError;

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

