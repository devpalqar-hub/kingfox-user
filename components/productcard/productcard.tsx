"use client";
import React from "react";
import { Star } from "lucide-react";
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
  images?: string[];
  name: string;
  price: string;
  reviews?: number;
  colors?: Array<string | { name: string; colorCode?: string | null }>;
  rating: number;
  isNew?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  wishlistLoading?: boolean;
  tags?: any[];
}

const ProductCard = ({
  id,
  slug,
  image,
  images,
  name,
  price,
  rating,
  reviews,
  colors,
  isNew,
  isWishlisted,
  onWishlistToggle,
  wishlistLoading,
  tags,
}: ProductCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const alternateImage = images?.find((productImage) => productImage !== image);

  const isProductNew =
    isNew ||
    tags?.some((tag: any) => {
      const tagName = typeof tag === "string" ? tag : tag?.name;
      const upperName = tagName?.toUpperCase();
      return upperName === "NEW ARRIVAL" || upperName === "NEW ARRIVALS";
    });

  const isBestSeller = tags?.some((tag: any) => {
    const tagName = typeof tag === "string" ? tag : tag?.name;
    return tagName?.toUpperCase().trim() === "BEST SELLER";
  });

  const colorMap: Record<string, string> = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    black: "#000000",
    white: "#ffffff",
    gray: "#6b7280",
    purple: "#a855f7",
    orange: "#f97316",
    pink: "#ec4899",
    brown: "#92400e",
    navy: "#1e3a8a",
    cyan: "#06b6d4",
    lime: "#84cc16",
    magenta: "#d946ef",
    "mist grey": "#bfc5c9",
    "military olive": "#556b2f",
    "mud olive": "#5b5b2b",
    "fluorescent green": "#39ff14",
  };

  const getColorValue = (
    colorName?: string | null,
    colorCode?: string | null,
  ) => {
    const normalizedColorCode = colorCode?.trim();
    if (
      normalizedColorCode &&
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalizedColorCode)
    ) {
      return normalizedColorCode;
    }

    const normalizedColorName = colorName?.trim().toLowerCase();
    if (!normalizedColorName) {
      return "#d1d5db";
    }

    return colorMap[normalizedColorName] || normalizedColorName;
  };

  const colorOptions =
    colors?.map((color) =>
      typeof color === "string"
        ? {
          name: color,
          value: getColorValue(color),
        }
        : {
          name: color.name,
          value: getColorValue(color.name, color.colorCode),
        },
    ) || [
      { name: "gold", value: "#f1b941" },
      { name: "gray", value: "#777" },
      { name: "black", value: "#000" },
    ];

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
    <div
      className={styles.cardContainer}
      onClick={() => router.push(getProductPath({ id, slug }))}
      style={{ cursor: "pointer" }}
    >
      <div
        className={`${styles.imageWrapper} ${
          alternateImage ? styles.hasAlternateImage : ""
        }`}
      >
        {isProductNew ? (
          <span className={styles.newBadge}>NEW</span>
        ) : isBestSeller ? (
          <span className={styles.newBadge}>BEST SELLER</span>
        ) : null}
        <img src={image} alt={name} className={styles.productImage} />
        {alternateImage && (
          <img
            src={alternateImage}
            alt=""
            aria-hidden="true"
            className={`${styles.productImage} ${styles.alternateProductImage}`}
          />
        )}

        {/* <div className={styles.iconOverlay}>
          <button
            className={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleWishlist();
            }}
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
        </div> */}

      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <h3 className={styles.productName}>{name}</h3>
          <p className={styles.price}>
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(Number(price))}
          </p>
        </div>

        {/* <div className={styles.colorOptions}>
          {colorOptions.map((color, i) => (
            <span
              key={`${color.name}-${i}`}
              className={styles.colorDot}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div> */}

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
