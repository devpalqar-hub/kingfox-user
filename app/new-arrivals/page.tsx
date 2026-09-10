"use client";
import React, { useCallback, useState, useEffect } from "react";
import styles from "./New-Arrivals.module.css";
import { LuLayers, LuShieldCheck, LuRuler } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { getProductPath } from "@/lib/product-path";
import LoginModal from "@/app/auth/login/page";
import {
  addToWishlist,
  removeFromWishlist,
  getWishList,
} from "@/services/wishlist.service";
import { getNewArrivals } from "@/services/product.service";
import { getAllCategories } from "@/services/category.service";
import { getReviewsByProductId } from "@/services/review.service";
import ProductCard from "@/components/productcard/productcard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton/ProductCardSkeleton";
import InfiniteScrollProducts from "@/components/InfiniteScrollProducts/InfiniteScrollProducts";

type ColorOption = {
  name: string;
  colorCode?: string | null;
};

const FIXED_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
  "7XL",
  "8XL",
  "9XL",
  "10XL",
  "11XL",
  "12XL",
];

const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  black: "#000000",
  white: "#ffffff",
  gray: "#6b7280",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
  brown: "#92400e",
  navy: "#1e3a8a",
  cyan: "#06b6d4",
  lime: "#84cc16",
  magenta: "#d946ef",
  "mist grey": "#bfc5c9",
  "military olive": "#556b2f",
  "mud olive": "#5b5b2b",
  "fluorescent green": "#39ff14",
};

