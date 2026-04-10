"use client";

import { useEffect, useState } from "react";
import styles from "./orderplaced.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { MdLocalShipping } from "react-icons/md";
export default function OrderConfirmation() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId =
  params.get("orderId") || params.get("orderid");

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
  const storedId = localStorage.getItem("lastOrderId");
  const data = localStorage.getItem("lastOrderData");

  console.log("URL orderId:", orderId);
  console.log("Stored orderId:", storedId);

  if (!data) {
    setOrder(null);
    return;
  }

  // ✅ Allow fallback (IMPORTANT)
  if (storedId === orderId) {
    setOrder(JSON.parse(data));
  } else {
    // ⚠️ fallback (so no infinite loading)
    setOrder(JSON.parse(data));
  }
}, [orderId]);

if (!order) {
  return <p>Loading correct order...</p>;
}
  return (
    <div className={styles.container}>

    {/* ✅ Success Icon */}
    <div className={styles.successIcon}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    {/* ✅ Header */}
    <header className={styles.header}>
      <h1>Thank you for your order!</h1>
      <p className={styles.orderNumber}>
        Order #{order.orderNumber}
      </p>
    </header>

    <div className={styles.divider}></div>

    {/* ✅ Items */}
    <div className={styles.sectionTitle}>Order Details</div>

    {order.items.map((item: any) => (
      <div key={item.id} className={styles.itemRow}>
        <img
          src={item.variant?.product?.images?.[0] || "/placeholder.png"}
          alt={item.variant?.product?.name}
          className={styles.productImg}
        />

        <div className={styles.itemInfo}>
          <span className={styles.itemName}>
            {item.variant?.product?.name}
          </span>

          <span className={styles.itemMeta}>
            {item.variant?.color}, {item.variant?.size} | Qty: {item.quantity}
          </span>
        </div>

        <div className={styles.price}>
          ₹{item.price}
        </div>
      </div>
    ))}

    {/* ✅ Pricing */}
    <div className={styles.summaryRow}>
      <span>Subtotal</span>
      <span>₹{order.subtotal}</span>
    </div>

    <div className={styles.summaryRow}>
      <span>Shipping</span>
      <span className={styles.shippingFree}>
        {order.shippingCharge == 0 ? "FREE" : `₹${order.shippingCharge}`}
      </span>
    </div>

    <div className={styles.totalRow}>
      <span>Total</span>
      <span>₹{order.finalAmount}</span>
    </div>

    {/* ✅ Delivery Card */}
    <div className={styles.deliveryCard}>
      <div className={styles.deliveryGrid}>

        {/* Address */}
        <div>
          <span className={styles.cardLabel}>DELIVERY ADDRESS</span>
          <p className={styles.cardContent}>
            {order.shippingAddress}
          </p>
        </div>

        {/* Estimated Delivery */}
        <div>
          <span className={styles.cardLabel}>ESTIMATED DELIVERY</span>
          <p className={styles.cardContent}>
            <MdLocalShipping className={styles.deliveryIcon} />
            3 - 5 Business Days
          </p>
        </div>
      </div>

      {/* Track Button */}
      <button
        className={styles.trackButton}
        onClick={() => router.push("/profile")}
      >
        <MdLocalShipping className={styles.trackIcon} />
        TRACK ORDER
      </button>
    </div>

    {/* Footer */}
    <div className={styles.footerLinks}>
      <span>NEED HELP?</span>
      <span>RETURN POLICY</span>
    </div>

    <button
      className={styles.continueBtn}
      onClick={() => router.push("/")}
    >
      CONTINUE SHOPPING
    </button>

  </div>
  );
}