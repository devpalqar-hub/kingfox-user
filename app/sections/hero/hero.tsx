"use client";

/**
 * KING FOX — Diwali Hero
 * ──────────────────────────────────────────────────────────────────────────
 * Static, full-bleed campaign hero: background photograph with a left-aligned
 * headline/CTA block overlaid on a dark gradient scrim for legibility. No
 * scroll-driven animation — everything is visible immediately on load,
 * matching the approved reference composition.
 */

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import styles from "./hero.module.css";

/**
 * A handful of small firework bursts, placed in the sky area of the hero
 * photo. Pure CSS keyframes (no rAF/JS loop) — each burst plays once on
 * mount with a staggered delay, then stays gone. `prefers-reduced-motion`
 * is handled entirely in CSS (the whole layer is hidden via media query),
 * so no JS branching is needed here.
 */
const FIREWORK_BURSTS = [
  { top: "14%", left: "22%", delay: "0.2s", scale: 0.8 },
  { top: "10%", left: "62%", delay: "0.9s", scale: 1 },
  { top: "20%", left: "80%", delay: "1.6s", scale: 0.65 },
  { top: "8%", left: "40%", delay: "2.3s", scale: 0.7 },
];

const PARTICLE_ANGLES = Array.from({ length: 12 }, (_, i) => (360 / 12) * i);

const FireworksLayer: React.FC = () => (
  <div className={styles.fireworksLayer} aria-hidden="true">
    {FIREWORK_BURSTS.map((burst, i) => (
      <span
        key={i}
        className={styles.fireworkBurst}
        style={
          {
            top: burst.top,
            left: burst.left,
            "--fw-delay": burst.delay,
            "--burst-scale": burst.scale,
          } as React.CSSProperties
        }
      >
        {PARTICLE_ANGLES.map((angle, j) => (
          <span
            key={j}
            className={styles.fireworkParticle}
            style={{ "--angle": `${angle}deg` } as React.CSSProperties}
          />
        ))}
      </span>
    ))}
  </div>
);

const Hero: React.FC = () => {
  const router = useRouter();

  const handleShopDiwaliClick = () => {
    router.push("/products?tag=DIWALI%20COLLECTION");
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
        {/* Dark gradient scrim for text legibility over the photo */}
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      {/* Small firework bursts that play once on load */}
      <FireworksLayer />
      {/* Content overlay */}
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <p className={styles.eyebrow}>
            Traditions fit different here
          </p>

          <div className={styles.eyebrowDivider} aria-hidden="true" />

          <h1 className={styles.title}>
            <span className={styles.titleLine}>SAME</span>
            <span className={styles.titleLine}>SPIRIT</span>
            <span className={`${styles.titleLine} ${styles.titleAccentLine}`}>
              BRIGHTER
            </span>
            <span className={styles.titleScript}>Diwali</span>
          </h1>

          <p className={styles.sub}>
            Festive fits for every story. Premium fabrics, relaxed
            silhouettes and sizes up to 12XL.
          </p>

          <div className={styles.btnGroup}>
            <button
              className={styles.shopBtn}
              onClick={handleShopDiwaliClick}
              aria-label="Shop the Diwali Drop"
            >
              SHOP DIWALI DROP&nbsp;
              <ArrowRight size={18} className={styles.btnArrow} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
