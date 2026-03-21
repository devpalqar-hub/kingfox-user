"use client";

import VoucherCard from "@/components/vouchercard/VoucherCard";
import styles from "./profile.module.css";

const ProfilePage = () => {
  const user = {
    name: "ALEXANDER VOID",
    email: "VOID@KINGFOX.TECH",
    phone: "+1 (555) 090-KFOX",
    address: "742 NEON DISTRICT, KINETIC CITY BUILDING 04, SECTOR 9",
  };

  const cart = [
    {
      name: 'KF-01 "NIGHTHAWK"',
      size: "11",
      image: "/shoe.png",
    },
    {
      name: "NEON OVERSIZED HOODIE",
      size: "L",
      image: "/hoodie.png",
    },
  ];

  const wishlist = [
    { name: "KF-VEST GEN. 2", price: "$210.00", image: "/wishlist1.png" },
    { name: "VELOCITY RED-04", price: "$345.00", image: "/wishlist2.png" },
    { name: "GHOST LOGO TEE", price: "$65.00", image: "/wishlist3.png" },
  ];

  const orders = [
    {
      id: "#KF-882910",
      date: "OCT 12, 2024",
      items: "3 ITEMS",
      total: "$1,240.00",
      status: "DELIVERED",
    },
    {
      id: "#KF-882745",
      date: "SEP 28, 2024",
      items: "1 ITEM",
      total: "$85.00",
      status: "DELIVERED",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>USER PROFILE</h1>

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
              <p>{user.name}</p>
            </div>

            <div>
              <p className={styles.label}>EMAIL ADDRESS</p>
              <p>{user.email}</p>
            </div>

            <div>
              <p className={styles.label}>PRIMARY SHIPPING</p>
              <p>{user.address}</p>
            </div>

            <div>
              <p className={styles.label}>PHONE</p>
              <p>{user.phone}</p>
            </div>
          </div>
        </div>

        {/* CART */}
        <div className={styles.cartCard}>
          <h3>CURRENT CART</h3>

          {cart.map((item, i) => (
            <div key={i} className={styles.cartItem}>
              <img src={item.image} />
              <div>
                <p>{item.name}</p>
                <span>QTY:1 / SIZE: {item.size}</span>
              </div>
            </div>
          ))}

          <div className={styles.cartFooter}>
            <span>SUBTOTAL</span>
            <h2>$485.00</h2>
          </div>

          <button className={styles.checkoutBtn}>
            CHECKOUT NOW
          </button>
        </div>
      </div>

      {/* VOUCHERS */}
      <div className={styles.voucherSection}>
        <h3>VOUCHER COLLECTION</h3>

        <div className={styles.voucherGrid}>
          <VoucherCard/>
          <VoucherCard/>
        </div>
      </div>

      {/* ORDERS */}
      <div className={styles.orders}>
        <h3>ORDER HISTORY</h3>

        <div className={styles.table}>
          {orders.map((o, i) => (
            <div key={i} className={styles.row}>
              <span>{o.id}</span>
              <span>{o.date}</span>
              <span>{o.items}</span>
              <span>{o.total}</span>
              <span className={styles.status}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WISHLIST */}
      <div className={styles.wishlist}>
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
      </div>
    </div>
  );
};

export default ProfilePage;