"use client";

import { useEffect, useRef, useState } from "react";
import type { Layer } from "@/types/design-studio";
import {
  drawFrame,
  preloadLayerImages,
  type FrameSpec,
} from "@/lib/design-studio/frameRenderer";

interface Props {
  frame: FrameSpec;
  layers: Layer[];
  /** Garment colour, shown behind the artwork so contrast is judged correctly. */
  background: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}

/**
 * The 2D frame. It is the print rectangle itself (1 unit = 1 mm), drawn with
 * the same drawFrame() that produces the 3D decal texture.
 */
export default function FrameEditor({
  frame,
  layers,
  background,
  selectedId,
  onSelect,
  onMove,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pxPerMm, setPxPerMm] = useState(1);
  const drag = useRef<{ id: string; startX: number; startY: number; x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPxPerMm(el.clientWidth / frame.widthMm));
    ro.observe(el);
    return () => ro.disconnect();
  }, [frame.widthMm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    preloadLayerImages(layers).then(() => {
      if (cancelled) return;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      drawFrame(canvas, frame, layers, { scale: pxPerMm * dpr, background });
    });
    return () => {
      cancelled = true;
    };
  }, [frame, layers, pxPerMm, background]);

  const onPointerDown = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    onSelect(layer.id);
    if (layer.isLocked) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      id: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      x: layer.x,
      y: layer.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    onMove(
      d.id,
      Math.round(d.x + (e.clientX - d.startX) / pxPerMm),
      Math.round(d.y + (e.clientY - d.startY) / pxPerMm),
    );
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        ref={wrapRef}
        onPointerDown={() => onSelect(null)}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${frame.widthMm} / ${frame.heightMm}`,
          outline: "2px dashed #2563eb",
          outlineOffset: 0,
          background:
            "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 16px 16px",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        {layers
          .filter((l) => l.isVisible !== false)
          .map((layer) => (
            <div
              key={layer.id}
              onPointerDown={(e) => onPointerDown(e, layer)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                position: "absolute",
                left: layer.x * pxPerMm,
                top: layer.y * pxPerMm,
                width: layer.width * pxPerMm,
                height: layer.height * pxPerMm,
                transform: `rotate(${layer.rotation || 0}deg)`,
                cursor: layer.isLocked ? "not-allowed" : "move",
                outline: layer.id === selectedId ? "1.5px solid #2563eb" : "none",
              }}
            />
          ))}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
        Print area {frame.widthMm / 10} × {frame.heightMm / 10} cm
      </p>
    </div>
  );
}
