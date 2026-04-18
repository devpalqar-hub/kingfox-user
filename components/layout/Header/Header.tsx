"use client";
import type { Product } from "@/types/product";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";

import LoginModal from "@/app/auth/login/page";
import { useAuth } from "@/context/AuthContext";
import { getProductPath } from "@/lib/product-path";
import { getAllCategories } from "@/services/category.service";
import { getCartAPI } from "@/services/cart.service";
import { getProducts } from "@/services/product.service";
import { getWishList } from "@/services/wishlist.service";

import type { CartItem } from "@/types/cart";

import styles from "./Header.module.css";
import { Campaign, getCampaignsAPI } from "@/services/campaign.service";

type Category = {
  id: number;
  name: string;
};

const Header = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Search suggestion states
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchTouched, setSearchTouched] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);

  const params = useSearchParams(); // (keep if you plan to use later)

const SlotDigit = ({ digit, delay }: { digit: string; delay: number }) => {
  const target = parseInt(digit, 10);
  const CELL_HEIGHT = 28;

  const fullCycle = Array.from({ length: 10 }, (_, i) => i);
  const reelDigits = [
    ...fullCycle,
    ...fullCycle,
    ...fullCycle,
    ...Array.from({ length: target + 1 }, (_, i) => i), // final: 0 → target
  ];

  const totalScroll = (reelDigits.length - 1) * CELL_HEIGHT;

  return (
    <div className={styles.digitWrap}>
      <div
        className={styles.digitReel}
        style={{
          ["--scroll" as any]: `-${totalScroll}px`,
          ["--delay" as any]: `${delay}ms`,
        }}
      >
        {reelDigits.map((d, i) => (
          <span key={i} className={styles.digitCell}>
            {d}
          </span>
        ))}
      </div>
    </div>
  );
};

  /* =========================
     GLOBAL LOGIN MODAL EVENT
  ========================= */
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setShowLogin(true);
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  /* =========================
     LOAD CATEGORIES
  ========================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Category error:", err);
      }
    };

    loadCategories();
  }, []);

  const oversizedCategory = categories.find((cat) =>
    cat.name.toLowerCase().includes("over"),
  );

useEffect(() => {
  const fetchCampaign = async () => {
    try {
      const data = await getCampaignsAPI();
      if (data && data.length > 0) {
        setCampaign(data[0]);
      }
    } catch (err) {
      console.error("Campaign error:", err);
    } finally {
      setCampaignLoading(false); // ← add this
    }
  };
  fetchCampaign();
}, []);

  /* =========================
     SEARCH HANDLER
  ========================= */
  // Debounced search for suggestions
  useEffect(() => {
    if (!showSearch) return;
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchError("");
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await getProducts({
          search: searchTerm,
          limit: 8,
        });
        setSearchResults(response?.items || []);
        setSearchError("");
      } catch (error) {
        setSearchResults([]);
        setSearchError("Failed to fetch products");
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, showSearch]);

  // On select suggestion or enter
  const handleSearchSelect = (product: any) => {
    setShowSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(getProductPath(product));
  };

  // On enter, if suggestions exist, go to first
  const handleSearch = () => {
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0]);
    }
  };

  /* =========================
     WISHLIST COUNT
  ========================= */
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setWishlistCount(0);
        return;
      }

      try {
        const res = await getWishList();
        const items = Array.isArray(res) ? res : res?.items || res?.data || [];

        setWishlistCount(items.length);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setWishlistCount(0);
          setShowLogin(true);
          return;
        }

        console.error("Wishlist error:", err);
        setWishlistCount(0);
      }
    };

    fetchWishlist();

    const handleWishlistUpdate = () => fetchWishlist();

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [user]);

  /* =========================
     CART COUNT
  ========================= */
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartCount(0);
        return;
      }

      try {
        const res = await getCartAPI();

        const totalQty =
          res.items?.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0,
          ) || 0;

        setCartCount(totalQty);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setCartCount(0);
          setShowLogin(true);
          return;
        }

        console.error("Cart error:", err);
        setCartCount(0);
      }
    };

    fetchCart();

    const handleCartUpdate = () => fetchCart();

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [user]);

  if (loading) return null;

  return (
    <header className={styles.headerContainer}>
      {/* ANNOUNCEMENT */}
      {!campaignLoading && campaign && (
        <div className={`${styles.announcementBar} ${styles.announcementVisible}`}>
          <div className={styles.marquee}>
            <span className={styles.campaignName}>
              &quot;{campaign?.name?.toUpperCase()}&quot;
            </span>
            <span className={styles.onlyText}>ONLY</span>
            <div className={styles.voucherCount}>
              {(campaign?.vouchersLeft?.toString() || "0")
                .split("")
                .map((digit, i) => (
                  <SlotDigit key={i} digit={digit} delay={600 + i * 300} />
                ))}
            </div>
            <span>
              VOUCHERS LEFT. GRAB YOURS BEFORE{" "}
              {campaign?.endDate
                ? new Date(campaign.endDate).toLocaleDateString("en-IN")
                : "THEY'RE GONE"}
              !
            </span>
          </div>
        </div>
      )}

      {campaignLoading && (
        <div className={styles.announcementSkeleton}>
          <div className={styles.skeletonLine} style={{ width: 140 }} />
          <div className={styles.skeletonLine} style={{ width: 40 }} />
          <div className={styles.skeletonDigitGroup}>
            <div className={styles.skeletonDigit} />
            <div className={styles.skeletonDigit} />
            <div className={styles.skeletonDigit} />
          </div>
          <div className={styles.skeletonLine} style={{ width: 220 }} />
        </div>
      )}

      {/* NAVBAR */}
      <nav className={styles.mainHeader}>
        {/* MENU */}
        <div
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* LOGO */}
        <div className={styles.logo}>
          
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="Logo" className={styles.logoImg} />
          </Link>
          <span className={styles.logoText}>KINGFOX</span>
        </div>

        {/* LINKS */}

        <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
          <li>
            <Link href="/" onClick={() => setMenuOpen(false)}>
              HOME
            </Link>
          </li>

          {/* PRODUCTS with Dropdown */}
          <li
            className={styles.dropdown}
            onMouseEnter={() => setShowCategoryDropdown(true)}
            onMouseLeave={() => setShowCategoryDropdown(false)}
          >
            <span
              className={styles.navLink}
              tabIndex={0}
              onClick={() => setShowCategoryDropdown((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setShowCategoryDropdown((v) => !v);
              }}
            >
              PRODUCTS
            </span>
            {showCategoryDropdown && categories.length > 0 && (
              <div className={styles.dropdownMenu}>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    onClick={() => {
                      setMenuOpen(false);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li>
            <Link href="/new-arrivals" onClick={() => setMenuOpen(false)}>
              NEW ARRIVALS
            </Link>
          </li>

          {oversizedCategory && (
            <li>
              <Link
                href={`/products?categoryId=${oversizedCategory.id}`}
                onClick={() => setMenuOpen(false)}
              >
                {oversizedCategory.name.toUpperCase()}
              </Link>
            </li>
          )}

          <li>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              CONTACT
            </Link>
          </li>
        </ul>

        {/* ICONS */}
        <div className={styles.iconActions}>
          {/* SEARCH */}
          <div
            className={styles.iconWrapper}
            onClick={() => setShowSearch(true)}
          >
            <Search size={20} />
          </div>

          {showSearch && (
            <div
              className={styles.searchOverlay}
              onClick={() => setShowSearch(false)}
            >
              <div
                className={styles.searchBox}
                onClick={(e) => e.stopPropagation()}
                style={{ position: "relative", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSearchTouched(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    autoFocus
                    className={styles.searchInput}
                  />
                  <div
                    className={styles.closeBtn}
                    onClick={() => setShowSearch(false)}
                  >
                    <X size={18} />
                  </div>
                </div>
                {/* Suggestions Dropdown */}
                {searchTouched && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      background: "#fff",
                      borderRadius: "0 0 16px 16px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      zIndex: 100,
                      marginTop: 4,
                      maxHeight: 340,
                      overflowY: "auto",
                    }}
                  >
                    {searchLoading && (
                      <div
                        style={{
                          padding: 16,
                          textAlign: "center",
                          color: "#888",
                        }}
                      >
                        Loading...
                      </div>
                    )}
                    {!searchLoading && searchError && (
                      <div
                        style={{
                          padding: 16,
                          textAlign: "center",
                          color: "#d00",
                        }}
                      >
                        {searchError}
                      </div>
                    )}
                    {!searchLoading &&
                      !searchError &&
                      searchResults.length === 0 &&
                      searchTerm.trim() && (
                        <div
                          style={{
                            padding: 16,
                            textAlign: "center",
                            color: "#888",
                          }}
                        >
                          No products found.
                        </div>
                      )}
                    {!searchLoading &&
                      !searchError &&
                      searchResults.length > 0 && (
                        <ul
                          style={{ listStyle: "none", margin: 0, padding: 0 }}
                        >
                          {searchResults.map((product: any) => (
                            <li
                              key={product.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 18px",
                                borderBottom: "1px solid #f0f0f0",
                                cursor: "pointer",
                                transition: "background 0.15s",
                              }}
                              onClick={() => handleSearchSelect(product)}
                            >
                              <img
                                src={
                                  product.images && product.images.length > 0
                                    ? product.images[0]
                                    : "/no-image.png"
                                }
                                alt={product.name}
                                style={{
                                  width: 48,
                                  height: 48,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  background: "#f3f3f3",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/no-image.png";
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>
                                  {product.name}
                                </div>
                                <div
                                  style={{
                                    color: "#888",
                                    fontSize: 13,
                                    marginTop: 2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 220,
                                  }}
                                >
                                  {product.description}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WISHLIST */}
          <Link href="/wishlist" className={styles.wishlistLink}>
            <div className={styles.iconWrapper}>
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </div>
          </Link>

          {/* CART */}
          <Link href="/cart" className={styles.iconWrapper}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {/* USER */}
          {user ? (
            <Link
              href="/profile"
              className={styles.iconWrapper}
              title="Profile"
            >
              <User size={20} />
            </Link>
          ) : (
            <button
              className={styles.loginBtn}
              onClick={() => setShowLogin(true)}
            >
              LOGIN
            </button>
          )}
        </div>
      </nav>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
};

export default Header;
