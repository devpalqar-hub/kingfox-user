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
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <span className={styles.rule} />
        <div className={styles.headerText}>
          <h2 className={styles.title}>Collections</h2>
          <p className={styles.subtitle}>Timeless Style. Oversized Comfort.</p>
        </div>
        <span className={styles.rule} />
      </div>

      {/* ── DESKTOP GRID ── */}
      <div className={styles.desktopGrid}>
        {/* LEFT COLUMN — cat0 + cat2 */}
        <div className={styles.col}>
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat0?.id}`)}
          >
            <Image
              src={cat0?.image || "/full-sleeve.png"}
              alt={cat0?.name || "Full Sleeve"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat0?.name?.toUpperCase() || "FULL SLEEVE"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>

          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat2?.id}`)}
          >
            <Image
              src={cat2?.image || "/half-sleeve.png"}
              alt={cat2?.name || "Half Sleeve"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat2?.name?.toUpperCase() || "HALF SLEEVE"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER — New Arrival (tall) */}
        <div
          className={`${styles.card} ${styles.newArrivalCard}`}
          onClick={() => router.push("/new-arrivals")}
        >
          <Image
            src="/new-arrival.png"
            alt="New Arrival"
            fill
            className={styles.img}
          />
          <span className={styles.newBadge}>NEW</span>
          <div className={styles.overlay}>
            <span className={styles.cardTitle}>
              NEW
              <br />
              ARRIVAL
            </span>
            <button className={styles.exploreBtn}>
              EXPLORE <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — cat1 + cat3 */}
        <div className={styles.col}>
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat1?.id}`)}
          >
            <Image
              src={cat1?.image || "/oversize.png"}
              alt={cat1?.name || "Oversize"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat1?.name?.toUpperCase() || "OVERSIZED T-SHIRT"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>

          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat3?.id}`)}
          >
            <Image
              src={cat3?.image || "/shirts.png"}
              alt={cat3?.name || "Shirts"}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat3?.name?.toUpperCase() || "SHIRTS"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE GRID ── */}
      <div className={styles.mobileGrid}>
        <div className={styles.mobileRow}>
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat0?.id}`)}
          >
            <Image
              src={cat0?.image || "/full-sleeve.png"}
              alt={cat0?.name || ""}
              fill
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat0?.name?.toUpperCase() || "FULL SLEEVE"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat1?.id}`)}
          >
            <Image
              src={cat1?.image || "/oversize.png"}
              alt={cat1?.name || ""}
              fill
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat1?.name?.toUpperCase() || "OVERSIZE TEE"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
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
            className={styles.img}
          />
          <span className={styles.newBadge}>NEW</span>
          <div className={styles.overlay}>
            <span className={styles.cardTitle}>NEW ARRIVAL</span>
            <button className={styles.exploreBtn}>
              EXPLORE <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>

        <div className={styles.mobileRow}>
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat2?.id}`)}
          >
            <Image
              src={cat2?.image || "/half-sleeve.png"}
              alt={cat2?.name || ""}
              fill
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat2?.name?.toUpperCase() || "HALF SLEEVE"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>
          <div
            className={styles.card}
            onClick={() => router.push(`/products?categoryId=${cat3?.id}`)}
          >
            <Image
              src={cat3?.image || "/shirts.png"}
              alt={cat3?.name || ""}
              fill
              className={styles.img}
            />
            <div className={styles.overlay}>
              <span className={styles.cardTitle}>
                {cat3?.name?.toUpperCase() || "SHIRTS"}
              </span>
              <button className={styles.exploreBtn}>
                EXPLORE <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div className={styles.footer}>
        <button
          className={styles.viewAllBtn}
          onClick={() => router.push("/products")}
        >
          VIEW ALL PRODUCTS <span className={styles.arrow}>→</span>
        </button>
      </div>
    </section>
  );
};

export default Collections;
