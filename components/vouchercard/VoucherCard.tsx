"use client";

import styles from "./VoucherCard.module.css";
import { Award, Copy } from "lucide-react";

interface VoucherCardProps {
  code: string;
  title: string;
  validTill: string;
}

const VoucherCard = ({ code, title, validTill }: VoucherCardProps) => {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className={styles.voucherCard}>
      
      {/* Left Strip */}
      <div className={styles.leftStrip}></div>

      {/* Content */}
      <div className={styles.voucherContent}>
        <p className={styles.smallLabel}>VOUCHER</p>

        {/* Title (campaign name) */}
        <h2 className={styles.discount}>{title}</h2>

        {/* Code */}
        {/* <div className={styles.codeRow}>
          <span className={styles.code}>{code}</span>
          <button onClick={handleCopy} className={styles.copyBtn}>
            <Copy size={14} />
          </button>
        </div> */}

        {/* Expiry */}
        <p className={styles.expiry}>VALID TILL: {validTill}</p>
      </div>

      {/* Corner */}
      <div className={styles.cornerCut}>
        <span className={styles.icon}><Award /></span>
      </div>
    </div>
  );
};

export default VoucherCard;