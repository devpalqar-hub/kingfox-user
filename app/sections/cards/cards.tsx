"use client";
import React, { useEffect, useState,useRef } from "react";
import Image from "next/image";
import styles from "./card.module.css";
import { getAllCampaigns } from "@/services/luckyDraw.service";
import { useRouter } from "next/navigation";
const Cards = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
   useEffect(() => {
    const loadData = async () => {
      const data = await getAllCampaigns();
      setCampaigns(data);
    };

    loadData();
  }, []);

  const handleScroll = () => {
  if (!scrollRef.current) return;

  const scrollLeft = scrollRef.current.scrollLeft;
  const width = scrollRef.current.clientWidth;

  const index = Math.round(scrollLeft / width);
  setCurrentIndex(index);
};

  const scrollRight = () => {
  if (scrollRef.current) {
    scrollRef.current.scrollBy({
      left: scrollRef.current.clientWidth, // move forward
      behavior: "smooth",
    });
  }
};
const scrollLeft = () => {
  if (scrollRef.current) {
    scrollRef.current.scrollBy({
      left: -scrollRef.current.clientWidth, // move full view
      behavior: "smooth",
    });
  }
};

useEffect(() => {
  if (!scrollRef.current || campaigns.length === 0) return;

  const interval = setInterval(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // 👉 If reached end → go back to start
    if (container.scrollLeft >= maxScroll - 5) {
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      container.scrollBy({
        left: container.clientWidth,
        behavior: "smooth",
      });
    }
  }, 3000); 

  return () => clearInterval(interval);
}, [campaigns]);

  return (
    <section className={styles.container}>
      {/* This wrapper ensures the arrow stays attached to the cards */}
      <div className={styles.carouselContainer}>
        
        <button 
            className={styles.rightArrow} 
            aria-label="Next"
            onClick={scrollRight}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="m9 6 6 6-6 6"/>
            </svg>
          </button>

         <div className={styles.cardWrapper} ref={scrollRef} onScroll={handleScroll}>
          {campaigns.map((item: any) => (
             <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => router.push(`/campaigns/${item.id}`)}
                >
              <Image
                src={item.image || "/card1.png"}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw" 
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.pagination}>
          {Array.from({ length: Math.ceil(campaigns.length / 2) }).map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${currentIndex === index ? styles.active : ""}`}
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: index * scrollRef.current.clientWidth,
                    behavior: "smooth",
                  });
                }
              }}
            />
          ))}
        </div>
    </section>
  );
};

export default Cards;