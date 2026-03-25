'use client';
import styles from "./toast.module.css";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { Toast } from "@/context/ToastContext";

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          
          {/* ICON */}
          <div className={styles.iconBox}>
            {toast.type === "success" && <CheckCircle size={18} />}
            {toast.type === "error" && <XCircle size={18} />}
            {toast.type === "info" && <Info size={18} />}
          </div>

          {/* MESSAGE */}
          <p className={styles.message}>{toast.message}</p>

          {/* PROGRESS BAR */}
          <div
            className={styles.progress}
            style={{
              animationDuration: `${toast.duration}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}