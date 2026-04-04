"use client";

import React, { useEffect, useState } from "react";
import styles from "./orderplaced.module.css";
import { MdLocalShipping } from "react-icons/md";
import { getOrderDetailsAPI } from "@/services/order-details.service";

export default function OrderPlaced() {
  const [order, setOrder] = useState<any>(null);

useEffect(() => {
  const orderId = localStorage.getItem("lastOrderId");


  if (orderId) {
    
    loadOrder(orderId);
    console.log(orderId)
  } else {
    console.warn("No orderId found ❌");

    // 🔥 FALLBACK (FIX)
    const stored = localStorage.getItem("lastOrderData");

    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("Using fallback order:", parsed);

      setOrder(parsed);
    } else {
      console.error("No fallback data ❌");
    }
  }
}, []);

  const loadOrder = async (id: string) => {
    try {
      const data = await getOrderDetailsAPI(id);
      console.log("API DATA:", data);
      setOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) {
    return <div style={{ padding: "100px" }}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      
      {/* Success Icon */}
      <div className={styles.successIcon}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <h1>Thank you for your order, Fox!</h1>
        <p className={styles.orderNumber}>
          Order #{order.orderNumber666}
        </p>
      </header>

      <div className={styles.divider}></div>

      <div className={styles.sectionTitle}>Order Details</div>

      {/* ✅ PRODUCTS */}
      {order.items.map((item: any) => (
        <div key={item.id} className={styles.itemRow}>
          <img
            src={item.variant.product.images[0]}
            className={styles.productImg}
          />

          <div className={styles.itemInfo}>
            <span className={styles.itemName}>
              {item.variant.product.name}
            </span>
            <span className={styles.itemMeta}>
              {item.variant.color}, {item.variant.size} | Qty: {item.quantity}
            </span>
          </div>

          <div className={styles.price}>₹{item.subtotal}</div>
        </div>
      ))}

      {/* ✅ SUMMARY */}
      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>₹{order.subtotal}</span>
      </div>

      <div className={styles.summaryRow}>
        <span>Shipping</span>
        <span className={styles.shippingFree}>
          {order.shippingCharge === "0" ? "FREE" : `₹${order.shippingCharge}`}
        </span>
      </div>

      <div className={styles.totalRow}>
        <span>Total</span>
        <span>₹{order.finalAmount}</span>
      </div>

      {/* ✅ DELIVERY CARD */}
      <div className={styles.deliveryCard}>
        <div className={styles.deliveryGrid}>
          <div>
            <span className={styles.cardLabel}>DELIVERY ADDRESS</span>
            <p className={styles.cardContent}>
              {order.shippingAddress}
            </p>
          </div>

          <div>
            <span className={styles.cardLabel}>ESTIMATED DELIVERY</span>
            <p className={styles.cardContent}>
              <MdLocalShipping className={styles.deliveryIcon} />
              3–5 Business Days
            </p>
          </div>
        </div>

        <button className={styles.trackButton}>
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
        onClick={() => (window.location.href = "/")}
      >
        CONTINUE SHOPPING
      </button>
    </div>
  );
}