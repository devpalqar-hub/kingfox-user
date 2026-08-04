"use client";
import React from "react";
import Image from "next/image";
import styles from "./hero.module.css";
import { useRouter } from "next/navigation";
import {
  Award,
  Sparkles,
  Leaf,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Headphones,
  ArrowRight,
} from "lucide-react";

/* ── Bottom scrolling features bar ── */
const barFeatures = [
  { icon: <Truck size={17} strokeWidth={1.8} />, text: "FREE SHIPPING" },
  {
    icon: <RefreshCcw size={17} strokeWidth={1.8} />,
    text: <>EASY EXCHANGE IN 10 DAYS</>,
  },
  { icon: <ShieldCheck size={17} strokeWidth={1.8} />, text: "SECURE PAYMENT" },
  { icon: <Leaf size={17} strokeWidth={1.8} />, text: "PREMIUM FESTIVE COTTON" },
  { icon: <Headphones size={17} strokeWidth={1.8} />, text: "ONLINE SUPPORT" },
];

/* ── Inline trust feature icons (left section bottom) ── */
const inlineFeatures = [
  {
    icon: <Award size={24} strokeWidth={1.5} />,
    line1: "PREMIUM",
    line2: "QUALITY",
  },
  {
    icon: <Sparkles size={24} strokeWidth={1.5} />,
    line1: "TRADITIONAL",
    line2: "DESIGNS",
  },
  {
    icon: <Leaf size={24} strokeWidth={1.5} />,
    line1: "COMFORT",
    line2: "YOU LOVE",
  },
];

