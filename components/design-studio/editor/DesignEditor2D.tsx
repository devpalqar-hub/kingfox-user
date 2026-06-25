"use client";

import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { Rnd } from "react-rnd";
import { TextLayer, ImageLayer, LineLayer } from "@/types/design-studio";
import { useRef, useEffect, useCallback } from "react";
import { getPrintBounds500 } from "@/utils/printBounds";
import styles from "./DesignEditor2D.module.css";

const CANVAS_W = 500;
const CANVAS_H = 600;

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

// ─── Offscreen compositing ────────────────────────────────────────────────────
// Draws GLB snapshot → print-zone guide → design layers onto an OffscreenCanvas,
// then atomically blits the result to avoid any flicker.
async function composite(
  bgSnapshot: string | null,
  layers: ReturnType<typeof useDesignStore.getState>["project"]["designs"]["front"],
  cancelled: { v: boolean },
  categoryId: string,
  view: "front" | "back",
): Promise<ImageBitmap | null> {
  const offscreen = new OffscreenCanvas(CANVAS_W, CANVAS_H);
  const ctx = offscreen.getContext("2d")!;

  // ── 1. White base (prevents transparent-canvas black flash) ──────────────
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── 2. GLB snapshot background ────────────────────────────────────────────
  if (bgSnapshot) {
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

  // ── 4. Design layers at pixel-exact positions ─────────────────────────────
  for (const layer of layers) {
    if (!layer.isVisible) continue;
    if (cancelled.v) return null;

    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;

    // Translate to layer centre so rotation pivots correctly
    const cx = layer.x + layer.width  / 2;
    const cy = layer.y + layer.height / 2;
    ctx.translate(cx, cy);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.type === "image") {
      const imageLayer = layer as ImageLayer;
      try {
        const img = await loadImage(imageLayer.asset.originalUrl);
        if (cancelled.v) return null;
        // Fill exact layer bounds → canvas visual matches Rnd selection border 1:1
        ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      } catch (e) {
        // Draw a placeholder rectangle so the user sees something even if image fails
        ctx.fillStyle = "rgba(200,200,200,0.7)";
        ctx.fillRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1;
        ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
      }

    } else if (layer.type === "text") {
      const textLayer = layer as TextLayer;
      ctx.fillStyle  = textLayer.colorHex || "#000";
      ctx.font       = `${textLayer.fontWeight ?? 700} ${textLayer.fontSize}px "${textLayer.fontFamily || "Inter"}", sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign    = (textLayer.textAlign as CanvasTextAlign) || "center";

      if (textLayer.letterSpacing && textLayer.letterSpacing !== 0) {
        const chars    = [...(textLayer.text || "")];
        const spacing  = textLayer.letterSpacing;
        const totalW   = chars.reduce((a, ch) => a + ctx.measureText(ch).width + spacing, 0);
        let startX = -(totalW / 2);
        if (textLayer.textAlign === "left")  startX = -layer.width / 2;
        if (textLayer.textAlign === "right") startX =  layer.width / 2 - totalW;
        for (const ch of chars) {
          ctx.fillText(ch, startX, 0);
          startX += ctx.measureText(ch).width + spacing;
        }
      } else {
        let xOff = 0;
        if (textLayer.textAlign === "left")  xOff = -layer.width / 2;
        if (textLayer.textAlign === "right") xOff =  layer.width / 2;
        ctx.fillText(textLayer.text || "", xOff, 0);
      }

    } else if (layer.type === "line") {
      const lineLayer = layer as LineLayer;
      ctx.fillStyle = lineLayer.colorHex || "#000";
      const half = lineLayer.thickness / 2;
      ctx.fillRect(-layer.width / 2, -half, layer.width, lineLayer.thickness);
    }

    ctx.restore();
  }

  return offscreen.transferToImageBitmap();
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

  // ─── Canvas redraw ─────────────────────────────────────────────────────────
  const redraw = useCallback(async (cancelled: { v: boolean }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bitmap = await composite(
      bgSnapshot, layers, cancelled, categoryId, activeView as "front" | "back",
    );
    if (cancelled.v || !bitmap) return;

    // Atomic blit — no partial-draw flicker
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
  }, [bgSnapshot, layers, categoryId, activeView]);

  useEffect(() => {
    const cancelled = { v: false };
    const id = requestAnimationFrame(() => {
      redraw(cancelled).catch(console.error);
    });
    return () => { cancelled.v = true; cancelAnimationFrame(id); };
  }, [redraw]);

  // ─── Drag / resize handlers ────────────────────────────────────────────────
  const handleDrag = (id: string, d: { x: number; y: number }) => {
    updateLayer(id, { x: Math.round(d.x), y: Math.round(d.y) });
  };

  const handleDragStop = (id: string, d: { x: number; y: number }) => {
    updateLayer(id, { x: Math.round(d.x), y: Math.round(d.y) });
  };

  // Live resize: update layer dimensions in the store on every move so the
  // canvas visual tracks the handle in real-time.
  const handleResize = (
    id: string,
    ref: HTMLElement,
    position: { x: number; y: number },
  ) => {
    updateLayer(id, {
      width:  parseInt(ref.style.width,  10) || 1,
      height: parseInt(ref.style.height, 10) || 1,
      x: Math.round(position.x),
      y: Math.round(position.y),
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
          {/* ── Canvas: GLB snapshot + print guide + design layers ─────────── */}
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

          {/* ── Rnd interaction handles (transparent — only for drag/resize) ── */}
          {layers.map((layer) => {
            if (!layer.isVisible) return null;
            const isSelected = selectedLayerId === layer.id;

            return (
              <Rnd
                key={layer.id}
                size={{ width: layer.width, height: layer.height }}
                position={{ x: layer.x, y: layer.y }}
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
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
