import React from 'react';
import Image from 'next/image';
import styles from './productcard.module.css';
import { Heart, Eye ,Star } from 'lucide-react'; // Or your preferred icon library

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  reviews?: number;
  colors?: string[];
  rating: number;
  isNew?: boolean;
}

const ProductCard = ({ image, name, price, rating, reviews, colors, isNew }: ProductCardProps) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        {isNew && <span className={styles.newBadge}>NEW ARRIVAL</span>}
        <img src={image} alt={name} className={styles.productImage} />

        <div className={styles.iconOverlay}>
          <button className={styles.iconBtn}><Heart size={18} /></button>
        </div>
        <button className={styles.viewBtn}><Eye size={18} />VIEW</button>
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