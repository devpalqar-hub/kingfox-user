"use client";

/**
 * KING FOX — Diwali Hero
 * ──────────────────────────────────────────────────────────────────────────
 * Static, full-bleed campaign hero: the campaign photograph fills the
 * entire hero as a background, with the headline/CTAs overlaid on the left
 * over a soft gradient scrim for legibility. No scroll-driven animation —
 * everything is visible immediately on load.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Truck, PackageCheck, Crown } from "lucide-react";
import styles from "./hero.module.css";

const trustBadges = [
  { icon: <Truck size={20} strokeWidth={1.6} />, line1: "FREE SHIPPING", line2: "ACROSS INDIA" },
  { icon: <PackageCheck size={20} strokeWidth={1.6} />, line1: "EASY RETURNS", line2: "14 DAYS" },
  { icon: <Crown size={20} strokeWidth={1.6} />, line1: "SIZES UP TO", line2: "12XL" },
];

const CRACKER_COLORS = ["#e8a93a", "#f2c565", "#ff6b4a", "#f5ead9", "#c9821e"];
const CRACKER_PARTICLES = 24;
const AUTO_BURST_WINDOW_MS = 3000;

interface Particle {
  dx: number;
  dy: number;
  size: number;
  delay: number;
  color: string;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

function makeParticles(): Particle[] {
  return Array.from({ length: CRACKER_PARTICLES }, (_, i) => {
    const angle = (360 / CRACKER_PARTICLES) * i + (Math.random() * 14 - 7);
    const distance = 70 + Math.random() * 90;
    return {
      dx: Math.cos((angle * Math.PI) / 180) * distance,
      dy: Math.sin((angle * Math.PI) / 180) * distance,
      size: 4 + Math.random() * 5,
      delay: Math.round(Math.random() * 60) / 1000,
      color: CRACKER_COLORS[Math.floor(Math.random() * CRACKER_COLORS.length)],
    };
  });
}

const Hero: React.FC = () => {
  const router = useRouter();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);
  const heroRef = useRef<HTMLElement>(null);

  const spawnBurst = useCallback((x: number, y: number) => {
    const id = burstIdRef.current++;
    setBursts((prev) => [...prev, { id, x, y, particles: makeParticles() }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1100);
  }, []);

  // Fire random cracker bursts across the hero for the first 3s after load.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const startedAt = Date.now();
    let timeoutId: number;

    const fire = () => {
      const rect = el.getBoundingClientRect();
      spawnBurst(
        rect.width * (0.1 + Math.random() * 0.8),
        rect.height * (0.1 + Math.random() * 0.7)
      );

      if (Date.now() - startedAt < AUTO_BURST_WINDOW_MS) {
        timeoutId = window.setTimeout(fire, 350 + Math.random() * 350);
      }
    };

    timeoutId = window.setTimeout(fire, 200);

    return () => window.clearTimeout(timeoutId);
  }, [spawnBurst]);

  const handleShopDiwaliClick = () => {
    router.push("/#graphic-collections");
  };

  const handleExploreClick = () => {
    router.push("/products?categoryId=oversized");
  };

  const handleHeroClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top);
    },
    [spawnBurst]
  );

  return (
    <section
      className={styles.heroContainer}
      onClick={handleHeroClick}
      ref={heroRef}
    >
      {/* Cracker bursts — auto-fire on load, then replay on click */}
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className={styles.burstLayer}
          style={{ top: burst.y, left: burst.x }}
          aria-hidden="true"
        >
          <span className={styles.burstFlash} />
          {burst.particles.map((p, i) => (
            <span
              key={i}
              className={styles.burstParticle}
              style={
                {
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  boxShadow: `0 0 6px 1px ${p.color}`,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}

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
              aria-label="Shop exclusive collection"
            >
              SHOP EXCLUSIVE COLLECTION&nbsp;
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
