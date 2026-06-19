export interface CartItem {
  variantId: number;
  cartItemId?: number; // optional for guest
  sku?: string;
  size: string;
  color: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  lineTotal?: number;
  availableStock: number; 
}

export interface CustomDesignCartItem {
  customDesignVariantId: number;
  cartItemId?: number;
  shirtType: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  lineTotal?: number;
  frontImageUrl: string;
  backImageUrl: string;
  stickerText?: string;
  assetImageUrls?: string[];
  notes?: string;
}

export interface CartResponse {
  cartId: number;
  customerId: number;
  items: CartItem[];
  customDesignItems: CustomDesignCartItem[];
  subtotal: number;
  appliedCouponDiscount: number;
  discountedSubtotal: number;
  gstPercent: number;
  gstAmount: number;
  totalWeight: number;
  shippingCharge: number;
  finalAmount: number;
  totalItems: number;
  totalQuantity: number;
}