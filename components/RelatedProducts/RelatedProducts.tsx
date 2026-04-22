"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/productcard/productcard";
import styles from "./related.module.css";
import { getProducts } from "@/services/product.service";
import { useRouter } from "next/navigation";

type Props = {
  categoryId: number;
  categoryName: string;
  currentProductId: number;
};

const RelatedProducts = ({
  categoryId,
  currentProductId,
}: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRelated = async () => {
      const res = await getProducts({
        categoryId,
        limit: 8,
      });

      // ❗ remove current product
      const filtered = (res.items || []).filter(
        (p: any) => p.id !== currentProductId
      );

      setProducts(filtered.slice(0, 4)); // show 4 like HotDeals
    };

    fetchRelated();
  }, [categoryId, currentProductId]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          RELATED PRODUCTS
        </h2>
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
          />
        ))}
      </div>

      <button
        className={styles.viewAll}
        onClick={() =>
          router.push(`/products?categoryId=${categoryId}`)
        }
      >
        VIEW ALL PRODUCTS
      </button>
    </section>
  );
};

export default RelatedProducts;