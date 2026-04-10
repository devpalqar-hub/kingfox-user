'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './bestseller.module.css';
import { getProducts } from '@/services/product.service';
import { useRouter } from 'next/navigation';
import { getWishList, addToWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { useAuth } from "@/context/AuthContext";

const Bestseller = () => {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await getProducts({
          limit: 4,
          tags: ["BEST SELLER"], // ✅ KEY PART
        });

        setProducts(res.items || []);
      } catch (err) {
        console.error("Failed to fetch bestseller", err);
      }
    };

    fetchBestSellers();
  }, []);


  // ✅ GET WISHLIST
    useEffect(() => {
      const fetchWishlist = async () => {
        if (!user) return;
  
        try {
          const res = await getWishList();
          window.dispatchEvent(new Event("wishlistUpdated"));
  
          const items = res?.data || res?.items || res || [];
  
          const ids = items.map((item: any) => item.productId);
  
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

  // ✅ Hide section if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>

      <div className={styles.header}>
        <h2 className={styles.title}>BESTSELLER</h2>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={String(product.priceRange?.min || 0)}
            rating={4}
            image={
              product.images?.[0] || "/placeholder-product.png"
            }
          />
        ))}
      </div>

      <div className={styles.viewAllWrapper}>
        <button
          className={styles.viewAll}
          onClick={() => router.push('/products?tag=BEST%20SELLER')}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>

    </section>
  );
};

export default Bestseller;