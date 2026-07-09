import Link from "next/link";
import { Wand2 } from "lucide-react";
import styles from "./page.module.css";
import { createMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export async function generateMetadata() {
  return createMetadata({
    title: "Design Studio — Customize Apparel | Kingfox",
    description:
      "Design Studio — personalize apparel with text, images, and real-time previews. Start customizing your apparel at Kingfox.",
    pathname: "/design-studio/select",
  });
}

export default function DesignStudioLanding() {
  return (
    <div className={styles.container}>
      <main>
        <BreadcrumbJsonLd
          items={[
            {
              name: "Design Studio",
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/design-studio/select`,
            },
          ]}
        />
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
