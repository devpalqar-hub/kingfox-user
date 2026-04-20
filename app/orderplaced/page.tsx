import OrderConfirmation from "./OrderConfirmation";

export default function Page({
  searchParams,
}: {
  searchParams: { orderId?: string; orderid?: string };
}) {
  const orderId = searchParams.orderId || searchParams.orderid;

  return <OrderConfirmation orderId={orderId} />;
}