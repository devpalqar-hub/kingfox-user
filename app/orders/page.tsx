import OrdersPage from "./OrdersPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <OrdersPage
      paymentId={params.razorpay_payment_id}
      orderId={params.razorpay_order_id}
    />
  );
}
