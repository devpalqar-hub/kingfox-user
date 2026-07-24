"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import { getAllCategories } from "@/services/category.service";
import { LuFacebook, LuInstagram } from "react-icons/lu";
import {
  FiPackage,
  FiTruck,
  FiHeadphones,
} from "react-icons/fi";

const Footer = () => {
  const [open, setOpen] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const pathname = usePathname() || "";
  const toggle = (section: string) => {
    setOpen(open === section ? null : section);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();

        const visibleCategories = (data || []).filter(
          (cat: { isOnline?: boolean }) => cat.isOnline === true,
        );

        setCategories(visibleCategories);
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();
  }, []);

  const isWorkspace = pathname.startsWith("/design-studio/workspace");

  return (
    <>
      {/* Trust Badges */}
      <div className={styles.trustSection}>
        <div className={styles.trustContainer}>
          <div className={styles.trustCard}>
            <div className={styles.trustIcon}>
              <FiPackage />
            </div>

            <h3>Free Shipping</h3>

            <p>For all orders above ₹1950</p>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIcon}>
              <FiTruck />
            </div>

            <h3>Fast Delivery</h3>

            <p>Estimated delivery in 5–8 business days</p>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIcon}>
              <FiHeadphones />
            </div>

            <h3>24/7 Support</h3>

            <p>We're here whenever you need assistance.</p>
          </div>
        </div>
      </div>
      <footer
        className={`${styles.footer} ${isWorkspace ? styles.hideOnMobileWorkspace : ""}`}
      >
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Company */}
            <div className={styles.column}>
              <h3 className={styles.title} onClick={() => toggle("company")}>
                Company
                <span className={styles.arrow}>
                  {open === "company" ? "−" : "+"}
                </span>
              </h3>

              <div
                className={`${styles.mobileContent} ${open === "company" ? styles.show : ""}`}
              >
                <div className={styles.addressText}>
                  <p>
                    King Fox Clothing, MNS Avenue,
                    <br /> Near 4th Gate, Calicut 673001
                  </p>
                  <a
                    href="https://www.google.com/maps?q=King+Fox+Clothing,+MNS+Avenue,+Near+4th+Gate,+Calicut+673001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.link} ${styles.mapLink}`}
                  >
                    Visit Map
                  </a>
                  <p style={{ marginTop: "20px" }}>+91 8129 8822 45</p>
                  <p style={{ textTransform: "lowercase" }}>
                    kingfoxclothingstore@gmail.com
                  </p>
                  <div className={styles.socialRow}>
                    <a
                      href="https://www.instagram.com/kingfoxclothingstore/"
                      target="_blank"
                      className={styles.socialIcon}
                    >
                      <LuInstagram />
                    </a>

                    <a
                      href="https://www.facebook.com/thekingfoxclothing"
                      target="_blank"
                      className={styles.socialIcon}
                    >
                      <LuFacebook />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className={styles.column}>
              <h3 className={styles.title} onClick={() => toggle("info")}>
                Information
                <span className={styles.arrow}>
                  {open === "info" ? "−" : "+"}
                </span>
              </h3>

              <ul
                className={`${styles.list} ${styles.mobileContent} ${open === "info" ? styles.show : ""}`}
              >
                <li>
                  <Link href="/profile" className={styles.link}>
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/products" className={styles.link}>
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className={styles.link}>
                    My Cart
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className={styles.link}>
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/contact#faq" className={styles.link}>
                    Faq
                  </Link>
                </li>
              </ul>
            </div>

            {/* Service */}
            <div className={styles.column}>
              <h3 className={styles.title} onClick={() => toggle("service")}>
                Service
                <span className={styles.arrow}>
                  {open === "service" ? "−" : "+"}
                </span>
              </h3>

              <ul
                className={`${styles.list} ${styles.mobileContent} ${open === "service" ? styles.show : ""}`}
              >
                <li>
                  <Link href="/" className={styles.link}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className={styles.link}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={styles.link}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacypolicy" className={styles.link}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-condition" className={styles.link}>
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © 2026 KING FOX CLOTHING INDIA POWERED BY{" "}
            <a
              href="https://www.palqar.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.palqarLink}
            >
              PALQAR
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
