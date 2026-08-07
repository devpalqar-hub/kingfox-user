"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QRCouponClaimResponse } from "@/types/qrCoupon";

interface SuccessPageProps {
  claimData: QRCouponClaimResponse;
}

export default function SuccessPage({ claimData }: SuccessPageProps) {
  const [copied, setCopied] = useState(false);

  const couponCode = claimData.coupon?.code || "QR-00001";
  const prizeReward = claimData.description || "Surprise KingFox Reward";
  const customerName = claimData.customer?.name || "Fox Hunter";
  const customerPhone = claimData.customer?.phone || "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-kf-yellow min-h-screen font-inter text-kf-black pb-24 overflow-x-hidden relative">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10 mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-4 pt-6 pb-4 flex justify-between items-center">
        <div className="bg-kf-black text-kf-yellow font-anton text-2xl px-4 py-2 transform -rotate-3 shadow-[4px_4px_0px_#fff] border-2 border-white">
          KINGFOX
        </div>
        <div className="bg-white text-kf-black font-marker text-xs px-4 py-2 rounded-full border-2 border-kf-black shadow-[3px_3px_0px_#111] transform rotate-3">
          KOCHI CITY HUNT
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-xl mx-auto px-4 pt-4 text-center">
        {/* Congratulations Badge */}
        <div className="inline-block bg-kf-black text-white font-anton text-lg sm:text-xl px-6 py-2 uppercase transform -rotate-2 shadow-[6px_6px_0px_#FFD000] border-2 border-white mb-6 animate-bounce">
          🎉 REWARD UNLOCKED!
        </div>

        <h1 className="font-anton text-5xl sm:text-6xl text-kf-black uppercase leading-tight transform -rotate-1 mb-2">
          CONGRATULATIONS, <br />
          <span className="text-white text-outline">{customerName.toUpperCase()}!</span>
        </h1>

        <p className="font-inter font-bold text-sm sm:text-base text-kf-black mb-8 max-w-md mx-auto">
          You have successfully claimed your exclusive KingFox Kochi Grand Opening reward!
        </p>

        {/* Prize Card */}
        <div className="relative bg-white p-6 sm:p-8 rounded-2xl border-4 border-kf-black shadow-[12px_12px_0px_#111111] transform rotate-1 mb-8 overflow-hidden">
          {/* Tape accents */}
          <div className="absolute -top-3 left-8 w-24 h-6 tape transform -rotate-6 z-20 border border-yellow-300" />
          <div className="absolute -bottom-3 right-8 w-24 h-6 tape transform rotate-6 z-20 border border-yellow-300" />

          {/* Reward Display */}
          <div className="bg-kf-yellow p-4 rounded-xl border-2 border-kf-black mb-6 transform -rotate-1 shadow-[4px_4px_0px_#111]">
            <p className="font-inter font-black text-xs uppercase tracking-widest text-kf-black/70 mb-1">
              YOUR PRIZE WON
            </p>
            <h2 className="font-anton text-3xl sm:text-4xl text-kf-black uppercase leading-none">
              {prizeReward}
            </h2>
          </div>

          {/* Coupon Code Section */}
          <div className="bg-gray-100 p-5 rounded-xl border-2 border-dashed border-kf-black mb-6 flex flex-col items-center gap-2">
            <span className="font-anton text-xs uppercase tracking-wider text-gray-500">
              YOUR EXCLUSIVE COUPON CODE
            </span>
            <div className="font-anton text-4xl sm:text-5xl text-kf-black tracking-widest bg-white px-6 py-2 rounded-lg border-2 border-kf-black shadow-[4px_4px_0px_#111] select-all">
              {couponCode}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              className={`mt-2 px-6 py-2 font-anton text-sm uppercase rounded-lg border-2 border-kf-black transition-all shadow-[3px_3px_0px_#111] ${copied
                  ? "bg-green-500 text-white"
                  : "bg-kf-yellow text-kf-black hover:bg-yellow-400"
                }`}
            >
              {copied ? "✓ COPIED TO CLIPBOARD!" : "📋 COPY COUPON CODE"}
            </button>
          </div>

          {/* WhatsApp Notification note */}
          <div className="bg-green-50 p-4 rounded-xl border-2 border-green-600 text-left flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-anton text-sm text-green-900 uppercase">
                SENT TO YOUR WHATSAPP
              </p>
              <p className="font-inter text-xs text-green-800 font-medium mt-0.5">
                We have sent this coupon code and redemption details to{" "}
                <span className="font-bold">{customerPhone}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Store Redemption Info Card */}
        <div className="bg-kf-black text-white p-6 rounded-2xl border-4 border-white shadow-[8px_8px_0px_#111] transform -rotate-1 text-left mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-kf-yellow text-3xl">
              storefront
            </span>
            <h3 className="font-anton text-2xl text-kf-yellow uppercase tracking-wide">
              HOW TO REDEEM YOUR PRIZE
            </h3>
          </div>

          <ol className="space-y-3 font-inter text-sm text-gray-200 pl-2">
            <li className="flex items-start gap-2">
              <span className="font-anton text-kf-yellow text-base">1.</span>
              <span>
                Visit our Grand Store Opening on{" "}
                <strong className="text-white">15TH AUG 2026 in Kochi</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-anton text-kf-yellow text-base">2.</span>
              <span>
                Show this coupon code (<strong className="text-kf-yellow">{couponCode}</strong>) or the WhatsApp message at the counter.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-anton text-kf-yellow text-base">3.</span>
              <span>
                Walk away with your <strong className="text-white">{prizeReward}</strong>!
              </span>
            </li>
          </ol>

          <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="font-anton text-sm text-kf-yellow">KINGFOXCLOTHING</p>
              <p className="font-inter text-xs text-gray-400">
              Pentagon Avenue, 4th Cross Rd, Panampilly Nagar, Kochi, Ernakulam, Kerala - 682036
              </p>
            </div>
            <span className="font-marker text-xs text-kf-yellow transform rotate-3">
              #KINGFOX
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto bg-kf-black hover:bg-gray-900 text-kf-yellow font-anton text-2xl px-8 py-4 uppercase rounded-xl border-4 border-kf-black shadow-[6px_6px_0px_#fff] transition-all hover:scale-105 text-center"
          >
            EXPLORE STORE ONLINE
          </Link>
        </div>
      </main>
    </div>
  );
}
