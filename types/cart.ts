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

export interface CartResponse {
  cartId: number;
  customerId: number;
  items: CartItem[];
  subtotal: number;
  appliedCouponDiscount: number;
  discountedSubtotal: number;
  gstPercent: number;
  gstAmount: number;
  finalAmount: number;
  totalItems: number;
  totalQuantity: number;
}