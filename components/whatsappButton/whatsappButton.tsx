"use client";

import { FaWhatsapp } from "react-icons/fa";
import styles from "./whatsappButton.module.css";

const PHONE = "+91 98765 43210";
const MESSAGE = encodeURIComponent(
    "Hi Kingfox, I'm interested in your products."
);

export default function WhatsappButton() {
    return (
        <a
          href={`https://wa.me/${PHONE}?text=${MESSAGE}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
          aria-label="Chat on Whatsapp"
        >
            <FaWhatsapp size={28}/>
            <span>Chat with us</span>    
        </a>
    )
}