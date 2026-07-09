"use client";

import { useEffect, useRef } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { getPrintBounds800 } from "@/utils/printBounds";

// Enable this only when calibrating new garments
// Keep disabled in production — used to draw the blue dashed calibration box.
const SHOW_CALIBRATION = false;

export function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { glbSnapshots, activeView, project } = useDesignStore();

  // Current GLB snapshot (front/back)
  const snapshot =
    activeView === "back" ? glbSnapshots.back : glbSnapshots.front;

  // Print bounds are still required because the design layer is positioned
  // using these values.
  const bounds = getPrintBounds800(
    (project.apparelConfig.categoryId || "").toString(),
    activeView as "front" | "back",
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ------------------------------------------------------------------
      // Draw GLB snapshot
      // ------------------------------------------------------------------
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // ------------------------------------------------------------------
      // Calibration overlay (Development only)
      // ------------------------------------------------------------------
      if (SHOW_CALIBRATION) {
        ctx.save();

        ctx.strokeStyle = "rgba(59,130,246,0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);

        // Blue calibration rectangle
        ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);

        // Corner handles
        ctx.fillStyle = "rgba(59,130,246,0.8)";

        [
          [bounds.x, bounds.y],
          [bounds.x + bounds.w, bounds.y],
          [bounds.x, bounds.y + bounds.h],
          [bounds.x + bounds.w, bounds.y + bounds.h],
        ].forEach(([cx, cy]) => {
          ctx.fillRect(cx - 4, cy - 4, 8, 8);
        });

        ctx.restore();
      }
    };

    img.src = snapshot;
  }, [snapshot, bounds]);

  // --------------------------------------------------------------------------
  // Loading state
  // --------------------------------------------------------------------------
  if (glbSnapshots.loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500 animate-pulse">
          Generating preview...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* ------------------------------------------------------------------
          GLB Snapshot Background
         ------------------------------------------------------------------ */}
      <canvas
        ref={canvasRef}
        width={800}
        height={960}
        className="w-full h-full rounded-lg shadow-md"
      />

      {/* ------------------------------------------------------------------
          Design Layer
          This is where the uploaded images, text and shapes are rendered.
          Its position is determined by the calibrated print bounds.
         ------------------------------------------------------------------ */}
      <div
        className="absolute"
        style={{
          left: `${(bounds.x / 800) * 100}%`,
          top: `${(bounds.y / 960) * 100}%`,
          width: `${(bounds.w / 800) * 100}%`,
          height: `${(bounds.h / 960) * 100}%`,
        }}
      >
        <div id="design-layer" className="w-full h-full" />
      </div>
    </div>
  );
}
