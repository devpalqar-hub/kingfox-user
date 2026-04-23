"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import styles from "./card.module.css";
import { getAllCampaigns } from "@/services/luckyDraw.service";
import { useRouter } from "next/navigation";

type CampaignStatus = "ACTIVE" | "CLOSED" | "UPCOMING";

// const STATUS_CONFIG: Record<CampaignStatus, { label: string; cls: string }> = {
//   ACTIVE: { label: "● ACTIVE", cls: "badgeLive" },
//   CLOSED: { label: "❌ CLOSED", cls: "badgeClosed" },
//   UPCOMING: { label: "🗓 UPCOMING", cls: "badgeUpcoming" },
// };

function useCountdown(endDate?: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}

function CampaignCard({
  item,
  isActive,
  onClick,
}: {
  item: any;
  isActive: boolean;
  onClick: () => void;
}) {
  const timeLeft = useCountdown(item.endDate);

  // const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG["UPCOMING"];

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      onClick={onClick}
    >
      {/* Background image */}
      <Image
        src={item.image || "/card1.png"}
        alt={item.name}
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        priority
      />

      {/* Gradient overlay */}
      <div className={styles.cardGradient} />

      {/* Shimmer border on active */}
      <div className={styles.shimmerBorder} />

      {/* Status badge */}
      {/* <span className={`${styles.badge} ${styles[statusCfg.cls]}`}>
        {statusCfg.label}
      </span> */}

      {/* Bottom glass panel */}
      <div className={styles.glassPanel}>
        <div className={styles.glassPanelLeft}>
          <p className={styles.campaignLabel}>Lucky Draw Campaign</p>
          <h2 className={styles.campaignName}>{item.name}</h2>
          {item.prize && (
            <p className={styles.prize}>
              <span className={styles.prizeIcon}>🏆</span>
              {item.prize}
            </p>
          )}
        </div>

        <div className={styles.glassPanelRight}>
          {timeLeft && (
            <div className={styles.countdownBox}>
              <span className={styles.countdownLabel}>Ends in</span>
              <span className={styles.countdownValue}>{timeLeft}</span>
            </div>
          )}
          <div className={styles.enterBtn}>
            <span>Enter Now</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Ticket notch decorations */}
      <div className={styles.notchLeft} />
      <div className={styles.notchRight} />
    </div>
  );
}

const Cards = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await getAllCampaigns({
        status: "ACTIVE",
      });

      setCampaigns(data);
    };
    loadData();
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[0] as HTMLElement;
    const cardWidth = card?.offsetWidth ?? 0;
    setIsTransitioning(true);
    scrollRef.current.scrollTo({
      left: index * (cardWidth + 20),
      behavior: "smooth",
    });
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  }, []);

  const handleNext = () => {
    if (currentIndex < campaigns.length - 1) scrollToIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[0] as HTMLElement;
    const cardWidth = (card?.offsetWidth ?? 1) + 20;
    const index = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setCurrentIndex(index);
  };

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      {/* Section heading */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.headerEyebrow}>✦ Active Campaigns</span>
          <h1 className={styles.headerTitle}>Lucky Draw Events</h1>
        </div>
        <span className={styles.headerCount}>
          {currentIndex + 1} / {campaigns.length}
        </span>
      </div>

      <div className={styles.carouselContainer}>
        {/* Left arrow */}
        <button
          className={styles.leftArrow}
          aria-label="Previous"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Card track */}
        <div
          className={`${styles.cardWrapper} ${isTransitioning ? styles.transitioning : ""}`}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {campaigns.map((item: any, i: number) => (
            <CampaignCard
              key={item.id}
              item={item}
              isActive={i === currentIndex}
              onClick={() => router.push(`/campaigns/${item.id}`)}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          className={styles.rightArrow}
          aria-label="Next"
          onClick={handleNext}
          disabled={currentIndex === campaigns.length - 1}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Pagination dots */}
      <div className={styles.pagination}>
        {campaigns.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${currentIndex === index ? styles.dotActive : ""}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to campaign ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Cards;
