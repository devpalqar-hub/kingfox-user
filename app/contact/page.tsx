'use client';

import { useState } from 'react';
import styles from './Contact.module.css';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Mail, MessageSquare, Instagram, MapPin } from 'lucide-react';
import { ChevronRight, Truck } from 'lucide-react';
import { sendContactForm } from '@/services/contact.service';
import { FaCheckCircle } from "react-icons/fa";

const ContactPage = () => {

  const [formData, setFormData] = useState({
  name: '',
  email: '',
  subject: 'Order Status Update',
  message: '',
});

const [loading, setLoading] = useState(false);
const [modalMessage, setModalMessage] = useState('');
const [showModal, setShowModal] = useState(false);


const handleChange = (e: any) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await sendContactForm(formData);

    setModalMessage(res.message);
    setShowModal(true);

    // reset form
    setFormData({
      name: '',
      email: '',
      subject: 'Order Status Update',
      message: '',
    });

  } catch (err: any) {
    setModalMessage('Something went wrong. Please try again.');
    setShowModal(true);
  } finally {
    setLoading(false);
  }
};
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

  {/* ✅ ONLY ONE FORM + onSubmit */}
  <form className={styles.contactForm} onSubmit={handleSubmit}>
    
    <div className={styles.inputRow}>
      <div className={styles.inputGroup}>
        <label>FULL NAME *</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          type="text"
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label>EMAIL ADDRESS *</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          required
        />
      </div>
    </div>

    <div className={styles.inputGroup}>
      <label>SUBJECT</label>
      <div className={styles.selectWrapper}>
        <select
            className={styles.selectInput}   // ✅ ADD THIS
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          >
          <option>Order Status Update</option>
          <option>Returns & Exchanges</option>
          <option>Sizing Help</option>
        </select>
      </div>
    </div>

    <div className={styles.inputGroup}>
      <label>YOUR MESSAGE *</label>
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        rows={5}
        required
      />
    </div>

    <button
      type="submit"
      className={styles.submitButton}
      disabled={loading}
    >
      {loading ? "Sending..." : "SEND MESSAGE"}
    </button>

  </form>
</div>

          {/* Right Side: Sidebar & Map */}
          <div className={styles.sidebar}>
            <div className={styles.supportCard}>
              <h3>SUPPORT CENTER</h3>
              <ul className={styles.supportLinks}>
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
      <section id="faq" className={styles.faqSection}>
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
    {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      
      <div className={styles.modalIcon}>
        <FaCheckCircle />
      </div>

      <h3 className={styles.modalTitle}>Message Sent!</h3>

      <p className={styles.modalText}>
        {modalMessage}
      </p>

      <button
        className={styles.modalBtn}
        onClick={() => setShowModal(false)}
      >
        OK
      </button>

    </div>
  </div>
)}
</>
    
  );
};

export default ContactPage;
