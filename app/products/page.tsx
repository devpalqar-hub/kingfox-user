'use client';
import React, { useState,useEffect } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './Products.module.css';
import Link from 'next/link';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types/product';


Link
const ProductsPage = () => {
const [products, setProducts] = useState<Product[]>([]);
const [totalProducts, setTotalProducts] = useState(0);
const [page, setPage] = useState(1);
const [color, setColor] = useState<string>();
const [size, setSize] = useState<string>();
const [minPrice, setMinPrice] = useState<number>();
const [maxPrice, setMaxPrice] = useState<number>();
const [categoryId, setCategoryId] = useState<number>();
const [availableColors, setAvailableColors] = useState<string[]>([]);
const [availableSizes, setAvailableSizes] = useState<string[]>([]);
const [availableCategories, setAvailableCategories] = useState<{id:number,name:string}[]>([]);
const [loading, setLoading] = useState(true);
const [filterOpen, setFilterOpen] = useState(false);


 useEffect(() => {
  const loadProducts = async () => {
  try {
    const data = await getProducts({
      page,
      limit: 8,
      size,
      color,
      minPrice,
      maxPrice,
      categoryId
    });

    if (page === 1) {
      setProducts(data.items);
    } else {
      setProducts((prev) => [...prev, ...data.items]);
    }

    setTotalProducts(data.pagination.total);

    // ---------- Extract filters from API ----------
    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();
    const categoryMap = new Map<number,string>();

    data.items.forEach((product) => {

      product.colors?.forEach((c) => colorsSet.add(c));

      product.sizes?.forEach((s) => sizesSet.add(s));

      if (product.category) {
        categoryMap.set(product.category.id, product.category.name);
      }

    });

    setAvailableColors(Array.from(colorsSet));
    setAvailableSizes(Array.from(sizesSet));
    setAvailableCategories(
      Array.from(categoryMap, ([id,name]) => ({id,name}))
    );

  } catch (error) {
    console.error(error);
  }
};
  loadProducts();
}, [page, size,color, minPrice, maxPrice, categoryId]);
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
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={styles.sizeBtn}
                    onClick={() => {
                      setSize(size);
                      setPage(1);
                    }}
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
                {availableColors.map((c) => (
                    <span
                      key={c}
                      className={styles.colorCircle}
                      style={{ backgroundColor: c.toLowerCase() }}
                      onClick={() => {
                        setColor(c);
                        setPage(1);
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>PRICE RANGE</p>
              <input
                type="range"
                min="100"
                max="5000"
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
              />
              <div className={styles.priceRangeLabels}>
                <span>₹499</span>
                <span>₹2,999</span>
              </div>
            </div>

            {/* FIT */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>CATEGORY</p>

              {availableCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={styles.fitOption}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setPage(1);
                  }}
                >
                  {cat.name}
                </div>
              ))}

            </div>
          </div>
        </aside>

        {/* PRODUCT AREA */}
        <main className={styles.mainContent}>
          <div className={styles.productGrid}>

            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <ProductCard
                  id={product.id} 
                  name={product.name}
                  price={String(product.priceRange?.min || 0)}
                  rating={4}
                  reviews={product.variantCount}
                  colors={product.colors}
                  image={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "/placeholder-product.png"
                  }
                  isNew={false}
                />
              </Link>
            ))}

          </div>

          {/* PAGINATION */}
          {products.length > 0 && (
            <div className={styles.paginationArea}>

              <p className={styles.showingText}>
                SHOWING {products.length} OF {totalProducts || products.length} PRODUCTS
              </p>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: totalProducts
                      ? `${(products.length / totalProducts) * 100}%`
                      : "0%"
                  }}
                />
              </div>

              {products.length < totalProducts && (
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  LOAD MORE PRODUCTS
                </button>
              )}

            </div>
          )}
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