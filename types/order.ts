// 🔹 Preview Payload
export interface PreviewPayload {
  isCartPurchase: boolean;

  items?: {
    variantId: number;
    quantity: number;
  }[];

  couponCode?: string;

  // Guest only
  customerEmail?: string;
  customerPhone?: string;
  isCOD?: boolean;
}
// 🔹 Preview Response
export interface OrderPreviewItem {
  variantId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  weightG: number;
}

export interface OrderPreviewResponse {
  subtotal: number;
  discount: number;
  couponApplied: string | null;
  shippingCharge: number;
  totalWeight: number;
  finalAmount: number;
  discountAmount?: number;
  items: OrderPreviewItem[];
}

// 🔹 Checkout Payload
export interface CheckoutPayload {
  isCartPurchase: boolean;
  items?: {
    variantId: number;
    quantity: number;
  }[];

  // Guest only
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  couponCode?: string;
  paymentMethod: "COD" | "RAZORPAY";
  shippingAddress: string;
}

// 🔹 Checkout Response
export interface OrderItem {
  id: number;
  variantId: number;
  quantity: number;
  price: string;
  subtotal: string;

}

export interface OrderResponse {
  message: string;

  order: {
    id: number;
    orderNumber: string;
    status: string;
    subtotal: string;
    discount: string;
    shippingCharge: string;
    finalAmount: string;
    paymentMethod: string;
    createdAt: string;
    items: OrderItem[];
  };

  // 🔥 ADD THIS
  paymentLink?: {
    url: string;
  };
}



