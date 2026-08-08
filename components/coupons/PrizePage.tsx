"use client";

import React, { useEffect, useState } from "react";
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
    <div className="bg-kf-yellow min-h-screen font-inter text-kf-black overflow-x-hidden">
      {/* Hero wrapper — mascot fades behind header + main hero only */}
      <div className="relative overflow-hidden">
        {/* Texture Overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-10 mix-blend-multiply z-0"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Faded Mascot Background — only in this hero wrapper */}
        <div
          className="absolute inset-0 pointer-events-none z-0 select-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,208,0,0.85) 0%, rgba(255,208,0,0.4) 60%, rgba(255,208,0,0.92) 100%)",
          }}
        >
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuArr9Ukhs7eRFeM2FFdv-AtNDFT2JR_swu-Wj424xZrPIChW0Wopyk5z9Jm-jhCE5VdQ3UmBmt094ENaQUZb12fKYEebguy2N6Wx8w9_R29Dah4VwPS-vDdIBBd-GX1aXFhCh2DaYDEStTKnwhy1NW7WrLtob7mVhO_QoA3Prbedk0OLeC6anM-oNz6VZIqptSkUnU6EhOmnyDKHO2QTpQx5Qb-PAuK5uCvRgDmgoi21Kh3FaI6UX382Q"
            alt=""
            fill
            className="object-contain object-center sm:object-right opacity-20 mix-blend-multiply scale-110"
            unoptimized
          />
        </div>

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

            {/* Mobile-only scroll hint — sits just below the date card */}
            <div className="md:hidden">
              <ScrollDownHint />
            </div>
          </div>

          {/* Mascot / Store Graphic Container */}
          <div className="relative flex justify-center items-center mt-4 md:mt-0">
            <div className="relative w-full max-w-md aspect-square">
              {/* White Torn Paper Container with Store Mockup */}
              <div
                className="absolute inset-0 bg-white shadow-2xl transform rotate-2 z-0 border-4 border-kf-black overflow-hidden"
                style={{
                  clipPath: "polygon(4% 0, 100% 3%, 96% 100%, 0 97%)",
                }}
              >
                <Image
                  src="/kingfox-store.png"
                  alt="KingFox Store"
                  fill
                  className="object-cover opacity-90"
                />
              </div>

              {/* Spacer so the torn paper tile fills the aspect-square */}
              <div className="relative z-10 w-full h-full" />

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
      </div>{/* end hero wrapper */}


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
            {/* Radiating ring wrapper */}
            <div className="relative inline-flex items-center justify-center">
              {/* Ring */}
              <span
                className="kf-claim-ring absolute inset-0 rounded-2xl border-4 border-kf-yellow pointer-events-none"
                aria-hidden="true"
              />
              <button
                onClick={onOpenClaimForm}
                className="kf-claim-btn bg-kf-black hover:bg-gray-900 text-kf-yellow font-anton text-3xl sm:text-5xl px-10 sm:px-16 py-6 uppercase transition-all shadow-[8px_8px_0px_#FFD000] border-4 border-kf-yellow rounded-2xl relative group cursor-pointer"
              >
                <span className="kf-claim-label relative z-10">CLAIM NOW 🎁</span>
              </button>
            </div>
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

function ScrollDownHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes kf-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        @keyframes kf-fadein {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kf-scroll-hint {
          animation: kf-fadein 0.6s ease both;
          transition: opacity 0.4s ease;
        }
        .kf-scroll-hint.hidden-hint {
          opacity: 0;
          pointer-events: none;
        }
        .kf-chevron {
          animation: kf-bounce 1.2s ease-in-out infinite;
        }
        .kf-chevron:nth-child(2) { animation-delay: 0.15s; }
        .kf-chevron:nth-child(3) { animation-delay: 0.30s; }

        /* ── Claim-Now button animations ── */
        @keyframes kf-jello {
          0%,100% { transform: scale(1) rotate(0deg); }
          10%      { transform: scale(1.08) rotate(-2deg); }
          20%      { transform: scale(1.08) rotate(2deg); }
          30%      { transform: scale(1.05) rotate(-1.5deg); }
          40%      { transform: scale(1.05) rotate(1.5deg); }
          50%      { transform: scale(1.02) rotate(-1deg); }
          60%      { transform: scale(1.02) rotate(1deg); }
          70%      { transform: scale(1) rotate(0deg); }
        }
        @keyframes kf-ring {
          0%   { transform: scale(0.95); opacity: 0.7; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes kf-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .kf-claim-btn {
          animation: kf-jello 0.8s ease-in-out 1.5s 1, kf-jello 0.8s ease-in-out 4s infinite;
          animation-fill-mode: both;
        }
        .kf-claim-ring {
          animation: kf-ring 1.4s ease-out 1.5s infinite;
        }
        .kf-claim-label {
          background: linear-gradient(90deg, #FFD000 30%, #fff 50%, #FFD000 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: kf-shimmer 2.4s linear 1.5s infinite;
        }
      `}</style>

      <div
        className={`kf-scroll-hint${visible ? "" : " hidden-hint"} relative z-10 flex flex-col items-center gap-2 -mt-4 mb-8 select-none`}
        aria-hidden="true"
      >
        {/* Label */}
        <div className="flex items-center gap-2 bg-kf-black text-kf-yellow font-anton text-xs sm:text-sm uppercase tracking-widest px-5 py-2 rounded-full shadow-[3px_3px_0px_#fff] border border-white">
          <span className="material-symbols-outlined text-base">redeem</span>
          Scroll down to claim your coupon
        </div>

        {/* Stacked chevrons */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="kf-chevron material-symbols-outlined text-4xl text-kf-black drop-shadow">expand_more</span>
          <span className="kf-chevron material-symbols-outlined text-4xl text-kf-black drop-shadow opacity-60">expand_more</span>
          <span className="kf-chevron material-symbols-outlined text-4xl text-kf-black drop-shadow opacity-30">expand_more</span>
        </div>
      </div>
    </>
  );
}
