"use client";
import React from "react";
import { Eye, Star } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getProductPath } from "@/lib/product-path";

import styles from "./productcard.module.css";

interface ProductCardProps {
  id: number;
  slug?: string | null;
  image: string;
  name: string;
  price: string;
  reviews?: number;
  colors?: string[];
  rating: number;
  isNew?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  wishlistLoading?: boolean;
}

const ProductCard = ({
  id,
  slug,
  image,
  name,
  price,
  rating,
  reviews,
  colors,
  isNew,
  isWishlisted,
  onWishlistToggle,
  wishlistLoading,
}: ProductCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleWishlist = async () => {
    if (!user) {
      showToast("Please login first", "info");
      return;
    }
    if (wishlistLoading) return;
    if (onWishlistToggle) {
      onWishlistToggle();
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        {isNew && <span className={styles.newBadge}>NEW ARRIVAL</span>}
        <img src={image} alt={name} className={styles.productImage} />

        <div className={styles.iconOverlay}>
          <button
            className={styles.iconBtn}
            onClick={handleWishlist}
            disabled={wishlistLoading}
          >
            {wishlistLoading ? (
              <span className={styles.spinner} />
            ) : isWishlisted ? (
              <FaHeart size={18} color="black" />
            ) : (
              <FiHeart size={18} />
            )}
          </button>
        </div>

        <button
          className={styles.viewBtn}
          onClick={() => router.push(getProductPath({ id, slug }))}
        >
          <Eye size={18} />
          VIEW
        </button>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <h3 className={styles.productName}>{name}</h3>
          <p>
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(Number(price))}
          </p>
        </div>

        <div className={styles.colorOptions}>
          {(colors || ["#f1b941", "#777", "#000"]).map((color, i) => (
            <span
              key={i}
              className={styles.colorDot}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {reviews !== undefined && reviews > 0 && (
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={i < Math.round(rating) ? "#c28b5a" : "#ccc"}
                  fill={i < Math.round(rating) ? "#c28b5a" : "none"}
                />
              ))}
            </div>

            <span className={styles.reviewCount}>({reviews}) Reviews</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
