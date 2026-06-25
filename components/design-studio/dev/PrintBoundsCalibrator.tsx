"use client";

/**
 * PrintBoundsCalibrator — Development tool only.
 *
 * Mount temporarily in the workspace page to interactively measure print
 * bounds in pixel coordinates relative to the 800×960 snapshot.
 *
 * Usage:
 *   1. Import and mount <PrintBoundsCalibrator /> inside the workspace page.
 *   2. The snapshot overlay will appear in the top-left corner.
 *   3. Click and drag on the snapshot to define the garment chest/print area.
 *   4. Copy the { x, y, w, h } values logged to the browser console.
 *   5. Paste them into PRINT_BOUNDS in DesignCanvas.tsx.
 *   6. REMOVE this component before deploying to production.
 */

import { useState, useRef } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";

export function PrintBoundsCalibrator() {
  // Render nothing outside development
  if (process.env.NODE_ENV !== "development") return null;

  const { glbSnapshots } = useDesignStore();
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCoords = (e: React.MouseEvent) => {
    const el = imgRef.current!.getBoundingClientRect();
    const scaleX = 800 / el.width;
    const scaleY = 960 / el.height;
    return {
      x: Math.round((e.clientX - el.left) * scaleX),
      y: Math.round((e.clientY - el.top)  * scaleY),
    };
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, background: "#000a" }}>
      <img
        ref={imgRef}
        src={glbSnapshots.front ?? ""}
        style={{ width: 400, height: 480, display: "block", cursor: "crosshair" }}
        onMouseDown={e => setStart(getCoords(e))}
        onMouseUp={e => {
          if (!start) return;
          const end = getCoords(e);
          const r = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            w: Math.abs(end.x - start.x),
            h: Math.abs(end.y - start.y),
          };
          setRect(r);
          console.log("PRINT_BOUNDS →", JSON.stringify(r));
        }}
      />
      {rect && (
        <pre style={{ color: "#0f0", padding: 8, fontSize: 12 }}>
          {JSON.stringify(rect, null, 2)}
        </pre>
      )}
      <p style={{ color: "#fff", fontSize: 11, padding: "4px 8px" }}>
        Click and drag to define print area. Copy values from console.
      </p>
    </div>
  );
}
