import { api } from "@/lib/api";

export const getBranchesAPI = async () => {
  const res = await api.get("/v1/branches/pickup-branches");
  return res.data;
};
