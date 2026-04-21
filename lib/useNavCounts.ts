"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getGuestCartCount } from "@/lib/cart";
import { getCartAPI } from "@/services/cart.service";
import { getWishList } from "@/services/wishlist.service";

export const useNavCounts = () => {
  const { token, user, loading } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  /* =========================
     WISHLIST COUNT
  ========================= */
  useEffect(() => {
    const fetchWishlist = async () => {
      if (loading) return;

      if (!token || !user) {
        setWishlistCount(0);
        return;
      }

      try {
        const res = await getWishList({
          headers: {
            "Skip-Auth-Error": true,
          },
        });

        const items = Array.isArray(res) ? res : res?.items || res?.data || [];

        setWishlistCount(items.length);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          console.warn("Wishlist 401 ignored");
          return;
        }

        console.error("Wishlist error:", error);
        setWishlistCount(0);
      }
    };

    fetchWishlist();
    window.addEventListener("wishlistUpdated", fetchWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", fetchWishlist);
    };
  }, [token, user, loading]);

  /* =========================
     CART COUNT
  ========================= */
  useEffect(() => {
    const fetchCart = async () => {
      if (loading) return;

      if (!token || !user) {
        setCartCount(getGuestCartCount());
        return;
      }

      try {
        const res = await getCartAPI({
          headers: {
            "Skip-Auth-Error": true,
          },
        });

        const totalQty =
          res.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        setCartCount(totalQty);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          console.warn("Cart 401 ignored");
          return;
        }

        console.error("Cart error:", error);
        setCartCount(getGuestCartCount());
      }
    };

    fetchCart();

    window.addEventListener("cartUpdated", fetchCart);
    window.addEventListener("storage", fetchCart);

    return () => {
      window.removeEventListener("cartUpdated", fetchCart);
      window.removeEventListener("storage", fetchCart);
    };
  }, [token, user, loading]);

  return {
    wishlistCount,
    cartCount,
  };
};
