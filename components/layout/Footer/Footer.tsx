"use client"
import React, { useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer = () => {

  const [open, setOpen] = useState<string | null>(null);

  const toggle = (section: string) => {
  setOpen(open === section ? null : section);
};

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Company */}
          <div className={styles.column}>
            <h3 
              className={styles.title} 
              onClick={() => toggle("company")}
            >
              Company
              <span className={styles.arrow}>
                {open === "company" ? "−" : "+"}
              </span>
            </h3>

            <div className={`${styles.mobileContent} ${open === "company" ? styles.show : ""}`}>
              <div className={styles.addressText}>
                <p>King Fox Clothing, MNS Avenue,<br/> Near 4th Gate, Calicut 673001</p>
                <Link href="#" className={`${styles.link} ${styles.mapLink}`}>Visit Map</Link>
                <p style={{marginTop:'20px'}}>+91 8129 8822 45</p>
                <p style={{textTransform:'lowercase'}}>kingfoxclothingstore@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div className={styles.column}>
            <h3 
              className={styles.title} 
              onClick={() => toggle("shop")}
            >
              Shop Categories
              <span className={styles.arrow}>
                {open === "shop" ? "−" : "+"}
              </span>
            </h3>

            <ul className={`${styles.list} ${styles.mobileContent} ${open === "shop" ? styles.show : ""}`}>
              <li><Link href="/products" className={styles.link}>Oversized Tees</Link></li>
              <li><Link href="/products" className={styles.link}>Half Sleeves</Link></li>
              <li><Link href="/products" className={styles.link}>Full Sleeves</Link></li>
              <li><Link href="/products" className={styles.link}>Casual Shirts</Link></li>
              <li><Link href="/custom" className={styles.link}>Custom Designer</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div className={styles.column}>
            <h3 
              className={styles.title} 
              onClick={() => toggle("info")}
            >
              Information
              <span className={styles.arrow}>
                {open === "info" ? "−" : "+"}
              </span>
            </h3>

            <ul className={`${styles.list} ${styles.mobileContent} ${open === "info" ? styles.show : ""}`}>
              <li><Link href="/account" className={styles.link}>My Account</Link></li>
              <li><Link href="/products" className={styles.link}>Products</Link></li>
              <li><Link href="/cart" className={styles.link}>My Cart</Link></li>
              <li><Link href="/wishlist" className={styles.link}>Wishlist</Link></li>
              <li><Link href="/faq" className={styles.link}>Faq</Link></li>
            </ul>
          </div>

          {/* Service */}
          <div className={styles.column}>
            <h3 
              className={styles.title} 
              onClick={() => toggle("service")}
            >
              Service
              <span className={styles.arrow}>
                {open === "service" ? "−" : "+"}
              </span>
            </h3>

            <ul className={`${styles.list} ${styles.mobileContent} ${open === "service" ? styles.show : ""}`}>
              <li><Link href="/" className={styles.link}>Home</Link></li>
              <li><Link href="/about" className={styles.link}>About Us</Link></li>
              <li><Link href="/contact" className={styles.link}>Contact Us</Link></li>
              <li><Link href="/privacypolicy" className={styles.link}>Privacy Policy</Link></li>
              <li><Link href="/terms-and-condition" className={styles.link}>Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>
      </div>

      <div className={styles.bottomSection}>
        <p className={styles.copyright}>
          © 2025 KING FOX CLOTHING INDIA
        </p>
      </div>

    </footer>
  );
};

export default Footer;