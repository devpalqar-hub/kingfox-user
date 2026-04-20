"use client";

import Link from "next/link";
import { Grid, Heart, Home, ShoppingCart, User } from "lucide-react";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";

import { useNavCounts } from "@/lib/useNavCounts";
import styles from "./BottomNav.module.css";

const NAV = [
  { href: "/", label: "Home", Icon: Home, key: "home" },
  { href: "/products", label: "Shop", Icon: Grid, key: "products" },
  {
    href: "/wishlist",
    label: "Wishlist",
    Icon: Heart,
    key: "wishlist",
    authGuarded: true,
  },
  { href: "/cart", label: "Cart", Icon: ShoppingCart, key: "cart" },
  {
    href: "/profile",
    label: "Account",
    Icon: User,
    key: "profile",
    authGuarded: true,
  },
];

export default function BottomNav() {
  const { wishlistCount, cartCount } = useNavCounts();
  const pathname = usePathname();

  const counts: Record<string, number> = {
    wishlist: wishlistCount,
    cart: cartCount,
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleGuardedNav = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!localStorage.getItem("token")) {
      e.preventDefault();
      window.dispatchEvent(new Event("openLoginModal"));
    }
  };

  return (
    <nav className={styles.bottomNav}>
      {NAV.map(({ href, label, Icon, key, authGuarded }) => {
        const active = isActive(href);
        const count = counts[key] ?? 0;

        return (
          <Link
            key={key}
            href={href}
            className={`${styles.navItem} ${active ? styles.active : ""}`}
            onClick={authGuarded ? handleGuardedNav : undefined}
          >
            <span className={styles.iconWrap}>
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.6}
                /* Filled look on active for heart / cart */
                fill={
                  active && (key === "wishlist" || key === "cart")
                    ? "currentColor"
                    : "none"
                }
              />
              {count > 0 && (
                <span className={styles.badge}>
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>

            <span className={styles.navLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
