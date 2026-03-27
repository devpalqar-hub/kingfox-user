import styles from "./privacy.module.css";

export default function PrivacyPolicy() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
            <h1>Privacy Policy</h1>
            <p>Last updated: March 20, 2026</p>
            </div>

        {/* Intro */}
        <p className={styles.intro}>
          This Privacy Policy explains how <strong>King Fox Clothing</strong>
          ("we", "us", "our") collects, uses, and protects your information.
        </p>

        {/* Sections */}
        <div className={styles.section}>
          <h2>1. Information We Collect</h2>

          <h3>Information You Provide</h3>
          <ul>
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Billing & shipping address</li>
            <li>Order history</li>
            <li>Login credentials</li>
          </ul>

          <h3>Automatically Collected</h3>
          <ul>
            <li>IP address</li>
            <li>Device & browser info</li>
            <li>Usage data</li>
            <li>Cookies</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>2. How We Use Information</h2>
          <ul>
            <li>Order processing</li>
            <li>Customer support</li>
            <li>Improve experience</li>
            <li>Fraud prevention</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your data. We only share with trusted partners like
            payment and delivery services when required.
          </p>
        </div>

        <div className={styles.section}>
          <h2>4. Data Security</h2>
          <p>
            We use security measures to protect your data, but no system is 100%
            secure.
          </p>
        </div>

        <div className={styles.section}>
          <h2>5. Data Retention</h2>
          <p>
            We keep data only as long as necessary for legal and business needs.
          </p>
        </div>

        <div className={styles.section}>
          <h2>6. Children’s Privacy</h2>
          <p>Our services are not intended for users under 18.</p>
        </div>

        <div className={styles.section}>
          <h2>7. Your Rights</h2>
          <p>You can request access, correction, or deletion of your data.</p>
        </div>

        <div className={styles.section}>
          <h2>8. Contact</h2>
          <div className={styles.contact}>
            <p><strong>King Fox Clothing</strong></p>
            <p>King Fox Clothing, MNS Avenue, Calicut</p>
            <p>📞 +91 8129 8822 45</p>
            <p>✉️ kingfoxclothingstore@gmail.com</p>
          </div>
        </div>

      </div>
    </main>
  );
}