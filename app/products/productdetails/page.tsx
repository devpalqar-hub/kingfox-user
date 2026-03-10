'use client'
import { useState } from 'react';
import styles from './productdetail.module.css';
import { LuTruck, LuShieldCheck, LuRotateCcw, LuCircleCheck,LuBox, LuAward } from "react-icons/lu";
import { IoStarSharp } from "react-icons/io5";

const ProductDetail = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const tabContent = {
  DESCRIPTION: {
    title: "REDEFINING STREET SILHOUETTE",
    text: "The Urban Plus Size Tee isn’t just a basic — it’s thoughtfully designed to celebrate curves with comfort and confidence. Crafted from premium stretch cotton, this tee offers a flattering fit that moves with your body while maintaining its shape wash after wash. Experience breathable softness and a smooth, heavyweight feel made for modern plus size streetwear.",
    points: [
      "240 GSM PREMIUM LOOP-KNIT COTTON",
      "DOUBLE-STITCHED SEAMS FOR DURABILITY",
      "BIO-WASHED FOR ZERO SHRINKAGE",
      "RIBBED CREW NECK THAT HOLDS ITS SHAPE"
    ],
    image: "/description.png"
  }
};
  
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
     <>
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
     {/* Bottom Features Bar */}
<div className={styles.featuresBar}>

  <div className={styles.featureItem}>
    <div className={styles.featureIcon}>
      <LuBox size={24} />
    </div>
    <h3>FREE SHIPPING</h3>
    <p>Available India-wide on all orders</p>
  </div>

  <div className={styles.featureItem}>
    <div className={styles.featureIcon}>
      <LuRotateCcw size={24} />
    </div>
    <h3>10-DAY EASY EXCHANGE</h3>
    <p>No questions asked return policy</p>
  </div>

  <div className={styles.featureItem}>
    <div className={styles.featureIcon}>
      <LuAward size={24} />
    </div>
    <h3>PREMIUM LOOP KNIT</h3>
    <p>Superior quality 240 GSM cotton</p>
  </div>

</div>

