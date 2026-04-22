import React from 'react';
import styles from './branding.module.css';

const Branding = () => {
  return (
    <section className={styles.brandingContainer}>
      <div className={styles.content}>
        <h2 className={styles.hashtag}>#KINGFOXCALICUT</h2>
        <p className={styles.description}>
          FOLLOW <span className={styles.handle}>@KINGFOXCLOTHINGSTORE</span> ON INSTAGRAM FOR FRESH DROPS, OVERSIZED FITS, AND STREETWEAR INSPO.
        </p>
        <p className={styles.linkText}>
          FIND MORE LOOKS ON <a href="https://www.instagram.com/kingfoxclothingstore/" target="_blank" rel="noopener noreferrer" className={styles.link}>OUR INSTAGRAM.</a>
        </p>
      </div>
    </section>
  );
};

export default Branding;