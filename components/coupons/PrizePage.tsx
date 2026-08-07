"use client";

import React from "react";
import Image from "next/image";

interface PrizePageProps {
  couponCode: string;
  onOpenClaimForm: () => void;
}

export default function PrizePage({
  couponCode,
  onOpenClaimForm,
}: PrizePageProps) {
  return (
    <div className="bg-kf-yellow min-h-screen font-inter text-kf-black overflow-x-hidden relative">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10 mix-blend-multiply z-0"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* 1. Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-between items-start">
        <div className="flex flex-col items-start gap-2">
          <div className="bg-kf-black text-kf-yellow font-anton text-3xl sm:text-4xl px-4 py-2 transform -rotate-2 border-2 border-white shadow-[4px_4px_0px_#fff]">
            KINGFOX
          </div>
          <p className="font-anton text-xs sm:text-sm text-kf-black tracking-widest uppercase ml-2">
            STREETWEAR REDEFINED
          </p>
        </div>

        <div className="bg-white rounded-full h-24 w-24 sm:h-28 sm:w-28 flex flex-col items-center justify-center shadow-lg transform rotate-6 border-4 border-kf-black border-dashed">
          <span className="material-symbols-outlined text-2xl sm:text-3xl mb-0.5">
            location_on
          </span>
          <span className="font-anton text-xs sm:text-sm text-kf-black text-center leading-tight">
            KOCHI
            <br />
            <span className="font-inter text-[10px] text-gray-600 uppercase font-semibold">
              CITY HUNT
            </span>
          </span>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-6">
          {/* Active QR Badge */}
          <div className="self-start bg-kf-black text-kf-yellow font-anton text-xs sm:text-sm px-4 py-1.5 rounded-full border border-kf-yellow transform -rotate-1 flex items-center gap-2 shadow-[3px_3px_0px_#111]">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
            <span>HOLD ON!</span>
          </div>

          <h1 className="font-anton text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tight text-kf-black transform -rotate-2">
            SOMETHING <br />
            <span className="text-white text-outline">EPIC IS</span> <br />
            LANDING!
          </h1>

          <div className="bg-kf-black text-white px-6 py-3 self-start transform rotate-1 inline-block shadow-[6px_6px_0px_#fff] border-2 border-white">
            <span className="font-anton text-xl sm:text-2xl uppercase tracking-wider italic text-kf-yellow">
              NEW STORE INAUGURATION
            </span>
          </div>

          <div className="flex items-center gap-4 mt-4 bg-white/80 p-4 rounded-2xl border-2 border-kf-black shadow-[4px_4px_0px_#111] max-w-md">
            <span className="material-symbols-outlined text-5xl text-kf-black">
              calendar_month
            </span>
            <div>
              <p className="font-anton text-3xl sm:text-4xl text-kf-black leading-none">
                15TH AUG 2026
              </p>
              <p className="font-marker text-2xl text-kf-black mt-1">
                Pentagon Avenue, 4th Cross Rd, Panampilly Nagar, Kochi, KERALA
              </p>
            </div>
          </div>
        </div>

        {/* Mascot / Store Graphic Container */}
        <div className="relative flex justify-center items-center mt-4 md:mt-0">
          <div className="relative w-full max-w-md aspect-square">
            {/* White Torn Paper Container */}
            <div
              className="absolute inset-0 bg-white shadow-2xl transform rotate-2 z-0 border-4 border-kf-black"
              style={{
                clipPath: "polygon(4% 0, 100% 3%, 96% 100%, 0 97%)",
              }}
            />

            {/* Mascot Image */}
            <div className="relative z-10 w-full h-full p-6 flex flex-col items-center justify-center text-center">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArr9Ukhs7eRFeM2FFdv-AtNDFT2JR_swu-Wj424xZrPIChW0Wopyk5z9Jm-jhCE5VdQ3UmBmt094ENaQUZb12fKYEebguy2N6Wx8w9_R29Dah4VwPS-vDdIBBd-GX1aXFhCh2DaYDEStTKnwhy1NW7WrLtob7mVhO_QoA3Prbedk0OLeC6anM-oNz6VZIqptSkUnU6EhOmnyDKHO2QTpQx5Qb-PAuK5uCvRgDmgoi21Kh3FaI6UX382Q"
                alt="KingFox Mascot"
                width={400}
                height={400}
                className="w-full h-full object-contain filter drop-shadow-[8px_8px_0px_rgba(0,0,0,0.8)]"
                unoptimized
              />
            </div>

            {/* Callout Sticker */}
            <div className="absolute top-4 left-2 bg-kf-black text-kf-yellow font-anton text-xs uppercase p-3 rounded-full transform -rotate-12 shadow-lg border-2 border-kf-yellow z-20">
              New Vibes.
              <br />
              New Store.
              <br />
              Same Energy!
            </div>
          </div>
        </div>
      </main>

      {/* 3. "You're Part of the Hunt" Section */}
      <section className="bg-kf-black text-white py-12 md:py-16 relative z-10 mt-12 border-y-8 border-dashed border-white rough-edge">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-kf-yellow font-anton text-3xl sm:text-5xl text-center uppercase mb-12 tracking-wider transform rotate-1">
            YOU&apos;RE PART OF THE HUNT!
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 relative group">
              <div className="w-24 h-24 bg-white text-kf-black rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform shadow-[6px_6px_0px_#FFD000] border-4 border-kf-black">
                <span className="material-symbols-outlined text-5xl">
                  qr_code_scanner
                </span>
              </div>
              <h3 className="font-anton text-2xl text-kf-yellow uppercase mt-2">
                SPOT THE QR
              </h3>
              <p className="font-inter text-xs text-gray-300">
                Hidden across Kochi!
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 relative group">
              <div className="w-24 h-24 bg-white text-kf-black rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-[6px_6px_0px_#FFD000] border-4 border-kf-black">
                <span className="material-symbols-outlined text-5xl">
                  smartphone
                </span>
              </div>
              <h3 className="font-anton text-2xl text-kf-yellow uppercase mt-2">
                SCAN IT
              </h3>
              <p className="font-inter text-xs text-gray-300">
                You just unlocked a secret!
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 relative group">
              <div className="w-24 h-24 bg-white text-kf-black rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform shadow-[6px_6px_0px_#FFD000] border-4 border-kf-black">
                <span className="material-symbols-outlined text-5xl">
                  redeem
                </span>
              </div>
              <h3 className="font-anton text-2xl text-kf-yellow uppercase mt-2">
                CLAIM YOUR OFFER
              </h3>
              <p className="font-inter text-xs text-gray-300">
                A special gift is waiting for you!
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-3 relative group">
              <div className="w-24 h-24 bg-white text-kf-black rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-[6px_6px_0px_#FFD000] border-4 border-kf-black">
                <span className="material-symbols-outlined text-5xl">
                  storefront
                </span>
              </div>
              <h3 className="font-anton text-2xl text-kf-yellow uppercase mt-2">
                VISIT THE STORE
              </h3>
              <p className="font-inter text-xs text-gray-300">
                Come to our grand opening &amp; claim it!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "Your Exclusive Reward Pool" Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10 text-center flex flex-col items-center">
        <div className="inline-block bg-kf-black text-white px-8 py-3 mb-10 transform -rotate-1 shadow-[6px_6px_0px_#fff] border-2 border-white">
          <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-wider italic text-kf-yellow">
            YOUR EXCLUSIVE REWARD POOL
          </h2>
        </div>

        <div className="w-full bg-white p-6 sm:p-12 relative shadow-2xl overflow-hidden border-8 border-kf-black rounded-3xl">
          {/* Tape accents */}
          <div className="absolute top-2 left-10 w-28 h-6 tape transform rotate-12 z-20 border border-yellow-300" />
          <div className="absolute bottom-4 right-10 w-32 h-8 tape transform -rotate-6 z-20 border border-yellow-300" />

          {/* Reward Pool Grid Graphics */}
          <div className="w-full flex justify-center items-center py-4">
            <Image
              src="https://lh3.googleusercontent.com/aida/AP1WRLsPcvNUkdWxKBuEEccrTSNIHakCHiFbOH0vkofTQxaVn363sndPjmpM2v3_TkVVUy_wO142Q5_giU6EKLgUvfnDN0n9wWLU3Ue6LDcYQgjwFarjhMIml7HbNRpxyiTRzr3imJSldTlWS0k-WpVjjMdTLoITcTOY8uG8Fie81_A16D-bQBcIWuyzrzM6V5M-NgW9eXV3B-BFcPWBn6TV06eKgQOaXnbmPDJe4iqHoDJDdOh4rOM-gfMRRrIE"
              alt="KingFox Reward Pool Icons"
              width={800}
              height={400}
              className="w-full max-w-3xl object-contain drop-shadow-xl rounded-2xl"
              unoptimized
            />
          </div>

          {/* Claim Button */}
          <div className="mt-10 text-center">
            <button
              onClick={onOpenClaimForm}
              className="bg-kf-black hover:bg-gray-900 text-kf-yellow font-anton text-3xl sm:text-5xl px-10 sm:px-16 py-6 uppercase transform hover:scale-105 transition-all shadow-[8px_8px_0px_#FFD000] border-4 border-kf-yellow rounded-2xl relative group cursor-pointer"
            >
              <span className="relative z-10">CLAIM NOW 🎁</span>
            </button>
            <p className="mt-4 font-inter font-bold text-xs text-gray-500 uppercase tracking-widest">
              * Valid for Kochi store launch event.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Location & Footer */}
      <footer className="bg-white text-kf-black pt-12 pb-8 border-t-8 border-kf-black relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-6xl text-kf-black">
                location_on
              </span>
              <div>
                <h3 className="font-anton text-4xl uppercase mb-1">
                  KINGFOXCLOTHING
                </h3>
                <p className="font-inter text-base font-semibold text-gray-700 leading-tight">
                  Pentagon Avenue, 4th Cross Rd, Panampilly Nagar, Kochi,
                  <br />
                  Ernakulam, Kerala – 682036
                </p>
              </div>
            </div>

            <div className="bg-kf-yellow text-kf-black font-anton text-base sm:text-lg uppercase px-6 py-3 inline-block self-start transform -rotate-1 border-2 border-kf-black shadow-[4px_4px_0px_#111]">
              BIG STORE. BIGGER VIBES. BIGGEST OPENING.
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end justify-center">
            <div className="bg-kf-black text-white font-marker text-2xl p-6 rounded-3xl transform -rotate-3 shadow-lg border-2 border-white text-center">
              SEE YOU THERE,
              <br />
              KINGFOX FAM! 🦊
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-kf-black text-white mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <h2 className="font-anton text-3xl tracking-widest text-kf-yellow">
              KINGFOX
            </h2>
            <div className="text-center md:text-right">
              <p className="font-marker text-lg text-kf-yellow">#KINGFOX</p>
              <p className="font-inter text-xs text-gray-400">kingfoxclothing.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
