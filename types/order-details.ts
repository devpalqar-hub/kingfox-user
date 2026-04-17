export interface OrderDetailsItem {
  id: number;
  quantity: number;
  price: string;
  subtotal: string;

  variant: {
    size: string;
    color: string;
    image: string;

    product: {
      id: number;
      name: string;
    };
  };

  review: {
    id: number;
    rating: number;
    title: string;
    body: string;
    images: string[];
  } | null; // ✅ VERY IMPORTANT
}



export interface Shipment {
  id: number;
  providerName: string | null;
  trackingId: string;
  shippedAt: string | null;
}

export interface OrderDetailsResponse {
  id: number;
  orderNumber: string;
  status: string;

  subtotal: string;
  discount: string;
  shippingCharge: string;
  finalAmount: string;

  shippingAddress: string;

  createdAt: string;
  updatedAt: string; 

  items: OrderDetailsItem[];

  shipments: Shipment[];

  payments: {
    paymentMethod: string;
  }[];

  voucher: {
    voucherCode: string;
    campaign: {
      name: string;
    };
  } | null;
}