const Hero = () => {
  const router = useRouter();

  const handleExploreClick = () => {
    router.push("/products?tag=ONAM%20COLLECTION");
  };

  return (
    <div className={styles.wrapper}>
      {/* ── MAIN HERO ── */}
      <section className={styles.heroContainer}>
        {/* LEFT PANEL (45%) */}
        <div className={styles.leftPanel}>
          <p className={styles.eyebrow}>
            Festival of Colors.
            <br />
            Celebration of Tradition.
          </p>

          <div className={styles.goldenDivider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerFlower}>✿</span>
            <span className={styles.dividerLineShort} />
          </div>

          <h1
            className={styles.title}
            aria-label="NEWLY ARRIVED ONAM COLLECTION LAUNCHED"
          >
            <span className={styles.titleLine1}>NEWLY ARRIVED</span>
            <br />
            <span className={styles.titleLine2}>
              <span className={styles.onamBrand}>
                <span className={styles.jasmineWrapper} aria-hidden="true">
                  <img
                    src="/jasmine.svg"
                    alt=""
                    className={styles.jasmineImg}
                  />
                </span>
                <span className={styles.srOnly}>O</span>
                <span className={styles.letterN}>N</span>
                <span className={styles.letterA}>A</span>
                <span className={styles.letterM}>M</span>
              </span>
              &nbsp;
              <span className={styles.collectionText}>COLLECTION</span>
            </span>
            <br />
            <span className={styles.titleLine3}>LAUNCHED</span>
          </h1>

          <div className={styles.titleDivider}>
            <span className={styles.titleLine} />
          </div>

          <p className={styles.sub}>
            Celebrate Onam in style with our exclusive collection of festive wear.
          </p>

          <div className={styles.btnGroup}>
            <button
              className={styles.shopBtn}
              onClick={handleExploreClick}
              aria-label="Explore Onam Collection"
            >
              EXPLORE ONAM COLLECTION &nbsp;
              <ArrowRight size={18} className={styles.btnArrow} />
            </button>
          </div>

          {/* Bottom of left section: Inline feature icons with thin separators */}
          <div className={styles.inlineFeatures}>
            {inlineFeatures.map((f, i) => (
              <React.Fragment key={i}>
                <div className={styles.inlineFeatureItem}>
                  <span className={styles.inlineIcon}>{f.icon}</span>
                  <span className={styles.inlineText}>
                    {f.line1}
                    <br />
                    {f.line2}
                  </span>
                </div>
                {i < inlineFeatures.length - 1 && (
                  <div className={styles.featureSeparator} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL (55%) */}
        <div className={styles.rightPanel}>
          {/* Subtle Kerala-inspired Line Art Decoration SVG */}
          <svg
            className={styles.keralaArtSvg}
            viewBox="0 0 800 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Houseboat (Kettuvallam) */}
            <g
              stroke="#DCC8AB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 150 480 Q 250 510 450 510 Q 550 510 620 470 Q 450 495 250 495 Z" />
              <path d="M 180 485 Q 350 520 600 475" />
              <path d="M 240 485 Q 260 410 380 410 Q 500 410 520 480" />
              <path d="M 270 485 Q 285 425 380 425 Q 475 425 490 480" />
              <path d="M 300 420 L 300 485" strokeDasharray="3 3" />
              <path d="M 340 415 L 340 485" strokeDasharray="3 3" />
              <path d="M 380 410 L 380 485" strokeDasharray="3 3" />
              <path d="M 420 415 L 420 485" strokeDasharray="3 3" />
              <path d="M 460 420 L 460 485" strokeDasharray="3 3" />
              <path d="M 140 460 L 220 495" />
              <path d="M 580 470 L 650 500" />
              <path d="M 100 520 Q 150 515 200 520 T 300 520 T 400 520 T 500 520 T 600 520 T 700 520" />
              <path d="M 160 535 Q 220 530 280 535 T 400 535 T 520 535 T 640 535" />
              <path d="M 220 550 Q 280 546 340 550 T 460 550 T 580 550" />
            </g>

            {/* Coconut Palm Trees */}
            <g
              stroke="#DCC8AB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 160 480 Q 180 320 220 180" />
              <path d="M 164 480 Q 183 320 223 180" strokeDasharray="6 4" />
              <path d="M 220 180 Q 150 140 100 170" />
              <path d="M 220 180 Q 170 110 130 115" />
              <path d="M 220 180 Q 210 90 200 80" />
              <path d="M 220 180 Q 260 100 290 110" />
              <path d="M 220 180 Q 280 140 310 170" />
              <path d="M 220 180 Q 250 190 270 230" />

              <path d="M 270 480 Q 285 360 310 240" />
              <path d="M 310 240 Q 250 200 210 230" />
              <path d="M 310 240 Q 270 170 240 180" />
              <path d="M 310 240 Q 310 150 300 140" />
              <path d="M 310 240 Q 360 170 380 180" />
              <path d="M 310 240 Q 370 210 390 240" />
            </g>

            {/* Banana Leaves on far right */}
            <g
              stroke="#DCC8AB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 680 500 Q 720 380 770 260" />
              <path d="M 770 260 Q 710 290 680 340 M 770 260 Q 730 320 700 380 M 770 260 Q 750 340 730 420" />
              <path d="M 770 260 Q 785 310 790 370 M 770 260 Q 795 290 800 330" />
            </g>

            {/* Hanging Flower Garlands (Thoranam) from Top Right */}
            <g stroke="#DCC8AB" strokeWidth="1.4" strokeLinecap="round">
              <line
                x1="620"
                y1="0"
                x2="620"
                y2="220"
                strokeDasharray="1 6"
                strokeWidth="3"
              />
              <circle cx="620" cy="50" r="6" />
              <circle cx="620" cy="100" r="7" />
              <circle cx="620" cy="150" r="6" />
              <circle cx="620" cy="200" r="8" />
              <path d="M 614 220 L 620 235 L 626 220 Z" fill="#DCC8AB" />

              <line
                x1="690"
                y1="0"
                x2="690"
                y2="280"
                strokeDasharray="1 6"
                strokeWidth="3"
              />
              <circle cx="690" cy="40" r="7" />
              <circle cx="690" cy="90" r="6" />
              <circle cx="690" cy="140" r="8" />
              <circle cx="690" cy="190" r="6" />
              <circle cx="690" cy="240" r="7" />
              <path d="M 684 280 L 690 295 L 696 280 Z" fill="#DCC8AB" />

              <line
                x1="750"
                y1="0"
                x2="750"
                y2="180"
                strokeDasharray="1 6"
                strokeWidth="3"
              />
              <circle cx="750" cy="60" r="6" />
              <circle cx="750" cy="110" r="7" />
              <circle cx="750" cy="160" r="6" />
              <path d="M 744 180 L 750 195 L 756 180 Z" fill="#DCC8AB" />
            </g>
          </svg>

          {/* Model Image anchored to bottom right */}
          <div className={styles.modelsImageWrapper}>
            <Image
              src="/onamHero.webp"
              alt="Premium Onam Collection - Festive Wear"
              fill
              priority
              className={styles.modelsImage}
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <div className={styles.featuresBar}>
        <div className={styles.featuresTrack}>
          {barFeatures.map((item, i) => (
            <div key={i} className={styles.featureItem}>
              <span className={styles.featureIcon}>{item.icon}</span>
              <span className={styles.featureText}>{item.text}</span>
            </div>
          ))}
          <div className={styles.mobileDuplicate}>
            {barFeatures.map((item, i) => (
              <div key={"d" + i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{item.icon}</span>
                <span className={styles.featureText}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

