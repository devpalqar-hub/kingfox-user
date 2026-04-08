"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Header.module.css";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import LoginModal from "@/app/auth/login/page";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getWishList } from "@/services/wishlist.service";
import { useRouter } from "next/navigation";
import { getAllCategories } from "@/services/category.service";
import { getCartAPI } from "@/services/cart.service";

const Header = () => {
  const router = useRouter();
  const { user, loading } = useAuth(); // ✅ ADD loading
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
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


const handleSearch = async () => {
  if (!searchTerm.trim()) return;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/products`,
      {
        params: {
          search: searchTerm, // ✅ better way
        },
      }
    );

    console.log("API:", response.data);

    const products = response.data.items; // ✅ FIXED

    if (products && products.length > 0) {
      const firstProduct = products[0];

      router.push(`/products/${firstProduct.id}`);
    } else {
      alert("No products found");
    }
  } catch (error) {
    console.error("Search error:", error);
  }

  setShowSearch(false);
};
   if (loading) return null;


   useEffect(() => {
  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");

    // ❌ not logged in → skip
    if (!token) {
      setWishlistCount(0);
      return;
    }

    try {
      const res = await getWishList();

      // ✅ API returns array
      setWishlistCount(res.length);
    } catch (err) {
      console.error("Wishlist error:", err);
      setWishlistCount(0);
    }
  };

  fetchWishlist();
}, [user]); // ✅ runs when login changes

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
        res.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

      setCartCount(totalQty);
    } catch (err) {
      console.error("Cart error:", err);
      setCartCount(0);
    }
  };

  fetchCart();

  // ✅ LISTENER
  const handleCartUpdate = () => fetchCart();

  window.addEventListener("cartUpdated", handleCartUpdate);

  return () => {
    window.removeEventListener("cartUpdated", handleCartUpdate);
  };
}, [user]);


  return (
    <header className={styles.headerContainer}>
      
      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.marquee}>
          <span>OUR FIRST 50000 MILESTONE GIVEAWAY, ONLY</span>

          <div className={styles.voucherCount}>
            <span className={styles.digit}>3</span>
            <span className={styles.digit}>8</span>
            <span className={styles.digit}>1</span>
            <span className={styles.digit}>8</span>
            <span className={styles.digit}>0</span>
          </div>

          <span>VOUCHERS LEFT. GRAB YOURS BEFORE THEY&apos;RE GONE!</span>
        </div>
      </div>

      {/* Main Header */}
      <nav className={styles.mainHeader}>

        {/* Hamburger */}
        <div
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* Logo */}
        <div className={styles.logo}>
          <img src="/logo.png" alt="Logo" className={styles.logoImg} />
          <span className={styles.logoText}>KINGFOX</span>
        </div>

        {/* Nav Links */}
        {/* Nav Links */}
        <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
          <li data-text="HOME">
            <Link href="/" onClick={() => setMenuOpen(false)}>HOME</Link>
          </li>

          <li data-text="PRODUCTS">
            <Link href="/products" onClick={() => setMenuOpen(false)}>PRODUCTS</Link>
          </li>

          <li data-text="NEW ARRIVALS">
            <Link href="/new-arrivals" onClick={() => setMenuOpen(false)}>NEW ARRIVALS</Link>
          </li>

         {oversizedCategory && (
          <li data-text={oversizedCategory.name}>
            <Link
              href={`/products?categoryId=${oversizedCategory.id}`}
              onClick={() => setMenuOpen(false)}
            >
              {oversizedCategory.name.toUpperCase()}
            </Link>
          </li>
        )}
          <li data-text="CONTACT">
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              CONTACT
            </Link>
          </li>
        </ul>

        {/* Icons */}
        <div className={styles.iconActions}>
  
          {/* 🔍 SEARCH BUTTON */}
          <div
            className={styles.iconWrapper}
            onClick={() => setShowSearch(true)}
          >
            <Search size={20} />
          </div>
           {showSearch && (
                <div className={styles.searchOverlay}>
                  <div
                    className={styles.searchBox}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search size={20} />

                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      autoFocus
                    />

                    <div
                      className={styles.closeBtn}
                      onClick={() => setShowSearch(false)}
                    >
                      <X size={18} />
                    </div>
                  </div>
                </div>
              )}
         

          <Link href="/wishlist" className={styles.wishlistLink}>
            <div className={styles.iconWrapper}>
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </div>
          </Link>

          <Link href="/cart" className={styles.iconWrapper}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
          </Link>
          {user ? (
            <Link href="/profile" className={styles.iconWrapper} title="Profile">
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
      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </header>
  );
};

export default Header;