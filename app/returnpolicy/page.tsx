"use client";

import styles from "./returnpolicy.module.css";
import { useRouter } from "next/navigation";

export default function ReturnPolicy() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Return Policy</h1>

      <div className={styles.section}>
        <h3 className={styles.heading}>1. Returns</h3>
        <p className={styles.text}>
          You can return products within 7 days of delivery if they are unused
          and in original condition.
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>2. Refunds</h3>
        <p className={styles.text}>
          Refunds will be processed within 5-7 business days after the product
          is received.
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>3. Exchanges</h3>
        <p className={styles.text}>
          Exchanges are allowed only for size or defective products.
        </p>
      </div>

      <button
        className={styles.backBtn}
        onClick={() => router.push("/")}
      >
        Back to Home
      </button>
    </div>
  );
}