"use client";

import React from "react";
import Link from "next/link";

interface TryHarderPageProps {
  isAlreadyClaimed?: boolean;
  couponCode?: string;
  codesPending?: number;
}

export default function TryHarderPage({
  isAlreadyClaimed = false,
  couponCode = "",
  codesPending,
}: TryHarderPageProps) {
  const hasPendingCodes = typeof codesPending === "number" && codesPending > 0;

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
      <header className="relative z-10 max-w-5xl mx-auto px-4 pt-6 pb-4 flex justify-between items-center">
        <div className="bg-kf-black text-kf-yellow font-anton text-2xl px-4 py-2 transform -rotate-3 shadow-[4px_4px_0px_#fff] border-2 border-white">
          KINGFOX
        </div>
        <div className="bg-white text-kf-black font-marker text-xs px-4 py-2 rounded-full border-2 border-kf-black shadow-[3px_3px_0px_#111] transform rotate-3">
          KOCHI CITY HUNT
        </div>
      </header>

      {/* Main Alert Banner */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 pt-6 text-center">
        <div className="inline-block bg-kf-black text-red-500 font-anton text-lg sm:text-2xl px-6 py-2 uppercase transform -rotate-2 shadow-[6px_6px_0px_#fff] border-2 border-white mb-6">
          {isAlreadyClaimed ? "⚠️ ALREADY CLAIMED!" : "❌ INVALID QR CODE!"}
        </div>

        <h1 className="font-anton text-5xl sm:text-7xl text-kf-black uppercase leading-none transform -rotate-1 mb-4">
          {isAlreadyClaimed ? (
            <>
              TOO LATE! <br />
              <span className="text-white text-outline">TRY HARDER!</span>
            </>
          ) : (
            <>
              TRY HARDER! <br />
              <span className="text-white text-outline">SPOT ANOTHER QR</span>
            </>
          )}
        </h1>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-kf-black shadow-[10px_10px_0px_#111111] transform rotate-1 mb-12">
          <p className="font-anton text-2xl text-kf-black uppercase mb-2">
            {isAlreadyClaimed
              ? "THIS QR CODE HAS ALREADY BEEN CLAIMED!"
              : `QR CODE NOT FOUND!`}
          </p>
          <p className="font-inter font-semibold text-sm sm:text-base text-gray-700 max-w-md mx-auto">
            {isAlreadyClaimed ? (
              hasPendingCodes ? (
                <>
                  Someone else scanned and claimed this QR code before you! Keep
                  your eyes open — there are{" "}
                  <strong className="font-black text-black text-lg bg-kf-yellow px-2 py-0.5 rounded border border-kf-black shadow-[2px_2px_0px_#111] inline-block mx-1">
                    {codesPending}
                  </strong>{" "}
                  more QR codes available nearby! Go find &apos;em!
                </>
              ) : (
                "Someone else scanned and claimed this QR code before you! Keep your eyes open — there are more QR codes hidden across Kochi with secret discounts & free tees!"
              )
            ) : (
              "Make sure you scan valid KingFox QR codes printed on our official flyers and posters around Kochi."
            )}
          </p>

          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
            <span className="font-marker text-2xl text-kf-black transform -rotate-2 inline-block">
              DON&apos;T GIVE UP! THE HUNT IS STILL ON! 🔥
            </span>
          </div>
        </div>

        {/* 4-Step Hunt Section from Stitch */}
        <div className="bg-kf-black text-white p-8 rounded-3xl border-4 border-white shadow-[12px_12px_0px_#111] my-8">
          <div className="inline-block bg-kf-yellow text-kf-black font-anton uppercase text-xl px-4 py-1 mb-8 transform -rotate-2 border-2 border-kf-black">
            YOU&apos;RE PART OF THE HUNT!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
              <div className="w-14 h-14 bg-white text-kf-black rounded-lg flex items-center justify-center border-2 border-kf-black shadow-[3px_3px_0px_#FFD000]">
                <span className="material-symbols-outlined text-4xl">
                  qr_code_scanner
                </span>
              </div>
              <h3 className="font-anton text-kf-yellow uppercase text-base">
                1. SPOT THE QR
              </h3>
              <p className="font-inter text-xs text-gray-400">
                Hidden across Kochi!
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
              <div className="w-14 h-14 bg-white text-kf-black rounded-lg flex items-center justify-center border-2 border-kf-black shadow-[3px_3px_0px_#FFD000]">
                <span className="material-symbols-outlined text-4xl">
                  smartphone
                </span>
              </div>
              <h3 className="font-anton text-kf-yellow uppercase text-base">
                2. SCAN IT FAST
              </h3>
              <p className="font-inter text-xs text-gray-400">
                Be the first to scan!
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
              <div className="w-14 h-14 bg-white text-kf-black rounded-lg flex items-center justify-center border-2 border-kf-black shadow-[3px_3px_0px_#FFD000]">
                <span className="material-symbols-outlined text-4xl">
                  redeem
                </span>
              </div>
              <h3 className="font-anton text-kf-yellow uppercase text-base">
                3. CLAIM OFFER
              </h3>
              <p className="font-inter text-xs text-gray-400">
                Unlock your prize!
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
              <div className="w-14 h-14 bg-white text-kf-black rounded-lg flex items-center justify-center border-2 border-kf-black shadow-[3px_3px_0px_#FFD000]">
                <span className="material-symbols-outlined text-4xl">
                  storefront
                </span>
              </div>
              <h3 className="font-anton text-kf-yellow uppercase text-base">
                4. VISIT STORE
              </h3>
              <p className="font-inter text-xs text-gray-400">
                Redeem on 15th Aug!
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/products"
            className="w-full sm:w-auto bg-kf-black hover:bg-gray-900 text-kf-yellow font-anton text-2xl px-8 py-4 uppercase rounded-xl border-4 border-kf-black shadow-[6px_6px_0px_#fff] transition-all hover:scale-105"
          >
            EXPLORE KINGFOX STORE
          </Link>
        </div>
      </main>
    </div>
  );
}
