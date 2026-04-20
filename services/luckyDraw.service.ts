import type { AxiosError } from "axios";

import { api, withAuth } from "@/lib/api";

type CampaignQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export const getAllCampaigns = async (params?: CampaignQueryParams) => {
  try {
    const response = await api.get(
      "/v1/lucky-draw/campaigns",
      withAuth({ params }),
    );

    return response.data.data;
  } catch (error: unknown) {
    const apiError = error as AxiosError;

    if (apiError.response?.status === 401) {
      return [];
    }

    console.error("FULL ERROR:", apiError.response?.data || apiError);
    return [];
  }
};

export const getCampaignById = async (id: number) => {
  try {
    const response = await api.get(
      `/v1/lucky-draw/campaigns/${id}`,
      withAuth({
        headers: {
          "Skip-Auth-Error": "true",
        },
      }),
    );

    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    const apiError = error as AxiosError;

    if (apiError.response?.status === 401) {
      return null;
    }

    return null;
  }
};
