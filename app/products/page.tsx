'use client';
import React, { useState,useEffect } from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './Products.module.css';
import Link from 'next/link';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types/product';
import { getReviewsByProductId } from "@/services/review.service";
import { useSearchParams } from "next/navigation";
import { getColorsBySize } from "@/services/product.service";
import LoginModal from "@/app/auth/login/page";
import {
  getWishList,
  addToWishlist,
  removeFromWishlist
} from "@/services/wishlist.service";
const ProductsPage = () => {
const searchParams = useSearchParams();
const [products, setProducts] = useState<Product[]>([]);
const [totalProducts, setTotalProducts] = useState(0);
const [page, setPage] = useState(1);
const [color, setColor] = useState<string | null>(null);
const [size, setSize] = useState<string | null>(null);
const [minPrice, setMinPrice] = useState(100);
const [maxPrice, setMaxPrice] = useState(5000);
const [categoryId, setCategoryId] = useState<number | null>(null);
const [availableSizes, setAvailableSizes] = useState<string[]>([]);
const [availableCategories, setAvailableCategories] = useState<{id:number,name:string}[]>([]);
const [loading, setLoading] = useState(true);
const [sortBy, setSortBy] = useState<"newly_arrived" | "low_to_high" | "high_to_low" | null>(null);
const [filterOpen, setFilterOpen] = useState(false);
const [reviewMap, setReviewMap] = useState<any>({});
const [wishlist, setWishlist] = useState<number[]>([]);
const [availableColors, setAvailableColors] = useState<string[]>([]);
const [loadingColors, setLoadingColors] = useState(false);
const [initialized, setInitialized] = useState(false);
const [tag, setTag] = useState<string | null>(null);
const FIXED_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const [isLoginOpen, setIsLoginOpen] = useState(false);
const [prefillEmail, setPrefillEmail] = useState("");


// ✅ CORRECT PLACE (top level)
useEffect(() => {
  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await getWishList();
      const ids = res.map((item: any) => item.productId);
      setWishlist(ids);
    } catch (err) {
      console.error(err);
    }
  };

  fetchWishlist();
}, []);




const handleWishlist = async (id: number) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login");
    return;
  }

  try {
    if (wishlist.includes(id)) {
      await removeFromWishlist(id);
      setWishlist((prev) => prev.filter((i) => i !== id));
    } else {
      await addToWishlist(id);
      setWishlist((prev) => [...prev, id]);
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  const categoryFromURL = searchParams.get("categoryId");
  const tagFromURL = searchParams.get("tag");

  setCategoryId(categoryFromURL ? Number(categoryFromURL) : null);
  setTag(tagFromURL || null);

  setInitialized(true);
}, [searchParams]);


    useEffect(() => {
  setPage(1);
}, [categoryId, tag]);


 useEffect(() => {
  if (!initialized) return;

  const loadProducts = async () => {
  try {
    const data = await getProducts({
      page,
      limit: 8,
      size: size || undefined,
      color: color || undefined,
      minPrice: minPrice,
      maxPrice: maxPrice,
      categoryId: categoryId || undefined,  
      tags: tag ? [tag] : undefined,
      sortBy: sortBy || undefined,
    });

    if (page === 1) {
  setProducts(data.items); // replace
} else {
  setProducts((prev) => {
    const newItems = data.items.filter(
      (item: any) => !prev.some((p) => p.id === item.id)
    );
    return [...prev, ...newItems];
  });
}
    setTotalProducts(data.pagination.total);


    // ---------- Extract filters from API ----------


    const sizesSet = new Set<string>();
    const categoryMap = new Map<number,string>();

    data.items.forEach((product) => {

      product.sizes?.forEach((s) => sizesSet.add(s));

      if (product.category) {
        categoryMap.set(product.category.id, product.category.name);
      }

    });
    setAvailableSizes(Array.from(sizesSet));
    setAvailableCategories(
      Array.from(categoryMap, ([id,name]) => ({id,name}))
    );

  } catch (error) {
    console.error(error);
  }
};
  loadProducts();
}, [page, size, color, minPrice, maxPrice, categoryId, sortBy,initialized, tag]);

   // ✅ OUTSIDE loadProducts (top level)
