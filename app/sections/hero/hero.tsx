"use client";
import React from 'react';
import Image from 'next/image';
import styles from './hero.module.css';
import { getAllCategories } from "@/services/category.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, RefreshCcw, ShieldCheck, Leaf, Headphones } from 'lucide-react';
const features = [
  { icon: <Truck size={18} strokeWidth={2} />, text: "FREE SHIPPING" },
  { icon: <RefreshCcw size={18} strokeWidth={2} />, text: <>EASY EXCHANGE <br/> IN 10 DAYS</> },
  { icon: <ShieldCheck size={18} strokeWidth={2} />, text: "SECURE PAYMENT" },
  { icon: <Leaf size={18} strokeWidth={2} />, text: "PREMIUM COTTON" },
  { icon: <Headphones size={18} strokeWidth={2} />, text: "ONLINE SUPPORT" },
];

const Hero = () => {
  const router = useRouter();
  type Category = {
  id: number;
  name: string;
};

const [categories, setCategories] = useState<Category[]>([]);
useEffect(() => {
  const loadCategories = async () => {
    const data = await getAllCategories();
    setCategories(data || []);
  };

  loadCategories();
}, []);

const oversizedCategory = categories.find((cat) =>
  cat.name.toLowerCase().includes("oversize")
);
const handleOversizedClick = () => {
  if (!oversizedCategory) return;

  router.push(`/products?categoryId=${oversizedCategory.id}`);
};

  return (
    <>
    <div className={styles.wrapper}>
    <section className={styles.heroContainer}>
      <div className={styles.content}>
        <span className={styles.badge}>FREE SHIPPING ACROSS INDIA</span>
        <h1 className={styles.title}>
          BUILT FOR <br /> THE <span className={styles.highlight}>STREETS</span> <br /> 
          WORN BY YOU
        </h1>
        <p className={styles.description}>
          High-quality oversized streetwear designed for the modern fit. 
          Premium cotton, breathable fabrics, and timeless designs.
        </p>
        <div className={styles.buttonGroup}>
          <button
            className={styles.primaryBtn}
            onClick={handleOversizedClick}
          >
            SHOP OVERSIZED TEES
          </button>
          <button className={styles.secondaryBtn}>CUSTOMIZE YOUR TEE</button>
        </div>
      </div>

      {/* IMAGE */}
        <div className={styles.imageWrapper}>

          {/* Desktop Image */}
          <Image
            src="/hero1.png"
            alt="Hero"
            fill
            priority
            className={`${styles.heroImage} ${styles.desktopImage}`}
          />

          {/* Mobile Image */}
          <Image
            src="/hero1.png"
            alt="Hero Mobile"
            fill
            priority
            className={`${styles.heroImage} ${styles.mobileImage}`}
          />

        </div>
    </section>
    {/* --- Features Bar --- */}
      <div className={styles.featuresBar}>
  <div className={styles.featuresTrack}>
    {features.map((item, index) => (
      <div key={index} className={styles.featureItem}>
        <span className={styles.featureIcon}>{item.icon}</span>
        <span className={styles.featureText}>{item.text}</span>
      </div>
    ))}

    {/* Duplicate only for scrolling effect */}
    <div className={styles.mobileDuplicate}>
      {features.map((item, index) => (
        <div key={"dup" + index} className={styles.featureItem}>
          <span className={styles.featureIcon}>{item.icon}</span>
          <span className={styles.featureText}>{item.text}</span>
        </div>
      ))}
    </div>
  </div>
</div>
      </div>
    </>
  );
};

export default Hero;