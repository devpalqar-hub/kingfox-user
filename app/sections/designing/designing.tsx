"use client"
import styles from "./designing.module.css";
// Try Shirt instead of Hanger for a cleaner apparel look
import { Shirt, Palette, ShoppingBag } from "lucide-react";

const Designing = () => {
  const steps = [
    {
      icon: <Shirt size={32} />,
      title: "1. SELECT FIT",
      description: "Choose from Oversized, Relaxed, or Regular fits.",
    },
    {
      icon: <Palette size={32} />,
      title: "2. CUSTOMIZE",
      description: "Upload art or use our editor to place elements.",
    },
    {
      icon: <ShoppingBag size={32} />,
      title: "3. ORDER",
      description: "We print with premium tech and ship to you.",
    },
  ];

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <p className={styles.subtext}>UNLOCK YOUR CREATIVITY</p>
        <h1 className={styles.title}>
          DESIGN YOUR OWN <span className={styles.badge}>TEE</span>
        </h1>
      </header>

      <div className={styles.grid}>
        {steps.map((step, index) => (
          <div key={index} className={styles.stepCard}>
            <div className={styles.iconWrapper}>{step.icon}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>

      <button
        className={styles.ctaButton}
        onClick={() => {
          const phoneNumber = "917594092293"; 
          const message = encodeURIComponent(
            "Hi, I want to design my own tee 👕",
          );

          window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
        }}
      >
        START DESIGNING NOW
      </button>
    </section>
  );
};

export default Designing;
