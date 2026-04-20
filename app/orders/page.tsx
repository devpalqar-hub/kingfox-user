import OrdersPage from "./OrdersPage";

export default function Page({
  searchParams,
}: {
  searchParams: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
  };
}) {
  return (
    <OrdersPage
      paymentId={searchParams.razorpay_payment_id}
      orderId={searchParams.razorpay_order_id}
    />
  );
}