"use client";
import styles from './wishlist.module.css';
import { Heart, ShoppingCart, Bell,ChevronLeft, ChevronRight, Eye } from 'lucide-react'; // Using Lucide for icons
import React, { useRef } from "react";
const WISHLIST_DATA = [
  { id: 1, name: "Urban Oversized Tee", price: "₹1,499", size: "L", tag: "NEW DROP", img: "/wishlist1.png", inStock: true },
  { id: 2, name: "Vortex Graphic Hoodie", price: "₹2,999", size: "M", tag: null, img: "/wishlist2.png", inStock: true },
  { id: 3, name: "Stealth Cargo Joggers", price: "₹2,499", size: "L", tag: null, img: "/wishlist3.png", inStock: false },
  { id: 4, name: "Cyber Street Overshirt", price: "₹3,299", size: "L", tag: null, img: "/wishlist4.png", inStock: true },
];
const RECOMMENDED_DATA = [
  { id: 5, name: "Urban Oversized Tee", price: "₹1,499", img: "/wishlist1.png", tag: "NEW DROP" },
  { id: 6, name: "Vortex Graphic Hoodie", price: "₹2,999", img: "/wishlist2.png" },
  { id: 7, name: "Vortex Graphic Hoodie", price: "₹2,999", img: "/wishlist2.png" },
  { id: 8, name: "Vortex Graphic Hoodie", price: "₹2,999", img: "/wishlist2.png" },
];
export default function WishlistPage() {
 const sliderRef = useRef<HTMLDivElement | null>(null);
const scrollLeft = () => {
  if (!sliderRef.current) return;

  sliderRef.current.scrollBy({
    left: -300,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  if (!sliderRef.current) return;

  sliderRef.current.scrollBy({
    left: 300,
    behavior: "smooth",
  });
};
  return (
    <>
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Your Wishlist</h1>
          <span className={styles.itemCount}>(4 ITEMS)</span>
          <span className={styles.continueShopping}>Continue Shopping</span>
        </div>
        
        <div className={styles.headerButtons}>
          <button className={styles.moveAllBtn}>
            <ShoppingCart size={16} /> Move All To Cart
          </button>
          <button className={styles.clearBtn}>Clear Wishlist</button>
        </div>
      </header>

      {/* Grid Section */}
      <div className={styles.grid}>
        {WISHLIST_DATA.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={item.img} alt={item.name} style={{ opacity: item.inStock ? 1 : 0.6 }} />
              <div className={styles.wishlistIcon}>
                <Heart size={18} fill="black" />
              </div>
              {item.tag && <div className={styles.tag}>{item.tag}</div>}
              {!item.inStock && <div className={styles.soldOutOverlay}>SOLD OUT</div>}
            </div>

            <div className={styles.productInfo}>
              <h3 style={{ color: item.inStock ? 'black' : '#999' }}>{item.name}</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>{item.price}</span>
                <span className={styles.sizeTag}>SIZE: {item.size}</span>
              </div>
            </div>

            {item.inStock ? (
              <button className={styles.actionBtn}>Move To Cart</button>
            ) : (
              <button className={styles.notifyBtn}>
                <Bell size={16} /> Notify Me
              </button>
            )}
          </div>
        ))}
      </div>
      <section className={styles.recommendSection}>
        <div className={styles.recommendHeader}>
          <h2>You Might Also Like</h2>
          <div className={styles.sliderControls}>
            <button className={styles.navBtn} onClick={scrollLeft}>
              <ChevronLeft size={20} />
            </button>

            <button className={styles.navBtn} onClick={scrollRight}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className={styles.grid} ref={sliderRef}>
          {RECOMMENDED_DATA.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={item.img} alt={item.name} />
                <div className={styles.quickViewIcon}>
                  <Eye size={18} />
                </div>
                {item.tag && <div className={styles.tag}>{item.tag}</div>}
              </div>
              <div className={styles.productInfo}>
                <h3>{item.name}</h3>
                <span className={styles.price}>{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}