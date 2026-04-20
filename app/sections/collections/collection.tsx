"use client";

import React from "react";
import Image from "next/image";
import styles from "./collection.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllCategories } from "@/services/category.service";

const Collections = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories();
      setCategories(data.slice(0, 4));
    };
    loadCategories();
  }, []);

  const [cat0, cat1, cat2, cat3] = categories;

  return (
    <section className={styles.wrapper}>
      <div className={styles.blackContainer}>
        {/* ── Header Tab ── */}
        <div className={styles.topTabContainer}>
          <div className={styles.headerTab}>
            <h2>Collections</h2>
            <div className={styles.curveLeft} />
            <div className={styles.curveRight} />
          </div>
        </div>

        {/* ── DESKTOP GRID ── */}
        <div className={styles.desktopGrid}>
          {/* FULL SLEEVE */}
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat0?.id}`)}
          >
            <Image
              src={cat0?.image || "/full-sleeve.png"}
              alt={cat0?.name || "Full Sleeve"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={`${styles.img} ${styles.imgFullSleeve}`}
            />
            <div className={styles.label}>
              {cat0?.name?.toUpperCase() || "FULL SLEEVE"}
            </div>
          </div>

          {/* NEW ARRIVAL */}
          <div
            className={`${styles.card} ${styles.newArrival}`}
            onClick={() => router.push("/new-arrivals")}
          >
            <Image
              src="/new-arrival.png"
              alt="New Arrival"
              fill
              className={`${styles.img} ${styles.imgNewArrival}`}
            />
            <span className={styles.newBadge}>NEW</span>
            <div className={styles.label}>NEW ARRIVAL</div>
          </div>

          {/* OVERSIZE */}
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat1?.id}`)}
          >
            <Image
              src={cat1?.image || "/oversize.png"}
              alt={cat1?.name || "Oversize"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
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
          >
            <Image
              src={cat2?.image || "/half-sleeve.png"}
              alt={cat2?.name || "Half Sleeve"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={`${styles.img} ${styles.imgHalfSleeve}`}
            />
            <div className={styles.label}>
              {cat2?.name?.toUpperCase() || "HALF SLEEVE"}
            </div>
          </div>

          {/* SHIRTS */}
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat3?.id}`)}
          >
            <Image
              src={cat3?.image || "/shirts.png"}
              alt={cat3?.name || "Shirts"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={`${styles.img} ${styles.imgShirts}`}
            />
            <div className={styles.label}>
              {cat3?.name?.toUpperCase() || "SHIRTS"}
            </div>
          </div>
        </div>

        {/* ── MOBILE GRID ── */}
        <div className={styles.mobileGrid}>
          <div className={styles.cardrow}>
            <div
              className={styles.card}
              onClick={() => router.push(`/products?categoryId=${cat0?.id}`)}
            >
              <Image
                src={cat0?.image || "/oversize.png"}
                alt={cat0?.name || ""}
                fill
                className={`${styles.img} ${styles.imgOversize}`}
              />
              <div className={styles.label}>
                {cat0?.name?.toUpperCase() || "OVERSIZE TEE"}
              </div>
            </div>
            <div
              className={styles.card}
              onClick={() => router.push(`/products?categoryId=${cat1?.id}`)}
            >
              <Image
                src={cat1?.image || "/shirts.png"}
                alt={cat1?.name || ""}
                fill
                className={`${styles.img} ${styles.imgShirts}`}
              />
              <div className={styles.label}>
                {cat1?.name?.toUpperCase() || "SHIRTS"}
              </div>
            </div>
          </div>

          <div
            className={`${styles.card} ${styles.mobileNewArrival}`}
            onClick={() => router.push("/new-arrivals")}
          >
            <Image
              src="/new-arrival.png"
              alt="New Arrival"
              fill
              className={`${styles.img} ${styles.imgNewArrival}`}
            />
            <span className={styles.newBadge}>NEW</span>
            <div className={styles.label}>NEW ARRIVAL</div>
          </div>

          <div className={styles.cardrow}>
            <div
              className={styles.card}
              onClick={() => router.push(`/products?categoryId=${cat2?.id}`)}
            >
              <Image
                src={cat2?.image || "/half-sleeve.png"}
                alt={cat2?.name || ""}
                fill
                className={`${styles.img} ${styles.imgHalfSleeve}`}
              />
              <div className={styles.label}>
                {cat2?.name?.toUpperCase() || "HALF SLEEVE"}
              </div>
            </div>
            <div
              className={styles.card}
              onClick={() => router.push(`/products?categoryId=${cat3?.id}`)}
            >
              <Image
                src={cat3?.image || "/full-sleeve.png"}
                alt={cat3?.name || ""}
                fill
                className={`${styles.img} ${styles.imgFullSleeve}`}
              />
              <div className={styles.label}>
                {cat3?.name?.toUpperCase() || "FULL SLEEVE"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Tab ── */}
        <div className={styles.bottomTabContainer}>
          <div className={styles.footerTab}>
            <button
              onClick={() => router.push("/products")}
              className={styles.viewBtn}
            >
              VIEW ALL PRODUCTS
            </button>
            <div className={styles.curveLeftBottom} />
            <div className={styles.curveRightBottom} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collections;
