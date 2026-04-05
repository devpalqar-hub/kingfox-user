"use client"; // Required for hooks

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkoutAPI } from "@/services/order.service";
import { getBranchesAPI } from "@/services/branch.service";
import { useAuth } from "@/context/AuthContext";
import React from 'react';
import { useToast } from "@/context/ToastContext";
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
import { MdCreditCard, MdAccountBalance } from "react-icons/md";

export default function CheckoutPage() {
const router = useRouter();
const [isPending, setIsPending] = useState(false);
const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
const [profile, setProfile] = useState<ProfileResponse | null>(null);
const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("RAZORPAY");
const [items, setItems] = useState<CartItem[]>([]);
const { showToast } = useToast();
const [branches, setBranches] = useState<any[]>([]);
const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
const [couponCode, setCouponCode] = useState("");


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
          couponCode: undefined,
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

useEffect(() => {
  if (paymentMethod === "COD") {
    const loadBranches = async () => {
      try {
        const res = await getBranchesAPI();
        setBranches(res.branches);
      } catch (err) {
        console.error(err);
      }
    };

    loadBranches();
  }
}, [paymentMethod]);

const updateGuestItem = (variantId: number, qty: number) => {
  const updated = items.map((i) =>
    i.variantId === variantId ? { ...i, quantity: qty } : i
  );

  setItems(updated);
  localStorage.setItem("guest_cart", JSON.stringify(updated));
};

const handlePlaceOrder = async () => {
  if (isPending) return;

  // 🔥 VALIDATION (VERY IMPORTANT)
  if (!form.firstName || !form.address || !form.phone) {
    showToast("Please fill all required fields", "error");
    return;
  }

  if (!/^\d{10}$/.test(form.phone)) {
    showToast("Enter valid 10-digit phone number", "error");
    return;
  }

  setIsPending(true);

  try {
    let response;

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const fullAddress = `${form.address}${
      form.pincode ? ` - ${form.pincode}` : ""
    }`;

    // 🔄 Loading feedback
    showToast("Placing your order...", "info", 1500);

    if (token) {
      response = await checkoutAPI({
        isCartPurchase: true,
        customerName: fullName,
        customerEmail: form.email,
        customerPhone: form.phone,
        paymentMethod,
        shippingAddress: fullAddress,
        couponCode: couponCode || undefined,
        ...(paymentMethod === "COD" && { pickupBranchId: selectedBranch }),
      });
    } else {
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
        couponCode: couponCode || undefined,
         ...(paymentMethod === "COD" && { pickupBranchId: selectedBranch }),
      });
    }

    console.log("Order Success:", response);
    // 🔥 RAZORPAY REDIRECT (ADD THIS)
    if (paymentMethod === "RAZORPAY") {
       const paymentUrl = response?.paymentLink?.url;

  if (response?.order?.id) {
  localStorage.setItem("lastOrderId", response.order.id.toString());

  // ✅ ADD THIS
  localStorage.setItem("lastOrderData", JSON.stringify(response.order));
}
  if (paymentUrl) {
    showToast("Redirecting to payment...", "info");
    window.location.href = paymentUrl;
    return;
  } else {
    showToast("Payment link not received", "error");
    return;
  }
}

      // ✅ ONLY FOR COD
    if (paymentMethod === "COD" && !selectedBranch) {
        showToast("Please select a pickup branch", "error");
        return;
      }
      {
      
      if (!token) {
        localStorage.removeItem("guest_cart");
      }

      showToast("Order placed successfully", "success", 2500);
      console.log("FULL RESPONSE:", response);

      setTimeout(() => {
        router.replace("/orderplaced");
      }, 1200);
    }

  } catch (err) {
    console.error(err);

    // ❌ ERROR TOAST
    showToast("Order failed. Please try again", "error", 3000);

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
            <input
              type="text"
              placeholder="ENTER CODE"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button
              className={styles.applyBtn}
              onClick={async () => {
                try {
                  const res = await previewOrderAPI({
                    isCartPurchase: token ? true : false,
                    couponCode: couponCode,
                    ...(token
                      ? {}
                      : {
                          customerEmail: "guest@test.com",
                          items: items.map((item) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                          })),
                        }),
                  });
                  setPreview(res);
                  showToast("Coupon applied", "success");
                } catch (err) {
                  showToast("Invalid coupon", "error");
                }
              }}
            >
              APPLY
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdOutlinePayment /> PAYMENT METHOD
          </h2>
          <div className={styles.paymentCard}>
            <input
                type="radio"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => setPaymentMethod("RAZORPAY")}
              />
            <div className={styles.paymentInfo}>
              <strong>RAZORPAY SECURE</strong>
              <p>CARDS, NETBANKING, WALLET, UPI</p>
            </div>
            <div className={styles.paymentIcons}>
              <MdCreditCard /> <MdAccountBalance />
            </div>
          </div>
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
          {paymentMethod === "COD" && (
            <div className={styles.inputGroup}>
              <label>SELECT PICKUP BRANCH</label>

              <select
                value={selectedBranch || ""}
                onChange={(e) => setSelectedBranch(Number(e.target.value))}
              >
                <option value="">Select Branch</option>

                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} - {b.address}
                  </option>
                ))}
              </select>
            </div>
          )}
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
          {(preview?.discount ?? 0) > 0 && (
            <div className={styles.summaryLine}>
              <span>DISCOUNT</span>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>
                -₹{preview?.discount || 0}
              </span>
            </div>
          )}

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