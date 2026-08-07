"use client";

import React from "react";

export default function CouponLoader() {
  return (
    <div className="bg-kf-yellow min-h-screen flex flex-col items-center justify-center p-6 text-kf-black relative overflow-hidden font-inter">
      {/* Texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10 mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm">
        {/* Animated Brand Sticker */}
        <div className="bg-kf-black text-kf-yellow font-anton text-2xl tracking-wider px-6 py-3 transform -rotate-3 shadow-[6px_6px_0px_rgba(0,0,0,1)] border-2 border-white animate-pulse">
          KINGFOX
        </div>

        {/* Loading Mascot / Spinner Graphic */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-white rounded-2xl border-4 border-kf-black shadow-[6px_6px_0px_#111111] transform rotate-6 animate-spin-slow" />
          <span className="text-6xl relative z-10 animate-bounce select-none">
            🎁
          </span>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <h2 className="font-anton text-3xl uppercase tracking-tight text-kf-black">
            VERIFYING QR CODE...
          </h2>
          <p className="font-marker text-lg text-kf-black/80 transform rotate-1">
            UNLOCKING YOUR EXCLUSIVE REWARD
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-4 bg-white border-2 border-kf-black rounded-full overflow-hidden p-0.5 shadow-[3px_3px_0px_#111]">
          <div className="h-full bg-kf-black rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
}
