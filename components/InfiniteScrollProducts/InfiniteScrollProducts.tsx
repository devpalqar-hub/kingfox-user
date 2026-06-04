"use client";

import { useEffect, useRef } from "react";

import ProductCardSkeleton from "@/components/ProductCardSkeleton/ProductCardSkeleton";

import styles from "./InfiniteScrollProducts.module.css";

type InfiniteScrollProductsProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  error?: string | null;
  skeletonCount?: number;
  endMessage?: string;
};

const TRIGGER_COOLDOWN_MS = 400;

const InfiniteScrollProducts = ({
  hasMore,
  isLoading,
  onLoadMore,
  error,
  skeletonCount = 4,
  endMessage = "You've reached the end",
}: InfiniteScrollProductsProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoading) {
          return;
        }

        const now = Date.now();
        if (now - lastTriggerRef.current < TRIGGER_COOLDOWN_MS) {
          return;
        }

        lastTriggerRef.current = now;
        onLoadMore();
      },
      {
        root: null,
        rootMargin: "0px 0px 320px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className={styles.container} aria-live="polite">
      {isLoading && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      )}

      {error && <p className={styles.message}>{error}</p>}
      {!hasMore && !isLoading && !error && (
        <p className={styles.message}>{endMessage}</p>
      )}

      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </div>
  );
};

export default InfiniteScrollProducts;
