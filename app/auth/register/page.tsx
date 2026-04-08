'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./register.module.css";
import { completeProfile } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const params = useSearchParams();

  const token = params.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!name) {
        showToast("Please enter your name", "error");
        return;
      }

      if (!email) {
        showToast("Please enter your email", "error");
        return;
      }

      setLoading(true);

      await completeProfile(token!, { name, email });

      const user = {
        id: 1,
        name,
        email,
        role: "customer",
      };

      login(token!, user);

      showToast("Profile completed successfully ", "success", 2500);

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (err) {
      console.error(err);

      showToast("Failed to complete profile", "error", 3000);

    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>

        <h1 className={styles.logo}>KING <br /> FOX</h1>

        <div className={styles.line}></div>

        <h2 className={styles.title}>COMPLETE PROFILE</h2>

        <p className={styles.subtitle}>
          Finish setting up your account
        </p>

        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter your name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter your email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          className={styles.otpButton}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "CONTINUE"}
        </button>

        <p className={styles.terms}>
          BY CONTINUING, YOU AGREE TO THE <span>TERMS</span>
        </p>

      </div>
    </div>
  );
}