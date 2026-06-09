import Link from "next/link";
import { Wand2 } from "lucide-react";
import styles from "./page.module.css";

export default function DesignStudioLanding() {
  return (
    <div className={styles.container}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.title}>KINGFOX DESIGN STUDIO</h1>
            <p className={styles.subtitle}>
              Create your fully customized premium apparel. Add your art, choose
              your colors, and get real-time previews instantly.
            </p>
            <Link href="/design-studio/select" className={styles.ctaButton}>
              <Wand2 size={20} />
              Start Designing Now
            </Link>
          </div>
        </section>

        {/* Features removed — hero now occupies full viewport */}
      </main>
    </div>
  );
}
