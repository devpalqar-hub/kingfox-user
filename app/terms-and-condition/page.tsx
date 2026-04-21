import styles from "./terms.module.css";

export default function TermsPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>TERMS & CONDITIONS</h1>
        <p className={styles.breadcrumb}>
          HOME <span>&gt;</span> TERMS & CONDITIONS
        </p>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p>
          PLEASE READ THESE TERMS OF USE CAREFULLY. BY SIGNING UP TO AND/OR USING
          THIS PLATFORM AND OUR SERVICES, YOU AGREE TO BE BOUND BY ALL OF THE
          BELOW TERMS AND CONDITIONS AND PRIVACY POLICY. :contentReference[oaicite:0]
        </p>

        <p>
          The website at www.kingfoxclothing.com (“Website”) is owned and
          operated by King Fox Clothing (“KING FOX CLOTHING”, “we”, “us”, “our”).
          The Website are collectively referred to as “Platform”.
        </p>

        <p>
          These terms of service (“Terms” / “Terms of Use”) describe the terms on
          which KING FOX CLOTHING grants users access to the Platform, and should
          be read with the privacy policy available at:
          https://www.thekingfoxclothing.com/privacy-policy (“Privacy Policy”).
        </p>

        <p>
          King Fox Clothing enables artists to earn money from their artwork by
          making it available for sale as products without giving up control of
          their rights.
        </p>

        <p>
          King Fox Clothing offers the Platform conditioned upon the user’s
          acceptance of all terms. By using the Platform, you agree to be bound by
          these Terms.
        </p>

        <p>
          We reserve the right to review and amend the Services without notice.
          If you do not agree, do not use this Website.
        </p>

        <h2>ABOUT OUR SERVICES</h2>
        <p>
          King Fox Clothing provides services including publishing, selling,
          promoting, and purchasing merchandise such as clothing, footwear, and
          accessories, along with payment processing and order fulfillment.
        </p>

        <h2>HOW TO USE THE SERVICES</h2>
        <p>
          We grant you a limited, non-transferable license to access and use the
          platform. Any misuse or illegal activity may result in suspension.
        </p>

        <h2>ACCOUNT</h2>
        <p>
          You must create an account to use our services. You are responsible for
          maintaining confidentiality of your credentials and all activities
          under your account.
        </p>

        <h2>SUBSCRIPTION</h2>
        <p>
          Membership plans may be offered and can be updated at any time. Fees are
          non-refundable unless cancelled by King Fox Clothing.
        </p>

        <h2>PRODUCT INFORMATION</h2>
        <p>
          We strive for accuracy but do not guarantee product descriptions,
          pricing, or availability are error-free.
        </p>

        <h2>CONTENT & COPYRIGHT POLICY</h2>
        <p>
          You retain ownership of content you upload but grant us a license to use
          it. You must not upload illegal, offensive, or infringing content.
        </p>

        <h2>DISCLAIMER</h2>
        <p>
          Services are provided “as is” without warranties. We are not liable for
          indirect damages or data loss.
        </p>

        <h2>INTELLECTUAL PROPERTY</h2>
        <p>
          All platform content including logos, text, and graphics are owned by
          King Fox Clothing and protected by law.
        </p>

        <h2>TERMINATION</h2>
        <p>
          We may terminate accounts at any time if terms are violated.
        </p>

        <h2>GOVERNING LAW</h2>
        <p>
          These terms are governed by the laws of India and disputes will be
          handled in Mumbai courts.
        </p>

        <h2>CONTACT</h2>
        <p>
          Email: kingfoxclothingstore@gmail.com <br />
          Phone: +91 8129882245 <br />
          Address: MN’S Avenue, Calicut, Kerala – 673001
        </p>
      </div>
    </div>
  );
}