"use client";
import styles from './wishlist.module.css';
import { Heart, ShoppingCart, Bell,ChevronLeft, ChevronRight, Eye } from 'lucide-react'; // Using Lucide for icons
import React, { useRef } from "react";
import { getWishList,removeFromWishlist,clearWishlist } from "@/services/wishlist.service";
import { getNewArrivals } from "@/services/product.service";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function WishlistPage() {
  const { showToast } = useToast();
 const sliderRef = useRef<HTMLDivElement | null>(null);
 const [wishlist, setWishlist] = useState<any[]>([]);
 const [newArrivals, setNewArrivals] = useState<any[]>([]);
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

const showControls = newArrivals.length > 4;
const scrollAmount = 300;

const scrollLeft = () => {
  if (!sliderRef.current || newArrivals.length <= 4) return;

  sliderRef.current.scrollBy({
    left: -scrollAmount,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  if (!sliderRef.current || newArrivals.length <= 4) return;

  sliderRef.current.scrollBy({
    left: scrollAmount,
    behavior: "smooth",
  });
};

const handleClearWishlist = async () => {
  const confirmClear = confirm("Are you sure you want to clear wishlist?");
  if (!confirmClear) return;

  try {
    await clearWishlist();

    setWishlist([]); // UI update
    showToast("Wishlist cleared", "success");

    // ✅🔥 ADD THIS
    window.dispatchEvent(new Event("wishlistUpdated"));

  } catch (err) {
    console.error(err);
    showToast("Something went wrong", "error");
  }
};

const handleRemove = async (productId: number) => {
  const confirmRemove = window.confirm("Remove from wishlist?");

  // ✅ HARD STOP
  if (confirmRemove !== true) {
    return;
  }

  try {
    await removeFromWishlist(productId);
    showToast("Removed from wishlist", "success");

    setWishlist((prev) =>
      prev.filter((item) => item.productId !== productId)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  const fetchNewArrivals = async () => {
    try {
      const data = await getNewArrivals();

      setNewArrivals(data.items); // ✅ FIXED
    } catch (err) {
      console.error(err);
    }
  };

  fetchNewArrivals();
}, []);
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
          <button
            className={styles.clearBtn}
            onClick={handleClearWishlist}
            disabled={wishlist.length === 0}
          >
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
                  src={product.images?.[0] }
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
          {showControls && (
            <div className={styles.sliderControls}>
              <button className={styles.navBtn} onClick={scrollLeft}>
                <ChevronLeft size={20} />
              </button>

              <button className={styles.navBtn} onClick={scrollRight}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.grid} ref={sliderRef}>
          {newArrivals.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img
                  src={item.images?.[0] }
                  alt={item.name}
                />

                <div className={styles.quickViewIcon}>
                  <Eye size={18} />
                </div>

                <div className={styles.tag}>NEW</div>
              </div>

              <div className={styles.productInfo}>
                <h3>{item.name}</h3>
                <span className={styles.price}>
                  ₹{item.priceRange?.min || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}