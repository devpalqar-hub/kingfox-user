"use client";

import { useEffect, useState } from "react";
import styles from "./orders.module.css";
import { getOrdersAPI } from "@/services/order-history.service";
import { OrderHistoryItem } from "@/types/order-history";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

const OrdersPage = () => {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("razorpay_payment_id");
  const orderId = searchParams.get("razorpay_order_id");
  console.log("Payment ID:", paymentId);
  console.log("Order ID:", orderId);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrdersAPI(page,limit);

        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error(err);
      }
    };

    loadOrders();
  }, [page]);

  const formatDate = (date: string) =>
    new Date(date).toISOString().split("T")[0];

  const formatStatus = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase();

const getStatusClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return styles.pending;

    case "CONFIRMED":
      return styles.confirmed;

    case "PACKED":
      return styles.packed;

    case "SHIPPED":
      return styles.shipped;

    case "DELIVERED":
      return styles.delivered;

    case "CANCELLED":
      return styles.cancelled;

    default:
      return "";
  }
};

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/profile")}>
          <ArrowLeft size={16}/>
        </button>
        <h1>MY ORDERS</h1>
      </div>

      {/* TABLE */}
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>ORDER_ID</span>
          <span>TIMESTAMP</span>
          <span>QUANTITY</span>
          <span>VALUATION</span>
          <span>PAYMENT</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {orders.map((order) => (
          <div key={order.id} className={styles.row}>
            <span>{order.orderNumber}</span>
            <span>{formatDate(order.createdAt)}</span>
            <span>{order.items.length} ITEMS</span>
            <span className={styles.amount}>₹{order.finalAmount}</span>

            <span>
              <span className={styles.paymentBadge}>{order.paymentMethod}</span>
            </span>

            <span className={`${styles.status} ${getStatusClass(order.status)}`}>
            <span className={styles.dot}></span>
            {formatStatus(order.status)}
            </span>

            <button
              className={styles.viewBtn}
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              VIEW DETAILS
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`${styles.pageBtn} ${
              page === i + 1 ? styles.activePage : ""
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;