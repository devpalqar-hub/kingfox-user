"use client";

import { useRouter } from "next/navigation";
import { Shirt } from "lucide-react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import styles from "./page.module.css";

const categories = [
  {
    id: "oversized-tee",
    name: "Oversized Premium Tee",
    description: "Heavyweight cotton, relaxed drop-shoulder fit.",
    basePrice: 599,
  },
  {
    id: "classic-hoodie",
    name: "Classic Hoodie",
    description: "Ultra-soft fleece inner, perfect for bold graphics.",
    basePrice: 1299,
  },
  {
    id: "crewneck-sweatshirt",
    name: "Half sleeve T-shirt",
    description: "Versatile daily wear with a comfortable fit.",
    basePrice: 1099,
  },
  {
    id: "long-sleeve-tee",
    name: "Long Sleeve Tee",
    description: "Lightweight cotton, ideal for layered looks.",
    basePrice: 799,
  },
  {
    id: "polo-Tshirt",
    name: "Polo T-shirt",
    description: "Classic pique knit with a structured collar.",
    basePrice: 899,
  },
];

export default function ApparelSelection() {
  const router = useRouter();
  const setApparelCategory = useDesignStore(
    (state) => state.setApparelCategory,
  );

  const handleSelect = (categoryId: string) => {
    setApparelCategory(categoryId);
    // Navigate to a new workspace (using a mock ID for now)
    const newProjectId = `proj_${Date.now()}`;
    router.push(`/design-studio/workspace/${newProjectId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your <span className={styles.highlightText}>Canvas</span></h1>
        <p className={styles.subtitle}>
          Select the apparel type you want to customize.
        </p>
      </div>

      <div className={styles.grid}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={styles.card}
            onClick={() => handleSelect(category.id)}
          >
            <div className={styles.imagePlaceholder}>
              {(() => {
                const imageName = category.id
                  .toString()
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");
                const imageMap: Record<string, string> = {
                  "oversized-tee": "oversized",
                  "classic-hoodie": "hoodie",
                  "crewneck-sweatshirt": "half-sleeve",
                  "long-sleeve-tee": "full-sleeve",
                  "polo-tshirt": "polo",
                };
                const base = imageMap[imageName] || imageName;
                const jpg = `/images/apparel/${base}.jpg`;
                const png = `/images/apparel/${base}.png`;
                const fallback = `/images/apparel/default.png`;
                return (
                  <img
                    src={png}
                    alt={category.name}
                    className={styles.cardImage}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src.endsWith(".jpg")) {
                        target.src = png;
                      } else if (target.src.endsWith(".png")) {
                        target.src = fallback;
                      } else {
                        target.src = fallback;
                      }
                    }}
                  />
                );
              })()}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{category.name}</h3>
              <p className={styles.cardDesc}>{category.description}</p>
              <div className={styles.cardFooter}>
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>From</span>
                  <span className={styles.price}>₹{category.basePrice}</span>
                </div>
                <button className={styles.selectBtn}>Customize Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
