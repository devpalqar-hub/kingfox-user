"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdAccountBalance,
  MdCreditCard,
  MdLocalShipping,
  MdLock,
  MdOutlinePayment,
  MdPayments,
} from "react-icons/md";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getBranchesAPI } from "@/services/branch.service";
import { getCartAPI, updateCartItemAPI } from "@/services/cart.service";
import { checkoutAPI, previewOrderAPI } from "@/services/order.service";
import { getProfileAPI } from "@/services/profile.service";
import { clearGuestCart, getGuestCart, updateGuestCart } from "@/lib/cart";
import { CartItem } from "@/types/cart";
import { OrderPreviewResponse } from "@/types/order";
import { ProfileResponse } from "@/types/profile";

import styles from "./checkout.module.css";

type Branch = {
  id: number;
  name: string;
  address: string;
};

const GUEST_PREVIEW_EMAIL = "guest@example.com";
const GUEST_PREVIEW_PHONE = "9999999999";

const buildGuestPreviewPayload = ({
  items,
  email,
  phone,
  paymentMethod,
  couponCode,
}: {
  items: CartItem[];
  email: string;
  phone: string;
  paymentMethod: "COD" | "RAZORPAY";
  couponCode?: string;
}) => ({
  isCartPurchase: false as const,
  customerEmail: email || GUEST_PREVIEW_EMAIL,
  customerPhone: phone.length === 10 ? phone : GUEST_PREVIEW_PHONE,
  items: items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  })),
  couponCode: couponCode || undefined,
  isCOD: paymentMethod === "COD",
});

