import {
  QRCouponDetailsResponse,
  QRCouponClaimPayload,
  QRCouponClaimResponse,
} from "@/types/qrCoupon";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kingfox.palqar.cloud";

export async function getQRCouponDetails(code: string): Promise<{
  data?: QRCouponDetailsResponse;
  isNotFound?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(
      `${BASE_URL}/v1/qr-coupons/details/${encodeURIComponent(code)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      return { isNotFound: true };
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        error: errData.message || "Failed to fetch QR coupon details",
      };
    }

    const data: QRCouponDetailsResponse = await res.json();
    return { data };
  } catch (err) {
    console.error("GET QR details error:", err);
    return { error: "Network error. Please check your internet connection." };
  }
}

export async function claimQRCoupon(payload: QRCouponClaimPayload): Promise<{
  data?: QRCouponClaimResponse;
  error?: string;
  isAlreadyClaimed?: boolean;
}> {
  try {
    const res = await fetch(`${BASE_URL}/v1/qr-coupons/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Failed to claim coupon";
      
      const isAlreadyClaimed =
        res.status === 400 &&
        typeof msg === "string" &&
        msg.toLowerCase().includes("already");

      return { error: msg, isAlreadyClaimed };
    }

    return { data: data as QRCouponClaimResponse };
  } catch (err) {
    console.error("POST claim QR coupon error:", err);
    return { error: "Network error. Please try again." };
  }
}
