import React from 'react';
import Image from 'next/image';
import styles from './About.module.css';
import { Fingerprint, Palette, Flag, Activity,Factory,Leaf,ShieldCheck} from "lucide-react";

const AboutPage = () => {
  return (
    <>
    <main className={styles.container}>
      {/* Top Heading Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          LIVING OUT EVERY SINGLE DAY <br />
          AND BE BRAVE TO SHOW OFF <br />
          YOUR OWN TRUE COLORS
        </h1>
        <p className={styles.heroSub}>
          LIVE EVERY DAY BOLDLY — AND SHOW YOUR TRUE  <br />COLORS.
        </p>
      </header>

      {/* Main Content Section */}
      <section className={styles.contentGrid}>
        <div className={styles.imageContainer}>
          <Image
            src="/aboutas.png" 
            alt="King Fox Lifestyle"
            fill // This makes the image fill the container entirely
            className={styles.mainImg}
            priority
          />
        </div>
        <div className={styles.textContent}>
          <h2 className={styles.rootedTitle}>
            ROOTED IN THE <br />
            <span className={styles.blackBox}>UNDERGROUND</span>
          </h2>

          <div className={styles.description}>
            <h3 className={styles.brandName}>King Fox Clothing</h3>
            <p>
              Since 2009, King Fox has been more than just streetwear it’s a movement. 
              Born from the streets, fueled by culture, and built for those who live 
              loud and move different.
            </p>
            <p>
              Inspired by music, art, skate, and city life, every drop reflects raw 
              authenticity and creative hustle. We don’t chase trends we set them.
            </p>
            <p>
              From underground roots to global reach, we stay true to what matters: 
              quality, identity, and expression.
            </p>
            <p className={styles.legacyText}>
              This is legacy wear. Your Second Skin. <br />
              Stay real. Stay loud.
            </p>
            <span className={styles.bottomTag}>DEFINING THE NEW STANDARD</span>
          </div>
        </div>
      </section>

      {/* New Values Section */}
        <section className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <Fingerprint size={32} strokeWidth={1.5} />
            <h4>AUTHENTICITY</h4>
            <p>No masks, no pretenses. Real recognize real in every stitch of our garments.</p>
          </div>

          <div className={styles.valueCard}>
            <Palette size={32} strokeWidth={1.5} />
            <h4>EXPRESSION</h4>
            <p>Your canvas, your rules. Wearable art designed for the creative soul.</p>
          </div>

          <div className={styles.valueCard}>
            <Activity  size={32} strokeWidth={1.5} />
            <h4>STREET CULTURE</h4>
            <p>The pulse of the pavement drives every design decision we make.</p>
          </div>

          <div className={styles.valueCard}>
            <Flag size={32} strokeWidth={1.5} />
            <h4>PROUDLY INDIAN</h4>
            <p>Homegrown excellence, crafted meticulously for a global stage.</p>
          </div>
        </section>

        {/* Origin Story Section */}
<section className={styles.originStory}>
  <div className={styles.topDivider}></div>
  <div className={styles.badge}>THE ORIGIN STORY</div>
  <h2 className={styles.originTitle}>WE ARE PROUDLY INDIAN</h2>

  <div className={styles.specsGrid}>
    <div className={styles.specCard}>
      <div className={styles.specIcon}>
        <Factory size={24} />
      </div>
      <div className={styles.specText}>
        <span>MANUFACTURING</span>
        <strong>MADE IN INDIA</strong>
      </div>
    </div>

    <div className={styles.specCard}>
      <div className={styles.specIcon}>
        <Leaf size={24} />
      </div>
      <div className={styles.specText}>
        <span>MATERIAL</span>
        <strong>PREMIUM COTTON</strong>
      </div>
    </div>

    <div className={styles.specCard}>
      <div className={styles.specIcon}>
        <ShieldCheck size={24} />
      </div>
      <div className={styles.specText}>
        <span>QUALITY</span>
        <strong>ETHICALLY SOURCED</strong>
      </div>
    </div>
  </div>

  <p className={styles.originDescription}>
    BY MERGING TRADITIONAL TEXTILE MASTERY WITH AGGRESSIVE <br />
    CONTEMPORARY AESTHETICS, WE SHOWCASE INDIAN <br />
    CRAFTSMANSHIP IN ITS MOST DEFIANT FORM.
  </p>
   <div className={styles.bottomDivider}></div>
</section>
{/* Legacy CTA Section */}
<section className={styles.legacySection}>
  <h2 className={styles.legacyTitle}>
    THIS IS LEGACY <br />
    WEAR. <br />
    YOUR SECOND SKIN.
  </h2>

  <div className={styles.blackStatementBox}>
    <h3 className={styles.statementText}>
      STAY REAL. STAY <br />
      LOUD.
    </h3>
  </div>

  <button className={styles.exploreButton}>
    EXPLORE THE DROP
  </button>
</section>
    </main>
    </>
  );
};

export default AboutPage;