"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Layer, TextLayer } from "@/types/design-studio";
import type { GarmentImage } from "@/lib/design-studio/garmentImages";
import {
  drawFrame,
  preloadLayerImages,
  type FrameSpec,
} from "@/lib/design-studio/frameRenderer";

interface Props {
  frame: FrameSpec;
  /** Static picture of this side of the garment, with the boundary placed on it. */
  image?: GarmentImage;
  layers: Layer[];
  /** Garment colour, shown behind the artwork so contrast is judged correctly. */
  background: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPatch: (id: string, changes: Partial<Layer>) => void;
  onDelete: (id: string) => void;
}

const MIN_MM = 5;

/**
 * The garment picture is multiplied over its colour, so a pure black garment
 * would hide every fold and seam. Very dark colours are lifted slightly so the
 * shape stays readable while still looking black.
 */
export function garmentTint(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const lift = (c: number) => Math.max(c, 44);
  return `rgb(${lift((n >> 16) & 255)}, ${lift((n >> 8) & 255)}, ${lift(n & 255)})`;
}

/**
 * The 2D frame. It is the print rectangle itself (1 unit = 1 mm), drawn with
 * the same drawFrame() that produces the 3D decal texture, so the boundary the
 * user sees is exactly the printable area. Layers are dragged with the layer
 * centre clamped inside the boundary and resized from the corner handle.
 */
export default function FrameEditor({
  frame,
  image,
  layers,
  background,
  selectedId,
  onSelect,
  onPatch,
  onDelete,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pxPerMm, setPxPerMm] = useState(1);
  const drag = useRef<{ id: string; startX: number; startY: number; x: number; y: number } | null>(
    null,
  );
  const resize = useRef<{
    id: string;
    startX: number;
    startY: number;
    w: number;
    h: number;
    x: number;
    y: number;
    fontSize?: number;
  } | null>(null);

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
      // With a garment picture behind it the frame is transparent; the
      // garment colour already shows through.
      drawFrame(canvas, frame, layers, {
        scale: pxPerMm * dpr,
        background: image ? undefined : background,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [frame, layers, pxPerMm, background, image]);

  const clamp = (layer: Pick<Layer, "width" | "height">, x: number, y: number) => ({
    // Keep the layer's centre inside the print boundary so nothing can be lost.
    x: Math.min(Math.max(x, -layer.width / 2), frame.widthMm - layer.width / 2),
    y: Math.min(Math.max(y, -layer.height / 2), frame.heightMm - layer.height / 2),
  });

  const onLayerPointerDown = (e: React.PointerEvent, layer: Layer) => {
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

  const onLayerPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const layer = layers.find((l) => l.id === d.id);
    if (!layer) return;
    const next = clamp(
      layer,
      Math.round(d.x + (e.clientX - d.startX) / pxPerMm),
      Math.round(d.y + (e.clientY - d.startY) / pxPerMm),
    );
    onPatch(d.id, next);
  };

  const onHandlePointerDown = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resize.current = {
      id: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      w: layer.width,
      h: layer.height,
      x: layer.x,
      y: layer.y,
      fontSize: layer.type === "text" ? (layer as TextLayer).fontSize : undefined,
    };
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    const r = resize.current;
    if (!r) return;
    const deltaMm = ((e.clientX - r.startX) + (e.clientY - r.startY)) / pxPerMm;
    const k = Math.max((r.w + deltaMm) / r.w, MIN_MM / Math.max(r.w, r.h));
    const w = Math.max(MIN_MM, Math.round(r.w * k));
    const h = Math.max(MIN_MM, Math.round(r.h * k));
    // Resize around the layer centre so it grows evenly inside the boundary.
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const changes: Partial<Layer> = {
      width: w,
      height: h,
      x: Math.round(cx - w / 2),
      y: Math.round(cy - h / 2),
    };
    if (r.fontSize) {
      (changes as Partial<TextLayer>).fontSize = Math.max(4, r.fontSize * (w / r.w));
    }
    onPatch(r.id, changes);
  };

  const endGesture = () => {
    drag.current = null;
    resize.current = null;
  };

  const [rl, rt, rw, rh] = image?.rect ?? [0, 0, 1, 1];

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: image ? `${image.width} / ${image.height}` : undefined,
          isolation: "isolate",
          background: image ? "#f1f2f4" : undefined,
          borderRadius: image ? 16 : 0,
        }}
      >
        {image && (
          <>
            {/* Garment colour, cut to the garment's silhouette… */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: garmentTint(background),
                WebkitMaskImage: `url(${image.src})`,
                maskImage: `url(${image.src})`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
            {/* …with the shaded render multiplied on top for folds and seams. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                mixBlendMode: "multiply",
                pointerEvents: "none",
              }}
            />
          </>
        )}
      <div
        ref={wrapRef}
        onPointerDown={() => onSelect(null)}
        style={{
          position: image ? "absolute" : "relative",
          ...(image
            ? {
                left: `${rl * 100}%`,
                top: `${rt * 100}%`,
                width: `${rw * 100}%`,
                height: `${rh * 100}%`,
              }
            : {
                width: "100%",
                aspectRatio: `${frame.widthMm} / ${frame.heightMm}`,
              }),
          outline: "2px dashed #2563eb",
          outlineOffset: 0,
          borderRadius: 2,
          background: image
            ? "transparent"
            : "repeating-conic-gradient(#ececec 0% 25%, #fff 0% 50%) 50% / 16px 16px",
          touchAction: "none",
          userSelect: "none",
          overflow: "visible",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        {layers
          .filter((l) => l.isVisible !== false)
          .map((layer) => {
            const isSelected = layer.id === selectedId;
            return (
              <div
                key={layer.id}
                onPointerDown={(e) => onLayerPointerDown(e, layer)}
                onPointerMove={onLayerPointerMove}
                onPointerUp={endGesture}
                onPointerCancel={endGesture}
                style={{
                  position: "absolute",
                  left: layer.x * pxPerMm,
                  top: layer.y * pxPerMm,
                  width: layer.width * pxPerMm,
                  height: layer.height * pxPerMm,
                  transform: `rotate(${layer.rotation || 0}deg)`,
                  cursor: layer.isLocked ? "not-allowed" : "move",
                  outline: isSelected ? "1.5px solid #2563eb" : "none",
                }}
              >
                {isSelected && !layer.isLocked && (
                  <>
                    <button
                      aria-label="Delete layer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onDelete(layer.id);
                      }}
                      style={{
                        position: "absolute",
                        top: -14,
                        right: -14,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "1.5px solid #fff",
                        background: "#111",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 1px 4px rgba(0,0,0,.35)",
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                    <div
                      aria-label="Resize layer"
                      onPointerDown={(e) => onHandlePointerDown(e, layer)}
                      onPointerMove={onHandlePointerMove}
                      onPointerUp={endGesture}
                      onPointerCancel={endGesture}
                      style={{
                        position: "absolute",
                        bottom: -13,
                        right: -13,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "1.5px solid #2563eb",
                        background: "#fff",
                        cursor: "nwse-resize",
                        touchAction: "none",
                        boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
      </div>
      </div>
    </div>
  );
}
