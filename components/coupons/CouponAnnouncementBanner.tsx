"use client";

import React from "react";
import Image from "next/image";

export default function CouponAnnouncementBanner() {
  const text =
    " KINGFOX CLOTHING STORE INAUGURATION AT PANAMPILLY NAGAR ON 15TH AUGUST ";
  const items = [text, text, text];

  return (
    <div className="-mt-[var(--site-header-offset,80px)] relative z-50 bg-kf-black text-kf-yellow border-b-4 border-kf-black py-3 overflow-hidden shadow-lg font-inter">
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .kf-marquee-track {
          display: flex;
          flex-shrink: 0;
          min-width: 100%;
          align-items: center;
          justify-content: space-around;
          gap: 2rem;
          animation: marqueeScroll 20s linear infinite;
        }
        .kf-marquee-container:hover .kf-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center">
        {/* Fixed Logo Badge on Left */}
        <div className="flex-shrink-0 bg-white text-kf-black px-4 py-1.5 ml-3 mr-4 rounded-xl font-anton text-sm flex items-center gap-2 border-2 border-white shadow-[3px_3px_0px_#fff] z-20">
          <Image
            src="/kingfox-logo.svg"
            alt="KingFox Logo"
            width={24}
            height={24}
            className="h-6 w-auto object-contain"
          />
          <span className="tracking-wider text-base">KINGFOX</span>
        </div>

        {/* Marquee Banner Container with 2 duplicated tracks for 100% smooth infinite loop */}
        <div className="kf-marquee-container overflow-hidden flex-1 flex whitespace-nowrap relative">
          {/* Track 1 */}
          <div className="kf-marquee-track">
            {items.map((item, idx) => (
              <div key={`t1-${idx}`} className="flex items-center gap-8">
                <span className="font-anton text-base sm:text-xl tracking-widest text-kf-yellow uppercase">
                  {item}
                </span>
                <span className="text-white text-sm font-bold">✦</span>
              </div>
            ))}
          </div>

          {/* Track 2 (Duplicate for seamless loop) */}
          <div className="kf-marquee-track" aria-hidden="true">
            {items.map((item, idx) => (
              <div key={`t2-${idx}`} className="flex items-center gap-8">
                <span className="font-anton text-base sm:text-xl tracking-widest text-kf-yellow uppercase">
                  {item}
                </span>
                <span className="text-white text-sm font-bold">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
