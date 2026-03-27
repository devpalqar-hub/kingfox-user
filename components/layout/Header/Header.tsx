"use client";
import React, { useState } from "react";
import axios from "axios";
import styles from "./Header.module.css";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import LoginModal from "@/app/auth/login/page";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
const Header = () => {
  const router = useRouter();
  const { user, loading } = useAuth(); // ✅ ADD loading
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

const handleSearch = async () => {
  if (!searchTerm.trim()) return;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/products?search=${searchTerm}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log("API:", response.data);

    const products = response.data; // ✅ FIXED

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

         <li data-text="OVERSIZED TEE">
          <Link
            href="/products?categoryId=8"   // 👈 IMPORTANT
            onClick={() => setMenuOpen(false)}
          >
            OVERSIZED TEE
          </Link>
        </li>

          <li data-text="ABOUT US">
            <a href="/about" onClick={() => setMenuOpen(false)}>ABOUT US</a>
          </li>
        </ul>

        {/* Icons */}
        <div className={styles.iconActions}>
          <div className={styles.searchContainer}>
  
  {showSearch ? (
  <div className={styles.searchFull}>
    <Search size={20} className={styles.searchIcon} />

    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      className={styles.searchInput}
      autoFocus
    />

    <X
      size={18}
      className={styles.closeIcon}
      onClick={() => setShowSearch(false)}
    />
  </div>
) : (
  <div
    className={styles.iconWrapper}
    onClick={() => setShowSearch(true)}
  >
    <Search size={20} />
  </div>
)}
</div>

          <Link href="/wishlist" className={styles.wishlistLink}>
            <div className={styles.iconWrapper}>
              <Heart size={20} />
              <span className={styles.badge}>0</span>
            </div>
          </Link>

          <Link href="/cart" className={styles.iconWrapper}>
            <ShoppingCart size={20} />
            <span className={styles.badge}>3</span>
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