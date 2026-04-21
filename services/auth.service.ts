import type { AxiosError } from "axios";

import { api } from "@/lib/api";

type ApiErrorResponse = {
  message?: string;
};

type SendOtpResponse = {
  message: string;
  otp?: string;
  isNew?: boolean;
};

type VerifyOtpResponse = {
  access_token: string;
  isNew?: boolean;
  user?: {
    id: string | number;
    name?: string;
    email?: string;
    role?: string;
  };
};

export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
  try {
    const res = await api.post(`/v1/customer-auth/request-otp`, {
      phone,
    });

    return res.data;
  } catch (error: unknown) {
    const apiError = error as AxiosError<ApiErrorResponse>;

    if (apiError.response?.status === 401) {
      return Promise.reject(error);
    }

    console.error(
      "Send OTP Error:",
      apiError.response?.data || apiError.message,
    );
    throw new Error(
      apiError.response?.data?.message || "Failed to send OTP",
    );
  }
};

export const verifyOtp = async (
  phone: string,
  otp: string,
): Promise<VerifyOtpResponse> => {
  try {
    const res = await api.post(`/v1/customer-auth/verify-otp`, {
      phone,
      otp,
    });

    return res.data;
  } catch (error: unknown) {
    const apiError = error as AxiosError<ApiErrorResponse>;

    if (apiError.response?.status === 401) {
      return Promise.reject(error);
    }

    console.error(
      "Verify OTP Error:",
      apiError.response?.data || apiError.message,
    );
    throw new Error(apiError.response?.data?.message || "Invalid OTP");
  }
};

export const completeProfile = async (
  token: string,
  data: { name: string; email: string },
) => {
  const res = await api.patch("/v1/customer-auth/complete-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
