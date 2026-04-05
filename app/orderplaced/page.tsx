"use client";

import React, { useEffect, useState } from "react";
import styles from "./orderplaced.module.css";
import { getOrderDetailsAPI } from "@/services/order-details.service";

export default function OrderPlaced() {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orderId = localStorage.getItem("lastOrderId");

    if (orderId) {
      loadOrder(orderId);
    }
  }, []);

  const loadOrder = async (id: string) => {
    try {
      const data = await getOrderDetailsAPI(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        
        {/* ✅ Success Icon */}
        <div className={styles.icon}>
          ✓
        </div>

        {/* ✅ Title */}
        <h1 className={styles.title}>Order Confirmed</h1>

        {/* ✅ Subtitle */}
        <p className={styles.subtitle}>
          Your order is confirmed. You will receive an order confirmation
          email/SMS shortly with the expected delivery date.
        </p>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* ✅ Order Info */}
        {/* <div className={styles.info}>
          <p><strong>Order ID:</strong> {order.orderNumber}</p>
          <p><strong>Total:</strong> ₹{order.finalAmount}</p>
          <p><strong>Address:</strong> {order.shippingAddress}</p>
        </div> */}

        {/* ✅ Buttons */}
        <div className={styles.actions}>
          <button onClick={() => window.location.href = "/"}>
            Continue Shopping
          </button>

          <button
            className={styles.secondary}
            onClick={() => window.location.href = "/orders"}
          >
            View Orders
          </button>
        </div>

      </div>
    </div>
  );
}