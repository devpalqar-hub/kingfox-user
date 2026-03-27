'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './hotdeals.module.css';
import { getProducts } from '@/services/product.service';
import { useRouter } from 'next/navigation';

const HotDeals = () => {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchHotDeals = async () => {
      try {
        const res = await getProducts({
          limit: 4,
          tags: ["HOT SALE"], // ✅ CHANGE HERE
        });

        setProducts(res.items || []);
      } catch (err) {
        console.error("Failed to fetch hot deals", err);
      }
    };

    fetchHotDeals();
  }, []);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>

      <div className={styles.header}>
        <h2 className={styles.title}>HOT DEALS</h2> {/* ✅ CHANGE TITLE */}
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={String(product.priceRange?.min || 0)}
            rating={4}
            image={product.images?.[0] || "/placeholder-product.png"}
          />
        ))}
      </div>

      <div className={styles.viewAllWrapper}>
        <button
          className={styles.viewAll}
          onClick={() => router.push('/products?tag=HOT%20SALE')}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>

    </section>
  );
};

export default HotDeals;