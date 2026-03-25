"use client";

import styles from "./orderdetails.module.css";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MdAccessTimeFilled, MdCheckCircle, MdContentCopy, MdEmail, MdInventory2, MdLocalShipping, MdPersonOutline, MdPhone } from "react-icons/md";
import React,{ useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderDetailsAPI } from "@/services/order-details.service";
import { OrderDetailsResponse } from "@/types/order-details";
import { getProfileAPI } from "@/services/profile.service";

const OrderDetailsPage = () => {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderDetailsAPI(params.id as string);
        setOrder(data);
        const profileData = await getProfileAPI();
        setProfile(profileData);
      } catch (err) {
        console.error(err);
      }
    };

    if (params.id) loadOrder();
  }, [params.id]);

  const steps = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"];

  const getStepStatus = (step: string) => {
    if (!order) return "inactive";

    const currentIndex = steps.indexOf(order.status);
    const stepIndex = steps.indexOf(step);

    if (stepIndex <= currentIndex) return "active";
    return "inactive";
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/orders")}>
          <ArrowLeft size={16}/> BACK TO ORDERS
        </button>

        <div className={styles.titleRow}>
          <h1>ORDER #{order?.orderNumber}</h1>

          <span className={styles.statusBadge}>
            {order?.status}
          </span>
        </div>

        <p className={styles.subText}>
          PLACED ON {new Date(order?.createdAt || "").toDateString()}
        </p>
      </div>

      {/* ORDER JOURNEY */}
      <div className={styles.journey}>
        <h3 className={styles.journeyTitle}>
            <span className={styles.dot}></span> ORDER JOURNEY
        </h3>

        <div className={styles.steps}>
            {steps.map((step, index) => {
              const isActive = getStepStatus(step) === "active";

              return (
                <React.Fragment key={step}>
                  <div className={styles.step}>
                    <div
                      className={
                        isActive ? styles.iconActive : styles.iconInactive
                      }
                    >
                      {step === "PENDING" && <MdAccessTimeFilled size={18} />}
                      {step === "CONFIRMED" && <MdCheckCircle size={18} />}
                      {step === "PACKED" && <MdInventory2 size={18} />}
                      {step === "SHIPPED" && <MdLocalShipping size={18} />}
                    </div>

                    <p
                      className={
                        isActive
                          ? styles.stepLabel
                          : styles.stepInactiveLabel
                      }
                    >
                      {step}
                    </p>

                    <span
                      className={
                        isActive
                          ? styles.stepTime
                          : styles.stepInactiveTime
                      }
                    >
                      {isActive
                        ? new Date(order?.updatedAt || "").toLocaleString()
                        : "—"}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={
                        getStepStatus(steps[index + 1]) === "active"
                          ? styles.lineActive
                          : styles.lineInactive
                      }
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

      {/* MAIN GRID */}
      <div className={styles.grid}>
        
        {/* LEFT */}
        <div className={styles.left}>
          
          {/* ITEMS */}
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
                <h3>ORDERED ITEMS (1)</h3>
            </div>

            {order.items.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                
                <div className={styles.imageBox}>
                  <img src={item.variant.image} />
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.topRow}>
                    <h2>{item.variant.product.name}</h2>
                    <span className={styles.price}>₹{item.price}</span>
                  </div>

                  <div className={styles.meta}>
                    <div>
                      <span className={styles.label}>COLOUR</span>
                      <div className={styles.value}>
                        <span
                          className={styles.colorDot}
                          style={{ background: item.variant.color }}
                        ></span>
                        {item.variant.color.toUpperCase()}
                      </div>
                    </div>

                    <div>
                      <span className={styles.label}>SIZE</span>
                      <div className={styles.value}>{item.variant.size}</div>
                    </div>

                    <div>
                      <span className={styles.label}>QTY</span>
                      <div className={styles.value}>{item.quantity}</div>
                    </div>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.subtotalRow}>
                    <span>ITEM SUBTOTAL</span>
                    <span className={styles.subtotal}>₹{item.subtotal}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>

          {order.shipments.length > 0 && (
            <div className={styles.shipmentCard}>
              
              <div className={styles.shipmentHeader}>
                <MdLocalShipping className={styles.shipIcon} />
                <h3>SHIPMENT DETAILS</h3>
              </div>

              {order.shipments.map((ship) => (
                <div key={ship.id} className={styles.shipmentGrid}>

                  {/* PROVIDER NAME */}
                  <div className={styles.shipItem}>
                    <span className={styles.label}>CARRIER</span>
                    <p className={styles.value}>
                      {ship.providerName || "N/A"}
                    </p>
                  </div>

                  {/* TRACKING ID */}
                  <div className={styles.shipItem}>
                    <span className={styles.label}>TRACKING ID</span>
                    <p className={styles.value}>
                      {ship.trackingId}
                      <MdContentCopy
                        className={styles.copyIcon}
                        onClick={() =>
                          navigator.clipboard.writeText(ship.trackingId)
                        }
                      />
                    </p>
                  </div>

                  {/* SHIPPED DATE */}
                  <div className={styles.shipItem}>
                    <span className={styles.label}>SHIPPED AT</span>
                    <p className={styles.value}>
                      {ship.shippedAt
                        ? new Date(ship.shippedAt).toISOString().split("T")[0]
                        : "—"}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          
          {/* CUSTOMER */}
          <div className={styles.customerCard}>
  
          {/* HEADER */}
          <div className={styles.customerHeader}>
            <MdPersonOutline className={styles.icon} />
            <h3>CUSTOMER</h3>
          </div>

          {/* DETAILS */}
          <div className={styles.customerBody}>

            <div className={styles.field}>
              <span className={styles.label}>NAME</span>
              <p className={styles.name}>{profile?.name}</p>
            </div>

            <div className={styles.fieldRow}>
              <MdPhone className={styles.subIcon} />
              <div>
                <span className={styles.label}>PHONE</span>
                <p className={styles.value}>{profile?.phone}</p>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <MdEmail className={styles.subIcon} />
              <div>
                <span className={styles.label}>EMAIL</span>
                <p className={styles.value}>{profile?.email}</p>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.field}>
              <span className={styles.label}>SHIPPING ADDRESS</span>
              <p className={styles.value}>{order?.shippingAddress}</p>
            </div>

          </div>

          {/* DIAGONAL SHAPE */}
          <div className={styles.cornerShape}></div>

        </div>

          {/* SUMMARY */}
          <div className={styles.summaryCard}>
  
  <h3 className={styles.title}>SUMMARY</h3>

  {/* ROWS */}
  <div className={styles.row}>
    <span>SUBTOTAL</span>
    <span>₹{order?.subtotal}</span>
  </div>

  <div className={styles.row}>
    <span>SHIPPING</span>
    <span>
      {Number(order?.shippingCharge) === 0
        ? "FREE"
        : `₹${order?.shippingCharge}`}
    </span>
  </div>

  <div className={styles.divider}></div>

  {/* DISCOUNT */}
  {Number(order?.discount) > 0 && (
    <>
      <div className={`${styles.row} ${styles.discount}`}>
        <span>DISCOUNT</span>
        <span>-₹{order?.discount}</span>
      </div>

      {order?.voucher && (
        <div className={styles.voucherBox}>
          🎟 {order.voucher.voucherCode}: {order.voucher.campaign.name} APPLIED
        </div>
      )}

      <div className={styles.divider}></div>
    </>
  )}

  <div className={styles.divider}></div>

  {/* TOTAL */}
  <div className={styles.totalRow}>
    <span>TOTAL</span>
    <div className={styles.totalBox}>₹{order?.finalAmount}</div>
  </div>

</div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsPage;