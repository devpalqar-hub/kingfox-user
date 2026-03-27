'use client'
import { useEffect,useMemo,useState, useRef  } from 'react';
import styles from './productdetail.module.css';
import { LuShieldCheck, LuRotateCcw, LuCircleCheck,LuBox, LuAward } from "react-icons/lu";
import { IoStarSharp } from "react-icons/io5";
import { useParams } from "next/navigation";
import { getProductById } from "@/services/product.service";
import { ProductDetail as ProductDetailType } from "@/types/product";
import { useRouter } from "next/navigation";
import { getReviewsByProductId } from "@/services/review.service";
<span className={styles.ratingNumber}>4.8</span>
import { addToGuestCart } from "@/lib/cart";
import { addToCartAPI } from "@/services/cart.service";
import { addToWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useToast } from '@/context/ToastContext';
const ProductDetail = () => {
  const router = useRouter();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const metaSections = product?.metaInfo || [];
  const { user } = useAuth();
  const params = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();


  // reviews
 const [reviewData, setReviewData] = useState<{
  rating: number;
  total: number;
  distribution: Record<number, number>;
  reviews: any[];
} | null>(null);

useEffect(() => {
  const fetchReviews = async () => {
    if (!product?.id) return;

    const res = await getReviewsByProductId(product.id);

    console.log("DETAIL PAGE REVIEW:", res);

    if (res) {
      const distribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
      };

      res.reviews.forEach((r: any) => {
        const rating = Number(r.rating);
        if (distribution[rating] !== undefined) {
          distribution[rating] += 1;
        }
      });

      console.log("FINAL DISTRIBUTION:", distribution); // ✅ debug

      setReviewData({
        rating: res.averageRating,
        total: res.total,
        distribution,
        reviews: res.reviews,
      });
    }
  };

  fetchReviews();
}, [product?.id]);

// review couresal
const scrollRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const interval = setInterval(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;

    container.scrollBy({
      left: 320,
      behavior: "smooth",
    });

    // loop back
    if (
      container.scrollLeft + container.clientWidth >=
      container.scrollWidth - 10
    ) {
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: "smooth" });
      }, 500);
    }
  }, 2500);

  return () => clearInterval(interval);
}, []);

const [isHovered, setIsHovered] = useState(false);

