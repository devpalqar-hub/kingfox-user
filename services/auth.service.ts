import axiosInstance from "@/lib/axios";

// Base path
const BASE_URL = "/v1/customer-auth";

// 👉 Types
type SendOtpResponse = {
  message: string;
  otp?: string;
  isNew?: boolean;
};

type VerifyOtpResponse = {
  access_token: string;
  isNew: boolean;
};

// 👉 Send OTP
export const sendOtp = async (email: string): Promise<SendOtpResponse> => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/request-otp`, {
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
    const res = await axiosInstance.post(`${BASE_URL}/verify-otp`, {
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

export const completeProfile = async (
  token: string,
  data: { name: string; phone: string }
) => {
  const res = await axiosInstance.patch(
    "/v1/customer-auth/complete-profile",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};