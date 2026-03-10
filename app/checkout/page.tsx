"use client"; // Required for hooks

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import styles from './checkout.module.css';
import { 
  SiRazorpay 
} from 'react-icons/si';
import { 
  MdFlashOn, 
  MdLocalShipping, 
  MdOutlinePayment, 
  MdLocationOn, 
  MdCreditCard, 
  MdAccountBalance, 
  MdPayments, 
  MdLock 
} from 'react-icons/md';
import Image from "next/image";

export default function CheckoutPage() {
const router = useRouter();
const [isPending, setIsPending] = useState(false);
const handlePlaceOrder = async () => {
  setIsPending(true);

  // simulate order processing
  setTimeout(() => {
    router.push("/orderplaced");
  }, 1500);
};
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Express Checkout Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdFlashOn /> EXPRESS CHECKOUT
          </h2>
          <div className={styles.expressButtons}>
            <button className={styles.upiBtn}>
              <MdPayments /> PAY VIA UPI
            </button>
            <div className={styles.razorpayPowered}>
              <span>POWERED BY</span>
              <span className={styles.razorpayBrand}>Razorpay</span>
            </div>
          </div>
          <div className={styles.divider}>
            <span>OR CONTINUE WITH SHIPPING</span>
          </div>
        </section>

        {/* Shipping Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdLocalShipping /> SHIPPING DETAILS
          </h2>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>FIRST NAME</label>
              <input type="text" placeholder="ALEX" />
            </div>
            <div className={styles.inputGroup}>
              <label>LAST NAME</label>
              <input type="text" placeholder="FOX" />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>EMAIL ADDRESS</label>
            <input type="email" placeholder="ALEX@KINGFOX.COM" />
          </div>
          <div className={styles.inputGroup}>
            <label>SHIPPING ADDRESS</label>
            <input type="text" placeholder="STREET NAME, HOUSE/APARTMENT NO." />
          </div>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>PIN CODE</label>
              <div className={styles.inputWithIcon}>
                <input type="text" defaultValue="560001" />
                <span className={styles.locationTag}><MdLocationOn /> BENGALURU, KA</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>PHONE NUMBER</label>
              <div className={styles.phoneInput}>
                <span className={styles.countryCode}>+91</span>
                <input type="text" placeholder="98765 43210" />
              </div>
            </div>
          </div>
        </section>

        {/* Coupon Section */}
        <div className={styles.couponSection}>
          <p>HAVE A COUPON? <span>▾</span></p>
          <div className={styles.couponRow}>
            <input type="text" placeholder="ENTER CODE" />
            <button className={styles.applyBtn}>APPLY</button>
          </div>
        </div>

        {/* Payment Method */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdOutlinePayment /> PAYMENT METHOD
          </h2>
          <div className={styles.paymentCardActive}>
            <input type="radio" checked readOnly />
            <div className={styles.paymentInfo}>
              <strong>RAZORPAY SECURE</strong>
              <p>CARDS, NETBANKING, WALLET, UPI</p>
            </div>
            <div className={styles.paymentIcons}>
              <MdCreditCard /> <MdAccountBalance />
            </div>
          </div>
          <div className={styles.paymentCard}>
            <input type="radio" />
            <div className={styles.paymentInfo}>
              <strong>CASH ON DELIVERY (COD)</strong>
              <p>PAY WHEN YOUR ORDER ARRIVES</p>
            </div>
            <MdPayments />
          </div>
        </section>
      </div>

      {/* Sidebar Order Summary */}
      <aside className={styles.sidebar}>
        <div className={styles.summaryCard}>
          <h3>ORDER SUMMARY</h3>
          <div className={styles.productRow}>
            <div className={styles.productImg}>
            <Image
                src="/wishlist1.png"
                alt="Urban Oversized Tee"
                width={85}
                height={95}
            />
            </div>
            <div className={styles.productDetails}>
              <h4>THE URBAN OVERSIZED TEE</h4>
              <p>SIZE: XL | COLOR: MIDNIGHT BLACK</p>
              <div className={styles.priceRow}>
                <span className={styles.price}>₹1,499.00</span>
                <div className={styles.quantity}>
                  <button>-</button>
                  <span>2</span>
                  <button>+</button>
                </div>
              </div>
            </div>
          </div>

          <hr className={styles.summaryDivider} />
          
          <div className={styles.summaryLine}>
            <span>SUBTOTAL</span>
            <span>₹1,499.00</span>
          </div>
          <div className={styles.summaryLine}>
            <span>SHIPPING</span>
            <span className={styles.freeBadge}>FREE SHIPPING</span>
          </div>
          
          <div className={styles.totalLine}>
            <span>TOTAL</span>
            <span>₹1,499.00</span>
          </div>

          <button 
                className={styles.placeOrderBtn} 
                onClick={handlePlaceOrder}
                disabled={isPending}
                >
                <MdLock /> 
                {isPending ? "PROCESSING..." : "PLACE SECURE ORDER"}
          </button>
          
          <div className={styles.secureFooter}>
             <p><MdLock size={12}/> SECURE PAYMENT ENCRYPTED</p>
             <div className={styles.trustIcons}>
               <span>Razorpay</span> <span>VISA</span> <span>MasterCard</span>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}