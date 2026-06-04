"use client";

import { X, Trash2 } from 'lucide-react';
import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import styles from './CostEstimateModal.module.css';

interface ClearConfirmModalProps {
  onClose: () => void;
}

export default function ClearConfirmModal({ onClose }: ClearConfirmModalProps) {
  const { clearView, clearAll, activeView } = useDesignStore();

  const handleClearView = () => {
    clearView(activeView);
    onClose();
  };

  const handleClearAll = () => {
    clearAll();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} style={{ color: '#ef4444' }}>Clear Design</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '20px', color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <p>Are you sure you want to clear your design? This action cannot be undone.</p>
        </div>

        <div className={styles.actions} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className={styles.checkoutBtn} 
            onClick={handleClearView}
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
          >
            Clear {activeView === 'front' ? 'Front' : 'Back'} Only
          </button>
          
          <button 
            className={styles.checkoutBtn} 
            onClick={handleClearAll}
            style={{ backgroundColor: '#ef4444', color: '#fff' }}
          >
            <Trash2 size={16} style={{ display: 'inline', marginRight: '8px' }}/>
            Clear Entire Project
          </button>

          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            style={{ marginTop: '10px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
