'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./register.module.css";
import { completeProfile } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const params = useSearchParams();

  const email = params.get("email");
  const token = params.get("token");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  try {
    if (!name) return alert("Enter your name");

    setLoading(true);

    await completeProfile(token!, { name, phone });

    const user = {
      id: 1,
      name,
      email: email!,
      role: "customer",
    };

    login(token!, user);

    // ✅ IMPORTANT FIX
    window.location.href = "/profile"; // 🔥 FORCE FULL RESET

  } catch (err) {
    console.error(err);
    alert("Failed to complete profile");
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
            type="text"
            placeholder="Enter your phone"
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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