"use client";

import { useEffect, useState } from "react";
import styles from "./orderplaced.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { MdLocalShipping } from "react-icons/md";
import Link from "next/link";
import { getOrderDetailsAPI } from "@/services/order-details.service";
export default function OrderConfirmation() {

  const router = useRouter();
  const params = useSearchParams();
  const orderId =
  params.get("orderId") || params.get("orderid");

  const [order, setOrder] = useState<any>(null);
useEffect(() => {
  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const res = await getOrderDetailsAPI(orderId);

      console.log("API ORDER 👉", res);

      setOrder(res); // ✅ FIXED
    } catch (err) {
      console.error(err);
      setOrder(null);
    }
  };

  fetchOrder();
}, [orderId]);

if (!order) {
  return <p>Loading correct order...</p>;
}
  return (
  <div className={styles.container}>

    {/* ✅ Success Icon */}
    <div className={styles.successIcon}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    {/* ✅ Header */}
    <header className={styles.header}>
      <h1>Thank you for your order, Fox!</h1>
      <p className={styles.orderNumber}>
        Order #{order.orderNumber}
      </p>
    </header>

    <div className={styles.divider}></div>

    {/* ✅ Order Details */}
    <div className={styles.sectionTitle}>ORDER DETAILS</div>

    {order.items.map((item: any) => (
      <div key={item.id} className={styles.itemRow}>
        
        {/* ✅ FIXED IMAGE */}
        <img
          src={item.variant?.image }
          alt={item.variant?.product?.name}
          className={styles.productImg}
        />

        <div className={styles.itemInfo}>
          <span className={styles.itemName}>
            {item.variant?.product?.name}
          </span>

          <span className={styles.itemMeta}>
            {item.variant?.color}, {item.variant?.size} | Qty: {item.quantity}
          </span>
        </div>

        <div className={styles.price}>
          ₹{item.price}
        </div>
      </div>
    ))}

    {/* ✅ Pricing */}
    <div className={styles.summaryRow}>
      <span>Subtotal</span>
      <span>₹{order.subtotal}</span>
    </div>

   
      
      {order.fulfillmentType !=="PICKUP" && (
         <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span className={styles.shippingFree}>
            {order.shippingCharge == 0 ? "FREE" : `₹${order.shippingCharge}`}
          </span>
        </div>
      )}
    

    <div className={styles.totalRow}>
      <span>Total</span>
      <span>₹{order.finalAmount}</span>
    </div>

    {/* ✅ Delivery Card */}
    <div className={styles.deliveryCard}>
      <div className={styles.deliveryGrid}>

        {order.fulfillmentType === "DELIVERY" ? (
        <>
          <div>
            <span className={styles.cardLabel}>DELIVERY ADDRESS</span>
            <p className={styles.cardContent}>
              {order.shippingAddress}
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
        <>
          <div>
            <span className={styles.cardLabel}>PICKUP LOCATION</span>
            <p className={styles.cardContent}>
              Your selected store branch
            </p>
          </div>
        </>
      )}
      </div>

      {/* ✅ Track Button */}
      <button
        className={styles.trackButton}
        onClick={() => router.push("/profile")}
      >
        <MdLocalShipping className={styles.trackIcon} />
        TRACK ORDER
      </button>
    </div>

    {/* ✅ Footer */}
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