useEffect(() => {
  const fetchColors = async () => {
    if (!size) {
      setAvailableColors([]);
      return;
    }

    try {
      const res = await getColorsBySize(size);
      setAvailableColors(res.colors || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchColors();
}, [size]);


  const handleClearFilters = () => {
    setSize(null);
    setColor(null);
    setMinPrice(100);
    setMaxPrice(5000);
    setCategoryId(null);
    setSortBy(null);
    setPage(1);
  };

  // reviews
  useEffect(() => {
  const fetchReviews = async () => {
    const map: any = {};

    await Promise.all(
      products.map(async (product: any) => {
        const res = await getReviewsByProductId(product.id);

        if (res) {
          map[product.id] = {
            rating: res.averageRating,
            total: res.total,
          };
        }
      })
    );
    setReviewMap(map);
  };

  if (products.length > 0) fetchReviews();
}, [products]);


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
            <select
              className={styles.sortSelect}
              value={sortBy || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSortBy(
                  value === ""
                    ? null
                    : (value as "newly_arrived" | "low_to_high" | "high_to_low")
                );
                setPage(1);
              }}
            >
              <option value="">Sort By</option>
              <option value="newly_arrived">New Arrival</option>
              <option value="low_to_high">Price: Low to High</option>
              <option value="high_to_low">Price: High to Low</option>
            </select>
          </div>

          <div className={styles.filterSection}>

            <h3 className={styles.filterHeader}>FILTERS</h3>

            {/* SIZE */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>SIZE</p>
              <div className={styles.sizeGrid}>
                {FIXED_SIZES.map((s) => (
                  <button
                    key={s}
                    className={`${styles.sizeBtn} ${
                      size === s ? styles.activeSize : ""
                    }`}
                    onClick={() => {
                      setSize((prev) => (prev === s ? null : s));
                      setColor(null); // ✅ IMPORTANT (reset color when size changes)
                      setPage(1);
                    }}
                  >
                    {s}
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
                      className={`${styles.colorCircle} ${
                        color === c ? styles.activeColor : ""
                      }`}
                      style={{ backgroundColor: c.toLowerCase() }}
                      onClick={() => {
                        setColor((prev) => (prev === c ? null : c));
                        setPage(1);
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>PRICE RANGE</p>

              <div className={styles.sliderWrapper}>
                
                {/* Background track */}
                <div className={styles.sliderTrack}></div>

                {/* Active selected range */}
                <div
                  className={styles.sliderRange}
                  style={{
                    left: `${(minPrice / 5000) * 100}%`,
                    width: `${((maxPrice - minPrice) / 5000) * 100}%`,
                  }}
                />

                {/* MIN */}
                {/* MIN */}
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value < maxPrice) {
                        setMinPrice(value);
                        setPage(1);
                      }
                    }}
                    className={styles.thumb}
                  />

                  {/* MAX */}
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > minPrice) {
                        setMaxPrice(value);
                        setPage(1);
                      }
                    }}
                    className={styles.thumb}
                  />
              </div>

              {/* Values */}
              <div className={styles.priceRangeLabels}>
                <span>₹{minPrice}</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>

            {/* FIT */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>CATEGORY</p>

              {availableCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`${styles.fitOption} ${
                    categoryId === cat.id ? styles.fitOptionActive : ""
                  }`}
                  onClick={() => {
                    setCategoryId((prev) => (prev === cat.id ? null : cat.id));
                    setPage(1);
                  }}
                >
                  {cat.name}
                </div>
              ))}

            </div>
            <button
              className={styles.clearBtn}
              onClick={handleClearFilters}
            >
              CLEAR FILTERS
            </button>
          </div>
        </aside>

        {/* PRODUCT AREA */}
        <main className={styles.mainContent}>
          <div className={styles.productGrid}>

            {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id} 
                  name={product.name}
                  price={String(product.priceRange?.min || 0)}
                  rating={reviewMap[product.id]?.rating ?? 0}
                  reviews={reviewMap[product.id]?.total ?? 0}
                  colors={product.colors}
                  image={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "/placeholder-product.png"
                  }
                  isWishlisted={wishlist.includes(product.id)}
                  onWishlistToggle={() => handleWishlist(product.id)}
                  isNew={false}
                />
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
            onSubmit={(e) => {
              e.preventDefault();

              const form = e.currentTarget;
              const email = form.email.value;

              setPrefillEmail(email);
              setIsLoginOpen(true);

              form.reset(); // ✅ CLEAR INPUT
            }}
          >
            <input
              name="email"   // 🔥 MUST ADD THIS
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
            />

            <button type="submit" className={styles.subscribeBtn}>
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
      <LoginModal
      isOpen={isLoginOpen}
      onClose={() => setIsLoginOpen(false)}
      prefillEmail={prefillEmail}
    />

    </section>
    
  );
};

export default ProductsPage;