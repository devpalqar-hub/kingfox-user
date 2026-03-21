"use client";
import React, { useState } from "react";
import styles from "./Header.module.css";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import LoginModal from "@/app/auth/login/page";
import Link from "next/link";
const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

          <span>VOUCHERS LEFT. GRAB YOURS BEFORE THEY'RE GONE!</span>
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

          <li data-text="CONTACT US">
            <a href="/contact" onClick={() => setMenuOpen(false)}>CONTACT US</a>
          </li>

          <li data-text="ABOUT US">
            <a href="/about" onClick={() => setMenuOpen(false)}>ABOUT US</a>
          </li>
        </ul>

        {/* Icons */}
        <div className={styles.iconActions}>
          <div className={styles.iconWrapper}><Search size={20} /></div>

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
          <div
            className={styles.iconWrapper}
            onClick={() => setShowLogin(true)}
          >
            <User size={20} />
          </div>
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