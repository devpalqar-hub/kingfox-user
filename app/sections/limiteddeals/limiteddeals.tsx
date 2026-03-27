'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './limited.module.css';
import { getProducts } from '@/services/product.service';
import { useRouter } from 'next/navigation';

const LimitedDeals = () => {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

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
          onClick={() => router.push('/products?tag=LIMITED%20EDITION')}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>

    </section>
  );
};

export default LimitedDeals;