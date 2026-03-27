import styles from "./terms.module.css";

export default function TermsConditions() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h1>Terms & Conditions</h1>
          <p>Last updated: March 20, 2026</p>
        </div>

        {/* Intro */}
        <p className={styles.intro}>
          These Terms & Conditions ("Terms") govern your use of{" "}
          <strong>King Fox Clothing</strong>. By using our website, you agree to
          these terms.
        </p>

        {/* Sections */}
        <section className={styles.section}>
          <h2>1. Eligibility</h2>
          <p>
            You must be at least 18 years old or under supervision of a guardian.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Products & Availability</h2>
          <ul>
            <li>Products are subject to availability</li>
            <li>Images are for illustration only</li>
            <li>Products may change without notice</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Pricing & Payments</h2>
          <ul>
            <li>Prices shown at checkout</li>
            <li>Payment required before confirmation</li>
            <li>Secure third-party payment processing</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Orders & Cancellation</h2>
          <p>
            Orders may be cancelled due to stock issues, errors, or fraud
            detection.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Shipping & Delivery</h2>
          <p>
            Delivery timelines may vary. We are not responsible for courier delays.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Returns & Refunds</h2>
          <p>
            Subject to our refund policy. Items must be in original condition.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. User Accounts</h2>
          <p>
            You are responsible for maintaining your account credentials.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Prohibited Activities</h2>
          <ul>
            <li>Illegal use of website</li>
            <li>False information</li>
            <li>Security interference</li>
            <li>Content misuse</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>9. Intellectual Property</h2>
          <p>
            All content belongs to King Fox Clothing and cannot be reused.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Liability</h2>
          <p>
            We are not liable for indirect or consequential damages.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Governing Law</h2>
          <p>These terms are governed by Qatar law.</p>
        </section>

        <section className={styles.section}>
          <h2>12. Contact</h2>
          <div className={styles.contact}>
            <p><strong>King Fox Clothing</strong></p>
            <p>King Fox Clothing, MNS Avenue,Calicut</p>
            <p>📞 +91 8129 8822 45</p>
            <p>✉️ kingfoxclothingstore@gmail.com</p>
          </div>
        </section>

      </div>
    </main>
  );
}