const NewArrivals = () => {
  const { showToast } = useToast();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    "newly_arrived" | "low_to_high" | "high_to_low" | null
  >(null);

  const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
  const [availableCategories, setAvailableCategories] = useState<
    { id: number; name: string; isOnline?: boolean }[]
  >([]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [reviewMap, setReviewMap] = useState<any>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const getColorValue = (
    colorName?: string | null,
    colorCode?: string | null,
  ) => {
    const normalizedColorCode = colorCode?.trim();
    if (
      normalizedColorCode &&
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalizedColorCode)
    ) {
      return normalizedColorCode;
    }

    const normalizedColorName = colorName?.trim().toLowerCase();
    if (!normalizedColorName) {
      return "#d1d5db";
    }

    return colorMap[normalizedColorName] || normalizedColorName;
  };

  const getProductColorOptions = useCallback(
    (product: any): ColorOption[] => {
      const variantColorOptions =
        product.variants?.flatMap((variant: any) => {
          const name = variant.color?.trim();
          if (!name) {
            return [];
          }

          return [
            {
              name,
              colorCode: variant.colorCode,
            },
          ];
        }) || [];

      if (variantColorOptions.length > 0) {
        return Array.from(
          new Map(
            variantColorOptions.map((colorOption: ColorOption) => [
              colorOption.name.toLowerCase(),
              colorOption,
            ]),
          ).values(),
        ) as ColorOption[];
      }

      return (product.colors || []).map((name: string) => ({ name }));
    },
    [],
  );

  const getAvailableColorOptions = useCallback(
    (productList: any[]) =>
      Array.from(
        new Map(
          productList
            .flatMap((product) => getProductColorOptions(product))
            .map((colorOption) => [
              colorOption.name.toLowerCase(),
              colorOption,
            ]),
        ).values(),
      ) as ColorOption[],
    [getProductColorOptions],
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        const visibleCategories = (data || []).filter(
          (cat: { isOnline?: boolean }) => cat.isOnline === true,
        );
        setAvailableCategories(visibleCategories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getWishList();
        setWishlist(res.map((item: any) => item.productId));
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setWishlist([]);
          setIsLoginOpen(true);
        }
        console.error(err);
      }
    };
    fetchWishlist();
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
    setLoadMoreError(null);
  }, [size, color, minPrice, maxPrice, categoryId, sortBy]);

  // Fetch products (page 1 = full loading state, further pages = infinite scroll)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }
        setLoadMoreError(null);

        const data = await getNewArrivals({
          page,
          limit: 8,
          size: size || undefined,
          color: color || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 5000 ? maxPrice : undefined,
          categoryId: categoryId || undefined,
          sortBy: sortBy || undefined,
        });

        const items = data.items || [];

        if (page === 1) {
          setProducts(items);
        } else {
          setProducts((prev) => {
            const newItems = items.filter(
              (item: any) => !prev.some((p: any) => p.id === item.id),
            );
            return [...prev, ...newItems];
          });
        }

        setTotalProducts(data.pagination?.total || items.length);
      } catch (err) {
        console.error(err);
        if (page === 1) {
          showToast("Failed to load products", "error");
        } else {
          setLoadMoreError("Unable to load more products. Please try again.");
        }
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };

    loadProducts();
  }, [page, size, color, minPrice, maxPrice, categoryId, sortBy]);

  // Fetch ALL colours matching the current filters (independent of pagination/scroll
  // and of the selected colour itself) so every swatch is available up front.
  useEffect(() => {
    const loadAllColors = async () => {
      try {
        const data = await getNewArrivals({
          page: 1,
          limit: 1000,
          size: size || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 5000 ? maxPrice : undefined,
          categoryId: categoryId || undefined,
        });

        setAvailableColors(getAvailableColorOptions(data.items || []));
      } catch (err) {
        console.error(err);
      }
    };

    loadAllColors();
  }, [size, minPrice, maxPrice, categoryId, getAvailableColorOptions]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const map: any = {};
      await Promise.all(
        products.map(async (product: any) => {
          const res = await getReviewsByProductId(product.id);
          if (res) {
            map[product.id] = { rating: res.averageRating, total: res.total };
          }
        }),
      );
      setReviewMap(map);
    };
    if (products.length > 0) fetchReviews();
  }, [products]);

  const handleWishlist = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    if (wishlistLoading === id) return;
    setWishlistLoading(id);

    if (wishlist.includes(id)) {
      setWishlist((prev) => prev.filter((i) => i !== id));
      showToast("Removing from wishlist...", "info");
      try {
        await removeFromWishlist(id);
        showToast("Removed from wishlist", "info");
      } catch (err: any) {
        setWishlist((prev) => [...prev, id]);
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setIsLoginOpen(true);
        } else {
          showToast("Something went wrong", "error");
        }
      }
    } else {
      setWishlist((prev) => [...prev, id]);
      showToast("Adding to wishlist...", "info");
      try {
        await addToWishlist(id);
        showToast("Added to wishlist", "success");
      } catch (err: any) {
        setWishlist((prev) => prev.filter((i) => i !== id));
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setIsLoginOpen(true);
        } else {
          showToast("Something went wrong", "error");
        }
      }
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
    setWishlistLoading(null);
  };

  const handleClearFilters = () => {
    setSize(null);
    setColor(null);
    setMinPrice(0);
    setMaxPrice(5000);
    setCategoryId(null);
    setSortBy(null);
    setPage(1);
  };

  return (
    <>
      {/* ───── ORIGINAL HEADER — UNTOUCHED ───── */}
      <div className={styles.headerWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            NEW ARRIVALS:
            <br />
            BEYOND THE STANDARD
          </h1>
          <div className={styles.subtextContainer}>
            <span className={styles.greenLine}></span>
            <p className={styles.subtext}>AVAILABLE UP TO SIZE 12XL</p>
          </div>
        </header>
      </div>

      {/* ───── PRODUCTS SECTION (identical to Products page) ───── */}
      <section className={styles.pageWrapper}>
        {/* Mobile filter button */}
        <button
          className={styles.mobileFilterBtn}
          onClick={() => setFilterOpen(true)}
        >
          FILTERS
        </button>

        <div className={styles.container}>
          {/* SIDEBAR */}
          <aside
            className={`${styles.sidebar} ${filterOpen ? styles.open : ""}`}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setFilterOpen(false)}
            >
              ✕
            </button>

            {/* SORT */}
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
                      className={`${styles.sizeBtn} ${size === s ? styles.activeSize : ""}`}
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
                  {availableColors.map((colorOption) => (
                    <div
                      key={colorOption.name}
                      className={`${styles.colorItem} ${
                        color === colorOption.name ? styles.colorActive : ""
                      }`}
                      onClick={() => {
                        setColor((prev) =>
                          prev === colorOption.name ? null : colorOption.name,
                        );
                        setPage(1);
                      }}
                    >
                      <span
                        className={styles.colorInner}
                        style={{
                          backgroundColor: getColorValue(
                            colorOption.name,
                            colorOption.colorCode,
                          ),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* PRICE RANGE */}
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>PRICE RANGE</p>
                <div className={styles.sliderWrapper}>
                  <div className={styles.sliderTrack} />
                  <div
                    className={styles.sliderRange}
                    style={{
                      left: `${(minPrice / 5000) * 100}%`,
                      width: `${((maxPrice - minPrice) / 5000) * 100}%`,
                    }}
                  />
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
                <div className={styles.priceRangeLabels}>
                  <span>₹{minPrice}</span>
                  <span>₹{maxPrice}</span>
                </div>
              </div>

              {/* CATEGORY */}
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>CATEGORY</p>
                <div className={styles.categoryGrid}>
                  <div
                    className={`${styles.categoryPill} ${categoryId === null ? styles.categoryActive : ""}`}
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
                      className={`${styles.categoryPill} ${categoryId === cat.id ? styles.categoryActive : ""}`}
                      onClick={() => {
                        setCategoryId((prev) =>
                          prev === cat.id ? null : cat.id,
                        );
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

          {/* PRODUCT GRID */}
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
                    name={
                      product.onlineName?.trim()
                        ? product.onlineName
                        : product.name
                    }
                    price={String(
                      product.priceRange?.min ||
                        product.variants?.[0]?.sellingPrice ||
                        0,
                    )}
                    rating={reviewMap[product.id]?.rating ?? 0}
                    reviews={reviewMap[product.id]?.total ?? 0}
                    // colors={getProductColorOptions(product)}
                    image={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "/placeholder-product.png"
                    }
                    isWishlisted={wishlist.includes(product.id)}
                    onWishlistToggle={() => handleWishlist(product.id)}
                    wishlistLoading={wishlistLoading === product.id}
                  />
                ))
              )}
            </div>

            {/* PAGINATION */}
            {products.length > 0 && (
              <div className={styles.paginationArea}>
                <p className={styles.showingText}>
                  SHOWING {products.length} OF{" "}
                  {totalProducts || products.length} PRODUCTS
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
                <InfiniteScrollProducts
                  hasMore={products.length < totalProducts}
                  isLoading={isFetchingMore}
                  onLoadMore={() => setPage((prev) => prev + 1)}
                  error={loadMoreError}
                />
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
      </section>

      {/* ───── QUALITY SECTION — UNTOUCHED ───── */}
      {/* <section className={styles.qualitySection}>
        <div className={styles.qualityTextContent}>
          <h2 className={styles.qualityTitle}>STREETWEAR FOR EVERY BODY</h2>
          <p className={styles.qualityDescription}>
            Our premium 240 GSM fabric is engineered for durability and the
            perfect fit for larger silhouettes. We don't just upscale designs;
            we re-engineer them from the fiber up. No compromises on style, no
            matter the size.
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
              <p>Custom blocks up to 12XL.</p>
            </div>
          </div>
        </div>
        <div className={styles.qualityImageWrapper}>
          <img
            src="/qaulity.png"
            alt="Fabric Detail"
            className={styles.qualityImage}
          />
          <div className={styles.qualityBadge}>QUALITY FIRST</div>
        </div>
      </section> */}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default NewArrivals;
