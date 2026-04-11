'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './bestseller.module.css';
import { getProducts } from '@/services/product.service';
import type { Product } from '@/types/product';
import { useRouter } from 'next/navigation';

const Bestseller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

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
            slug={product.slug}
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
