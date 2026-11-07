import type { ImageLayer, Layer, TextLayer } from "@/types/design-studio";

/** The 2D frame. 1 layer unit = 1 mm, so it is also the physical print size. */
export interface FrameSpec {
  widthMm: number;
  heightMm: number;
}

// Decoded images, readable synchronously once preloaded.
const images = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<void>>();

function loadImage(src: string): Promise<void> {
  if (images.has(src)) return Promise.resolve();
  let p = pending.get(src);
  if (!p) {
    p = new Promise<void>((resolve) => {
      const img = new Image();
      if (!src.startsWith("data:") && !src.startsWith("blob:")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        images.set(src, img);
        resolve();
      };
      img.onerror = () => resolve(); // broken image: skipped when drawing
      img.src = src;
    });
    pending.set(src, p);
  }
  return p;
}

/** Call (and await) before drawFrame so image layers are available synchronously. */
export async function preloadLayerImages(layers: Layer[]) {
  await Promise.all(
    layers
      .filter((l): l is ImageLayer => l.type === "image")
      .map((l) => loadImage(l.asset.originalUrl)),
  );
}

const fontString = (layer: TextLayer, scale: number) =>
  `${layer.fontWeight ?? 700} ${layer.fontSize * scale}px ${layer.fontFamily || "Arial"}, sans-serif`;

type SpacedContext = CanvasRenderingContext2D & { letterSpacing?: string };

/** Natural size (mm) of a single-line text layer. */
export function measureText(layer: Pick<TextLayer, "text" | "fontFamily" | "fontSize" | "fontWeight" | "letterSpacing">) {
  const ctx = document.createElement("canvas").getContext("2d") as SpacedContext;
  ctx.font = `${layer.fontWeight ?? 700} ${layer.fontSize}px ${layer.fontFamily || "Arial"}, sans-serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${layer.letterSpacing ?? 0}px`;
  const m = ctx.measureText(layer.text || " ");
  return { width: Math.ceil(m.width) + 2, height: Math.ceil(layer.fontSize * 1.25) };
}

/**
 * Draws all visible layers. Used for BOTH the 2D editor view and the 3D decal
 * texture, so what you see in the frame is exactly what lands on the garment.
 * Image layers must be preloaded (see preloadLayerImages).
 */
export function drawFrame(
  canvas: HTMLCanvasElement,
  frame: FrameSpec,
  layers: Layer[],
  opts: { scale: number; background?: string },
) {
  const { scale, background } = opts;
  canvas.width = Math.max(1, Math.round(frame.widthMm * scale));
  canvas.height = Math.max(1, Math.round(frame.heightMm * scale));
  const ctx = canvas.getContext("2d") as SpacedContext | null;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const ordered = [...layers]
    .filter((l) => l.isVisible !== false)
    .sort((p, q) => p.zIndex - q.zIndex);

  for (const layer of ordered) {
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.translate((layer.x + layer.width / 2) * scale, (layer.y + layer.height / 2) * scale);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

    const w = layer.width * scale;
    const h = layer.height * scale;

    if (layer.type === "image") {
      const img = images.get(layer.asset.originalUrl);
      if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else if (layer.type === "text") {
      ctx.font = fontString(layer, scale);
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${(layer.letterSpacing ?? 0) * scale}px`;
      ctx.fillStyle = layer.colorHex || "#000000";
      ctx.textBaseline = "middle";
      ctx.textAlign = layer.textAlign || "center";
      const tx = layer.textAlign === "left" ? -w / 2 : layer.textAlign === "right" ? w / 2 : 0;
      ctx.fillText(layer.text || "", tx, 0);
    } else if (layer.type === "line") {
      const thick = Math.max(1, layer.thickness * scale);
      ctx.fillStyle = layer.colorHex || "#000000";
      ctx.fillRect(-w / 2, -thick / 2, w, thick);
    }

    ctx.restore();
  }
}

/**
 * Calibration artwork: numbered 5 cm grid, coloured corner squares, centre
 * crosshair + circle, TOP marker. If the corner squares do not land on the
 * same garment points in 2D and 3D, the mapping is wrong.
 */
export function createTestCardDataUrl(frame: FrameSpec): string {
  const s = 4;
  const c = document.createElement("canvas");
  c.width = frame.widthMm * s;
  c.height = frame.heightMm * s;
  const ctx = c.getContext("2d")!;
  const W = c.width;
  const H = c.height;

  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillRect(0, 0, W, H);

  ctx.font = `${10 * s}px Arial, sans-serif`;
  ctx.textBaseline = "top";
  for (let mm = 0; mm <= frame.widthMm; mm += 50) {
    ctx.strokeStyle = mm % 100 === 0 ? "#111" : "#888";
    ctx.lineWidth = mm % 100 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(mm * s, 0);
    ctx.lineTo(mm * s, H);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.fillText(String(mm / 10), mm * s + 3, 14 * s);
  }
  for (let mm = 0; mm <= frame.heightMm; mm += 50) {
    ctx.strokeStyle = mm % 100 === 0 ? "#111" : "#888";
    ctx.lineWidth = mm % 100 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, mm * s);
    ctx.lineTo(W, mm * s);
    ctx.stroke();
    if (mm > 0) {
      ctx.fillStyle = "#111";
      ctx.fillText(String(mm / 10), 14 * s, mm * s + 3);
    }
  }

  const sq = 40 * s;
  const corners: [number, number, string, string][] = [
    [0, 0, "#e11d48", "TL"],
    [W - sq, 0, "#16a34a", "TR"],
    [0, H - sq, "#2563eb", "BL"],
    [W - sq, H - sq, "#f59e0b", "BR"],
  ];
  for (const [x, y, color, label] of corners) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, sq, sq);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${16 * s}px Arial, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(label, x + sq / 2, y + sq / 2);
  }

  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 100 * s, 0, Math.PI * 2);
  ctx.moveTo(W / 2 - 120 * s, H / 2);
  ctx.lineTo(W / 2 + 120 * s, H / 2);
  ctx.moveTo(W / 2, H / 2 - 120 * s);
  ctx.lineTo(W / 2, H / 2 + 120 * s);
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = `bold ${22 * s}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("TOP", W / 2, 46 * s);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, W, H);

  return c.toDataURL("image/png");
}

/** Dashed outline + corner ticks, drawn as a guide decal in 3D. */
export function createZoneGuideCanvas(frame: FrameSpec): HTMLCanvasElement {
  const s = 4;
  const c = document.createElement("canvas");
  c.width = frame.widthMm * s;
  c.height = frame.heightMm * s;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "rgba(37,99,235,0.95)";
  ctx.lineWidth = 3 * s;
  ctx.setLineDash([10 * s, 6 * s]);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, c.width - ctx.lineWidth, c.height - ctx.lineWidth);
  ctx.fillStyle = "rgba(37,99,235,0.08)";
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}
