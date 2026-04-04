'use client';
import React, { useState } from 'react';
import styles from './New-Arrivals.module.css';
import {LuLayers, LuShieldCheck, LuRuler } from "react-icons/lu";
import { FiHeart } from "react-icons/fi"; // outline
import { FaHeart } from "react-icons/fa"; // filled
import { FiEye } from "react-icons/fi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishList 
} from "@/services/wishlist.service";
import { getNewArrivals } from "@/services/product.service";

const NewArrivals = () => {

  const { showToast } = useToast();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const inStockSizes = ['5XL', '6XL', '8XL', '10XL'];
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<
  { id: number; name: string }[]
>([]);

  const formatName = (name: string) => {
  return name
    ?.split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
  
useEffect(() => {
  const fetchWishlist = async () => {
    try {
      const res = await getWishList();

      // extract product IDs
      const ids = res.map((item: any) => item.productId);

      setWishlist(ids);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      showToast("Failed to load wishlist", "error");
    }
  };

  fetchWishlist();
}, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await getNewArrivals({
        size: selectedSize,
        categoryId: selectedCategory,
      });

      console.log("NEW ARRIVALS API:", res);

      const data = res.items || []; // ✅ FIX
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch new arrivals", err);
      showToast("Failed to load products", "error");
    }
  };

  fetchData();
}, [selectedSize, selectedCategory]);


useEffect(() => {
  const sizesSet = new Set<string>();

  products.forEach((product) => {
    product.variants?.forEach((variant: any) => {
      if (variant.size) {
        sizesSet.add(variant.size);
      }
    });
  });

  setAvailableSizes(Array.from(sizesSet));
}, [products]);

useEffect(() => {
  if (!products || products.length === 0) {
    setCategories([]);
    return;
  }

  const map = new Map<number, { id: number; name: string }>();

  products.forEach((product) => {
    if (product.category) {
      map.set(product.category.id, product.category);
    }
  });

  setCategories(Array.from(map.values()));
}, [products]);


const handleWishlist = async (id: number) => {
  const token = localStorage.getItem("token");

  // ❌ Not logged in
  if (!token) {
    showToast("Please login to use wishlist", "error");
    return;
  }

  try {
    if (wishlist.includes(id)) {
      // REMOVE
      await removeFromWishlist(id);
      setWishlist((prev) => prev.filter((i) => i !== id));

      showToast("Removed from wishlist", "info"); // ✅ TOAST
    } else {
      // ADD
      await addToWishlist(id);
      setWishlist((prev) => [...prev, id]);

      showToast("Added to wishlist ❤️", "success"); // ✅ TOAST
    }
  } catch (err: any) {
    if (err?.response?.status === 409) {
      setWishlist((prev) => [...prev, id]);
      showToast("Already in wishlist", "info"); // ✅ TOAST
    } else {
      console.error(err);
      showToast("Something went wrong", "error"); // ✅ TOAST
    }
  }
};
  return (
    <>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>NEW ARRIVALS:<br />BEYOND THE STANDARD</h1>
        <div className={styles.subtextContainer}>
          <span className={styles.greenLine}></span>
          <p className={styles.subtext}>AVAILABLE UP TO SIZE  XL</p>
        </div>
      </header>
      {/* ⭐ MOBILE FILTER BUTTON — EXACT POSITION */}
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setFilterOpen(true)}
      >
        FILTERS
      </button>

      <div className={styles.mainContent}>
        <aside className={`${styles.sidebar} ${filterOpen ? styles.open : ''}`}>
          <button
              className={styles.closeBtn}
              onClick={() => setFilterOpen(false)}
            >
              ✕
            </button>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>SIZE FILTER</h3>
            <div className={styles.sizeGrid}>
              {availableSizes.length === 0 ? (
                <p>No sizes available</p> // 👈 TEMP DEBUG
              ) : (
                availableSizes.map((size) => {
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize((prev) => (prev === size ? null : size))
                      }
                      className={`${styles.sizeBtn} ${isSelected ? styles.active : ''}`}
                    >
                      {size}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>CATEGORY</h3>
            <div className={styles.categoryList}>
              {categories.map((cat) => (
                <label key={cat.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.id}
                    onChange={() =>
                      setSelectedCategory((prev) =>
                        prev === cat.id ? null : cat.id
                      )
                    }
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <img
                  src={product.images?.[0] }
                  alt={product.name}
                />
                <div className={styles.iconActions}>
                <div className={styles.iconOverlay}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => handleWishlist(product.id)}
                  >
                    {wishlist.includes(product.id) ? (
                      <FaHeart size={16} color="#000" />
                    ) : (
                      <FiHeart size={16} />
                    )}
                  </button>

                  <button
                    className={styles.iconBtn}
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <FiEye size={16} />
                  </button>
                </div>
                </div>
              </div>
              <div className={styles.productInfo}>
                <div className={styles.productRow}>
                    <h4 className={styles.productName}>
                      {formatName(product.name)}
                    </h4>

                    <p className={styles.price}>
                      ₹{product.variants?.[0]?.sellingPrice || 0}
                    </p>
                  </div>
                <p className={styles.inclusiveText}>INCLUSIVE SIZING (UP TO XL)</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
    {filterOpen && (
  <div
    className={styles.overlay}
    onClick={() => setFilterOpen(false)}
  />
)}


     {/* --- Section 2: Streetwear Info (Exact Match to Image) --- */}

<section className={styles.qualitySection}>
  <div className={styles.qualityTextContent}>
    <h2 className={styles.qualityTitle}>STREETWEAR FOR EVERY BODY</h2>
    <p className={styles.qualityDescription}>
      Our premium 240 GSM fabric is engineered for durability and the 
      perfect fit for larger silhouettes. We don't just upscale designs; 
      we re-engineer them from the fiber up. No compromises on style, 
      no matter the size.
    </p>

    <div className={styles.featureGrid}>
      <div className={styles.featureCard}>
        <LuLayers className={styles.featureIcon} />
        <h4>240 GSM</h4>
        <p>Heavyweight cotton that holds shape.</p>
      </div>
      <div className={styles.featureCard}>
        <LuShieldCheck className={styles.featureIcon} />
        <h4>REINFORCED</h4>
        <p>Double-stitched seams for longevity.</p>
      </div>
      <div className={styles.featureCard}>
        <LuRuler className={styles.featureIcon} />
        <h4>PRO FIT</h4>
        <p>Custom blocks up to 10XL.</p>
      </div>
    </div>
  </div>

  <div className={styles.qualityImageWrapper}>
    <img src="/qaulity.png" alt="Fabric Detail" className={styles.qualityImage} />
    <div className={styles.qualityBadge}>QUALITY FIRST</div>
  </div>
</section>
    </>
  );
};

export default NewArrivals;