'use client'
import { useState } from 'react';
import styles from './productdetail.module.css';
import { LuTruck, LuShieldCheck, LuRotateCcw, LuCircleCheck,LuBox, LuAward } from "react-icons/lu";
import { IoStarSharp } from "react-icons/io5";

const ProductDetail = () => {
  // Mock images - replace with your actual paths
  const productImages = ['/main.png', '/thumb2.jpg', '/thumb3.jpg', '/thumb4.jpg'];
  const [activeImg, setActiveImg] = useState(productImages[0]);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL'];
  const colors = [
    { name: 'JET BLACK', hex: '#000000' },
    { name: 'NAVY BLUE', hex: '#3b4754' },
    { name: 'WHITE', hex: '#f0f4f7' },
    { name: 'BOTTLE GREEN', hex: '#1a3d32' }
  ];

  const [selectedColor, setSelectedColor] = useState(colors[3]); 
  const [selectedSize, setSelectedSize] = useState('6XL');

  return (
    <div className={styles.container}>
      {/* LEFT: Image Gallery */}
      <div className={styles.gallery}>
        <div className={styles.thumbnails}>
          {productImages.map((img, i) => (
            <div 
              key={i} 
              className={`${styles.thumbBox} ${activeImg === img ? styles.activeThumb : ''}`}
              onClick={() => setActiveImg(img)}
            >
              <img src={img} alt={`view ${i}`} />
            </div>
          ))}
        </div>
        <div className={styles.mainImage}>
          <img src={activeImg} alt="Urban Oversized Tee" />
        </div>
      </div>

      {/* RIGHT: Product Info */}
      <div className={styles.details}>
        <h1 className={styles.title}>URBAN OVERSIZED TEE</h1>
        
        <div className={styles.priceRow}>
          <span className={styles.price}>₹1,499</span>
          <div className={styles.divider}></div>
          <div className={styles.ratingBox}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => <IoStarSharp key={i} />)}
            </div>
            <span className={styles.reviews}>(120 Reviews)</span>
          </div>
        </div>
        
        <p className={styles.description}>
          Heavyweight 240 GSM loop-knit cotton for the perfect street silhouette. 
          Designed for maximum comfort and an effortless boxy fit.
        </p>

        {/* Color Selection */}
        <div className={styles.section}>
          <p className={styles.label}>COLOR: <span className={styles.colorName}>{selectedColor.name}</span></p>
          <div className={styles.colorPicker}>
            {colors.map((color) => (
              <div 
                key={color.name} 
                onClick={() => setSelectedColor(color)}
                className={`${styles.colorCircle} ${selectedColor.name === color.name ? styles.activeColor : ''}`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className={styles.section}>
          <div className={styles.labelRow}>
            <span className={styles.label}>SELECT SIZE</span>
            <span className={styles.sizeGuide}>SIZE GUIDE</span>
          </div>
          <div className={styles.sizeGrid}>
            {sizes.map((size) => (
              <button 
                key={size} 
                onClick={() => setSelectedSize(size)}
                className={selectedSize === size ? styles.sizeBtnActive : styles.sizeBtn}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Shipping Pill */}
        <div className={styles.shippingBar}>
          <LuTruck size={18} /> 
          <span>DELIVERING TO <span className={styles.location}>MUMBAI</span> — GET IT BY <strong>FRIDAY</strong></span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.addToCart}>ADD TO CART</button>
          <button className={styles.buyNow}>BUY IT NOW</button>
        </div>

        {/* Trust Badges */}
        <div className={styles.trustBadges}>
          <div className={styles.badge}>
            <LuCircleCheck size={22} />
            <span>100% COTTON</span>
          </div>
          <div className={styles.badge}>
            <LuShieldCheck size={22} />
            <span>SECURE CHECKOUT</span>
          </div>
          <div className={styles.badge}>
            <LuRotateCcw size={22} />
            <span>EASY RETURNS</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ProductDetail;