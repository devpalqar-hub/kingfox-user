"use client";

import { useEffect, useRef } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { getPrintBounds800, getModelKey } from "@/utils/printBounds";

export function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { glbSnapshots, activeView, project } = useDesignStore();

  const snapshot = activeView === "back" ? glbSnapshots.back : glbSnapshots.front;
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

      // Background: GLB render (800×960 canvas)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Print area guide (dashed blue rectangle)
      ctx.save();
      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);

      // Corner markers
      ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
      [
        [bounds.x, bounds.y],
        [bounds.x + bounds.w, bounds.y],
        [bounds.x, bounds.y + bounds.h],
        [bounds.x + bounds.w, bounds.y + bounds.h],
      ].forEach(([cx, cy]) => {
        ctx.fillRect(cx - 4, cy - 4, 8, 8);
      });

      ctx.restore();
    };
    img.src = snapshot;
  }, [snapshot, bounds]);

  if (glbSnapshots.loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500 animate-pulse">Generating preview…</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Layer 1: GLB snapshot background */}
      <canvas
        ref={canvasRef}
        width={800}
        height={960}
        className="w-full h-full rounded-lg shadow-md"
      />

      {/* Layer 2: Design editor — positioned over print zone only */}
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
