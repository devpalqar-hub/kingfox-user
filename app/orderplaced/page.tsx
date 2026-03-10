import React from 'react';
import styles from './orderplaced.module.css';
import { MdLocalShipping } from "react-icons/md";
export default function OrderPlaced() {
  return (
    <div className={styles.container}>
      {/* Success Check Icon */}
      <div className={styles.successIcon}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <header className={styles.header}>
        <h1>Thank you for your order, Fox!</h1>
        <p className={styles.orderNumber}>Order #KF-98765</p>
      </header>
     <div className={styles.divider}></div>
      <div className={styles.sectionTitle}>Order Details</div>

      {/* Product Item */}
      <div className={styles.itemRow}>
        <img 
          src="/wishlist1.png" // Replace with your actual image path
          alt="Urban Oversized Tee" 
          className={styles.productImg} 
        />
        <div className={styles.itemInfo}>
          <span className={styles.itemName}>Urban Oversized Tee</span>
          <span className={styles.itemMeta}>Black, XL | Qty: 1</span>
        </div>
        <div className={styles.price}>₹1,499</div>
      </div>

      {/* Pricing Breakdown */}
      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>₹1,499</span>
      </div>
      <div className={styles.summaryRow}>
        <span>Shipping</span>
        <span className={styles.shippingFree}>FREE</span>
      </div>

      <div className={styles.totalRow}>
        <span>Total</span>
        <span>₹1,499</span>
      </div>

      {/* Delivery Info Card */}
      <div className={styles.deliveryCard}>

    <div className={styles.deliveryGrid}>
      <div>
        <span className={styles.cardLabel}>DELIVERY ADDRESS</span>
        <p className={styles.cardContent}>
          123 Streetwear Ave,<br/>
          Koramangala, 4th Block,<br/>
          Bengaluru, KA 560034
        </p>
      </div>

      <div>
        <span className={styles.cardLabel}>ESTIMATED DELIVERY</span>
        <p className={styles.cardContent}>
            <MdLocalShipping className={styles.deliveryIcon} />
            Friday, Oct 20th
        </p>
       </div>
    </div>

    <button className={styles.trackButton}>
        <MdLocalShipping className={styles.trackIcon} />
        TRACK ORDER
    </button>

  </div>

      {/* Footer Links */}
      <div className={styles.footerLinks}>
    <span>NEED HELP?</span>
    <span>RETURN POLICY</span>
  </div>

  <button className={styles.continueBtn}>
    CONTINUE SHOPPING
  </button>
    </div>
  );
}