"use client";
import styles from './wishlist.module.css';
import { Heart, ShoppingCart, Bell,ChevronLeft, ChevronRight, Eye } from 'lucide-react'; // Using Lucide for icons
import React, { useRef } from "react";
import { getWishList,removeFromWishlist,clearWishlist } from "@/services/wishlist.service";
import { useEffect, useState } from "react";
const RECOMMENDED_DATA = [
  { id: 5, name: "Urban Oversized Tee", price: "₹1,499", img: "/wishlist1.png", tag: "NEW DROP" },
  { id: 6, name: "Vortex Graphic Hoodie", price: "₹2,999", img: "/wishlist2.png" },
  { id: 7, name: "Vortex Graphic Hoodie", price: "₹2,999", img: "/wishlist2.png" },
  { id: 8, name: "Vortex Graphic Hoodie", price: "₹2,999", img: "/wishlist2.png" },
];
export default function WishlistPage() {
 const sliderRef = useRef<HTMLDivElement | null>(null);
 const [wishlist, setWishlist] = useState<any[]>([]);
 useEffect(() => {
  const fetchWishlist = async () => {
    try {
      const data = await getWishList();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchWishlist();
}, []);
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

const handleClearWishlist = async () => {
  const confirmClear = confirm("Are you sure you want to clear wishlist?");
  if (!confirmClear) return;

  try {
    await clearWishlist();

    setWishlist([]); // ✅ clear UI instantly

  } catch (err) {
    console.error(err);
  }
};

const handleRemove = async (productId: number) => {
  try {
    await removeFromWishlist(productId);

    // ✅ update UI instantly (important)
    setWishlist((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
    if (!confirm("Remove from wishlist?")) return;

  } catch (err) {
    console.error(err);
  }
};
  return (
    <>
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Your Wishlist</h1>
          <span className={styles.itemCount}>({wishlist.length} ITEMS)</span>
          <span className={styles.continueShopping}>Continue Shopping</span>
        </div>
        
        <div className={styles.headerButtons}>
          <button className={styles.moveAllBtn}>
            <ShoppingCart size={16} /> Move All To Cart
          </button>
          <button className={styles.clearBtn} onClick={handleClearWishlist}>
            Clear Wishlist
          </button>
        </div>
      </header>

      {/* Grid Section */}
      <div className={styles.grid}>
        {wishlist.map((item) => {
  const product = item.product;

  return (
    <div key={item.id} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={product.images?.[0] || "/fallback.png"}
          alt={product.name}
        />

        <div
          className={styles.wishlistIcon}
          onClick={() => handleRemove(item.productId)}
          style={{ cursor: "pointer" }}
        >
          <Heart size={18} fill="black" />
        </div>
      </div>

      <div className={styles.productInfo}>
        <h3>{product.name}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            ₹{product.priceRange?.min || 0}
          </span>

          <span className={styles.sizeTag}>
            {product.brand?.name}
          </span>
        </div>
      </div>

      <button className={styles.actionBtn}>
        Move To Cart
      </button>
    </div>
  );
})}
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