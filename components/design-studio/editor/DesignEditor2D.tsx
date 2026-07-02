"use client";

import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { Rnd } from "react-rnd";
import { TextLayer, ImageLayer, LineLayer, Layer } from "@/types/design-studio";
import React, { useRef, useEffect, useCallback } from "react";
import { getPrintBounds500 } from "@/utils/printBounds";
import styles from "./DesignEditor2D.module.css";

const CANVAS_W = 500;
const CANVAS_H = 600;

// CSS dimensions of .printArea (must match page.module.css → .printArea)
// The canvas is stretched to fill this box, so we need scale factors to
// align the Rnd selection handles with the actual canvas-drawn visuals.
const DISPLAY_W = 500;
const DISPLAY_H = 600;
const SCALE_X   = DISPLAY_W / CANVAS_W;  // 1.0
const SCALE_Y   = DISPLAY_H / CANVAS_H;  // 1.0

// ─── Image cache ──────────────────────────────────────────────────────────────
// Keyed by src string. loadImage returns instantly on cache hit.
const imgCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imgCache.has(src)) return Promise.resolve(imgCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    // NOTE: do NOT set crossOrigin for data: URLs — browsers reject it and the
    // image load silently fails, causing the canvas to show nothing.
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload  = () => { imgCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}
// ─── Guide template calibration ───────────────────────────────────────────────
// Each garment can define a visual guide overlay for the 2D editor.
// These are ONLY visual aids — they have NO effect on UV mapping, texture
// painting, layer coordinates, print bounds, or 3D rendering.
//
// To calibrate:
//   scale   — 1.0 = fit-to-canvas. Lower = smaller. Higher = bigger.
//   offsetX — canvas px. Positive = shift right,  negative = shift left.
//   offsetY — canvas px. Positive = shift down,   negative = shift up.
interface GuideCalibration {
  src:     string;   // path relative to public/
  scale:   number;   // multiplier on top of fit-to-canvas scale
  offsetX: number;   // horizontal nudge in canvas pixels
  offsetY: number;   // vertical nudge in canvas pixels
}

const GUIDE_CALIBRATIONS: Record<string, GuideCalibration> = {
  hoodie: {
    src:     "/templates/hoodie-template.png",
    scale:   0.76,   // ← adjust to shrink/grow the guide
    offsetX: 45,     // ← adjust to move guide left (−) / right (+)
    offsetY: 0,      // ← adjust to move guide up (−) / down (+)
  },
  // Future garments: add entries here (e.g. "polo", "longsleeve", etc.)
};

/** Resolve a categoryId to its guide calibration, if one exists. */
function getGuideCalibration(categoryId: string): GuideCalibration | null {
  const n = categoryId.toLowerCase();
  for (const [key, cal] of Object.entries(GUIDE_CALIBRATIONS)) {
    if (n.includes(key)) return cal;
  }
  return null;
}

// ─── Offscreen compositing (background only) ──────────────────────────────────
// Draws GLB snapshot → print-zone guide onto an OffscreenCanvas.
// Design layers are now rendered as DOM elements inside each Rnd handle,
// so the canvas is purely a background visual (garment + dashed print zone).
async function compositeBackground(
  bgSnapshot: string | null,
  cancelled: { v: boolean },
  categoryId: string,
  view: "front" | "back",
): Promise<ImageBitmap | null> {
  const offscreen = new OffscreenCanvas(CANVAS_W, CANVAS_H);
  const ctx = offscreen.getContext("2d")!;

  // ── 1. White base (prevents transparent-canvas black flash) ──────────────
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── 2. Background: calibrated guide template OR GLB snapshot ─────────────
  const guide = getGuideCalibration(categoryId);
  if (guide) {
    try {
      const tmpl = await loadImage(guide.src);
      if (cancelled.v) return null;

      const fitScale  = Math.min(CANVAS_W / tmpl.naturalWidth, CANVAS_H / tmpl.naturalHeight);
      const scale     = fitScale * guide.scale;
      const drawW     = tmpl.naturalWidth  * scale * 1.5;
      const drawH     = tmpl.naturalHeight * scale * 1.5;
      const x         = (CANVAS_W - drawW) / 2 + guide.offsetX;
      const y         = (CANVAS_H - drawH) / 2 + guide.offsetY;

      ctx.drawImage(tmpl, x, y, drawW, drawH);
    } catch (e) {
      console.warn(`[2D Editor] guide template load failed (${categoryId}):`, e);
    }

  } else if (bgSnapshot) {
    try {
      const bgImg = await loadImage(bgSnapshot);
      if (cancelled.v) return null;
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
    } catch (e) {
      console.warn("[2D Editor] snapshot load failed:", e);
    }
  }

  // ── 3. Printable zone guide (dashed rectangle, drawn under design layers) ─
  const pb = getPrintBounds500(categoryId, view);
  if (pb) {
    ctx.save();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(pb.x + 0.75, pb.y + 0.75, pb.w - 1.5, pb.h - 1.5);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(59, 130, 246, 0.85)";
    [[pb.x, pb.y], [pb.x + pb.w, pb.y], [pb.x, pb.y + pb.h], [pb.x + pb.w, pb.y + pb.h]]
      .forEach(([cx, cy]) => ctx.fillRect(cx - 4, cy - 4, 8, 8));
    ctx.restore();
  }

  return offscreen.transferToImageBitmap();
}

// ─── DOM layer content renderer ───────────────────────────────────────────────
// Renders the visual for each layer type as a real DOM element so it lives
// physically inside the Rnd boundary box. This guarantees the content is
// always perfectly aligned with the selection/resize handles.
function LayerContent({ layer }: { layer: Layer }) {
  if (layer.type === "image") {
    const imageLayer = layer as ImageLayer;
    return (
      <img
        src={imageLayer.asset.originalUrl}
        alt=""
        className={styles.imageContent}
        draggable={false}
      />
    );
  }

  if (layer.type === "text") {
    const textLayer = layer as TextLayer;
    const justifyContent =
      textLayer.textAlign === "left"  ? "flex-start" :
      textLayer.textAlign === "right" ? "flex-end"   : "center";

    return (
      <div
        className={styles.textContent}
        style={{
          justifyContent,
          fontFamily:    `"${textLayer.fontFamily || "Inter"}", sans-serif`,
          fontSize:      `${textLayer.fontSize * SCALE_X}px`,
          fontWeight:    textLayer.fontWeight ?? 700,
          color:         textLayer.colorHex || "#000",
          letterSpacing: textLayer.letterSpacing ? `${textLayer.letterSpacing}px` : undefined,
          textAlign:     (textLayer.textAlign as React.CSSProperties["textAlign"]) || "center",
        }}
      >
        {textLayer.text}
      </div>
    );
  }

  if (layer.type === "line") {
    const lineLayer = layer as LineLayer;
    return (
      <div className={styles.lineContent}>
        <div
          style={{
            width:      "100%",
            height:     `${lineLayer.thickness * SCALE_Y}px`,
            background: lineLayer.colorHex || "#000",
          }}
        />
      </div>
    );
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onLayerSelect?: (id: string | null) => void;
}

export default function DesignEditor2D({ onLayerSelect }: Props) {
  const {
    project, activeView, selectedLayerId, selectLayer, updateLayer, glbSnapshots,
  } = useDesignStore();

  const layers     = project.designs[activeView] || [];
  const bgSnapshot = activeView === "back" ? glbSnapshots.back : glbSnapshots.front;
  const categoryId = (project.apparelConfig.categoryId || "").toString();
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  // ─── Canvas redraw (background only) ──────────────────────────────────────
  const redraw = useCallback(async (cancelled: { v: boolean }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bitmap = await compositeBackground(
      bgSnapshot, cancelled, categoryId, activeView as "front" | "back",
    );
    if (cancelled.v || !bitmap) return;

    // Atomic blit — no partial-draw flicker
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
  }, [bgSnapshot, categoryId, activeView]);

  useEffect(() => {
    const cancelled = { v: false };
    const id = requestAnimationFrame(() => {
      redraw(cancelled).catch(console.error);
    });
    return () => { cancelled.v = true; cancelAnimationFrame(id); };
  }, [redraw]);

  // ─── Drag / resize handlers ────────────────────────────────────────────────
  // Rnd positions/sizes are in CSS display space (DISPLAY_W × DISPLAY_H).
  // We divide by SCALE_X/SCALE_Y before storing so that layer coordinates
  // stay in canvas pixel space — preserving all UV mapping / 3D placement.
  const handleDrag = (id: string, d: { x: number; y: number }) => {
    updateLayer(id, {
      x: Math.round(d.x / SCALE_X),
      y: Math.round(d.y / SCALE_Y),
    });
  };

  const handleDragStop = (id: string, d: { x: number; y: number }) => {
    updateLayer(id, {
      x: Math.round(d.x / SCALE_X),
      y: Math.round(d.y / SCALE_Y),
    });
  };

  // Live resize: convert CSS handle dimensions back to canvas coordinates.
  const handleResize = (
    id: string,
    ref: HTMLElement,
    position: { x: number; y: number },
  ) => {
    updateLayer(id, {
      width:  Math.max(1, Math.round(parseInt(ref.style.width,  10) / SCALE_X)),
      height: Math.max(1, Math.round(parseInt(ref.style.height, 10) / SCALE_Y)),
      x: Math.round(position.x / SCALE_X),
      y: Math.round(position.y / SCALE_Y),
    });
  };

  const handleLayerSelect = (id: string) => {
    selectLayer(id);
    onLayerSelect?.(id);
  };

  const handleDeselect = () => {
    selectLayer(null);
    onLayerSelect?.(null);
  };

  return (
    <div className={styles.editorContainer} onClick={handleDeselect}>
      <div className={styles.printAreaWrapper}>
        <div
          className={styles.printArea}
          data-print-area="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Canvas: garment background + print zone guide only ─────────── */}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={styles.compositeCanvas}
          />

          {/* Loading shimmer */}
          {glbSnapshots.loading && (
            <div className={styles.snapshotLoading}>
              <span>Generating preview…</span>
            </div>
          )}

          {/* ── Rnd handles: contain the actual layer content as DOM ─────────
               Each Rnd renders the image / text / line visually inside itself,
               so the content is always inside the blue boundary box.          */}
          {layers.map((layer) => {
            if (!layer.isVisible) return null;
            const isSelected = selectedLayerId === layer.id;

            return (
              <Rnd
                key={layer.id}
                // ── Display in CSS space (scaled up from canvas coordinates) ──
                size={{
                  width:  layer.width  * SCALE_X,
                  height: layer.height * SCALE_Y,
                }}
                position={{
                  x: layer.x * SCALE_X,
                  y: layer.y * SCALE_Y,
                }}
                onDrag={(_e, d) => handleDrag(layer.id, d)}
                onDragStop={(_e, d) => handleDragStop(layer.id, d)}
                // Live resize: update store while dragging handle for real-time canvas tracking
                onResize={(_e, _dir, ref, _delta, pos) => handleResize(layer.id, ref, pos)}
                onResizeStop={(_e, _dir, ref, _delta, pos) => handleResize(layer.id, ref, pos)}
                disableDragging={layer.isLocked}
                enableResizing={
                  !layer.isLocked
                    ? {
                        top: false, right: true, bottom: true, left: false,
                        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
                      }
                    : false
                }
                resizeHandleStyles={{
                  topRight:    { width: 10, height: 10, background: "#0070f3", borderRadius: "50%", right: -5, top: -5 },
                  bottomRight: { width: 10, height: 10, background: "#0070f3", borderRadius: "50%", right: -5, bottom: -5 },
                  bottomLeft:  { width: 10, height: 10, background: "#0070f3", borderRadius: "50%", left: -5, bottom: -5 },
                  topLeft:     { width: 10, height: 10, background: "#0070f3", borderRadius: "50%", left: -5, top: -5 },
                  right:  { width: 6, height: 24, background: "#0070f3", borderRadius: 3, right: -3, top: "calc(50% - 12px)" },
                  bottom: { width: 24, height: 6, background: "#0070f3", borderRadius: 3, bottom: -3, left: "calc(50% - 12px)" },
                }}
                bounds="parent"
                dragGrid={[1, 1]}
                className={`${styles.layerHandle} ${isSelected ? styles.selected : ""}`}
                style={{ zIndex: (layer.zIndex ?? 1) + 10 }}
                onMouseDown={() => handleLayerSelect(layer.id)}
              >
                {/* Layer content lives inside the Rnd box — always in sync with the boundary */}
                <div
                  className={styles.layerContent}
                  style={{
                    opacity:         layer.opacity ?? 1,
                    transform:       layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                    transformOrigin: "center center",
                  }}
                >
                  <LayerContent layer={layer} />
                </div>
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
