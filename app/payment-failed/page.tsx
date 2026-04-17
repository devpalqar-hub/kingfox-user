"use client";

import { useRouter } from "next/navigation";
import styles from "./failed.module.css";

export default function PaymentFailed() {
  const router = useRouter();

  const handleRetry = () => {
    // optional: clear last order if needed
    // localStorage.removeItem("lastOrderId");

    router.push("/checkout");
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      
      {/* ❌ Failed Icon */}
      <div className={styles.failIcon}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className={styles.title}>Payment Failed</h1>

      {/* Subtitle */}
      <p className={styles.subtitle}>
        Something went wrong while processing your payment.
      </p>

      {/* Actions */}
      <div className={styles.actions}>
        <button onClick={handleRetry}>
          TRY AGAIN
        </button>

        <button onClick={handleHome}>
          GO TO HOME
        </button>
      </div>

    </div>
  );
}