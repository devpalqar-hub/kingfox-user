"use client";
import Image from "next/image";
import styles from "./collection.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllCategories } from "@/services/category.service";

// ─── Slot definitions ─────────────────────────────────────────────────────────
// Each slot maps to one card in the Collections grid.
// `keywords` are checked case-insensitively against the admin category name.
// Add more keywords to a slot if the admin ever renames a category.
// Add a completely new slot if a new featured category should appear here.
const SLOTS = [
  {
    key: "jeans",
    keywords: ["jean", "jeans", "denim"],
    fallbackImage: "/jeans.png",
    fallbackLabel: "JEANS",
  },
  {
    key: "half-sleeve",
    keywords: ["half sleeve", "half-sleeve", "halfsleeve", "half"],
    fallbackImage: "/half-sleeve.png",
    fallbackLabel: "HALF SLEEVE",
  },
  {
    key: "linen-pant",
    keywords: ["linen pant", "linen-pant", "linen"],
    fallbackImage: "/linenPant.png",
    fallbackLabel: "LINEN PANT",
  },
  {
    key: "shirts",
    keywords: ["shirt", "shirts"],
    fallbackImage: "/shirts.png",
    fallbackLabel: "SHIRTS",
  },
] as const;

interface MatchedCategory {
  id: string | number;
  name: string;
  image?: string;
}

/** Find the best-matching admin category for a given slot (case-insensitive). */
function findCategory(
  categories: MatchedCategory[],
  keywords: readonly string[]
): MatchedCategory | null {
  return (
    categories.find((cat) => {
      const name = (cat.name || "").toLowerCase();
      return keywords.some((kw) => name.includes(kw));
    }) ?? null
  );
}

// ─── Reusable collection card ─────────────────────────────────────────────────
interface CardProps {
  category: MatchedCategory | null;
  fallbackImage: string;
  fallbackLabel: string;
  sizes?: string;
  onClick: () => void;
}

function CollectionCard({
  category,
  fallbackImage,
  fallbackLabel,
  sizes = "(max-width:768px) 100vw, 33vw",
  onClick,
}: CardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <Image
        src={category?.image || fallbackImage}
        alt={category?.name || fallbackLabel}
        fill
        sizes={sizes}
        className={styles.img}
      />
      <div className={styles.overlay}>
        <span className={styles.cardTitle}>
          {category?.name?.toUpperCase() || fallbackLabel}
        </span>
        <button className={styles.exploreBtn}>
          EXPLORE <span className={styles.arrow}>→</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const Collections = () => {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<MatchedCategory[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories();
      // Load ALL categories — matching happens by name, not position
      setAllCategories(data);
    };
    loadCategories();
  }, []);

  // Map every display slot to the best-matching admin category (or null if absent)
  const matched = SLOTS.map((slot) => ({
    ...slot,
    category: findCategory(allCategories, slot.keywords),
  }));

  const [jeans, halfSleeve, linenPant, shirts] = matched;

  /**
   * Navigate to the products page filtered by category.
   * If no admin category matched this slot, redirect to /not-found instead.
   */
  const goTo = (cat: MatchedCategory | null) => {
    if (cat?.id) {
      router.push(`/products?categoryId=${cat.id}`);
    } else {
      router.push("/not-found");
    }
  };

  return (
    <section className={styles.wrapper}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <span className={styles.rule} />
        <div className={styles.headerText}>
          <h2 className={styles.title}>Collections</h2>
          <p className={styles.subtitle}>Timeless Style. Oversized Comfort.</p>
        </div>
        <span className={styles.rule} />
      </div>

      {/* ── DESKTOP GRID ── */}
      <div className={styles.desktopGrid}>
        {/* LEFT COLUMN — Jeans + Half Sleeve */}
        <div className={styles.col}>
          <CollectionCard
            category={jeans.category}
            fallbackImage={jeans.fallbackImage}
            fallbackLabel={jeans.fallbackLabel}
            onClick={() => goTo(jeans.category)}
          />
          <CollectionCard
            category={halfSleeve.category}
            fallbackImage={halfSleeve.fallbackImage}
            fallbackLabel={halfSleeve.fallbackLabel}
            onClick={() => goTo(halfSleeve.category)}
          />
        </div>

        {/* CENTER — New Arrival (tall hero card) */}
        <div
          className={`${styles.card} ${styles.newArrivalCard}`}
          onClick={() => router.push("/new-arrivals")}
        >
          <Image
            src="/new-arrival.png"
            alt="New Arrival"
            fill
            className={styles.img}
          />
          <span className={styles.newBadge}>NEW</span>
          <div className={styles.overlay}>
            <span className={styles.cardTitle}>
              NEW
              <br />
              ARRIVAL
            </span>
            <button className={styles.exploreBtn}>
              EXPLORE <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — Linen Pant + Shirts */}
        <div className={styles.col}>
          <CollectionCard
            category={linenPant.category}
            fallbackImage={linenPant.fallbackImage}
            fallbackLabel={linenPant.fallbackLabel}
            onClick={() => goTo(linenPant.category)}
          />
          <CollectionCard
            category={shirts.category}
            fallbackImage={shirts.fallbackImage}
            fallbackLabel={shirts.fallbackLabel}
            onClick={() => goTo(shirts.category)}
          />
        </div>
      </div>

      {/* ── MOBILE GRID ── */}
      <div className={styles.mobileGrid}>
        <div className={styles.mobileRow}>
          <CollectionCard
            category={jeans.category}
            fallbackImage={jeans.fallbackImage}
            fallbackLabel={jeans.fallbackLabel}
            onClick={() => goTo(jeans.category)}
          />
          <CollectionCard
            category={linenPant.category}
            fallbackImage={linenPant.fallbackImage}
            fallbackLabel={linenPant.fallbackLabel}
            onClick={() => goTo(linenPant.category)}
          />
        </div>

        <div
          className={`${styles.card} ${styles.mobileNewArrival}`}
          onClick={() => router.push("/new-arrivals")}
        >
          <Image
            src="/new-arrival.png"
            alt="New Arrival"
            fill
            className={styles.img}
          />
          <span className={styles.newBadge}>NEW</span>
          <div className={styles.overlay}>
            <span className={styles.cardTitle}>NEW ARRIVAL</span>
            <button className={styles.exploreBtn}>
              EXPLORE <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>

        <div className={styles.mobileRow}>
          <CollectionCard
            category={halfSleeve.category}
            fallbackImage={halfSleeve.fallbackImage}
            fallbackLabel={halfSleeve.fallbackLabel}
            onClick={() => goTo(halfSleeve.category)}
          />
          <CollectionCard
            category={shirts.category}
            fallbackImage={shirts.fallbackImage}
            fallbackLabel={shirts.fallbackLabel}
            onClick={() => goTo(shirts.category)}
          />
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div className={styles.footer}>
        <button
          className={styles.viewAllBtn}
          onClick={() => router.push("/products")}
        >
          VIEW ALL PRODUCTS <span className={styles.arrow}>→</span>
        </button>
      </div>
    </section>
  );
};

export default Collections;
