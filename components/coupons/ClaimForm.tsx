"use client";

import React, { useState, useEffect } from "react";

interface ClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export default function ClaimForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: ClaimFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setNameTouched(false);
      setPhoneTouched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation functions
  const validateName = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return "Name is required";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validatePhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "WhatsApp number is required";
    if (digits.length !== 10) return "Must be exactly 10 digits";
    if (!/^[6-9]\d{9}$/.test(digits))
      return "Must be a valid 10-digit Indian mobile number (starts with 6-9)";
    return "";
  };

  const nameError = nameTouched ? validateName(name) : "";
  const phoneError = phoneTouched ? validatePhone(phone) : "";

  const isFormValid =
    validateName(name) === "" && validatePhone(phone) === "" && !isSubmitting;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);

    if (isFormValid) {
      onSubmit(name.trim(), phone);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-inter">
      {/* Texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-md bg-white p-6 sm:p-8 rounded-xl border-4 border-kf-black shadow-[12px_12px_0px_#111111] transform -rotate-1 z-10 overflow-hidden">
        {/* Tape Accent */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 tape transform rotate-2 z-20 border border-yellow-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 w-9 h-9 bg-kf-black text-white hover:bg-kf-yellow hover:text-kf-black font-bold flex items-center justify-center rounded-lg border-2 border-kf-black transition-colors"
          aria-label="Close form"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-block bg-kf-yellow text-kf-black font-anton text-lg px-4 py-1 uppercase transform -rotate-2 border-2 border-kf-black shadow-[3px_3px_0px_#111] mb-3">
            CLAIM YOUR REWARD
          </div>
          <h2 className="font-anton text-3xl text-kf-black uppercase leading-tight">
            ENTER YOUR DETAILS
          </h2>
          <p className="font-inter text-xs font-semibold text-gray-600 mt-1">
            Your prize coupon & details will be sent to your WhatsApp.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 transform -rotate-1">
            <span className="material-symbols-outlined text-lg text-red-600 flex-shrink-0">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Field */}
          <div>
            <label className="block font-anton text-sm uppercase text-kf-black mb-1 tracking-wide">
              FULL NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="e.g. Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 bg-gray-50 text-kf-black font-inter text-sm rounded-lg border-2 ${
                nameError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-kf-black focus:border-kf-yellow"
              } focus:outline-none shadow-[3px_3px_0px_#111] transition-all`}
            />
            {nameError && (
              <p className="text-xs text-red-600 font-semibold mt-1">
                {nameError}
              </p>
            )}
          </div>

          {/* WhatsApp Field */}
          <div>
            <label className="block font-anton text-sm uppercase text-kf-black mb-1 tracking-wide">
              WHATSAPP NUMBER <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-anton text-xs text-gray-500 pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => setPhoneTouched(true)}
                disabled={isSubmitting}
                maxLength={10}
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-kf-black font-inter text-sm rounded-lg border-2 ${
                  phoneError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-kf-black focus:border-kf-yellow"
                } focus:outline-none shadow-[3px_3px_0px_#111] transition-all`}
              />
            </div>
            {phoneError && (
              <p className="text-xs text-red-600 font-semibold mt-1">
                {phoneError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 mt-2 font-anton text-2xl uppercase tracking-wider transition-all rounded-lg border-4 border-kf-black shadow-[6px_6px_0px_#111] ${
              isFormValid && !isSubmitting
                ? "bg-kf-yellow text-kf-black hover:bg-yellow-400 active:translate-y-1 active:shadow-none cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none"
            } flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-6 w-6 text-kf-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>CLAIMING...</span>
              </>
            ) : (
              <span>SUBMIT &amp; CLAIM PRIZE 🎁</span>
            )}
          </button>

          <p className="text-[10px] text-center text-gray-500 uppercase font-semibold mt-1">
            * By clicking claim, you agree to receive coupon details via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}
