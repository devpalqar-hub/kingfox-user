"use client";
import React from "react";
import Image from "next/image";
import styles from "./hero.module.css";
import { getAllCategories } from "@/services/category.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  RefreshCcw,
  ShieldCheck,
  Leaf,
  Headphones,
  Shirt,
  Layers,
  Tag,
} from "lucide-react";

/* ── Bottom scrolling features bar ── */
const barFeatures = [
  { icon: <Truck size={17} strokeWidth={2} />, text: "FREE SHIPPING" },
  {
    icon: <RefreshCcw size={17} strokeWidth={2} />,
    text: <>EASY EXCHANGE IN 10 DAYS</>,
  },
  { icon: <ShieldCheck size={17} strokeWidth={2} />, text: "SECURE PAYMENT" },
  { icon: <Leaf size={17} strokeWidth={2} />, text: "PREMIUM COTTON" },
  { icon: <Headphones size={17} strokeWidth={2} />, text: "ONLINE SUPPORT" },
];

/* ── Inline trust icons (left panel bottom) ── */
const inlineFeatures = [
  {
    icon: <Shirt size={26} strokeWidth={1.4} />,
    line1: "OVERSIZED",
    line2: "FIT",
  },
  {
    icon: <Layers size={26} strokeWidth={1.4} />,
    line1: "PREMIUM",
    line2: "FABRIC",
  },
  {
    icon: <Tag size={26} strokeWidth={1.4} />,
    line1: "MINIMAL",
    line2: "DESIGN",
  },
];

const Hero = () => {
  const router = useRouter();

  type Category = { id: number; name: string };
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories();
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const handleCustomizeClick = () => {
    const section = document.getElementById("designing-section");
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ── MAIN HERO ── */}
      <section className={styles.heroContainer}>
        {/* LEFT — white content panel */}
        <div className={styles.leftPanel}>
          <p className={styles.eyebrow}>OVERSIZED FIT. MAXIMUM COMFORT.</p>

          <h1 className={styles.title}>
            OVERSIZED
            <br />
            T&#8209;SHIRTS
            <br />
            &amp; PANTS
          </h1>

          <div className={styles.rule} />

          <p className={styles.sub}>BUILT FOR COMFORT. STYLED FOR EVERYDAY.</p>

          <div className={styles.btnGroup}>
            <button
              className={styles.shopBtn}
              onClick={() => router.push("/products")}
            >
              SHOP NOW &nbsp;&rarr;
            </button>
            <button
              className={styles.customizeBtn}
              onClick={handleCustomizeClick}
            >
              CUSTOMIZE YOUR TEE
            </button>
          </div>

          {/* Inline feature icons */}
          <div className={styles.inlineFeatures}>
            {inlineFeatures.map((f, i) => (
              <div key={i} className={styles.inlineFeatureItem}>
                <span className={styles.inlineIcon}>{f.icon}</span>
                <span className={styles.inlineText}>
                  {f.line1}
                  <br />
                  {f.line2}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — split B&W panel with models */}
        <div className={styles.rightPanel}>
          <div className={styles.halfLight} />
          <div className={styles.halfDark} />

          <div className={styles.modelsImageWrapper}>
            <Image
              src="/hero-models.png"
              alt="Oversized streetwear — two models"
              fill
              priority
              className={styles.modelsImage}
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>

          {/* Vertical brand tagline — far right edge */}
          <div className={styles.verticalTagline}>
            <span>SIMPLE</span>
            <span className={styles.vdot}>&middot;</span>
            <span>CLEAN</span>
            <span className={styles.vdot}>&middot;</span>
            <span>TIMELESS</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <div className={styles.featuresBar}>
        <div className={styles.featuresTrack}>
          {barFeatures.map((item, i) => (
            <div key={i} className={styles.featureItem}>
              <span className={styles.featureIcon}>{item.icon}</span>
              <span className={styles.featureText}>{item.text}</span>
            </div>
          ))}
          <div className={styles.mobileDuplicate}>
            {barFeatures.map((item, i) => (
              <div key={"d" + i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{item.icon}</span>
                <span className={styles.featureText}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
