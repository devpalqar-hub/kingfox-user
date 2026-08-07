export interface QRCouponCampaign {
  id: number;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  codesIssued: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  codesClaimed: number;
  codesTotal: number;
  codesPending: number;
}

export interface QRCouponDetailsResponse {
  code: string;
  isClaimed: boolean;
  claimedAt: string | null;
  campaign: QRCouponCampaign;
}

export interface QRCouponClaimPayload {
  code: string;
  phone: string;
  name: string;
}

export interface QRCouponClaimResponse {
  title: string;
  description: string;
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
    minPurchaseAmount: number;
    maxDiscountAmount: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
  };
}

export interface QRCouponApiError {
  message: string | string[];
  error?: string;
  statusCode?: number;
}