useEffect(() => {
  if (isHovered) return;

  const interval = setInterval(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  }, 2500);

  return () => clearInterval(interval);
}, [isHovered]);

  useEffect(() => {
  const fetchProduct = async () => {
    try {
      const data = await getProductById(params.id as string);
      setProduct(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (params.id) {
    fetchProduct();
  }
}, [params.id]);

useEffect(() => {
  if (product?.variants?.length) {
    const firstSize = product.variants[0].size;

    setSelectedSize(firstSize);

    // pick first color of that size
    const firstColorForSize = product.variants.find(
      v => v.size === firstSize
    )?.color;

    setSelectedColor(firstColorForSize || null);
  }
}, [product]);

useEffect(() => {
  if (product?.metaInfo?.length) {
    setActiveTab(product.metaInfo[0].title);
  }
}, [product]);

useEffect(() => {
  if (product) {
    setIsWishlisted(product.isWishlisted ?? false);
  }
}, [product]);

const handleWishlist = async () => {
  if (!user) {
    alert("Please login first");
    return;
  }

  if (!product?.id) return;

  try {
    if (isWishlisted) {
      await removeFromWishlist(product.id);
      setIsWishlisted(false);
    } else {
      await addToWishlist(product.id);
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
  const sizes = [...new Set(product?.variants?.map(v => v.size) || [])];
  const colors = [
    ...new Set(
      product?.variants
        ?.filter(v => v.size === selectedSize)
        .map(v => v.color) || []
    )
  ];
  const selectedVariant = useMemo(() => {
    return product?.variants.find(
      (v) =>
        v.color?.toLowerCase() === selectedColor?.toLowerCase() &&
        v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);


  // Mock images - replace with your actual paths
  const productImages = product?.images || [];
  const [activeImg, setActiveImg] = useState<string | null>(null);
  useEffect(() => {
    if (product?.images?.length) {
      setActiveImg(product.images[0]);
    }
  }, [product]);


const isInCart = selectedVariant?.isAddedInCart ?? false;
const isOutOfStock = selectedVariant?.totalStock === 0;


const handleAddToCart = async () => {
  if (!product || !selectedVariant) {
    alert("Please select size & color");
    return;
  }

  try {
    if (token) {
      await addToCartAPI(selectedVariant.id, 1);
    } else {
      addToGuestCart({
        variantId: selectedVariant.id,
        quantity: 1,
        productName: product.name,
        productImage: product.images?.[0] || "",
        price: Number(selectedVariant.sellingPrice),
        size: selectedVariant.size,
        color: selectedVariant.color,
      });
    }

    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === selectedVariant.id
            ? { ...v, isAddedInCart: true }
            : v
        ),
      };
    });

    showToast("Added to cart", "success");
  } catch (err) {
    console.error(err);
  }
};

const handleBuyNow = async () => {
  if (!product || !selectedVariant) {
    alert("Please select size & color");
    return;
  }

  // ❌ Prevent if out of stock
  if (selectedVariant.totalStock === 0) {
    showToast("Out of stock", "error");
    return;
  }

  try {
    if (token) {
      await addToCartAPI(selectedVariant.id, 1);
    } else {
      addToGuestCart({
        variantId: selectedVariant.id,
        quantity: 1,
        productName: product.name,
        productImage: product.images?.[0] || "",
        price: Number(selectedVariant.sellingPrice),
        size: selectedVariant.size,
        color: selectedVariant.color,
      });
    }

    // ✅ update UI state
    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === selectedVariant.id
            ? { ...v, isAddedInCart: true }
            : v
        ),
      };
    });

    router.push("/cart");

  } catch (err) {
    console.error(err);
  }
};

   if (!product) {
  return <div>Loading...</div>;
}

  return (
     <>
    <div className={styles.container}>
      {/* LEFT: Image Gallery */}
      <div className={styles.gallery}>
        <div className={styles.thumbnails}>
          {productImages.map((img, i) => (
            <div
              key={i}
              className={`${styles.thumbBox} ${
                activeImg === img ? styles.activeThumb : ""
              }`}
              onClick={() => setActiveImg(img)}
            >
              <img src={img} alt={`view ${i}`} />
            </div>
          ))}
        </div>
        <div className={styles.mainImage}>
  <img
    src={activeImg || productImages[0]}
    alt={product.name}
  />

  {/* ❤️ Wishlist */}
  <button
    className={`${styles.wishlistBtn} ${
      isWishlisted ? styles.active : ""
    }`}
    onClick={handleWishlist}
  >
    {isWishlisted ? (
      <FaHeart size={20} color="white" />
    ) : (
      <FiHeart size={20} color="black" />
    )}
  </button>
</div>

      </div>

      {/* RIGHT: Product Info */}
      <div className={styles.details}>
        <h1 className={styles.title}>{product?.name}</h1>
        
        <div className={styles.priceRow}>
         <span className={styles.price}>
            ₹{selectedVariant?.sellingPrice || product?.variants[0]?.sellingPrice}
          </span>
          <div className={styles.divider}></div>
          {reviewData && reviewData.total > 0 && (
            <div className={styles.ratingBox}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <IoStarSharp
                    key={i}
                    color={i < Math.round(reviewData.rating) ? "#000" : "#ccc"}
                  />
                ))}
              </div>

              <span className={styles.reviews}>
                ({reviewData.total} Reviews)
              </span>
            </div>
          )}
        </div>
        
        <p className={styles.description}>
          {product?.description}
        </p>

        {/* Color Selection */}
        <div className={styles.section}>
          <p className={styles.label}>
            COLOR: <span className={styles.colorName}>{selectedColor}</span>
          </p>

          <div className={styles.colorPicker}>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`${styles.colorItem} ${
                selectedColor === color ? styles.activeColor : ""
              }`}
            >
              <span
                className={styles.colorDot}
                style={{ backgroundColor: color.toLowerCase() }}
              ></span>

              <span className={styles.colorText}>{color}</span>
            </button>
          ))}
        </div>
        </div>
        {/* Size Selection */}
        <div className={styles.section}>
          <div className={styles.labelRow}>
            <span className={styles.label}>SELECT SIZE</span>
          </div>
          <div className={styles.sizeGrid}>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);

                  const firstColor = product?.variants.find(
                    v => v.size === size
                  )?.color;

                  setSelectedColor(firstColor || null);
                }}
                className={
                  selectedSize === size
                    ? styles.sizeBtnActive
                    : styles.sizeBtn
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isInCart ? (
            <button
              className={styles.addToCart}
              onClick={() => router.push("/cart")}
            >
              GO TO CART
            </button>
          ) : isOutOfStock ? (
            <button className={styles.addToCart} disabled>
              OUT OF STOCK
            </button>
          ) : (
            <button
              className={styles.addToCart}
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>
          )}

          <button
            className={styles.buyNow}
            onClick={handleBuyNow}
            disabled={selectedVariant?.totalStock === 0}
          >
            BUY IT NOW
          </button>
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
          {metaSections.map((section, i) => (
            <button
              key={i}
              className={`${styles.tabBtn} ${
                activeTab === section.title ? styles.activeTabBtn : ""
              }`}
              onClick={() => setActiveTab(section.title)}
            >
              {section.title.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContentSection}>
          {metaSections.map((section, i) => {
            if (activeTab !== section.title) return null;

            return (
              <div key={i} className={styles.descriptionGrid}>
                <div className={styles.descTextSide}>
                  <div
                    dangerouslySetInnerHTML={{ __html: section.text }}
                  />
                </div>

                {section.imageUrl && (
                  <div className={styles.descImageSide}>
                    <div className={styles.textureCard}>
                      <img src={section.imageUrl} alt={section.title} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    <div className={styles.mobileAccordion}>
  {metaSections.map((section, i) => (
    <div key={i} className={styles.accordionItem}>

      <button
        className={styles.accordionHeader}
        onClick={() =>
          setOpenAccordion(openAccordion === section.title ? null : section.title)
        }
      >
        {section.title.toUpperCase()}
        <span className={styles.arrow}>
          {openAccordion === section.title ? "⌃" : "⌄"}
        </span>
      </button>

      {openAccordion === section.title && (
        <div className={styles.accordionContent}>
          <div className={styles.descriptionGrid}>

            <div className={styles.descTextSide}>
              <div
                dangerouslySetInnerHTML={{ __html: section.text }}
              />
            </div>

            {section.imageUrl && (
              <div className={styles.descImageSide}>
                <div className={styles.textureCard}>
                  <img src={section.imageUrl} alt={section.title} />
                </div>
              </div>
            )}

          </div>
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
          {reviewData && reviewData.total > 0 && (
              <span className={styles.ratingNumber}>
                {reviewData.rating.toFixed(1)}
              </span>
            )}
          <span className={styles.ratingSub}>OUT OF 5</span>
        </div>

        <div className={styles.statBars}>
          {reviewData &&
            [5, 4, 3].map((star) => {
              const count = reviewData.distribution?.[star] || 0;

              const percent =
                reviewData.total > 0
                  ? (count / reviewData.total) * 100
                  : 0;

              return (
                <div className={styles.barRow} key={star}>
                  <span className={styles.starLabel}>{star}</span>

                  <div className={styles.barEmpty}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>

  </div>
</section>
{/* Customer Review Gallery */}
<section className={styles.reviewGallerySection}>
  
<div
  className={styles.carouselWrapper} ref={scrollRef}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  >
  <div className={styles.carouselTrack}>
    
    {reviewData?.reviews?.length ? (
  reviewData.reviews.map((review: any) => {
    const name = review.customer?.name || "User";

    

        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div key={review.id} className={styles.reviewCard}>
            
            {/* HEADER */}
            <div className={styles.reviewHeader}>
              <div className={styles.avatar}>{initials}</div>

              <div>
                <div className={styles.userName}>{name}</div>
                <div className={styles.verified}>VERIFIED BUYER</div>
              </div>
            </div>

            {/* STARS */}
            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {i < review.rating ? "★" : "☆"}
                </span>
              ))}
            </div>

            {/* TEXT */}
            <p className={styles.reviewText}>
              "{review.body}"
            </p>

            {/* IMAGE */}
            {review.images?.length > 0 && (
             <div className={styles.reviewWrapper}>
              <img
                src={review.images[0]}
                className={styles.reviewImg}
              />
              </div>
            )}
          </div>
        );
      })
    ) : (
      <p>No reviews</p>
    )}

  </div>
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