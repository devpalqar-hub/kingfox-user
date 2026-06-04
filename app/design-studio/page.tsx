import Link from 'next/link';
import { Palette, Wand2, Shirt, Sparkles } from 'lucide-react';
import styles from './page.module.css';

export default function DesignStudioLanding() {
  return (
    <div className={styles.container}>
      <main>
        <section className={styles.hero}>
          <h1 className={styles.title}>KingFox Design Studio</h1>
          <p className={styles.subtitle}>
            Create your fully customized premium apparel. Add your art, choose your colors, and get real-time previews instantly.
          </p>
          <Link href="/design-studio/select" className={styles.ctaButton}>
            <Wand2 size={20} />
            Start Designing Now
          </Link>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Shirt size={32} color="#fff" />
              </div>
              <h3 className={styles.featureTitle}>Premium Apparel</h3>
              <p className={styles.featureDesc}>
                Choose from our high-quality oversized tees, hoodies, and more as your blank canvas.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Palette size={32} color="#fff" />
              </div>
              <h3 className={styles.featureTitle}>Unlimited Customization</h3>
              <p className={styles.featureDesc}>
                Add custom text, upload your own logos, and place artwork anywhere on the garment.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Sparkles size={32} color="#fff" />
              </div>
              <h3 className={styles.featureTitle}>Real-time Preview</h3>
              <p className={styles.featureDesc}>
                See exactly how your design will look before you order, with instant price estimates.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
