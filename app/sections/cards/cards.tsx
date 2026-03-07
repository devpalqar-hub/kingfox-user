import React from 'react';
import styles from './card.module.css';
import Image from 'next/image';

const Cards = () => {
  return (
    <section className={styles.container}>
      {/* This wrapper ensures the arrow stays attached to the cards */}
      <div className={styles.carouselContainer}>
        
        <button className={styles.leftArrow} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <div className={styles.cardWrapper}>
          {/* Card Mapping */}
          {[1, 2].map((id) => (
            <div key={id} className={styles.card}>
              <Image src={`/card${id}.png`} alt="Card" fill style={{ objectFit: 'cover' }} priority />
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.pagination}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={`${styles.dot} ${styles.active}`}></span>
      </div>
    </section>
  );
};

export default Cards;