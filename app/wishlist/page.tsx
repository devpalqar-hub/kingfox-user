"use client";
import styles from "./wishlist.module.css";
import {
  Heart,
  ShoppingCart,
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeIcon,
} from "lucide-react"; // Using Lucide for icons
import React, { useRef } from "react";
import { useRouter } from "next/navigation";

import {
  getWishList,
  removeFromWishlist,
  clearWishlist,
} from "@/services/wishlist.service";
import { getNewArrivals } from "@/services/product.service";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { addToCartAPI } from "@/services/cart.service";
import { moveAllWishlistToCartAPI } from "@/services/cart.service";
import { getProductPath } from "@/lib/product-path";

export default function WishlistPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getWishList();
        console.log("here", data);
        setWishlist(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, []);

  const showControls = newArrivals.length > 4;
  const scrollAmount = 300;

  const scrollLeft = () => {
    if (!sliderRef.current || newArrivals.length <= 4) return;

    sliderRef.current.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!sliderRef.current || newArrivals.length <= 4) return;

    sliderRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const handleClearWishlist = async () => {
    const confirmed = await confirm({
      title: "Clear Wishlist",
      message:
        "Are you sure you want to clear your entire wishlist? This action cannot be undone.",
      confirmText: "Clear All",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await clearWishlist();

      setWishlist([]);
      showToast("Wishlist cleared", "success");

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  };

  const handleRemove = async (variantId: number) => {
    const confirmed = await confirm({
      title: "Remove Item",
      message: "Are you sure you want to remove this item from your wishlist?",
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await removeFromWishlist(variantId);

      setWishlist((prev) =>
        prev.filter((item) => item.variantId !== variantId),
      );

      showToast("Removed from wishlist", "success");
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to remove item", "error");
    }
  };

  const handleMoveToCart = async (item: any) => {
    try {
      const variantId = item.variantId;

      if (!variantId) {
        showToast("No variant found", "error");
        return;
      }
      await addToCartAPI(variantId, 1);
      await removeFromWishlist(variantId);
      setWishlist((prev) => prev.filter((w) => w.variantId !== variantId));
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));

      showToast("Moved to cart", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to move to cart", "error");
    }
  };

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await getNewArrivals();

        setNewArrivals(data.items);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNewArrivals();
  }, []);
  const handleMoveAllToCart = async () => {
    if (wishlist.length === 0) {
      showToast("Wishlist is empty", "info");
      return;
    }

    const confirmed = await confirm({
      title: "Move All To Cart",
      message: "Are you sure you want to move all items to cart?",
      confirmText: "Move All",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      const res = await moveAllWishlistToCartAPI();

      const data = res.data;

      if (data.addedCount > 0) {
        showToast(`${data.addedCount} items moved to cart`, "success");
      }

      if (data.skippedCount > 0) {
        showToast(`${data.skippedCount} items already in cart`, "info");
      }

      const updatedWishlist = await getWishList();
      setWishlist(updatedWishlist);

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to move items", "error");
    }
  };
  return (
    <>
      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1>Your Wishlist</h1>
            <span className={styles.itemCount}>({wishlist.length} ITEMS)</span>
            <button onClick={() => router.push("/")} className={styles.continueShopping}>Continue Shopping</button>
          </div>

          <div className={styles.headerButtons}>
            <button
              className={styles.moveAllBtn}
              onClick={handleMoveAllToCart}
              disabled={wishlist.length === 0}
            >
              <ShoppingCart size={16} /> Move All To Cart
            </button>
            <button
              className={styles.clearBtn}
              onClick={handleClearWishlist}
              disabled={wishlist.length === 0}
            >
              Clear Wishlist
            </button>
          </div>
        </header>

        {/* Grid Section */}
        <div className={styles.grid}>
          {wishlist.map((item) => {
            const product = item.product;

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    src={
                      item.variant?.image ||
                      item.product?.images?.[0] ||
                      "/placeholder-product.png"
                    }
                    alt={item.product?.name}
                  />
                  <div
                    className={styles.wishlistIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.variantId);
                    }}
                  >
                    <Heart size={18} fill="black" />
                  </div>
                  <div
                    className={styles.viewIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        getProductPath({ id: product.id, slug: product.slug }),
                      );
                    }}
                  >
                    <EyeIcon size={18} />
                  </div>
                </div>

                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>

                  {/* ✅ Variant Info */}
                  <div className={styles.variantInfo}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: item.variant?.color?.toLowerCase() }}
                    />
                    <span className={styles.variantText}>
                      {item.variant?.color}
                    </span>

                    <span className={styles.separator}>•</span>

                    <span className={styles.sizeText}>
                      {item.variant?.size}
                    </span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      ₹{item.variant?.price || 0}
                    </span>

                    <span className={styles.sizeTag}>
                      {product.brand?.name}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToCart(item);
                  }}
                >
                  Move To Cart
                </button>
              </div>
            );
          })}
        </div>
        <section className={styles.recommendSection}>
          <div className={styles.recommendHeader}>
            <h2>You Might Also Like</h2>
            {showControls && (
              <div className={styles.sliderControls}>
                <button className={styles.navBtn} onClick={scrollLeft}>
                  <ChevronLeft size={20} />
                </button>

                <button className={styles.navBtn} onClick={scrollRight}>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.grid} ref={sliderRef}>
            {newArrivals.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={item.images?.[0]} alt={item.name} />

                  <div
                    className={styles.quickViewIcon}
                    onClick={() => router.push(`/products/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Eye size={18} />
                  </div>

                  <div className={styles.tag}>NEW</div>
                </div>

                <div className={styles.productInfo}>
                  <h3>{item.name}</h3>
                  <span className={styles.price}>
                    ₹{item.priceRange?.min || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
