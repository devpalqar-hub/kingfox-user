import OrderConfirmation from "./OrderConfirmation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; orderid?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId || params.orderid;

  return <OrderConfirmation orderId={orderId} />;
}
