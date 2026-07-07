"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import LoginModal from "@/app/auth/login/page";
import InfiniteScrollProducts from "@/components/InfiniteScrollProducts/InfiniteScrollProducts";
import ProductCardSkeleton from "@/components/ProductCardSkeleton/ProductCardSkeleton";
import ProductCard from "@/components/productcard/productcard";
import { useToast } from "@/context/ToastContext";
import { getAllCategories } from "@/services/category.service";
import { getProducts } from "@/services/product.service";
import { getReviewsByProductId } from "@/services/review.service";
import {
  addToWishlist,
  getWishList,
  removeFromWishlist,
} from "@/services/wishlist.service";
import { Product, ProductResponse } from "@/types/product";

import styles from "./Products.module.css";

type ColorOption = {
  name: string;
  colorCode?: string | null;
};

type SortOption = "newly_arrived" | "low_to_high" | "high_to_low" | null;

type ProductsPageProps = {
  initialData: ProductResponse;
};

const PRODUCTS_LIMIT = 8;
const DEFAULT_MAX_PRICE = 5000;
const INITIAL_PAGE = 1;
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

const dedupeProducts = (items: Product[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

const getPageSizes = (productList: Product[]) => {
  const sizesSet = new Set<string>();

  productList.forEach((product) => {
    product.sizes?.forEach((entry) => sizesSet.add(entry));
  });

  return Array.from(sizesSet);
};

const ProductsPage = ({ initialData }: ProductsPageProps) => {
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(() =>
    dedupeProducts(initialData.items || []),
  );
  const [totalProducts, setTotalProducts] = useState(
    initialData.pagination.total || 0,
  );
  const [page, setPage] = useState(INITIAL_PAGE);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>(() =>
    getPageSizes(initialData.items || []),
  );
  const [availableCategories, setAvailableCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [sortBy, setSortBy] = useState<SortOption>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [reviewMap, setReviewMap] = useState<Record<number, any>>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);
  const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");
  const [loading, setLoading] = useState(initialData.items.length === 0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const initialQueryAppliedRef = useRef(false);
  const initialDataConsumedRef = useRef(false);
  const activeRequestKeyRef = useRef<string | null>(null);

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

  const getProductColorOptions = useCallback((product: Product): ColorOption[] => {
    const variantColorOptions =
      product.variants?.flatMap((variant) => {
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
          variantColorOptions.map((colorOption) => [
            colorOption.name.toLowerCase(),
            colorOption,
          ]),
        ).values(),
      );
    }

    return (product.colors || []).map((name) => ({ name }));
  }, []);

  const getAvailableColorOptions = useCallback(
    (productList: Product[]) =>
      Array.from(
        new Map(
          productList
            .flatMap((product) => getProductColorOptions(product))
            .map((colorOption) => [
              colorOption.name.toLowerCase(),
              colorOption,
            ]),
        ).values(),
      ),
    [getProductColorOptions],
  );

  const queryState = useMemo(
    () => ({
      size,
      color,
      minPrice,
      maxPrice,
      categoryId,
      tag,
      sortBy,
    }),
    [size, color, minPrice, maxPrice, categoryId, tag, sortBy],
  );

  const queryKey = useMemo(() => JSON.stringify(queryState), [queryState]);
  const hasMore = products.length < totalProducts;

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

  useEffect(() => {
    const categoryFromURL = searchParams.get("categoryId");
    const tagFromURL = searchParams.get("tag");

    setCategoryId(categoryFromURL ? Number(categoryFromURL) : null);
    setTag(tagFromURL || null);
    setInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!initialQueryAppliedRef.current) {
      initialQueryAppliedRef.current = true;
      return;
    }

    setPage(INITIAL_PAGE);
    setLoadMoreError(null);
  }, [queryKey, initialized]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const shouldUseInitialData =
      !initialDataConsumedRef.current &&
      page === INITIAL_PAGE &&
      size === null &&
      color === null &&
      minPrice === 0 &&
      maxPrice === DEFAULT_MAX_PRICE &&
      sortBy === null;

    if (shouldUseInitialData) {
      initialDataConsumedRef.current = true;
      const nextProducts = dedupeProducts(initialData.items || []);
      setProducts(nextProducts);
      setTotalProducts(initialData.pagination.total || 0);
      setAvailableColors(getAvailableColorOptions(nextProducts));
      setAvailableSizes(getPageSizes(nextProducts));
      setLoading(false);
      setIsFetchingMore(false);
      setLoadMoreError(null);
      return;
    }

    const loadProducts = async () => {
      const requestKey = `${queryKey}-${page}`;

      if (activeRequestKeyRef.current === requestKey) {
        return;
      }

      activeRequestKeyRef.current = requestKey;
      setLoadMoreError(null);

      if (page === INITIAL_PAGE) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const data = await getProducts({
          page,
          limit: PRODUCTS_LIMIT,
          size: size || undefined,
          color: color || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice:
            maxPrice < DEFAULT_MAX_PRICE ? maxPrice : undefined,
          categoryId: categoryId || undefined,
          tags: tag ? [tag] : undefined,
          sortBy: sortBy || undefined,
        });

        const incomingProducts = dedupeProducts(data.items || []);

        setProducts((prev) => {
          const mergedProducts =
            page === INITIAL_PAGE
              ? incomingProducts
              : dedupeProducts([...prev, ...incomingProducts]);

          setAvailableColors(getAvailableColorOptions(mergedProducts));
          return mergedProducts;
        });

        setTotalProducts(data.pagination.total || 0);
        setAvailableSizes(getPageSizes(incomingProducts));
      } catch (error) {
        console.error(error);
        setLoadMoreError(
          page === INITIAL_PAGE
            ? "Unable to load products right now."
            : "Unable to load more products. Please try again.",
        );
      } finally {
        activeRequestKeyRef.current = null;
        setLoading(false);
        setIsFetchingMore(false);
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
    queryKey,
    initialData,
    getAvailableColorOptions,
  ]);

  const handleLoadMore = useCallback(() => {
    if (loading || isFetchingMore || !hasMore) {
      return;
    }

    setPage((prev) => prev + 1);
  }, [loading, isFetchingMore, hasMore]);

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
        setWishlist((prev) => prev.filter((i) => i !== id));
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

  const handleClearFilters = () => {
    setSize(null);
    setColor(null);
    setMinPrice(0);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setCategoryId(null);
    setSortBy(null);
    setPage(INITIAL_PAGE);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      const uncachedProducts = products.filter(
        (product) => reviewMap[product.id] === undefined,
      );

      if (uncachedProducts.length === 0) {
        return;
      }

      const reviewEntries = await Promise.all(
        uncachedProducts.map(async (product) => {
          const res = await getReviewsByProductId(product.id);

          return [
            product.id,
            {
              rating: res?.averageRating ?? 0,
              total: res?.total ?? 0,
            },
          ] as const;
        }),
      );

      setReviewMap((prev) => ({
        ...prev,
        ...Object.fromEntries(reviewEntries),
      }));
    };

    if (products.length > 0) {
      fetchReviews();
    }
  }, [products, reviewMap]);

  return (
    <section className={styles.pageWrapper}>
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setFilterOpen(true)}
      >
        FILTERS
      </button>

      <div className={styles.container}>
        <aside className={`${styles.sidebar} ${filterOpen ? styles.open : ""}`}>
          <button
            className={styles.closeBtn}
            onClick={() => setFilterOpen(false)}
          >
            X
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
                    : (value as Exclude<SortOption, null>),
                );
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

            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>SIZE</p>
              <div className={styles.sizeGrid}>
                {FIXED_SIZES.map((entry) => (
                  <button
                    key={entry}
                    className={`${styles.sizeBtn} ${
                      size === entry ? styles.activeSize : ""
                    }`}
                    onClick={() => {
                      setSize((prev) => (prev === entry ? null : entry));
                      setColor(null);
                    }}
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>

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

            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>PRICE RANGE</p>

              <div className={styles.sliderWrapper}>
                <div className={styles.sliderTrack}></div>

                <div
                  className={styles.sliderRange}
                  style={{
                    left: `${(minPrice / DEFAULT_MAX_PRICE) * 100}%`,
                    width: `${((maxPrice - minPrice) / DEFAULT_MAX_PRICE) * 100}%`,
                  }}
                />

                <input
                  type="range"
                  min="0"
                  max={DEFAULT_MAX_PRICE}
                  value={minPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value < maxPrice) {
                      setMinPrice(value);
                    }
                  }}
                  className={styles.thumb}
                />

                <input
                  type="range"
                  min="0"
                  max={DEFAULT_MAX_PRICE}
                  value={maxPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > minPrice) {
                      setMaxPrice(value);
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

            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>CATEGORY</p>

              <div className={styles.categoryGrid}>
                <div
                  className={`${styles.categoryPill} ${
                    categoryId === null ? styles.categoryActive : ""
                  }`}
                  onClick={() => {
                    setCategoryId(null);
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
                      setCategoryId((prev) =>
                        prev === cat.id ? null : cat.id,
                      );
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

        <main className={styles.mainContent}>
          <div className={styles.productGrid}>
            {loading ? (
              Array.from({ length: PRODUCTS_LIMIT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : products.length === 0 ? (
              <div className={styles.noProductsWrapper}>
                <div className={styles.noProductsIcon}>SHOP</div>
                <h3>No products found</h3>
                <p>Try adjusting filters or explore new arrivals</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className={styles.productCardFadeIn}>
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    name= {
                      product.onlineName?.trim()
                      ? product.onlineName
                      : product.name
                    }
                    price={String(product.priceRange?.min || 0)}
                    rating={reviewMap[product.id]?.rating ?? 0}
                    reviews={reviewMap[product.id]?.total ?? 0}
                    colors={getProductColorOptions(product)}
                    image={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "/placeholder-product.png"
                    }
                    isWishlisted={wishlist.includes(product.id)}
                    onWishlistToggle={() => handleWishlist(product.id)}
                    wishlistLoading={wishlistLoading === product.id}
                  />
                </div>
              ))
            )}
          </div>

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

              <InfiniteScrollProducts
                hasMore={hasMore}
                isLoading={isFetchingMore}
                onLoadMore={handleLoadMore}
                error={loadMoreError}
              />
            </div>
          )}
        </main>
      </div>

      {filterOpen && (
        <div className={styles.overlay} onClick={() => setFilterOpen(false)} />
      )}

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
