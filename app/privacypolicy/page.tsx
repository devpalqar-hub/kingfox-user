import styles from "./privacy.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>PRIVACY POLICY</h1>
        <p className={styles.breadcrumb}>
          HOME <span>&gt;</span> PRIVACY POLICY
        </p>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h2>INTRODUCTION</h2>

        <p>
          This Privacy Policy sets out how King Fox Clothing uses and protects
          any personal information of users collected through the website or
          services. :contentReference[oaicite:0]
        </p>

        <p>
          This Policy is published in accordance with the Information Technology
          (Reasonable Security Practices and Procedures and Sensitive Personal
          Data or Information) Rules, 2011.
        </p>

        <p>
          King Fox Clothing is committed to ensuring that your privacy is
          protected and your personal information is used strictly in accordance
          with this policy.
        </p>

        <p>
          By using the Platform, you agree to the collection and use of
          information in accordance with this Privacy Policy.
        </p>

        <h2>LEGAL BASIS</h2>
        <p>
          This policy complies with:
          <br />• Digital Personal Data Protection Act, 2023 <br />
          • Information Technology Act, 2000 <br />• IT Rules, 2011 <br />• IT
          Intermediary Guidelines, 2021
        </p>

        <h2>CONSENT</h2>
        <p>
          By using our Platform, you consent to the collection, storage, and use
          of your information. You may withdraw consent anytime by contacting us.
        </p>

        <h2>INFORMATION WE COLLECT</h2>
        <p>
          We collect personal details such as name, email, phone number, address,
          payment details, and account credentials.
        </p>

        <p>
          We also automatically collect data such as IP address, browser type,
          device info, cookies, and usage behavior.
        </p>

        <h2>HOW WE USE INFORMATION</h2>
        <p>
          Your information is used to:
          <br />• Provide services and process orders <br />• Improve user
          experience <br />• Prevent fraud <br />• Send updates and promotional
          content
        </p>

        <h2>DATA SHARING</h2>
        <p>
          We do not sell your data. We only share information with trusted
          partners for payment processing, logistics, and legal compliance.
        </p>

        <h2>DATA RETENTION</h2>
        <p>
          We retain your data as long as necessary to provide services or comply
          with legal obligations. You can request deletion anytime.
        </p>

        <h2>COOKIES</h2>
        <p>
          Cookies help us enhance your experience by remembering preferences and
          tracking usage behavior.
        </p>

        <h2>SECURITY</h2>
        <p>
          We implement strict security measures to protect your data, but no
          system is completely secure.
        </p>

        <h2>THIRD-PARTY LINKS</h2>
        <p>
          Our website may contain links to third-party sites. We are not
          responsible for their privacy practices.
        </p>

        <h2>USER RIGHTS</h2>
        <p>
          You can update, correct, or delete your data anytime. You may also opt
          out of marketing communications.
        </p>

        <h2>CONTACT</h2>
        <p>
          Email: kingfoxclothingstore@gmail.com
        </p>

        <h2>GOVERNING LAW</h2>
        <p>
          This Privacy Policy is governed by the laws of India. Any disputes will
          be handled in Mumbai courts.
        </p>
      </div>
    </div>
  );
}