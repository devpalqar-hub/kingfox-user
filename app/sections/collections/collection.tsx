'use client';

import React from "react";
import Image from "next/image";
import styles from "./collection.module.css";
import { useRouter } from 'next/navigation';
import  { useEffect, useState } from "react";
import { getAllCategories } from "@/services/category.service";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/services/product.service";

const Collections = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  useEffect(() => {
  const loadCategories = async () => {
    const data = await getAllCategories();

    // ✅ take only 4 categories
    // ✅ Just take first 4 categories from API
    const selectedCategories = data.slice(0, 4);

    setCategories(selectedCategories);    
  };

  loadCategories();
  
}, []);
const getCategory = (index: number) => {
  return categories[index] || null;
};

const cat0 = categories[0];
const cat1 = categories[1];
const cat2 = categories[2];
const cat3 = categories[3];


  return (
    <section className={styles.wrapper}>
      <div className={styles.blackContainer}>

        {/* Header */}
        <div className={styles.topTabContainer}>
          <div className={styles.headerTab}>
            <h2>COLLECTIONS</h2>
            <div className={styles.curveLeft}></div>
            <div className={styles.curveRight}></div>
          </div>
        </div>

        {/* DESKTOP GRID */}
        <div className={styles.desktopGrid}>
  
  {/* FULL SLEEVE */}
  <div
    className={styles.card}
    onClick={() => router.push(`/products?categoryId=${cat0?.id}`)}
    style={{ cursor: "pointer" }}
  >
    <Image
      src={cat0?.image || "/full-sleeve.png"}
      alt={cat0?.name || ""}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className={`${styles.img} ${styles.imgFullSleeve}`}
    />
    <div className={styles.label}>
      {cat0?.name?.toUpperCase() || "FULL SLEEVE T-SHIRTS"}
    </div>
  </div>

  {/* NEW ARRIVAL (already correct) */}
  <div
    className={`${styles.card} ${styles.newArrival}`}
    onClick={() => router.push("/new-arrivals")}
    style={{ cursor: "pointer" }}
  >
    <Image
      src="/new-arrival.png"
      alt=""
      fill
      className={`${styles.img} ${styles.imgNewArrival}`}
    />
    <div className={styles.label}>NEW ARRIVAL</div>
  </div>

  {/* OVERSIZE */}
  <div
    className={styles.card}
    onClick={() => router.push(`/products?categoryId=${cat1?.id}`)}
    style={{ cursor: "pointer" }}
  >
    <Image
      src={cat1?.image || "/oversize.png"}
      alt={cat1?.name || ""}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className={`${styles.img} ${styles.imgOversize}`}
    />
    <div className={styles.label}>
      {cat1?.name?.toUpperCase() || "OVERSIZE TEE"}
    </div>
  </div>

  {/* HALF SLEEVE */}
  <div
    className={styles.card}
    onClick={() => router.push(`/products?categoryId=${cat2?.id}`)}
    style={{ cursor: "pointer" }}
  >
    <Image
      src={cat2?.image || "/half-sleeve.png"}
      alt={cat2?.name || ""}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className={`${styles.img} ${styles.imgHalfSleeve}`}
    />
    <div className={styles.label}>
      {cat2?.name?.toUpperCase() || "HALF SLEEVE T-SHIRTS"}
    </div>
  </div>

  {/* SHIRTS */}
  <div
    className={styles.card}
    onClick={() => router.push(`/products?categoryId=${cat3?.id}`)}
    style={{ cursor: "pointer" }}
  >
    <Image
      src={cat3?.image || "/shirts.png"}
      alt={cat3?.name || "SHIRTS"}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className={`${styles.img} ${styles.imgShirts}`}
    />
    <div className={styles.label}>
      {cat3?.name?.toUpperCase() || "SHIRTS"}
    </div>
  </div>

</div>

      
        <div className={styles.mobileGrid}>
         <div className={styles.cardrow}>
          <div className={styles.card}>
            <Image src="/oversize.png" alt="" fill className={`${styles.img} ${styles.imgOversize}`} />
            <div className={styles.label}>OVERSIZE TEE</div>
          </div>

          <div className={styles.card}>
            <Image src="/shirts.png" alt="" fill className={`${styles.img} ${styles.imgShirts}`} />
            <div className={styles.label}>SHIRTS</div>
          </div>
        </div>

          <div className={`${styles.card} ${styles.mobileNewArrival}`}>
            <Image src="/new-arrival.png" alt="" fill className={`${styles.img} ${styles.imgNewArrival}`} />
            <div className={styles.label}>NEW ARRIVAL</div>
          </div>
          
          <div  className={styles.cardrow}>
            <div className={styles.card}>
                <Image src="/half-sleeve.png" alt="" fill className={`${styles.img} ${styles.imgHalfSleeve}`} />
                <div className={styles.label}>HALF SLEEVE T-SHIRTS</div>
            </div>

            <div className={styles.card}>
                <Image src="/full-sleeve.png" alt="" fill className={`${styles.img} ${styles.imgFullSleeve}`} />
                <div className={styles.label}>FULL SLEEVE T-SHIRTS</div>
            </div>
        </div>
    </div>
        {/* Button */}
        <div className={styles.bottomTabContainer}>
          <div className={styles.footerTab}>
            <button onClick={() => router.push('/products')} className={styles.viewBtn}>VIEW ALL PRODUCTS</button>
            <div className={styles.curveLeftBottom}></div>
            <div className={styles.curveRightBottom}></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Collections;