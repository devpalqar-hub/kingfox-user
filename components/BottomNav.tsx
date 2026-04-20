"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Home, User } from "lucide-react";
import styles from "./BottomNav.module.css";

type Props = {
  wishlistCount?: number;
  cartCount?: number;
};

const NAV_ITEMS = [
  { href: "/products", icon: Grid, label: "Shop" },
  { href: "/", icon: Home, label: "Home" },
  { href: "/profile", icon: User, label: "Account" },
];

export default function BottomNav({ wishlistCount = 0, cartCount = 0 }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navItem} ${isActive(href) ? styles.active : ""}`}
        >
          <span className={styles.iconWrap}>
            <Icon size={20} strokeWidth={isActive(href) ? 2.2 : 1.7} />
          </span>
          <span className={styles.navLabel}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
