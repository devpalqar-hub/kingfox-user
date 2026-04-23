"use client";

import React, { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/productcard/productcard";
import styles from "./hotdeals.module.css";
import { getProducts } from "@/services/product.service";
import {
  getWishList,
  addToWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const HotDeals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    const fetchHotDeals = async () => {
      const res = await getProducts({
        limit: 20, // 🔥 increase
        tags: ["HOT SALE"],
      });
      setProducts(res.items || []);
    };

    fetchHotDeals();
  }, []);

  // ✅ FETCH WISHLIST
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;

      try {
        const res = await getWishList();
        const items = res?.data || res?.items || res || [];
        const ids = items.map((item: any) => item.productId);

        setWishlistIds(ids);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [user]);

  // 🔥 SCROLL
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  const handleWishlistToggle = async (productId: number) => {
    if (!user) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    try {
      if (wishlistIds.includes(productId)) {
        // REMOVE
        await removeFromWishlist(productId);

        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      } else {
        try {
          // ADD
          await addToWishlist(productId);

          setWishlistIds((prev) => [...prev, productId]);
        } catch (err: any) {
          // handle already exists
          if (err.response?.status === 409) {
            setWishlistIds((prev) => [...prev, productId]);
          } else {
            throw err;
          }
        }
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Wishlist error", err);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>HOT DEALS</h2>

        {/* 🔥 ARROWS */}
        <div className={styles.navButtons}>
          <button onClick={scrollLeft}>←</button>
          <button onClick={scrollRight}>→</button>
        </div>
      </div>

      {/* 🔥 CAROUSEL */}
      <div className={styles.grid} ref={scrollRef}>
        {products.map((product) => (
          <div className={styles.cardWrapper} key={product.id}>
            <ProductCard
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={String(product.priceRange?.min || 0)}
              rating={4}
              image={product.images?.[0]}
              isWishlisted={wishlistIds.includes(product.id)}
              onWishlistToggle={() => handleWishlistToggle(product.id)}
            />
          </div>
        ))}
      </div>

      {/* VIEW ALL */}
      <div className={styles.viewAllWrapper}>
        <button
          className={styles.viewAll}
          onClick={() => router.push("/products?tag=HOT%20SALE")}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>
    </section>
  );
};

export default HotDeals;
