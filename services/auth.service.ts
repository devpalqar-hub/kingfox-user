const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/auth";

export const sendOtp = async (email: string) => {
  const res = await fetch(`${BASE_URL}/otp/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error("Failed to send OTP");

  return res.json();
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await fetch(`${BASE_URL}/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!res.ok) throw new Error("Invalid OTP");

  return res.json();
};