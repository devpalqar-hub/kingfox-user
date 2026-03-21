'use client';
import React, { useState } from 'react';
import styles from './New-Arrivals.module.css';
import { LuHeart, LuEye, LuLayers, LuShieldCheck, LuRuler } from "react-icons/lu";
const NewArrivals = () => {
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '8XL', '10XL'];
  const inStockSizes = ['5XL', '6XL', '8XL', '10XL'];
  
  const products = [
    { id: 1, name: 'OVERSIZED HEAVY TEE', price: '₹1,499', image: '/hero1.png' },
    { id: 2, name: 'URBAN CARGO PANTS', price: '₹1,499', image: '/newarrival2.png' },
    { id: 3, name: 'URBAN CARGO PANTS', price: '₹1,499', image: '/newarrival2.png' },
    { id: 4, name: 'BOXY FIT JACKET', price: '₹1,499', image: '/newarrival2.png' },
    { id: 5, name: 'BOXY FIT JACKET', price: '₹1,499', image: '/newarrival2.png' },
    { id: 6, name: 'BOXY FIT JACKET', price: '₹1,499', image: '/newarrival2.png' },
  ];
  const [filterOpen, setFilterOpen] = useState(false);
  

  return (
    <>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>NEW ARRIVALS:<br />BEYOND THE STANDARD</h1>
        <div className={styles.subtextContainer}>
          <span className={styles.greenLine}></span>
          <p className={styles.subtext}>AVAILABLE UP TO SIZE 10XL</p>
        </div>
      </header>
      {/* ⭐ MOBILE FILTER BUTTON — EXACT POSITION */}
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setFilterOpen(true)}
      >
        FILTERS
      </button>

      <div className={styles.mainContent}>
        <aside className={`${styles.sidebar} ${filterOpen ? styles.open : ''}`}>
          <button
              className={styles.closeBtn}
              onClick={() => setFilterOpen(false)}
            >
              ✕
            </button>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>SIZE FILTER</h3>
            <div className={styles.sizeGrid}>
              {sizes.map((size) => {
                const isInStock = inStockSizes.includes(size);
                const isSelected = size === '10XL';
                return (
                  <button 
                    key={size} 
                    className={`${styles.sizeBtn} ${isInStock ? styles.inStock : ''} ${isSelected ? styles.active : ''}`}
                  >
                    <span className={styles.sizeLabel}>{size}</span>
                    {isInStock && <span className={styles.stockLabel}>IN STOCK</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>CATEGORY</h3>
            <div className={styles.categoryList}>
              <label className={styles.checkboxLabel}><input type="checkbox" /> Oversized Tees</label>
              <label className={styles.checkboxLabel}><input type="checkbox" /> Heavy Hoodies</label>
              <label className={styles.checkboxLabel}><input type="checkbox" /> Cargo Pants</label>
            </div>
          </div>
        </aside>

        <section className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <img src={product.image} alt={product.name} />
                <div className={styles.iconActions}>
                   <button className={styles.iconBtn}>♡</button>
                   <button className={styles.iconBtn}>👁</button>
                </div>
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{product.name}</h4>
                <p className={styles.price}>{product.price}</p>
                <p className={styles.inclusiveText}>INCLUSIVE SIZING (UP TO 10XL)</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
    {filterOpen && (
  <div
    className={styles.overlay}
    onClick={() => setFilterOpen(false)}
  />
)}


     {/* --- Section 2: Streetwear Info (Exact Match to Image) --- */}

<section className={styles.qualitySection}>
  <div className={styles.qualityTextContent}>
    <h2 className={styles.qualityTitle}>STREETWEAR FOR EVERY BODY</h2>
    <p className={styles.qualityDescription}>
      Our premium 240 GSM fabric is engineered for durability and the 
      perfect fit for larger silhouettes. We don't just upscale designs; 
      we re-engineer them from the fiber up. No compromises on style, 
      no matter the size.
    </p>

    <div className={styles.featureGrid}>
      <div className={styles.featureCard}>
        <LuLayers className={styles.featureIcon} />
        <h4>240 GSM</h4>
        <p>Heavyweight cotton that holds shape.</p>
      </div>
      <div className={styles.featureCard}>
        <LuShieldCheck className={styles.featureIcon} />
        <h4>REINFORCED</h4>
        <p>Double-stitched seams for longevity.</p>
      </div>
      <div className={styles.featureCard}>
        <LuRuler className={styles.featureIcon} />
        <h4>PRO FIT</h4>
        <p>Custom blocks up to 10XL.</p>
      </div>
    </div>
  </div>

  <div className={styles.qualityImageWrapper}>
    <img src="/qaulity.png" alt="Fabric Detail" className={styles.qualityImage} />
    <div className={styles.qualityBadge}>QUALITY FIRST</div>
  </div>
</section>
    </>
  );
};

export default NewArrivals;