"use client";

import VoucherCard from "@/components/vouchercard/VoucherCard";
import styles from "./profile.module.css";
import { useEffect, useState } from "react";
import { getProfileAPI } from "@/services/profile.service";
import { getCartAPI } from "@/services/cart.service";
import { getOrdersAPI } from "@/services/order-history.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LuLogOut } from "react-icons/lu";

const ProfilePage = () => {

  const { logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  useEffect(() => {
  const loadData = async () => {
    try {
      const profileData = await getProfileAPI();
      setProfile(profileData);

      const cartData = await getCartAPI();
      setCartItems(cartData.items);
      setCartTotal(cartData.finalAmount);

      const ordersData = await getOrdersAPI();
      setOrders(ordersData.data.slice(0, 3)); // 🔥 only 3
    } catch (err) {
      console.error(err);
    }
  };

  loadData();
}, []);


  const wishlist = [
    { name: "KF-VEST GEN. 2", price: "$210.00", image: "/wishlist1.png" },
    { name: "VELOCITY RED-04", price: "$345.00", image: "/wishlist2.png" },
    { name: "GHOST LOGO TEE", price: "$65.00", image: "/wishlist3.png" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.containerheader}>
        <div className={styles.title}>USER PROFILE</div>
        <div className={styles.logout}>
          <button onClick={logout}><LuLogOut/> LOGOUT</button>
        </div>
      </div>

      {/* TOP SECTION */}
      <div className={styles.topSection}>
        
        {/* DETAILS */}
        <div className={styles.detailsCard}>
          <div className={styles.cardHeader}>
            <h2>DETAILS</h2>
            <button className={styles.editBtn}>EDIT INFO</button>
          </div>

          <div className={styles.grid}>
            <div>
              <p className={styles.label}>FULL NAME</p>
              <strong>{profile?.name}</strong>
            </div>

            <div>
              <p className={styles.label}>EMAIL ADDRESS</p>
              <strong>{profile?.email}</strong>
            </div>

            <div>
              <p className={styles.label}>PHONE</p>
              <strong>{profile?.phone}</strong>
            </div>
          </div>
        </div>

        {/* CART */}
        <div className={styles.cartCard}>
        <h3>CURRENT CART</h3>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Your cart is empty</p>
            <button onClick={() => router.push("/products")}>
              SHOP NOW
            </button>
          </div>
        ) : (
          <>
            {cartItems.slice(0, 2).map((item, i) => (
              <div key={i} className={styles.cartItem}>
                <img src={item.productImage} />
                <div>
                  <p>{item.productName}</p>
                  <span>
                    QTY:{item.quantity} / SIZE: {item.size}
                  </span>
                </div>
              </div>
            ))}

            {cartItems.length > 2 && (
              <div
                className={styles.moreItems}
                onClick={() => router.push("/cart")}
              >
                +{cartItems.length - 2} more items →
              </div>
            )}

            <div className={styles.cartFooter}>
              <span>SUBTOTAL</span>
              <h2>₹{cartTotal}</h2> {/* ✅ dynamic */}
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={() => router.push("/cart")} // ✅ FIXED
            >
              VIEW CART
            </button>
          </>
        )}
      </div>
      </div>

      {/* VOUCHERS */}
      <div className={styles.voucherSection}>
        <h3>VOUCHER COLLECTION</h3>

        <div className={styles.voucherGrid}>
          {profile?.activeVouchers?.length ? (
            profile.activeVouchers.map((v) => (
              <VoucherCard
                key={v.id}
                code={v.voucherCode}
                title={v.campaign.name}
                validTill={formatDate(v.campaign.validUntil)}
              />
            ))
          ) : (
            <p className={styles.emptyText}>No vouchers available</p>
          )}
        </div>
      </div>

      {/* ORDERS */}
      <div className={styles.orders}>
        <div className={styles.ordersHeader}>
          <h3>ORDER HISTORY</h3>
          <button onClick={() => router.push("/orders")}>
            VIEW ALL
          </button>
        </div>

        <div className={styles.table}>
          <div className={styles.row}>
            <span className={styles.tablehead}>ORDER ID</span>
            <span className={styles.tablehead}>DATE</span>
            <span className={styles.tablehead}>ITEMS</span>
            <span className={styles.tablehead}>TOTAL</span>
            <span className={styles.tablehead}>STATUS</span>
          </div>
          {orders.map((o) => (
            <div key={o.id} className={styles.row}>
              <span>{o.orderNumber}</span>
              <span>{new Date(o.createdAt).toDateString()}</span>
              <span>{o.items.length} ITEMS</span>
              <span>₹{o.finalAmount}</span>
              <span className={styles.status}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WISHLIST */}
      {/* <div className={styles.wishlist}>
        <h3>WISHLIST FAVORITES</h3>

        <div className={styles.wishlistGrid}>
          {wishlist.map((item, i) => (
            <div key={i} className={styles.wishlistCard}>
              <img src={item.image} />
              <p>{item.name}</p>
              <span>{item.price}</span>
            </div>
          ))}

          <div className={styles.moreCard}>+</div>
        </div>
      </div> */}
    </div>
  );
};

export default ProfilePage;