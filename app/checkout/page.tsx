"use client"; // Required for hooks

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkoutAPI } from "@/services/order.service";
import { useAuth } from "@/context/AuthContext";
import React from 'react';
import styles from './checkout.module.css';
import { 
  MdLocalShipping, 
  MdOutlinePayment, 
  MdLocationOn, 
  MdPayments, 
  MdLock 
} from 'react-icons/md';
import { OrderPreviewResponse } from '@/types/order';
import { CartItem } from '@/types/cart';
import { ProfileResponse } from '@/types/profile';
import { getProfileAPI } from '@/services/profile.service';
import { getCartAPI, updateCartItemAPI} from "@/services/cart.service";
import { previewOrderAPI } from "@/services/order.service";

export default function CheckoutPage() {
const router = useRouter();
const [isPending, setIsPending] = useState(false);
const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
const [profile, setProfile] = useState<ProfileResponse | null>(null);
const [paymentMethod, setPaymentMethod] = useState<"COD">("COD");
const [items, setItems] = useState<CartItem[]>([]);

const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  pincode: "",
});
const { token } = useAuth();


useEffect(() => {
  const loadCart = async () => {
    try {
      if (token) {
        // 🔥 LOGGED USER CART
        const data = await getCartAPI();
        setItems(data.items);
      } else {
        // 👤 GUEST CART
        const guest = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        setItems(guest);
      }
    } catch (err) {
      console.error(err);
    }
  };

  loadCart();
}, [token]);

useEffect(() => {
  const loadPreview = async () => {
    try {
      if (token) {
        // 🔥 Logged user → use cart
        const res = await previewOrderAPI({
          isCartPurchase: true,
        });
        setPreview(res);
      } else {
        // 👤 Guest → send items
        const guest = JSON.parse(localStorage.getItem("guest_cart") || "[]");

        const res = await previewOrderAPI({
          isCartPurchase: false,
          customerEmail: "guest@test.com",
          items: guest.map((item: CartItem) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        });

        setPreview(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  loadPreview();
}, [items, token]);

useEffect(() => {
  const loadProfile = async () => {
    if (!token) return;

    try {
      const data = await getProfileAPI();
      setProfile(data);

      const [first, ...rest] = data.name.split(" ");

      setForm((prev) => ({
        ...prev,
        firstName: first || "",
        lastName: rest.join(" ") || "",
        email: data.email,
        phone: data.phone,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  loadProfile();
}, [token]);

const updateGuestItem = (variantId: number, qty: number) => {
  const updated = items.map((i) =>
    i.variantId === variantId ? { ...i, quantity: qty } : i
  );

  setItems(updated);
  localStorage.setItem("guest_cart", JSON.stringify(updated));
};

const handlePlaceOrder = async () => {
  setIsPending(true);

  try {
    let response;

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    const fullAddress = `${form.address}${
      form.pincode ? ` - ${form.pincode}` : ""
    }`;

    if (token) {
      // 🔥 LOGGED USER
      response = await checkoutAPI({
        isCartPurchase: true,
        customerName: fullName,
        customerEmail: form.email,
        customerPhone: form.phone,
        paymentMethod,
        shippingAddress: fullAddress,
      });
    } else {
      // 👤 GUEST USER
      const guestCart: CartItem[] = JSON.parse(
        localStorage.getItem("guest_cart") || "[]"
      );

      response = await checkoutAPI({
        isCartPurchase: false,
        items: guestCart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        customerName: fullName,
        customerEmail: form.email,
        customerPhone: form.phone,
        paymentMethod,
        shippingAddress: fullAddress,
      });
    }

    console.log("Order Success:", response);

    if (!token) {
      localStorage.removeItem("guest_cart");
    }

    router.push("/profile");
  } catch (err) {
    console.error(err);
    alert("Order failed");
  } finally {
    setIsPending(false);
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Shipping Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdLocalShipping /> SHIPPING DETAILS
          </h2>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>FIRST NAME</label>
              <input
                type="text"
                value={form.firstName}
                disabled={!!profile}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <label>LAST NAME</label>
              <input
                type="text"
                value={form.lastName}
                disabled={!!profile}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>EMAIL ADDRESS</label>
           <input
            type="email"
            placeholder="ALEX@KINGFOX.COM"
            value={form.email}
            disabled={!!profile}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
          </div>
          <div className={styles.inputGroup}>
            <label>SHIPPING ADDRESS</label>
            <input
              type="text"
              placeholder="STREET NAME, HOUSE/APARTMENT NO."
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>PIN CODE</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  placeholder='560001'
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                />
                <span className={styles.locationTag}><MdLocationOn /> BENGALURU, KA</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>PHONE NUMBER</label>
              <div className={styles.phoneInput}>
                <span className={styles.countryCode}>+91</span>
                <input
                  type="text"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Coupon Section */}
        <div className={styles.couponSection}>
          <p>HAVE A COUPON? <span>▾</span></p>
          <div className={styles.couponRow}>
            <input type="text" placeholder="ENTER CODE" />
            <button className={styles.applyBtn}>APPLY</button>
          </div>
        </div>

        {/* Payment Method */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdOutlinePayment /> PAYMENT METHOD
          </h2>
          {/* <div className={styles.paymentCard}>
            <input type="radio" />
            <div className={styles.paymentInfo}>
              <strong>RAZORPAY SECURE</strong>
              <p>CARDS, NETBANKING, WALLET, UPI</p>
            </div>
            <div className={styles.paymentIcons}>
              <MdCreditCard /> <MdAccountBalance />
            </div>
          </div> */}
          <div
            className={styles.paymentCardActive}
            onClick={() => setPaymentMethod("COD")}
          >
            <input type="radio" checked={paymentMethod === "COD" } onChange={() => setPaymentMethod("COD")}/>
            <div className={styles.paymentInfo}>
              <strong>CASH ON DELIVERY (COD)</strong>
              <p>PAY WHEN YOUR ORDER ARRIVES</p>
            </div>
            <MdPayments />
          </div>
        </section>
      </div>

      {/* Sidebar Order Summary */}
      <aside className={styles.sidebar}>
        <div className={styles.summaryCard}>
          <h3>ORDER SUMMARY</h3>
          {items.map((item) => (
            <div key={item.variantId} className={styles.productRow}>
              <div className={styles.productImg}>
                <img
                  src={item.productImage || "/placeholder-product.png"}
                  alt={item.productName}
                />
              </div>

              <div className={styles.productDetails}>
                <h4>{item.productName}</h4>
                <p>
                  SIZE: {item.size} | COLOR: {item.color}
                </p>

                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{item.price}</span>

                  <div className={styles.quantity}>
                    <button
                      onClick={async () => {
                        if (item.quantity > 1) {
                          if (token) {
                            await updateCartItemAPI(item.variantId, item.quantity - 1);
                            const data = await getCartAPI();
                            setItems(data.items);
                          } else {
                            updateGuestItem(item.variantId, item.quantity - 1);
                          }
                        }
                      }}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={async () => {
                        if (token) {
                          await updateCartItemAPI(item.variantId, item.quantity + 1);
                          const data = await getCartAPI();
                          setItems(data.items);
                        } else {
                          updateGuestItem(item.variantId, item.quantity + 1);
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <hr className={styles.summaryDivider} />
          
          <div className={styles.summaryLine}>
            <span>SUBTOTAL</span>
            <span>₹{preview?.subtotal || 0}</span>
          </div>

          <div className={styles.summaryLine}>
            <span>SHIPPING</span>
            {preview?.shippingCharge === 0 ? (
              <span className={styles.freeBadge}>FREE SHIPPING</span>
            ) : (
              <span>₹{preview?.shippingCharge}</span>
            )}
          </div>

          <div className={styles.totalLine}>
            <span>TOTAL</span>
            <span>₹{preview?.finalAmount || 0}</span>
          </div>

          <button 
                className={styles.placeOrderBtn} 
                onClick={handlePlaceOrder}
                disabled={isPending}
                >
                <MdLock /> 
                {isPending ? "PROCESSING..." : "PLACE SECURE ORDER"}
          </button>
          
          <div className={styles.secureFooter}>
             <p><MdLock size={12}/> SECURE PAYMENT ENCRYPTED</p>
             <div className={styles.trustIcons}>
               <span>Razorpay</span> <span>VISA</span> <span>MasterCard</span>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}