'use client';
import React, { useState } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './Products.module.css';
import Link from 'next/link';

const PRODUCTS_DATA = Array.from({ length: 12 }).map((_, index) => ({
  id: index + 1,
  name: "Phantom Boxy Tee",
  price: "1,499",
  rating: 4,
  reviews: 42,
  colors: ["#c4ff00", "#777", "#000"],
  image: "/product1.png",
  isNew: index < 4
}));

const ProductsPage = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <section className={styles.pageWrapper}>

      {/* MOBILE FILTER BUTTON */}
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setFilterOpen(true)}
      >
        FILTERS
      </button>

      <div className={styles.container}>
        
        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${filterOpen ? styles.open : ''}`}>
          
          <button
            className={styles.closeBtn}
            onClick={() => setFilterOpen(false)}
          >
            ✕
          </button>

          <div className={styles.sortBox}>
            <select className={styles.sortSelect}>
              <option>Sort by: New Arrival</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className={styles.filterSection}>

            <h3 className={styles.filterHeader}>FILTERS</h3>

            {/* SIZE */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>SIZE</p>
              <div className={styles.sizeGrid}>
                {['S','M','L','XL','XXL','3XL','4XL','5XL','6XL','7XL','8XL','9XL'].map(size => (
                  <button
                    key={size}
                    className={size === '7XL' ? styles.sizeBtnActive : styles.sizeBtn}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>COLOR</p>
              <div className={styles.colorRow}>
                {['#000','#D1D5DB','#374151','#064E3B','#991B1B','#FFF'].map((color, i) => (
                  <span
                    key={i}
                    className={styles.colorCircle}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>PRICE RANGE</p>
              <input
                type="range"
                className={styles.rangeInput}
                min="499"
                max="2999"
              />
              <div className={styles.priceRangeLabels}>
                <span>₹499</span>
                <span>₹2,999</span>
              </div>
            </div>

            {/* FIT */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>FIT</p>

              <div className={styles.fitOptionActive}>
                <span className={styles.checkIcon}>✓</span>
                <span>Oversized</span>
              </div>

              <div className={styles.fitOption}>
                <span className={styles.circle}></span>
                <span>Boxy</span>
              </div>

              <div className={styles.fitOption}>
                <span className={styles.circle}></span>
                <span>Relaxed</span>
              </div>

            </div>
          </div>
        </aside>

        {/* PRODUCT AREA */}
        <main className={styles.mainContent}>
          <div className={styles.productGrid}>

            {PRODUCTS_DATA.map((product) => (
              <Link key={product.id} href="/products/productdetails">
                <ProductCard
                  name={product.name}
                  price={product.price}
                  rating={product.rating}
                  reviews={product.reviews}
                  colors={product.colors}
                  image={product.image}
                  isNew={product.isNew}
                />
              </Link>
            ))}

          </div>

          {/* PAGINATION */}
          <div className={styles.paginationArea}>
            <p className={styles.showingText}>
              SHOWING 8 OF 124 PRODUCTS
            </p>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: '40%' }}
              />
            </div>

            <button className={styles.loadMoreBtn}>
              LOAD MORE PRODUCTS
            </button>

          </div>
        </main>

      </div>

      {/* OVERLAY */}
      {filterOpen && (
        <div
          className={styles.overlay}
          onClick={() => setFilterOpen(false)}
        />
      )}

      {/* NEWSLETTER */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>

          <h2 className={styles.newsletterTitle}>
            JOIN THE FOX PACK
          </h2>

          <p className={styles.newsletterSubtitle}>
            Get exclusive access to underground drops, private events,
            and 15% off your first order.
          </p>

          <form
            className={styles.newsletterForm}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
            />

            <button
              type="submit"
              className={styles.subscribeBtn}
            >
              SUBSCRIBE
            </button>

          </form>

        </div>
      </div>

    </section>
  );
};

export default ProductsPage;