export default function CheckoutPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">(
    "RAZORPAY",
  );
  const [items, setItems] = useState<CartItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>();
  const [couponCode, setCouponCode] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const normalizedPhone = form.phone.replace(/\D/g, "");
  const trimmedEmail = form.email.trim();

  const getImageSrc = (image?: string) => {
    if (!image) return "/placeholder-product.png";
    if (image.includes("via.placeholder.com"))
      return "/placeholder-product.png";
    if (image.startsWith("http")) return image;
    return `${baseUrl}${image}`;
  };

  const localSubtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      ),
    [items],
  );

  const summarySubtotal = preview?.subtotal ?? localSubtotal;
  const summaryShipping = preview?.shippingCharge ?? 0;
  const summaryTotal = preview?.finalAmount ?? localSubtotal;

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (token) {
          const data = await getCartAPI();
          setItems(data.items);
          return;
        }

        setItems(getGuestCart());
      } catch (error) {
        console.error(error);
      }
    };

    loadCart();
  }, [token]);

  useEffect(() => {
    const loadPreview = async () => {
      if (items.length === 0) {
        setPreview(null);
        return;
      }

      try {
        if (token) {
          const res = await previewOrderAPI({
            isCartPurchase: true,
            couponCode: undefined,
            isCOD: paymentMethod === "COD",
          });

          setPreview(res);
          return;
        }

        const res = await previewOrderAPI(
          buildGuestPreviewPayload({
            items,
            email: GUEST_PREVIEW_EMAIL,
            phone: GUEST_PREVIEW_PHONE,
            paymentMethod,
          }),
          {
            headers: {
              "Skip-Auth-Error": true,
            },
          },
        );

        setPreview(res);
      } catch (error) {
        console.error(error);
        setPreview(null);
      }
    };

    loadPreview();
  }, [items, paymentMethod, token]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }

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
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [token]);

  useEffect(() => {
    if (paymentMethod !== "COD") {
      setSelectedBranch(undefined);
      return;
    }

    const loadBranches = async () => {
      try {
        const res = await getBranchesAPI();
        setBranches(res.branches);
      } catch (error) {
        console.error(error);
      }
    };

    loadBranches();
  }, [paymentMethod]);

  const handleQuantityChange = async (
    variantId: number,
    nextQuantity: number,
    availableStock?: number,
  ) => {
    if (nextQuantity < 1) {
      return;
    }

    if (availableStock !== undefined && nextQuantity > availableStock) {
      showToast(`Only ${availableStock} item(s) available`, "error");
      return;
    }

    try {
      if (token) {
        await updateCartItemAPI(variantId, nextQuantity);
        const data = await getCartAPI();
        setItems(data.items);
      } else {
        updateGuestCart(variantId, nextQuantity);
        setItems(getGuestCart());
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error(error);
      showToast("Unable to update cart", "error");
    }
  };

  const handleApplyCoupon = async () => {
    if (items.length === 0) return;

    try {
      const res = token
        ? await previewOrderAPI({
            isCartPurchase: true,
            couponCode: couponCode || undefined,
            isCOD: paymentMethod === "COD",
          })
        : await previewOrderAPI(
            buildGuestPreviewPayload({
              items,
              email: trimmedEmail,
              phone: normalizedPhone,
              paymentMethod,
              couponCode,
            }),
            {
              headers: {
                "Skip-Auth-Error": true,
              },
            },
          );

      setPreview(res);
      showToast("Coupon applied", "success");
    } catch (error) {
      console.error(error);
      showToast("Invalid coupon", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (isPending) return;

    if (!form.firstName.trim() || !form.address.trim() || !normalizedPhone) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (!token && !trimmedEmail) {
      showToast("Please enter your email address", "error");
      return;
    }

    if (normalizedPhone.length !== 10) {
      showToast("Enter valid 10-digit phone number", "error");
      return;
    }

    if (paymentMethod === "COD" && !selectedBranch) {
      showToast("Please select a pickup branch", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    setIsPending(true);

    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const fullAddress = `${form.address}${
        form.pincode ? ` - ${form.pincode}` : ""
      }`;

      showToast("Placing your order...", "info", 1500);

      const response = token
        ? await checkoutAPI({
            isCartPurchase: true,
            customerName: fullName,
            customerEmail: form.email,
            customerPhone: normalizedPhone,
            paymentMethod,
            shippingAddress: fullAddress,
            couponCode: couponCode || undefined,
            ...(paymentMethod === "COD" && { pickupBranchId: selectedBranch }),
          })
        : await checkoutAPI(
            {
              isCartPurchase: false,
              items: items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
              })),
              customerName: fullName,
              customerEmail: trimmedEmail,
              customerPhone: normalizedPhone,
              paymentMethod,
              shippingAddress: fullAddress,
              couponCode: couponCode || undefined,
              ...(paymentMethod === "COD" && {
                pickupBranchId: selectedBranch,
              }),
            },
            {
              headers: {
                "Skip-Auth-Error": true,
              },
            },
          );

      if (response?.order?.id) {
        localStorage.setItem("lastOrderId", response.order.id.toString());
        localStorage.setItem("lastOrderData", JSON.stringify(response.order));
        localStorage.setItem("lastCheckoutItems", JSON.stringify(items));
      }

      if (paymentMethod === "RAZORPAY") {
        const paymentUrl = response?.paymentLink?.url;

        if (!paymentUrl) {
          showToast("Payment link not received", "error");
          return;
        }

        showToast("Redirecting to payment...", "info");
        window.location.href = paymentUrl;
        return;
      }

      if (!token) {
        clearGuestCart();
        setItems([]);
      }

      window.dispatchEvent(new Event("cartUpdated"));
      showToast("Order placed successfully", "success", 2500);

      setTimeout(() => {
        router.replace(`/orderplaced?orderId=${response.order.id}`);
      }, 1200);
    } catch (error) {
      console.error(error);
      showToast("Order failed. Please try again", "error", 3000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
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
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
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
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>SHIPPING ADDRESS</label>
            <input
              type="text"
              placeholder="STREET NAME, HOUSE/APARTMENT NO."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>PIN CODE</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  placeholder="560001"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>PHONE NUMBER</label>
              <div className={styles.phoneInput}>
                {/* <span className={styles.countryCode}>+91</span> */}
                <input
                  type="text"
                  placeholder="98765 43210"
                  value={form.phone}
                  disabled={!!profile}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.couponSection}>
          <p>
            HAVE A COUPON? <span>▾</span>
          </p>
          <div className={styles.couponRow}>
            <input
              type="text"
              placeholder="ENTER CODE"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button className={styles.applyBtn} onClick={handleApplyCoupon}>
              APPLY
            </button>
          </div>
        </div>

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
            <input
              type="radio"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            <div className={styles.paymentInfo}>
              <strong>STORE PICKUP (PAY AT STORE)</strong>
              <p>SELECT A BRANCH AND PAY WHEN YOU PICK UP</p>
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
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.address}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.summaryCard}>
          <h3>ORDER SUMMARY</h3>
          {items.map((item) => (
            <div key={item.variantId} className={styles.productRow}>
              <div className={styles.productImg}>
                <img
                  src={getImageSrc(item.productImage)}
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
                      onClick={() =>
                        handleQuantityChange(
                          item.variantId,
                          item.quantity - 1,
                          item.availableStock,
                        )
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.variantId,
                          item.quantity + 1,
                          item.availableStock,
                        )
                      }
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
            <span>₹{summarySubtotal}</span>
          </div>

          {paymentMethod !== "COD" && (
            <div className={styles.summaryLine}>
              <span>SHIPPING</span>
              {summaryShipping === 0 ? (
                <span className={styles.freeBadge}>FREE SHIPPING</span>
              ) : (
                <span>₹{summaryShipping}</span>
              )}
            </div>
          )}

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
            <span>₹{summaryTotal}</span>
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
            <p>
              <MdLock size={12} /> SECURE PAYMENT ENCRYPTED
            </p>
            <div className={styles.trustIcons}>
              <span>Razorpay</span> <span>VISA</span> <span>MasterCard</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
