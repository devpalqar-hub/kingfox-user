import styles from "./productcardskelton.module.css";

const ProductCardSkeleton = () => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        <div className={styles.skeletonImage}></div>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonPrice}></div>
        </div>

        <div className={styles.colorOptions}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={styles.skeletonDot}></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;