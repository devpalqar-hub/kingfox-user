"use client";

import styles from "./VoucherCard.module.css";
import { Award } from "lucide-react";

const VoucherCard = () => {
  return (
    <div className={styles.voucherCard}>
      
      {/* Left Yellow Strip */}
      <div className={styles.leftStrip}></div>

      {/* Content */}
      <div className={styles.voucherContent}>
        <p className={styles.smallLabel}>CREW REWARD</p>

        <h2 className={styles.discount}>20% OFF</h2>

        <p className={styles.desc}>VALID ON ALL ACCESSORIES</p>

        <p className={styles.expiry}>EXPIRES: DEC 31, 2024</p>
      </div>

      {/* Top Right Cut Shape */}
      <div className={styles.cornerCut}>
        <span className={styles.icon}><Award/></span>
      </div>

    </div>
  );
};

export default VoucherCard;