import axiosInstance from "@/lib/axios";

// 👉 Types
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

// 👉 Send OTP
export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
  try {
    const res = await axiosInstance.post(`/v1/customer-auth/request-otp`, {
      phone,
    });

    return res.data;
  } catch (error: any) {
    // Skip throwing for 401 - let interceptor handle it
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    console.error("Send OTP Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to send OTP");
  }
};

// 👉 Verify OTP
export const verifyOtp = async (
  phone: string,
  otp: string,
): Promise<VerifyOtpResponse> => {
  try {
    const res = await axiosInstance.post(`/v1/customer-auth/verify-otp`, {
      phone,
      otp,
    });

    return res.data;
  } catch (error: any) {
    // Skip throwing for 401 - let interceptor handle it
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    console.error("Verify OTP Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Invalid OTP");
  }
};

export const completeProfile = async (
  token: string,
  data: { name: string; email: string },
) => {
  const res = await axiosInstance.patch(
    "/v1/customer-auth/complete-profile",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
