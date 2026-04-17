import axiosInstance from "@/lib/axios";

export const getBranchesAPI = async () => {
  const res = await axiosInstance.get("/v1/branches/pickup-branches");
  return res.data;
};