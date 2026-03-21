'use client'
import React from 'react';
import { Minus, Plus, Trash2, ArrowRight, CreditCard, Wallet, Nfc } from 'lucide-react';
import styles from './cart.module.css';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getGuestCart,
  updateGuestCart,
  removeGuestCartItem,
} from "@/lib/cart";
import { getCartAPI, removeCartItemAPI, updateCartItemAPI } from "@/services/cart.service";
import { CartResponse, CartItem } from "@/types/cart";
import { useEffect, useState } from "react";

const CartPage = () => {
  const { token } = useAuth();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);
  const router = useRouter();

  const guestItemCount = guestCart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const guestTotal = guestCart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (token) {
          const data = await getCartAPI();
          setCartData(data);
        } else {
          setGuestCart(getGuestCart());
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadCart();
  }, [token]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>YOUR BAG</h1>
        <p>
          Review your selection.{" "}
          {token ? cartData?.totalItems || 0 : guestItemCount} items currently in cart.
        </p>
      </header>

      <div className={styles.cartContent}>
        {/* Left Column: Items */}
        <div className={styles.itemsList}>
          {token &&
            cartData?.items.map((item) => (
              <div key={item.cartItemId} className={styles.cartItem}>
                <div className={styles.imageWrapper}>
                  <img src={item.productImage || "/placeholder-product.png"} />
                </div>

                <div className={styles.itemDetails}>
                  <h3>{item.productName}</h3>
                  <p>₹{item.price}</p>
                  <p>{item.size} / {item.color}</p>

                  <div className={styles.quantity}>
                    <button
                      onClick={async () => {
                        if (item.quantity > 1) {
                          await updateCartItemAPI(item.variantId, item.quantity - 1);
                          const data = await getCartAPI();
                          setCartData(data);
                        }
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={async () => {
                        await updateCartItemAPI(item.variantId, item.quantity + 1);
                        const data = await getCartAPI();
                        setCartData(data);
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={async () => {
                      await removeCartItemAPI(item.variantId);
                      const data = await getCartAPI();
                      setCartData(data);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
          ))}
          {!token &&
            guestCart.map((item) => (
              <div key={item.variantId} className={styles.cartItem}>
                <div className={styles.imageWrapper}>
                  <img src={item.productImage || "/placeholder-product.png"} />
                </div>

                <div className={styles.itemDetails}>
                  <h3>{item.productName}</h3>
                  <p>₹{item.price}</p>
                  <p>{item.size} / {item.color}</p>

                  <div className={styles.quantity}>
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateGuestCart(item.variantId, item.quantity - 1);
                          setGuestCart(getGuestCart());
                        }
                      }}
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => {
                        updateGuestCart(item.variantId, item.quantity + 1);
                        setGuestCart(getGuestCart());
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => {
                      removeGuestCartItem(item.variantId);
                      setGuestCart(getGuestCart());
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
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
                <span className={styles.summaryValue}>
                  ₹{token ? cartData?.subtotal || 0 : guestTotal}
                </span>
                </div>
                
                <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.summaryValue}>$5.00</span>
                </div>
                
                <div className={styles.summaryRow}>
                <span>Tax</span>
                <span className={styles.summaryValue}>
                  ₹{token ? cartData?.gstAmount || 0 : 0}
                </span>
                </div>

                <div className={styles.divider}></div>

                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>TOTAL</span>
                <span className={styles.totalValue}>
                  ₹{token ? cartData?.finalAmount || 0 : guestTotal}
                </span>
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
                    <span className={styles.mobileTotal}>
                      ₹{token ? cartData?.finalAmount || 0 : guestTotal}
                    </span>

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