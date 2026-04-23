"use client";

import React, { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/productcard/productcard";
import styles from "./bestseller.module.css";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import {
  getWishList,
  addToWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";
import { useAuth } from "@/context/AuthContext";

const Bestseller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { user } = useAuth();

  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await getProducts({
          limit: 20,
          tags: ["BEST SELLER"],
        });

        setProducts(res.items || []);
      } catch (err) {
        console.error("Failed to fetch bestseller", err);
      }
    };

    fetchBestSellers();
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

  // 🔥 SCROLL FUNCTIONS
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

  // ✅ HIDE IF EMPTY
  if (!products || products.length === 0) return null;

  return (
    <section className={styles.section}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>BESTSELLER</h2>

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
              image={product.images?.[0] || "/placeholder-product.png"}
            />
          </div>
        ))}
      </div>

      {/* VIEW ALL */}
      <div className={styles.viewAllWrapper}>
        <button
          className={styles.viewAll}
          onClick={() => router.push("/products?tag=BEST%20SELLER")}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>
    </section>
  );
};

export default Bestseller;
