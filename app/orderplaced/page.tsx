"use client";

import { useEffect, useState } from "react";
import styles from "./orderplaced.module.css";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrderConfirmation() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId =
  params.get("orderId") || params.get("orderid");

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("lastOrderData");
    if (data) {
      setOrder(JSON.parse(data));
    }
  }, []);

  if (!order) return <p>Loading...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        
        <h1 className={styles.title}>🎉 Order Confirmed</h1>
        <p className={styles.subtitle}>
          Order #{order.orderNumber}
        </p>

        {/* STATUS */}
        <div className={styles.status}>
          Payment: <b>{order.paymentStatus}</b>
        </div>

        {/* ITEMS */}
        <div className={styles.section}>
          <h3>Items</h3>
          {order.items.map((item: any) => (
            <div key={item.id} className={styles.item}>
              <img src={item.variant.product.images[0]} />
              <div>
                <p>{item.variant.product.name}</p>
                <p>{item.variant.size} / {item.variant.color}</p>
                <p>Qty: {item.quantity}</p>
              </div>
              <b>₹{item.price}</b>
            </div>
          ))}
        </div>

        {/* ADDRESS */}
        <div className={styles.section}>
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress}</p>
        </div>

        {/* PAYMENT */}
        <div className={styles.section}>
          <h3>Payment Method</h3>
          <p>{order.paymentMethod}</p>
        </div>

        {/* TOTAL */}
        <div className={styles.total}>
          Total Paid: ₹{order.finalAmount}
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button onClick={() => router.push("/")}>
            Continue Shopping
          </button>

          <button
            className={styles.secondary}
            onClick={() => router.push("/profile")}
          >
            View Orders
          </button>
        </div>

      </div>
    </div>
  );
}