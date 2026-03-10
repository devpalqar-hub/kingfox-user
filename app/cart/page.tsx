'use client'
import React from 'react';
import { Minus, Plus, Trash2, ArrowRight, CreditCard, Wallet, Nfc } from 'lucide-react';
import styles from './cart.module.css';
import { useRouter } from "next/navigation";
const CartPage = () => {
  const cartItems = [1, 2, 3]; // Placeholder for your items
  const router = useRouter();
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>YOUR BAG</h1>
        <p>Review your selection. {cartItems.length} items currently in cart.</p>
      </header>

      <div className={styles.cartContent}>
        {/* Left Column: Items */}
        <div className={styles.itemsList}>
          {cartItems.map((item) => (
            <div key={item} className={styles.cartItem}>
              <div className={styles.imageWrapper}>
                <img src="/wishlist1.png" alt="Noir Oversized Tee" />
              </div>
              
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <div>
                    <h3>NOIR OVERSIZED TEE</h3>
                    <span>KING FOX ESSENTIALS</span>
                  </div>
                  <span className={styles.price}>$45.00</span>
                </div>

                <div className={styles.options}>
                  <div className={styles.optionGroup}>
                    <label>SIZE</label>
                    <div className={styles.badge}>L</div>
                  </div>
                  <div className={styles.optionGroup}>
                    <label>COLOR</label>
                    <div className={styles.colorBadge}>
                      <span className={styles.dot} /> Black
                    </div>
                  </div>
                </div>

                <div className={styles.itemFooter}>
                  <div className={styles.quantity}>
                    <button><Minus size={16} /></button>
                    <span>1</span>
                    <button><Plus size={16} /></button>
                  </div>
                  <button className={styles.removeBtn}><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Summary */}
       <aside className={styles.summary}>
            <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>
                
                <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span className={styles.summaryValue}>$87.00</span>
                </div>
                
                <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.summaryValue}>$5.00</span>
                </div>
                
                <div className={styles.summaryRow}>
                <span>Tax</span>
                <span className={styles.summaryValue}>$4.35</span>
                </div>

                <div className={styles.divider}></div>

                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>TOTAL</span>
                <span className={styles.totalValue}>$96.35</span>
                </div>

                <button 
                    className={styles.checkoutBtn}
                    onClick={() => router.push("/checkout")}
                    >
                    PROCEED TO CHECKOUT <ArrowRight size={20} strokeWidth={2.5} />
                </button>

                <div className={styles.securePayments}>
                <p>SECURE PAYMENTS</p>
                <div className={styles.paymentIcons}>
                    <CreditCard size={28} strokeWidth={1.5} />
                    <Wallet size={28} strokeWidth={1.5} />
                    <Nfc size={28} strokeWidth={1.5} />
                </div>
                </div>
            </div>
            </aside>
            </div>
               <div className={styles.mobileCheckout}>
                    <span className={styles.mobileTotal}>$96.35</span>

                    <button
                        className={styles.mobileCheckoutBtn}
                        onClick={() => router.push("/checkout")}
                        >
                        Checkout
            </button>
        </div>
    </div>
  );
};

export default CartPage;