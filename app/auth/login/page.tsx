"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import styles from "./login.module.css";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  prefillPhone?: string;
  prefillEmail?: string;
};

export default function LoginModal({
  isOpen,
  onClose,
  prefillPhone,
  prefillEmail,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { login } = useAuth();
  const [phone, setPhone] = useState<string | undefined>("");
  const [defaultCountry, setDefaultCountry] = useState<any>("IN");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const locale = navigator.language;
    const country = locale.split("-")[1];
    if (country) setDefaultCountry(country);
  }, []);

  useEffect(() => {
    if (prefillPhone) {
      setPhone(prefillPhone);
      return;
    }

    if (prefillEmail) {
      setPhone(prefillEmail);
    }
  }, [prefillPhone, prefillEmail]);

  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
    }
  }, [isOpen]);
  if (!isOpen) return null;

  // 👉 Send OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      if (!phone) {
        showToast("Please enter a valid phone number", "error");
        return;
      }

      await sendOtp(phone);

      showToast("OTP sent successfully", "success", 3000);
      setStep("otp");
    } catch (err) {
      console.error(err);
      showToast("Failed to send OTP", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Verify OTP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      if (!phone) {
        showToast("Invalid phone number", "error");
        return;
      }
      
      const res = await verifyOtp(phone, otp);

      if (res.user) {
        const user = {
          id: Number(res.user.id) || 1,
          name: res.user.name || "User",
          email: res.user.email || "",
          role: res.user.role || "customer",
        };

        login(res.access_token, user);

        showToast("Login successful ", "success", 2500);

        onClose();
      } else if (res.isNew) {
        showToast("Account not found. Continue signup ", "info", 3000);

        router.push(`/auth/register?email=${phone}&token=${res.access_token}`);
      } else {
        const user = {
          id: 1,
          name: "User",
          email: "",
          role: "customer",
        };

        login(res.access_token, user);

        showToast("Login successful ", "success", 2500);

        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast("Invalid OTP ", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>

        <h1 className={styles.logo}>
          KING <br /> FOX
        </h1>

        <div className={styles.line}></div>

        <h2 className={styles.title}>VERIFICATION</h2>

        {/* STEP 1: PHONE INPUT */}
        {step === "phone" && (
          <>
            <p className={styles.subtitle}>
              Enter your phone number to continue
            </p>

            <div className={styles.phoneWrapper}>
              <PhoneInput
                international
                defaultCountry={defaultCountry}
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
                className={styles.phoneInput}
              />
            </div>

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
            <p className={styles.subtitle}>Enter OTP sent to {phone}</p>

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
          BY CONTINUING, YOU AGREE TO THE{" "}
          <Link
            href="/terms-and-condition"
            className={styles.termsLink}
            onClick={onClose} // ✅ CLOSE MODAL
          >
            TERMS
          </Link>
        </p>
      </div>
    </div>
  );
}
