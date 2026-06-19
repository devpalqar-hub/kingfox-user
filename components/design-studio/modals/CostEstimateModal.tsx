"use client";

import { X } from 'lucide-react';
import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import styles from './CostEstimateModal.module.css';

interface CostEstimateModalProps {
  onClose: () => void;
  onProceed: () => void;
}

export default function CostEstimateModal({ onClose, onProceed }: CostEstimateModalProps) {
  const pricing = useDesignStore((state) => state.pricing);

  if (!pricing) return null;

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Estimated Cost</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.table}>
          <div className={styles.row}>
            <span className={styles.label}>Base Apparel Cost</span>
            <span className={styles.value}>{formatCurrency(pricing.baseCost)}</span>
          </div>

          <div className={styles.totalRow}>
            <span>Total Estimate</span>
            <span>{formatCurrency(pricing.totalEstimate)}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Keep Editing</button>
          <button className={styles.checkoutBtn} onClick={onProceed}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}
