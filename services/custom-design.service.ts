import type { AxiosRequestConfig } from "axios";
import { api, withAuth } from "@/lib/api";

export interface CustomDesignVariant {
  id: number;
  shirtType: string;
  color: string;
  colorCode: string;
  size: string;
  sellingPrice: number;
  outOfStock: boolean;
  availableStock: number;
}

export interface CustomDesignTypesResponse {
  [shirtType: string]: CustomDesignVariant[];
}

export const getCustomDesignTypesAPI = async (
  shirtType: string,
  config?: AxiosRequestConfig,
): Promise<CustomDesignTypesResponse> => {
  const res = await api.get(`/v1/custom-design/types?shirtType=${shirtType}`, config);
  return res.data;
};

export const uploadImagesAPI = async (
  files: File[],
  config?: AxiosRequestConfig,
): Promise<{ urls: string[] }> => {
  const formData = new FormData();

  files.forEach(file => formData.append("files", file));

  const res = await api.post(
    "/v1/upload/images",
    formData,
    {
      ...withAuth(config),
      headers: {
        ...withAuth(config)?.headers,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return {
    urls: res.data.files.map((file: any) => file.url),
  };
};

export interface AddToCustomCartPayload {
  customDesignVariantId: number;
  quantity: number;
  frontImageUrl: string;
  backImageUrl: string;
  stickerText?: string;
  assetImageUrls?: string[];
  notes?: string;
}

export const addToCustomCartAPI = async (
  payload: AddToCustomCartPayload,
  config?: AxiosRequestConfig,
) => {
  const res = await api.post("/v1/custom-design/cart", payload, withAuth(config));
  return res.data;
};
