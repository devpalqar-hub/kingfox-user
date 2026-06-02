import { api } from "@/lib/api";

export const getBranchesAPI = async (variationId?: string | number) => {
  const res = await api.get("/v1/branches/pickup-branches", {
    params: { variationId },
  });
  return res.data;
};
