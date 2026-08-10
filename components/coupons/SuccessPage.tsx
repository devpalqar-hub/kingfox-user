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

          {/* WhatsApp Get Coupon */}
          <div className="bg-green-50 p-4 rounded-xl border-2 border-green-600 text-left">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl flex-shrink-0">💬</span>
              <div>
                <p className="font-anton text-sm text-green-900 uppercase">
                  GET YOUR COUPON ON WHATSAPP
                </p>
                <p className="font-inter text-xs text-green-800 font-medium mt-0.5">
                  Send the text{" "}
                  <span className="font-bold bg-green-200 px-1 rounded">My Coupons</span>{" "}
                  to our WhatsApp number{" "}
                  <span className="font-bold">+91 81398 02865</span>{" "}
                  and we'll send your coupon details instantly!
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/918139802865?text=My%20Coupons"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-anton text-sm uppercase px-4 py-2.5 rounded-lg border-2 border-green-800 shadow-[3px_3px_0px_#14532d] transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 flex-shrink-0"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              OPEN WHATSAPP &amp; SEND "MY COUPONS"
            </a>
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
