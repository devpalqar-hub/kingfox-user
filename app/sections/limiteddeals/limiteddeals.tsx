'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './limited.module.css';
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

const LimitedDeals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  // ✅ GET PRODUCTS
  useEffect(() => {
    const fetchLimitedDeals = async () => {
      try {
        const res = await getProducts({
          limit: 4,
          tags: ["LIMITED EDITION"], // ✅ correct
        });

        setProducts(res.items || []);
      } catch (err) {
        console.error("Failed to fetch limited deals", err);
      }
    };

    fetchLimitedDeals();
  }, []);

  // ✅ GET WISHLIST
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;

      try {
        const res = await getWishList();
        const items: WishlistEntry[] = res?.data || res?.items || [];
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
        window.dispatchEvent(new Event("openLoginModal"));
        return;
      }
  
      try {
        if (wishlistIds.includes(productId)) {
          // ✅ REMOVE
          await removeFromWishlist(productId);
          window.dispatchEvent(new Event("wishlistUpdated"));
  
          setWishlistIds((prev) =>
            prev.filter((id) => id !== productId)
          );
        } else {
          try {
            // ✅ ADD
            await addToWishlist(productId);
  
            setWishlistIds((prev) => [...prev, productId]);
          } catch (err: any) {
            // 🔥 HANDLE 409
            if (err.response?.status === 409) {
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
  

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>

      <div className={styles.header}>
        <h2 className={styles.title}>LIMITED DEALS</h2>
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
            image={product.images?.[0]}

            // ✅ THIS IS THE MAGIC
            isWishlisted={wishlistIds.includes(product.id)}

            // ✅ THIS HANDLES CLICK
            onWishlistToggle={() => handleWishlistToggle(product.id)}
          />
        ))}
      </div>

      <div className={styles.viewAllWrapper}>
        <button
          className={styles.viewAll}
          onClick={() => router.push('/products?tag=LIMITED%20EDITION')}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>

    </section>
  );
};

export default LimitedDeals;
