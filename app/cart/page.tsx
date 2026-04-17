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
import { useToast } from "@/context/ToastContext";
import { getCartAPI, removeCartItemAPI, updateCartItemAPI } from "@/services/cart.service";
import { CartResponse, CartItem } from "@/types/cart";
import { useEffect, useState } from "react";
import { OrderPreviewResponse } from '@/types/order';
import { previewOrderAPI } from '@/services/order.service';
import LoginModal from "@/app/auth/login/page";

const CartPage = () => {
  const { token } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);
  const router = useRouter();
  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const { showToast } = useToast();

  const getImageSrc = (image?: string) => {
    if (!image) return "/placeholder-product.png";
    if (image.includes("via.placeholder.com")) return "/placeholder-product.png";
    if (image.startsWith("http")) return image;
    return `${BASE_URL}${image}`;
  };

  const guestItemCount = guestCart.reduce((acc, item) => acc + item.quantity, 0);

  const isCartEmpty = token
    ? !cartData || cartData.items.length === 0
    : guestCart.length === 0;

  const loadPreview = async (guest?: CartItem[]) => {
    try {
      if (token) {
        const res = await previewOrderAPI({ isCartPurchase: true });
        setPreview(res);
      } else if (guest && guest.length > 0) {
        const res = await previewOrderAPI({
          customerEmail: "guest@test.com",
          isCartPurchase: false,
          items: guest.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        });
        setPreview(res);
      } else {
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (token) {
          const cart = await getCartAPI();
          setCartData(cart);
          await loadPreview();
        } else {
          const guest = getGuestCart();
          setGuestCart(guest);
          await loadPreview(guest);
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

          {/* Logged-in cart items */}
          {token && cartData?.items.map((item) => (
            <div key={item.cartItemId} className={styles.cartItem}>
              <div className={styles.imageWrapper}>
                <img
                  src={getImageSrc(item.productImage)}
                  onError={(e) => { e.currentTarget.src = "/placeholder-product.png"; }}
                  alt={item.productName}
                />
              </div>

              <div className={styles.itemDetails}>
                <h3>{item.productName}</h3>
                <p>₹{item.price}</p>
                <p>{item.size} / {item.color}</p>

                <div className={styles.quantity}>
                  <button
                    disabled={item.quantity <= 1}
                    onClick={async () => {
                      if (item.quantity > 1) {
                        await updateCartItemAPI(item.variantId, item.quantity - 1);
                        window.dispatchEvent(new Event("cartUpdated"));
                        const data = await getCartAPI();
                        setCartData(data);
                        await loadPreview();
                      }
                    }}
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    disabled={item.quantity >= item.availableStock}
                    onClick={async () => {
                      if (item.quantity >= item.availableStock) {
                        showToast(`Only ${item.availableStock} item(s) available`, "error");
                        return;
                      }
                      await updateCartItemAPI(item.variantId, item.quantity + 1);
                      window.dispatchEvent(new Event("cartUpdated"));
                      const data = await getCartAPI();
                      setCartData(data);
                      await loadPreview();
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={async () => {
                    await removeCartItemAPI(item.variantId);
                    showToast("Item removed from cart", "info");
                    window.dispatchEvent(new Event("cartUpdated"));
                    const data = await getCartAPI();
                    setCartData(data);
                    await loadPreview();
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Guest cart items */}
          {!token && guestCart.map((item) => (
            <div key={item.variantId} className={styles.cartItem}>
              <div className={styles.imageWrapper}>
                <img
                  src={getImageSrc(item.productImage)}
                  onError={(e) => { e.currentTarget.src = "/placeholder-product.png"; }}
                  alt={item.productName}
                />
              </div>

              <div className={styles.itemDetails}>
                <h3>{item.productName}</h3>
                <p>₹{item.price}</p>
                <p>{item.size} / {item.color}</p>

                <div className={styles.quantity}>
                  <button
                    disabled={item.quantity <= 1}
                    onClick={async () => {
                      if (item.quantity > 1) {
                        updateGuestCart(item.variantId, item.quantity - 1);
                        window.dispatchEvent(new Event("cartUpdated"));
                        const updated = getGuestCart();
                        setGuestCart(updated);
                        await loadPreview(updated);
                      }
                    }}
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={async () => {
                      updateGuestCart(item.variantId, item.quantity + 1);
                      window.dispatchEvent(new Event("cartUpdated"));
                      const updated = getGuestCart();
                      setGuestCart(updated);
                      await loadPreview(updated);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={async () => {
                    removeGuestCartItem(item.variantId);
                    showToast("Item removed from cart", "info");
                    window.dispatchEvent(new Event("cartUpdated"));
                    const updated = getGuestCart();
                    setGuestCart(updated);
                    await loadPreview(updated);
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
              <span className={styles.summaryValue}>₹{preview?.subtotal || 0}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.summaryValue}>₹{preview?.shippingCharge || 0}</span>
            </div>

            <div className={styles.divider}></div>

            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>TOTAL</span>
              <span className={styles.totalValue}>₹{preview?.finalAmount || 0}</span>
            </div>

            <button
              className={`${styles.checkoutBtn} ${isCartEmpty ? styles.disabledBtn : ""}`}
              disabled={isCartEmpty}
              onClick={() => {
                if (isCartEmpty) return;
                if (!token) {
                  setShowLoginModal(true);
                  showToast("Please login to proceed to checkout", "info");
                  return;
                }
                localStorage.setItem("checkout_preview", JSON.stringify(preview));
                router.push("/checkout");
              }}
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

      {/* Mobile Checkout Bar */}
      <div className={styles.mobileCheckout}>
        <span className={styles.mobileTotal}>₹{preview?.finalAmount || 0}</span>

        <button
          className={`${styles.mobileCheckoutBtn} ${isCartEmpty ? styles.disabledBtn : ""}`}
          disabled={isCartEmpty}
          onClick={() => {
            if (isCartEmpty) return;
            if (!token) {
              setShowLoginModal(true);
              showToast("Please login to proceed to checkout", "info");
              return;
            }
            localStorage.setItem("checkout_preview", JSON.stringify(preview));
            router.push("/checkout");
          }}
        >
          Checkout
        </button>
      </div>

      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default CartPage;