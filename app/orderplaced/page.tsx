"use client";

import styles from "./orderplaced.module.css";

export default function OrderPlaced() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        
        {/* ✅ Success Icon */}
        <div className={styles.icon}>✓</div>

        {/* ✅ Title */}
        <h1 className={styles.title}>Order Confirmed</h1>

        {/* ✅ Message */}
        <p className={styles.subtitle}>
          Your order is confirmed. You will receive an order confirmation
          email/SMS shortly with the expected delivery date for your items.
        </p>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* ✅ Buttons */}
        <div className={styles.actions}>
          <button onClick={() => (window.location.href = "/")}>
            Continue Shopping
          </button>

          <button
            className={styles.secondary}
            onClick={() => (window.location.href = "/profile")}
          >
            View Orders
          </button>
        </div>

      </div>
    </div>
  );
}