"use client";
import React from 'react';
import Image from 'next/image';
import styles from './productcard.module.css';
import {  Eye ,Star } from 'lucide-react'; // Or your preferred icon library
import { addToWishlist } from "@/services/wishlist.service";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";  // ✅ FIX 1
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";    // ✅ FIX 2
import { getWishList } from "@/services/wishlist.service"; // ✅ FIX 3

interface ProductCardProps {
  id: number;
  image: string;
  name: string;
  price: string;
  reviews?: number;
  colors?: string[];
  rating: number;
  isNew?: boolean;
}

const ProductCard = ({ id, image, name, price, rating, reviews, colors, isNew }: ProductCardProps) => {
const { user } = useAuth();
const [isWishlisted, setIsWishlisted] = useState(false);

useEffect(() => {
  const fetchWishlist = async () => {
    try {
      const data = await getWishList();

      const exists = data.some(
        (item: any) => item.productId === id
      );

      setIsWishlisted(exists);
    } catch (err) {
      console.error(err);
    }
  };

  if (user) {
    fetchWishlist();
  }
}, [user, id]);

const handleWishlist = async () => {
  if (!user) {
    alert("Please login first");
    return;
  }

  try {
    await addToWishlist(id);
    alert("Added to wishlist ❤️");
  } catch (err: any) {
    if (err.response?.status === 409) {
      alert("Already in wishlist ❤️"); // ✅ handle 409
    } else {
      console.error(err);
      alert("Failed to add to wishlist");
    }
  }
};
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        {isNew && <span className={styles.newBadge}>NEW ARRIVAL</span>}
        <img src={image} alt={name} className={styles.productImage} />
        
        <div className={styles.iconOverlay}>
          {/* ❤️ Wishlist */}
          <button className={styles.iconBtn} onClick={handleWishlist}>
            {isWishlisted ? (
              <FaHeart size={18} color="black" />
            ) : (
              <FiHeart size={18} />
            )}
          </button>

          {/* 👁 View */}
          <button className={styles.iconBtn}>
            <Eye size={18} />
          </button>
        </div>
      </div>

      <div className={styles.details}>
  
  {/* Product Name + Price */}
  <div className={styles.row}>
    <h3 className={styles.productName}>{name}</h3>
    <p className={styles.price}>₹{price}</p>
  </div>

  {/* Star Rating */}
  <div className={styles.ratingRow}>
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            size={14}
            className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}
            fill={i < Math.round(rating) ? "#c28b5a" : "none"}
        />
        ))}
    </div>
    <span className={styles.reviewCount}>({reviews || 42})</span>
  </div>

  {/* Color Options */}
  <div className={styles.colorOptions}>
    {(colors || ["#f1b941", "#777", "#000"]).map((color, i) => (
      <span
        key={i}
        className={styles.colorDot}
        style={{ backgroundColor: color }}
      />
    ))}
  </div>

</div>
    </div>
  );
};

export default ProductCard;