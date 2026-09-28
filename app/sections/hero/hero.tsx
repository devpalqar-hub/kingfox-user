"use client";

/**
 * KING FOX — Diwali Hero
 * ──────────────────────────────────────────────────────────────────────────
 * Static, full-bleed campaign hero: the campaign photograph fills the
 * entire hero as a background, with the headline/CTAs overlaid on the left
 * over a soft gradient scrim for legibility. No scroll-driven animation —
 * everything is visible immediately on load.
 */

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Truck, PackageCheck, Crown } from "lucide-react";
import styles from "./hero.module.css";

const trustBadges = [
  { icon: <Truck size={20} strokeWidth={1.6} />, line1: "FREE SHIPPING", line2: "ACROSS INDIA" },
  { icon: <PackageCheck size={20} strokeWidth={1.6} />, line1: "EASY RETURNS", line2: "14 DAYS" },
  { icon: <Crown size={20} strokeWidth={1.6} />, line1: "SIZES UP TO", line2: "12XL" },
];

const Hero: React.FC = () => {
  const router = useRouter();

  const handleShopDiwaliClick = () => {
    router.push("/products?tag=DIWALI%20COLLECTION");
  };

  const handleExploreClick = () => {
    router.push("/products?categoryId=oversized");
  };

  return (
    <section className={styles.heroContainer}>
      {/* Full-bleed background photograph */}
      <div className={styles.imageWrap}>
        <Image
          src="/images/herobg.webp"
          alt="King Fox Diwali Collection"
          fill
          priority
          className={styles.heroImage}
          sizes="100vw"
        />
        {/* Gradient scrim for text legibility over the photo (left-weighted) */}
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      {/* Content overlay — headline, copy, CTAs, trust badges */}
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <p className={styles.eyebrow}>
            The Festival of Lights x Street Culture
            <span className={styles.eyebrowLine} aria-hidden="true" />
          </p>

          <h1 className={styles.title}>
            <span className={styles.titleLine}>STAY LOUD.</span>
            <span className={`${styles.titleLine} ${styles.titleAccent}`}>
              SHINE
            </span>
            <span className={`${styles.titleLine} ${styles.titleAccent}`}>
              BRIGHT.
            </span>
          </h1>

          <p className={styles.sub}>
            Level up your festive wardrobe with exclusive oversized drops,
            premium corduroys, and streetwear cut for royalty. Sizes up to
            12XL.
          </p>

          <div className={styles.btnGroup}>
            <button
              className={styles.shopBtn}
              onClick={handleShopDiwaliClick}
              aria-label="Shop the Diwali Drop"
            >
              SHOP THE DIWALI DROP&nbsp;
              <ArrowRight size={18} className={styles.btnArrow} />
            </button>

            <button
              className={styles.exploreBtn}
              onClick={handleExploreClick}
              aria-label="Explore oversized tees"
            >
              EXPLORE OVERSIZED TEES
            </button>
          </div>

          <div className={styles.badgeRow}>
            {trustBadges.map((b, i) => (
              <div className={styles.badgeItem} key={i}>
                <span className={styles.badgeIcon}>{b.icon}</span>
                <span className={styles.badgeText}>
                  {b.line1}
                  <br />
                  {b.line2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
