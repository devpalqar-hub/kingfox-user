'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './hotdeals.module.css';
import { getProducts } from '@/services/product.service';
import { getWishList, addToWishlist, removeFromWishlist } from "@/services/wishlist.service";
import type { Product } from '@/types/product';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

type WishlistEntry = {
  productId: number;
};

const hasResponseStatus = (
  error: unknown,
): error is { response?: { status?: number } } =>
  typeof error === "object" && error !== null && "response" in error;

const HotDeals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  // ✅ GET PRODUCTS
  useEffect(() => {
    const fetchHotDeals = async () => {
      const res = await getProducts({
        limit: 4,
        tags: ["HOT SALE"],
      });
      setProducts(res.items || []);
    };

    fetchHotDeals();
  }, []);

  // ✅ GET WISHLIST
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;

      try {
        const res = await getWishList();

        const items: WishlistEntry[] = res?.data || res?.items || res || [];
        const ids = items.map((item) => item.productId);

        setWishlistIds(ids);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [user]);
  // ✅ TOGGLE FUNCTION
  const handleWishlistToggle = async (productId: number) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      if (wishlistIds.includes(productId)) {
        // ✅ REMOVE
        await removeFromWishlist(productId);

        setWishlistIds((prev) =>
          prev.filter((id) => id !== productId)
        );
      } else {
        try {
          // ✅ ADD
          await addToWishlist(productId);

          setWishlistIds((prev) => [...prev, productId]);
        } catch (err: unknown) {
          // 🔥 HANDLE 409
          if (hasResponseStatus(err) && err.response?.status === 409) {
            console.log("Already in wishlist");

            // sync UI anyway
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
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            price={String(product.priceRange?.min || 0)}
            rating={4}
            image={product.images?.[0] || "/placeholder-product.png"}

            // ✅ THIS IS THE MAGIC
            isWishlisted={wishlistIds.includes(product.id)}

            // ✅ THIS HANDLES CLICK
            onWishlistToggle={() => handleWishlistToggle(product.id)}
          />
        ))}
      </div>

      <button onClick={() => router.push('/products?tag=HOT%20SALE')}>
        VIEW ALL
      </button>
    </section>
  );
};

export default HotDeals;