<div className={styles.tabsContainer}>
        {/* Tab Headers */}
        <div className={styles.tabHeader}>
          {['DESCRIPTION', 'FABRIC & CARE', 'SIZE GUIDE', 'SHIPPING'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContentSection}>
          {activeTab === 'DESCRIPTION' && (
            <div className={styles.descriptionGrid}>
              <div className={styles.descTextSide}>
                <h2 className={styles.descTitle}>{tabContent.DESCRIPTION.title}</h2>
                <p className={styles.descBody}>{tabContent.DESCRIPTION.text}</p>
                <ul className={styles.descList}>
                  {tabContent.DESCRIPTION.points.map((point, i) => (
                    <li key={i}><span>○</span> {point}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.descImageSide}>
                <div className={styles.textureCard}>
                  <img src={tabContent.DESCRIPTION.image} alt="Texture" />
                  <span className={styles.textureLabel}>FEEL THE LOOP KNIT TEXTURE</span>
                </div>
              </div>
            </div>
          )}
          {/* Add conditional rendering for other tabs here */}
        </div>
      </div>
     <div className={styles.mobileAccordion}>
  {['DESCRIPTION', 'FABRIC & CARE', 'SIZE GUIDE', 'SHIPPING'].map((tab) => (
    <div key={tab} className={styles.accordionItem}>

      <button
        className={styles.accordionHeader}
        onClick={() =>
          setOpenAccordion(openAccordion === tab ? null : tab)
        }
      >
        {tab}
        <span className={styles.arrow}>
          {openAccordion === tab ? "⌃" : "⌄"}
        </span>
      </button>

      {openAccordion === tab && (
        <div className={styles.accordionContent}>

          {/* DESCRIPTION CONTENT */}
          {tab === 'DESCRIPTION' && (
            <div className={styles.descriptionGrid}>
              <div className={styles.descTextSide}>
                <h2 className={styles.descTitle}>
                  {tabContent.DESCRIPTION.title}
                </h2>

                <p className={styles.descBody}>
                  {tabContent.DESCRIPTION.text}
                </p>

                <ul className={styles.descList}>
                  {tabContent.DESCRIPTION.points.map((point, i) => (
                    <li key={i}><span>○</span> {point}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.descImageSide}>
                <div className={styles.textureCard}>
                  <img
                    src={tabContent.DESCRIPTION.image}
                    alt="Texture"
                  />
                  <span className={styles.textureLabel}>
                    FEEL THE LOOP KNIT TEXTURE
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  ))}
</div>
      {/* Community Feedback Section */}
<section className={styles.feedbackSection}>
  <div className={styles.feedbackContainer}>
    
    <div className={styles.ratingOverview}>
      <h2 className={styles.feedbackTitle}>COMMUNITY FEEDBACK</h2>
      
      <div className={styles.ratingFlex}>
        <div className={styles.bigRating}>
          <span className={styles.ratingNumber}>4.8</span>
          <span className={styles.ratingSub}>OUT OF 5</span>
        </div>

        <div className={styles.statBars}>
          {/* 5 Star Bar */}
          <div className={styles.barRow}>
            <span className={styles.starLabel}>5</span>
            <div className={styles.barEmpty}>
              <div className={styles.barFill} style={{ width: '85%' }}></div>
            </div>
          </div>
          {/* 4 Star Bar */}
          <div className={styles.barRow}>
            <span className={styles.starLabel}>4</span>
            <div className={styles.barEmpty}>
              <div className={styles.barFill} style={{ width: '10%' }}></div>
            </div>
          </div>
          {/* 3 Star Bar */}
          <div className={styles.barRow}>
            <span className={styles.starLabel}>3</span>
            <div className={styles.barEmpty}>
              <div className={styles.barFill} style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className={styles.writeReviewContainer}>
      <button className={styles.writeReviewBtn}>WRITE A REVIEW</button>
    </div>

  </div>
</section>
{/* Customer Review Gallery */}
<section className={styles.reviewGallerySection}>
  
  <div className={styles.reviewGrid}>
    {[
      {
        name: "ARJUN K.",
        initials: "AK",
        text: "Best plus size tee I've owned. The fit is super flattering and feels incredibly comfortable all day. The fabric quality feels premium and gives me the confident look I wanted.",
        img: "/testmonial1.png"
      },
      {
        name: "ROHAN M.",
        initials: "RM",
        text: "GSM quality is impressive. It feels a bit heavy for peak summer afternoons but perfect for cooler evenings and winter wear. Totally worth the price for the comfort and curve-friendly fit.",
        img: "/testmonial3.png"
      },
      {
        name: "SARA P.",
        initials: "SP",
        text: "Love the relaxed plus size fit. I sized up for an extra comfy look and it still holds its shape beautifully. Really happy with the quality and feel!",
        img: "/testmonial2.png"
      }
    ].map((review, idx) => (
      <div key={idx} className={styles.reviewCard}>
        <div className={styles.reviewHeader}>
          <div className={styles.avatar}>{review.initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{review.name}</span>
            <span className={styles.verified}>VERIFIED BUYER</span>
          </div>
        </div>
        <div className={styles.cardStars}>
          {[...Array(5)].map((_, i) => <IoStarSharp key={i} size={12} />)}
        </div>
        <p className={styles.reviewText}>"{review.text}"</p>
        <div className={styles.reviewImageWrapper}>
          <img src={review.img} alt="User Review" className={styles.reviewImg} />
        </div>
      </div>
    ))}
  </div>
  <div className={styles.seeAllContainer}>
    <button className={styles.seeAllBtn}>SEE ALL →</button>
  </div>
</section>

{/* NEWSLETTER */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>

          <h2 className={styles.newsletterTitle}>
            JOIN THE FOX PACK
          </h2>

          <p className={styles.newsletterSubtitle}>
            Get exclusive access to underground drops, private events,
            and 15% off your first order.
          </p>

          <form
            className={styles.newsletterForm}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
            />

            <button
              type="submit"
              className={styles.subscribeBtn}
            >
              SUBSCRIBE
            </button>

          </form>

        </div>
      </div>

  </>
  );
};

export default ProductDetail;