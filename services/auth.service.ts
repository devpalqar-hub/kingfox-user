import axiosInstance from "@/lib/axios";

// Base path only (axios already has baseURL)
const BASE_URL = "/v1/auth";


type SendOtpResponse = {
  message: string;
  otp?: string;
};

type VerifyOtpResponse = {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

// 👉 Send OTP
export const sendOtp = async (email: string): Promise<SendOtpResponse> => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/otp/generate`, {
      email,
    });

    return res.data;
  } catch (error: any) {
    console.error("Send OTP Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to send OTP"
    );
  }
};

// 👉 Verify OTP
export const verifyOtp = async (
  email: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/otp/verify`, {
      email,
      otp,
    });

    return res.data;
  } catch (error: any) {
    console.error("Verify OTP Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Invalid OTP"
    );
  }
};