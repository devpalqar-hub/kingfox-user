// types/profile.ts

export interface Campaign {
  id: number;
  name: string;
  validUntil: string;
}

export interface Voucher {
  id: number;
  voucherCode: string;
  issuedAt: string;
  minimumPurchaseAmount: number | null;
  maximumPurchaseAmount: number | null;
  campaign: Campaign;
}

export interface ProfileStats {
  totalOrders: number;
  wishlistCount: number;
  cartItemCount: number;
  activeVoucherCount: number;
}

export interface ProfileResponse {
  type: "customer";
  id: number;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  activeVouchers: Voucher[];
  stats: ProfileStats;
}