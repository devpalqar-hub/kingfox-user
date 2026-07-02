"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";

const categories = [
  {
    id: "oversized-tee",
    name: "Premium Tee",
    label: "OVERSIZED",
    description: "Heavyweight cotton, relaxed drop-shoulder fit.",
    basePrice: 599,
    image: "oversized",
  },
  {
    id: "classic-hoodie",
    name: "Classic Hoodie",
    label: "BESTSELLER",
    description: "Ultra-soft fleece inner, perfect for bold graphics.",
    basePrice: 799,
    image: "hoodie",
  },
  {
    id: "crewneck-sweatshirt",
    name: "Half Sleeve T-shirt",
    label: "EVERYDAY",
    description: "Versatile daily wear with a comfortable fit.",
    basePrice: 499,
    image: "half-sleeve",
  },
  {
    id: "long-sleeve-tee",
    name: "Long Sleeve Tee",
    label: "LAYER UP",
    description: "Lightweight cotton, ideal for layered looks.",
    basePrice: 699,
    image: "full-sleeve",
  },
  {
    id: "polo-Tshirt",
    name: "Polo T-shirt",
    label: "CLASSIC",
    description: "Classic pique knit with a structured collar.",
    basePrice: 699,
    image: "polo",
  },
];

export default function ApparelSelection() {
  const router = useRouter();
  const setApparelCategory = useDesignStore(
    (state) => state.setApparelCategory,
  );

  const handleSelect = (categoryId: string) => {
    setApparelCategory(categoryId);
    router.push(`/design-studio/workspace/${categoryId}`);
  };

  return (
    <div className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrowText}>PREMIUM FIT. TIMELESS COMFORT.</span>
          </div>

          <h1 className={styles.heroHeading}>
            <span className={styles.heroLine1}>CHOOSE YOUR</span>
            <span className={styles.heroLine2}>CANVAS</span>
          </h1>

          <p className={styles.heroDesc}>
            Explore premium silhouettes designed
            <br />
            for everyday confidence.
          </p>

          {/* <div className={styles.heroButtons}>
            <button className={styles.btnPrimary}>
              SHOP ALL
              <span className={styles.btnArrow}>→</span>
            </button>
            <button className={styles.btnSecondary}>
              CUSTOMIZE YOURS
              <span className={styles.btnIcon}>✦</span>
            </button>
          </div> */}
        </div>

        {/* Vertical side text */}
        <div className={styles.sideText}>
          <span>SIMPLE</span>
          <span className={styles.sideDot}>·</span>
          <span>CLEAN</span>
          <span className={styles.sideDot}>·</span>
          <span>TIMELESS</span>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {categories.map((category, index) => {
            const fallback = `/images/apparel/default.png`;
            const png = `/images/apparel/${category.image}.png`;

            return (
              <div
                key={category.id}
                className={styles.card}
                onClick={() => handleSelect(category.id)}
                style={{ animationDelay: `${index * 0.08}s` }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${category.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelect(category.id);
                  }
                }}
              >
                <div className={styles.cardImageWrap}>
                  <img
                    src={png}
                    alt={category.name}
                    className={styles.cardImage}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.endsWith("default.png")) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <button
                    className={styles.addBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(category.id);
                    }}
                    aria-label={`Quick add ${category.name}`}
                    tabIndex={-1}
                  >
                    +
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <span className={styles.cardLabel}>{category.label}</span>
                  <h3 className={styles.cardTitle}>{category.name}</h3>
                  <p className={styles.cardDesc}>{category.description}</p>

                  <div className={styles.cardFooter}>
                    <div className={styles.priceBlock}>
                      <span className={styles.priceFrom}>From</span>
                      <span className={styles.price}>₹{category.basePrice}</span>
                    </div>
                    <button
                      className={styles.arrowBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(category.id);
                      }}
                      aria-label={`Customize ${category.name}`}
                      tabIndex={-1}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}