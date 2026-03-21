'use client';
import React, { useState } from 'react';
import styles from './Contact.module.css';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Mail, MessageSquare, Instagram, MapPin } from 'lucide-react';
import { ChevronRight, Truck } from 'lucide-react';
const ContactPage = () => {
  const contactDetails = [
    {
      icon: <Mail size={24} />,
      label: 'EMAIL SUPPORT',
      value: 'support@kingfoxclothing.com',
      subtext: '24hr response time',
    },
    {
      icon: <MessageSquare size={24} />,
      label: 'WHATSAPP',
      value: '+91 98765 43210',
      subtext: 'Mon-Sat, 10am - 8pm',
    },
    {
      icon: <Instagram size={24} />,
      label: 'INSTAGRAM',
      value: '@kingfoxclothing',
      subtext: 'DM for quick queries',
    },
    {
      icon: <MapPin size={24} />,
      label: 'LOCATION',
      value: 'Kerala, India', // Corrected spelling from your screenshot's "kerela"
      subtext: 'Global shipping operations',
    },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqData = [
    {
      question: "WHERE IS MY ORDER?",
      answer: "You can track your order using the 'Track Order' button at the top of this page or by clicking the link sent to your email/WhatsApp."
    },
    {
      question: "HOW DO I CHOOSE THE RIGHT SIZE?",
      answer: "Check our size guide available on every product page. If you're between sizes, we usually recommend sizing up for a relaxed street fit."
    },
    {
      question: "DO YOU ACCEPT INTERNATIONAL ORDERS?",
      answer: "Currently, we ship across India. We are working on bringing King Fox clothing to the global stage very soon!"
    }
  ];

  const toggleFAQ = (index: number) => {
  setOpenIndex(openIndex === index ? null : index);
};
  return (
    <>
    <section className={styles.contactHero}>
      <div className={styles.container}>
        {/* Left Content */}
        <div className={styles.textContent}>
          <h1 className={styles.title}>
            CONTACT <br /> US
          </h1>
          <p className={styles.description}>
            Got questions about your order or sizing? Our <br />
            street-ops team is here to help you gear up.
          </p>
          <button className={styles.trackButton}>
            TRACK ORDER
          </button>
        </div>

        {/* Right Image */}
        <div className={styles.imageWrapper}>
          <img 
            src="/contact.png" 
            alt="Customer Support" 
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>

    <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          {contactDetails.map((item, index) => (
            <div key={index} className={styles.infoCard}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <p className={styles.infoLabel}>{item.label}</p>
              <h3 className={styles.infoValue}>{item.value}</h3>
              <p className={styles.infoSubtext}>{item.subtext}</p>
            </div>
          ))}
        </div>
      </section>


      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          
          {/* Left Side: Contact Form */}
          <div className={styles.formContent}>
            <h2 className={styles.formTitle}>DROP US A LINE</h2>
            <p className={styles.formSubtitle}>
              Fields marked with * are required for our team to process your request.
            </p>
            
            <form className={styles.contactForm}>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>FULL NAME *</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className={styles.inputGroup}>
                  <label>EMAIL ADDRESS *</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label>SUBJECT</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.selectInput}>
                    <option>Order Status Update</option>
                    <option>Returns & Exchanges</option>
                    <option>Sizing Help</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>YOUR MESSAGE *</label>
                <textarea placeholder="Tell us what's on your mind..." rows={6} required></textarea>
              </div>

              <button type="submit" className={styles.submitButton}>
                SEND MESSAGE
              </button>
            </form>
          </div>

          {/* Right Side: Sidebar & Map */}
          <div className={styles.sidebar}>
            <div className={styles.supportCard}>
              <h3>SUPPORT CENTER</h3>
              <ul className={styles.supportLinks}>
                <li>Frequently Asked Questions <ChevronRight size={18} /></li>
                <li>Shipping Information <ChevronRight size={18} /></li>
                <li>Return Policy <ChevronRight size={18} /></li>
              </ul>
              <div className={styles.deliveryBadge}>
                <Truck size={24} />
                <div>
                  <p className={styles.badgeTitle}>FREE DELIVERY</p>
                  <p className={styles.badgeText}>ACROSS INDIA ON ORDERS OVER ₹1,999</p>
                </div>
              </div>
            </div>

            <div className={styles.mapPlaceholder}>
               {/* Replace with an <iframe> or actual Map component */}
               <div className={styles.mapPin}>
                 <span className={styles.pinIcon}>📍</span>
                 <p>kerela, India</p>
               </div>
            </div>
          </div>

        </div>
      </section>
      {/* NEW FAQ SECTION */}
      <section className={styles.faqSection}>
        <h2 className={styles.faqMainTitle}>QUICK HELP FAQ</h2>
        <div className={styles.faqContainer}>
          {faqData.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <button 
                className={styles.faqHeader} 
                onClick={() => toggleFAQ(index)}
              >
                <span>{item.question}</span>
                <ChevronDown 
                  className={`${styles.faqIcon} ${openIndex === index ? styles.iconRotate : ''}`} 
                  size={20} 
                />
              </button>
              <div className={`${styles.faqAnswer} ${openIndex === index ? styles.answerShow : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    
</>
    
  );
};

export default ContactPage;