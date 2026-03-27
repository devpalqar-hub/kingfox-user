"use client";
import React, { useState } from 'react';
import styles from './productcard.module.css';
import { Eye, Star } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { useAuth } from "@/context/AuthContext";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useRouter } from "next/navigation"; 

interface ProductCardProps {
  id: number;
  image: string;
  name: string;
  price: string;
  reviews?: number;
  colors?: string[];
  rating: number;
  isNew?: boolean;
  isWishlisted?: boolean;
}

const ProductCard = ({
  
  id,
  image,
  name,
  price,
  rating,
  reviews,
  colors,
  isNew,
  isWishlisted: initialWishlisted
}: ProductCardProps) => {
  

  const router = useRouter();
  const { user } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted ?? false);

  const handleWishlist = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      if (isWishlisted) {

        await removeFromWishlist(id);
        setIsWishlisted(false);
      } else {

        await addToWishlist(id);
        setIsWishlisted(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setIsWishlisted(true);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        {isNew && <span className={styles.newBadge}>NEW ARRIVAL</span>}
        <img src={image} alt={name} className={styles.productImage} />

        <div className={styles.iconOverlay}>
          <button className={styles.iconBtn} onClick={handleWishlist}>
            {isWishlisted ? (
              <FaHeart size={18} color="black" />
            ) : (
              <FiHeart size={18} />
            )}
          </button>
        </div>

        <button
          className={styles.viewBtn}
          onClick={() => router.push(`/products/${id}`)}
        >
          <Eye size={18} />
          VIEW
        </button>
      </div>
            
      <div className={styles.details}>
        <div className={styles.row}>
          <h3 className={styles.productName}>{name}</h3>
          <p className={styles.price}>₹{price}</p>
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

          <span className={styles.reviewCount} >
            ({reviews}) Reviews
          </span>

        </div>
      )}

        
      </div>
    </div>
  );
};

export default ProductCard;