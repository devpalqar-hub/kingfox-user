export interface OrderHistoryItem {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: string;
  finalAmount: string;
  createdAt: string;
  paymentMethod: string;
  items: {
    id: number;
    quantity: number;
    variant: {
      image: string;
      product: {
        name: string;
      };
    };
  }[];
}

export interface OrderHistoryResponse {
  data: OrderHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}