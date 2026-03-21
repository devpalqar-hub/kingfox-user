'use client'
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import styles from "./login.module.css";
import { sendOtp, verifyOtp } from "@/services/auth.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
    const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 👉 Send OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const res = await sendOtp(email);
      console.log(res);

      alert("OTP sent successfully");
      setStep("otp");

    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 👉 Verify OTP
const handleVerifyOtp = async () => {
  try {
    setLoading(true);
    const res = await verifyOtp(email, otp);

    // ✅ THIS IS THE KEY FIX
    login(res.access_token, res.user);

    alert("Login successful");
    onClose();

  } catch (err) {
    console.error(err);
    alert("Invalid OTP");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>

        <button className={styles.close} onClick={onClose}>✕</button>

        <h1 className={styles.logo}>KING <br /> FOX</h1>

        <div className={styles.line}></div>

        <h2 className={styles.title}>VERIFICATION</h2>

        {/* STEP 1: EMAIL INPUT */}
        {step === "email" && (
          <>
            <p className={styles.subtitle}>
              Enter your email to continue
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              className={styles.phoneInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className={styles.otpButton}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "SEND OTP"}
            </button>
          </>
        )}

        {/* STEP 2: OTP INPUT */}
        {step === "otp" && (
          <>
            <p className={styles.subtitle}>
              Enter OTP sent to {email}
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              className={styles.phoneInput}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              className={styles.otpButton}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "VERIFY OTP"}
            </button>
          </>
        )}

        <p className={styles.terms}>
          BY CONTINUING, YOU AGREE TO THE <span>TERMS</span>
        </p>

      </div>
    </div>
  );
}