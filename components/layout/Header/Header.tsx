"use client";
import React, { useState } from "react";
import styles from "./Header.module.css";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";

const Header = () => {
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
        <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
          <li data-text="HOME"><a href="/" onClick={() => setMenuOpen(false)}>HOME</a></li>
          <li data-text="PRODUCTS"><a href="/products" onClick={() => setMenuOpen(false)}>PRODUCTS</a></li>
          <li data-text="NEW ARRIVALS"><a href="#new-arrivals">NEW ARRIVALS</a></li>
          <li data-text="CONTACT US"><a href="#contact">CONTACT US</a></li>
          <li data-text="ABOUT US"><a href="#about">ABOUT US</a></li>
        </ul>

        {/* Icons */}
        <div className={styles.iconActions}>
          <div className={styles.iconWrapper}><Search size={20} /></div>

          <div className={styles.iconWrapper}>
            <Heart size={20} />
            <span className={styles.badge}>0</span>
          </div>

          <div className={styles.iconWrapper}>
            <ShoppingCart size={20} />
            <span className={styles.badge}>3</span>
          </div>

          <div className={styles.iconWrapper}><User size={20} /></div>
        </div>
      </nav>
    </header>
  );
};

export default Header;