"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ removed useSearchParams
import { MdLocalShipping } from "react-icons/md";
import { PiPhoneFill } from "react-icons/pi";

import { useAuth } from "@/context/AuthContext";
import { getOrderDetailsAPI } from "@/services/order-details.service";
import { OrderDetailsResponse } from "@/types/order-details";

import styles from "./orderplaced.module.css";

type StoredCheckoutItem = {
  variantId?: number;
  productName?: string;
  productImage?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number | string;
};

type FallbackOrderItem = {
  id?: number;
  variantId?: number;
  quantity: number;
  price: number | string;
  variant?: {
    size?: string;
    color?: string;
    image?: string;
    product?: {
      name?: string;
    };
  };
};

type FallbackOrder = {
  id?: number;
  orderNumber?: string;
  subtotal?: number | string;
  shippingCharge?: number | string;
  finalAmount?: number | string;
  shippingAddress?: string | null;
  fulfillmentType?: string;
  pickupBranch?: {
    id?: number;
    name?: string;
    phone?: string;
    address?: string;
  } | null;
  items: FallbackOrderItem[];
};

const formatCurrency = (value?: number | string | null) => {
  if (value === undefined || value === null || value === "") return "₹0";
  return `₹${value}`;
};

const buildStoredOrder = (orderId?: string | null): FallbackOrder | null => {
  if (typeof window === "undefined") return null;

  const rawOrder = localStorage.getItem("lastOrderData");
  const rawItems = localStorage.getItem("lastCheckoutItems");

  if (!rawOrder) return null;

  try {
    const parsedOrder = JSON.parse(rawOrder) as FallbackOrder;
    const parsedItems = rawItems
      ? (JSON.parse(rawItems) as StoredCheckoutItem[])
      : [];

    if (
      orderId &&
      parsedOrder.id !== undefined &&
      String(parsedOrder.id) !== orderId
    ) {
      return null;
    }

    const items = (parsedOrder.items || []).map((item, index) => {
      const storedItem =
        parsedItems.find((entry) => entry.variantId === item.variantId) ||
        parsedItems[index];

      return {
        ...item,
        variant: {
          size: item.variant?.size || storedItem?.size,
          color: item.variant?.color || storedItem?.color,
          image: item.variant?.image || storedItem?.productImage,
          product: {
            name: item.variant?.product?.name || storedItem?.productName,
          },
        },
      };
    });

    return {
      ...parsedOrder,
      items,
      fulfillmentType:
        parsedOrder.fulfillmentType ||
        (parsedOrder.pickupBranch ? "PICKUP" : "DELIVERY"),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default function OrderConfirmation({
  orderId, // ✅ comes from props now
}: {
  orderId?: string;
}) {
  const router = useRouter();
  const { token } = useAuth();

  const [order, setOrder] = useState<
    OrderDetailsResponse | FallbackOrder | null
  >(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const storedOrder = buildStoredOrder(orderId || null);

      if (!orderId) {
        setOrder(storedOrder);
        return;
      }

      if (!token) {
        setOrder(storedOrder);
        return;
      }

      try {
        const res = await getOrderDetailsAPI(orderId, {
          headers: {
            "Skip-Auth-Error": true,
          },
        });
        setOrder(res);
        localStorage.setItem("lastOrderData", JSON.stringify(res));
      } catch (error) {
        console.error(error);
        setOrder(storedOrder);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  if (!order) {
    return <p>Loading your order...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.successIcon}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <header className={styles.header}>
        <h1>Thank you for your order, Fox!</h1>
        <p className={styles.orderNumber}>
          Order #{order.orderNumber || orderId}
        </p>
      </header>

      <div className={styles.divider}></div>

      <div className={styles.sectionTitle}>ORDER DETAILS</div>

      {order.items.map((item, index) => (
        <div key={item.id || index} className={styles.itemRow}>
          <img
            src={item.variant?.image || "/placeholder-product.png"}
            alt={item.variant?.product?.name || "Ordered item"}
            className={styles.productImg}
          />

          <div className={styles.itemInfo}>
            <span className={styles.itemName}>
              {item.variant?.product?.name || `Item ${index + 1}`}
            </span>

            <span className={styles.itemMeta}>
              {item.variant?.color || "-"}, {item.variant?.size || "-"} | Qty:{" "}
              {item.quantity}
            </span>
          </div>

          <div className={styles.price}>{formatCurrency(item.price)}</div>
        </div>
      ))}

      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>{formatCurrency(order.subtotal)}</span>
      </div>

      {order.fulfillmentType !== "PICKUP" && (
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span className={styles.shippingFree}>
            {Number(order.shippingCharge || 0) === 0
              ? "FREE"
              : formatCurrency(order.shippingCharge)}
          </span>
        </div>
      )}

      <div className={styles.totalRow}>
        <span>Total</span>
        <span>{formatCurrency(order.finalAmount)}</span>
      </div>

      <div className={styles.deliveryCard}>
        <div className={styles.deliveryGrid}>
          {order.fulfillmentType === "DELIVERY" ? (
            <>
              <div>
                <span className={styles.cardLabel}>DELIVERY ADDRESS</span>
                <p className={styles.cardContent}>
                  {order.shippingAddress || "Address will be shared soon."}
                </p>
              </div>

              <div>
                <span className={styles.cardLabel}>ESTIMATED DELIVERY</span>
                <p className={styles.cardContent}>
                  <MdLocalShipping className={styles.deliveryIcon} />
                  3 - 5 Business Days
                </p>
              </div>
            </>
          ) : (
            <div>
              <span className={styles.cardLabel}>PICKUP LOCATION</span>

              <div className={styles.branchDetails}>
                <p className={styles.branchName}>
                  {order.pickupBranch?.name ||
                    "Selected store pickup branch"}
                </p>

                <p className={styles.branchAddress}>
                  {order.pickupBranch?.address ||
                    "Branch details will be shared soon."}
                </p>

                {order.pickupBranch?.phone && (
                  <p className={styles.branchPhone}>
                    <PiPhoneFill /> {order.pickupBranch.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className={styles.trackButton}
          onClick={() => router.push(token ? "/profile" : "/")}
        >
          <MdLocalShipping className={styles.trackIcon} />
          {token ? "TRACK ORDER" : "CONTINUE SHOPPING"}
        </button>
      </div>

      <div className={styles.footerLinks}>
        <Link href="/contact" className={styles.link}>
          NEED HELP?
        </Link>

        <Link href="/returnpolicy" className={styles.link}>
          RETURN POLICY
        </Link>
      </div>

      <button
        className={styles.continueBtn}
        onClick={() => router.push("/")}
      >
        CONTINUE SHOPPING
      </button>
    </div>
  );
}