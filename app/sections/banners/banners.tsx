'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBanners } from '@/services/banner.service';
import { BannerWithMediaType } from '@/types/banner.types';
import styles from './banners.module.css';

const SLIDE_DURATION = 5000;

export default function Banners() {
  const [banners, setBanners] = useState<BannerWithMediaType[]>([]);
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  useEffect(() => {
    fetchBanners().then((data) => {
      setBanners(data);
      setLoading(false);
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || banners.length <= 1) return;
      setExiting(current);
      setCurrent(index);
      setProgressKey((k) => k + 1);
      const incoming = videoRefs.current.get(index);
      if (incoming) {
        incoming.currentTime = 0;
        incoming.play().catch(() => {});
      }
      setTimeout(() => setExiting(null), 900);
    },
    [current, banners.length]
  );

  const next = useCallback(
    () => goTo((current + 1) % banners.length),
    [current, banners.length, goTo]
  );

  const prev = useCallback(
    () => goTo((current - 1 + banners.length) % banners.length),
    [current, banners.length, goTo]
  );

  // Auto-advance
  useEffect(() => {
    if (banners.length <= 1) return;
    autoPlayRef.current = setTimeout(next, SLIDE_DURATION);
    return () => { if (autoPlayRef.current) clearTimeout(autoPlayRef.current); };
  }, [banners.length, current, next]);

  // Play active video
  useEffect(() => {
    const vid = videoRefs.current.get(current);
    if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  }, [current]);

  if (loading) {
    return (
      <section className={styles.bannerSection}>
        <div className={styles.sectionDivider} />
        <div className={styles.labelStrip}>
          <div className={styles.labelLeft}>
            <div className={styles.labelDot} />
            <span className={styles.labelText}>Featured</span>
          </div>
        </div>
        <div className={styles.sliderCard}>
          <div className={styles.sliderTrack}>
            <div className={styles.skeleton} />
          </div>
        </div>
      </section>
    );
  }

  if (!banners.length) return null;

  const total = banners.length;
  const activeBanner = banners[current];

  return (
    <section className={styles.bannerSection}>
      {/* Top gold separator */}
      <div className={styles.sectionDivider} />

      {/* Label strip */}
      <div className={styles.labelStrip}>
        <div className={styles.labelLeft}>
          <div className={styles.labelDot} />
          <span className={styles.labelText}>Featured</span>
        </div>
        {total > 1 && (
          <span className={styles.slideCounter}>
            <span>{String(current + 1).padStart(2, '0')}</span>
            {' / '}
            {String(total).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Rounded card wrapping the entire slider */}
      <div className={styles.sliderCard}>
        <div className={styles.sliderTrack}>

          {/* Slides */}
          {banners.map((banner, i) => {
            const isActive = i === current;
            const isExiting = i === exiting;

            const mediaEl =
              banner.mediaType === 'video' ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(i, el);
                    else videoRefs.current.delete(i);
                  }}
                  className={styles.bannerVideo}
                  src={banner.mediaUrl}
                  autoPlay={isActive}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={banner.title}
                />
              ) : (
                <Image
                  src={banner.mediaUrl}
                  alt={banner.title}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={styles.bannerImage}
                />
              );

            const slideContent = banner.redirectLink ? (
              <Link
                href={banner.redirectLink}
                className={styles.slideLink}
                tabIndex={isActive ? 0 : -1}
              >
                {mediaEl}
              </Link>
            ) : (
              <span className={styles.slideNoLink}>{mediaEl}</span>
            );

            return (
              <div
                key={banner.id}
                className={[
                  styles.slide,
                  isActive ? styles.active : '',
                  isExiting ? styles.exiting : '',
                ].filter(Boolean).join(' ')}
                aria-hidden={!isActive}
              >
                {slideContent}
                <div className={styles.overlay} />
              </div>
            );
          })}

          {/* Banner title badge (top-left of image) */}
          {activeBanner.title && (
            <div className={styles.bannerTitleBadge}>
              <span className={styles.bannerTitleText}>{activeBanner.title}</span>
            </div>
          )}

          {/* Progress bar */}
          {total > 1 && (
            <div
              key={progressKey}
              className={styles.progressBar}
              style={{ '--slide-duration': `${SLIDE_DURATION}ms` } as React.CSSProperties}
            />
          )}

          {/* Controls */}
          {total > 1 && (
            <div className={styles.controlsBar}>
              <div
                className={styles.dotsContainer}
                role="tablist"
                aria-label="Banner navigation"
              >
                {banners.map((_, i) => (
                  <button
                    key={i}
                    className={[styles.dot, i === current ? styles.activeDot : '']
                      .filter(Boolean).join(' ')}
                    onClick={() => goTo(i)}
                    role="tab"
                    aria-selected={i === current}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>

              <div className={styles.navCluster}>
                <button className={styles.navBtn} onClick={prev} aria-label="Previous banner">
                  <svg viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className={styles.navBtn} onClick={next} aria-label="Next banner">
                  <svg viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}