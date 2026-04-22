"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/productcard/productcard";
import styles from "./Products.module.css";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import { getReviewsByProductId } from "@/services/review.service";
import { useSearchParams } from "next/navigation";
import { getColorsBySize } from "@/services/product.service";
import LoginModal from "@/app/auth/login/page";
import {
  getWishList,
  addToWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";
import { useToast } from "@/context/ToastContext";
import ProductCardSkeleton from "@/components/ProductCardSkeleton/ProductCardSkeleton";
import { getAllCategories } from "@/services/category.service";
const ProductsPage = () => {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [sortBy, setSortBy] = useState<
    "newly_arrived" | "low_to_high" | "high_to_low" | null
  >(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [reviewMap, setReviewMap] = useState<any>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null); // id of loading item
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const FIXED_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setAvailableCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await getWishList();
        const ids = res.map((item: any) => item.productId);
        setWishlist(ids);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setWishlist([]);
          setIsLoginOpen(true);
          return;
        }

        console.error(err);
      }
    };

    fetchWishlist();
  }, []);

  const handleWishlist = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    // Prevent duplicate clicks
    if (wishlistLoading === id) return;
    setWishlistLoading(id);
    // Optimistic update
    let rollback = false;
    if (wishlist.includes(id)) {
      setWishlist((prev) => prev.filter((i) => i !== id));
      showToast("Removing from wishlist...", "info");
      try {
        await removeFromWishlist(id);
        showToast("Removed from wishlist", "info");
      } catch (err: any) {
        setWishlist((prev) => [...prev, id]); // rollback
        rollback = true;
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setIsLoginOpen(true);
          setWishlistLoading(null);
          return;
        }
        showToast("Something went wrong", "error");
      }
    } else {
      setWishlist((prev) => [...prev, id]);
      showToast("Adding to wishlist...", "info");
      try {
        await addToWishlist(id);
        showToast("Added to wishlist", "success");
      } catch (err: any) {
        setWishlist((prev) => prev.filter((i) => i !== id)); // rollback
        rollback = true;
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setIsLoginOpen(true);
          setWishlistLoading(null);
          return;
        }
        showToast("Something went wrong", "error");
      }
    }
    window.dispatchEvent(new Event("wishlistUpdated"));
    setWishlistLoading(null);
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
        setLoading(true);

        const data = await getProducts({
          page,
          limit: 8,
          size: size || undefined,
          color: color || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 5000 ? maxPrice : undefined,
          categoryId: categoryId || undefined,
          tags: tag ? [tag] : undefined,
          sortBy: sortBy || undefined,
        });

        if (page === 1) {
          setProducts(data.items);
        } else {
          setProducts((prev) => {
            const newItems = data.items.filter(
              (item: any) => !prev.some((p) => p.id === item.id),
            );
            return [...prev, ...newItems];
          });
        }

        setTotalProducts(data.pagination.total);

        const sizesSet = new Set<string>();

        data.items.forEach((product) => {
          product.sizes?.forEach((s) => sizesSet.add(s));

        });

        setAvailableSizes(Array.from(sizesSet));

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [
    page,
    size,
    color,
    minPrice,
    maxPrice,
    categoryId,
    sortBy,
    initialized,
    tag,
  ]);

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
    setMinPrice(0);
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
        }),
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
        <aside className={`${styles.sidebar} ${filterOpen ? styles.open : ""}`}>
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
                    : (value as
                        | "newly_arrived"
                        | "low_to_high"
                        | "high_to_low"),
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
                      setColor(null);
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

              <div className={styles.colorGrid}>
                {availableColors.map((c) => (
                  <div
                    key={c}
                    className={`${styles.colorItem} ${
                      color === c ? styles.colorActive : ""
                    }`}
                    onClick={() => {
                      setColor((prev) => (prev === c ? null : c));
                      setPage(1);
                    }}
                  >
                    <span
                      className={styles.colorInner}
                      style={{ backgroundColor: c.toLowerCase() }}
                    />
                  </div>
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
                  min="0"
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
                  min="0"
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

              <div className={styles.categoryGrid}>
                {/* ALL */}
                <div
                  className={`${styles.categoryPill} ${
                    categoryId === null ? styles.categoryActive : ""
                  }`}
                  onClick={() => {
                    setCategoryId(null);
                    setPage(1);
                  }}
                >
                  All
                </div>

                {availableCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`${styles.categoryPill} ${
                      categoryId === cat.id ? styles.categoryActive : ""
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
            </div>
            <button className={styles.clearBtn} onClick={handleClearFilters}>
              CLEAR FILTERS
            </button>
          </div>
        </aside>

        {/* PRODUCT AREA */}
        <main className={styles.mainContent}>
          <div className={styles.productGrid}>
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : products.length === 0 ? (
                <div className={styles.noProductsWrapper}>
                  <div className={styles.noProductsIcon}>🛍️</div>
                  <h3>No products found</h3>
                  <p>Try adjusting filters or explore new arrivals</p>
                </div>
              ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
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
                  wishlistLoading={wishlistLoading === product.id}
                  // isNew removed: not present on Product type
                />
              ))
            )}
          </div>

          {/* PAGINATION */}
          {products.length > 0 && (
            <div className={styles.paginationArea}>
              <p className={styles.showingText}>
                SHOWING {products.length} OF {totalProducts || products.length}{" "}
                PRODUCTS
              </p>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: totalProducts
                      ? `${(products.length / totalProducts) * 100}%`
                      : "0%",
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
        <div className={styles.overlay} onClick={() => setFilterOpen(false)} />
      )}

      {/* NEWSLETTER */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>JOIN THE FOX PACK</h2>

          <p className={styles.newsletterSubtitle}>
            Follow us on Instagram for exclusive drops, early access & special
            offers
          </p>

          <button
            className={styles.subscribeBtn}
            onClick={() =>
              window.open(
                "https://www.instagram.com/kingfoxclothingstore/",
                "_blank",
              )
            }
          >
            FOLLOW US ON INSTAGRAM
          </button>
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
