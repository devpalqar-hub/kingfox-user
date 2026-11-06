"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageLayer, Layer, TextLayer } from "@/types/design-studio";
import {
  DEFAULT_GARMENT,
  GARMENTS,
  PRINT_PX_PER_MM,
  type StudioView,
} from "@/lib/design-studio/printZones";
import {
  createTestCardDataUrl,
  drawFrame,
  measureText,
  preloadLayerImages,
} from "@/lib/design-studio/frameRenderer";
import FrameEditor from "./FrameEditor";
import GarmentViewer from "./GarmentViewer";

const COLORS = [
  { name: "White", hex: "#f5f5f5" },
  { name: "Black", hex: "#111111" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Red", hex: "#b91c1c" },
  { name: "Olive", hex: "#556b2f" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const baseLayer = (zIndex: number) => ({
  id: uid(),
  rotation: 0,
  zIndex,
  isLocked: false,
  isVisible: true,
  opacity: 1,
});

const btn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  background: "#fff",
  color: "#111",
  cursor: "pointer",
  fontSize: 13,
};

/**
 * Prototype of the rebuilt customiser: one print rectangle drives both the 2D
 * frame and the 3D decal. Shirt only. Lives at /design-studio/v2.
 */
export default function StudioV2() {
  const [garmentKey, setGarmentKey] = useState(DEFAULT_GARMENT);
  const spec = GARMENTS[garmentKey];
  const [view, setView] = useState<StudioView>("front");
  const [colorHex, setColorHex] = useState(COLORS[0].hex);
  const [showZone, setShowZone] = useState(true);
  const [layers, setLayers] = useState<Record<StudioView, Layer[]>>({ front: [], back: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Size at the moment the slider was grabbed, so scaling is not cumulative.
  const scaleBase = useRef<{ id: string; w: number; h: number; fontSize?: number } | null>(null);

  const zone = spec.zones[view];
  const frame = useMemo(
    () => ({ widthMm: zone.sizeMm[0], heightMm: zone.sizeMm[1] }),
    [zone],
  );
  const current = layers[view];
  const selected = current.find((l) => l.id === selectedId) ?? null;

  const patch = (id: string, changes: Partial<Layer>) =>
    setLayers((prev) => ({
      ...prev,
      [view]: prev[view].map((l) => (l.id === id ? ({ ...l, ...changes } as Layer) : l)),
    }));

  const add = (layer: Layer) => {
    setLayers((prev) => ({ ...prev, [view]: [...prev[view], layer] }));
    setSelectedId(layer.id);
  };

  const nextZ = () => current.reduce((m, l) => Math.max(m, l.zIndex), 0) + 1;

  const addText = () => {
    const t = {
      text: "KINGFOX",
      fontFamily: "Arial Black",
      fontSize: 40,
      fontWeight: 800,
      letterSpacing: 2,
    };
    let size = measureText(t);
    // New text always starts inside the print area (max 80% of its width).
    if (size.width > frame.widthMm * 0.8) {
      t.fontSize = Math.max(8, Math.floor((t.fontSize * frame.widthMm * 0.8) / size.width));
      size = measureText(t);
    }
    const layer: TextLayer = {
      ...baseLayer(nextZ()),
      type: "text",
      name: "Text",
      ...t,
      colorHex: colorHex === "#111111" ? "#ffffff" : "#111111",
      textAlign: "center",
      width: size.width,
      height: size.height,
      x: Math.round((frame.widthMm - size.width) / 2),
      y: Math.round((frame.heightMm - size.height) / 2),
    };
    add(layer);
  };

  const addImageFromUrl = (url: string, name: string, fit: "contain" | "fill") =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        let w = fit === "fill" ? frame.widthMm : frame.widthMm * 0.6;
        let h = fit === "fill" ? frame.heightMm : w / ratio;
        if (fit === "contain" && h > frame.heightMm * 0.8) {
          h = frame.heightMm * 0.8;
          w = h * ratio;
        }
        const layer: ImageLayer = {
          ...baseLayer(nextZ()),
          type: "image",
          name,
          width: Math.round(w),
          height: Math.round(h),
          x: Math.round((frame.widthMm - w) / 2),
          y: Math.round((frame.heightMm - h) / 2),
          asset: {
            assetId: uid(),
            originalUrl: url,
            thumbnailUrl: url,
            mimeType: "image/png",
          },
        };
        add(layer);
        resolve();
      };
      img.src = url;
    });

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addImageFromUrl(String(reader.result), file.name, "contain");
    reader.readAsDataURL(file);
  };

  const addTestCard = () => addImageFromUrl(createTestCardDataUrl(frame), "Test card", "fill");

  // QA helpers: ?testcard=1 puts a calibration card on both sides, ?view=back opens the back.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.get("view") === "back") setView("back");
    const g = params.get("garment");
    if (g && GARMENTS[g]) setGarmentKey(g);
    if (!params.has("testcard")) return;
    const sp = GARMENTS[g && GARMENTS[g] ? g : DEFAULT_GARMENT];
    const make = (v: StudioView): ImageLayer => ({
      ...baseLayer(1),
      type: "image",
      name: "Test card",
      x: 0,
      y: 0,
      width: sp.zones[v].sizeMm[0],
      height: sp.zones[v].sizeMm[1],
      asset: {
        assetId: uid(),
        originalUrl: createTestCardDataUrl({
          widthMm: sp.zones[v].sizeMm[0],
          heightMm: sp.zones[v].sizeMm[1],
        }),
        thumbnailUrl: "",
        mimeType: "image/png",
      },
    });
    setLayers({ front: [make("front")], back: [make("back")] });
  }, []);

  const remove = () => {
    if (!selected) return;
    setLayers((prev) => ({ ...prev, [view]: prev[view].filter((l) => l.id !== selected.id) }));
    setSelectedId(null);
  };

  const startRescale = () => {
    if (!selected) return;
    scaleBase.current = {
      id: selected.id,
      w: selected.width,
      h: selected.height,
      fontSize: selected.type === "text" ? (selected as TextLayer).fontSize : undefined,
    };
  };

  const rescale = (percent: number) => {
    const base = scaleBase.current;
    if (!selected || !base || base.id !== selected.id) return;
    const k = percent / 100;
    const cx = selected.x + selected.width / 2;
    const cy = selected.y + selected.height / 2;
    const w = Math.max(4, Math.round(base.w * k));
    const h = Math.max(4, Math.round(base.h * k));
    const changes: Partial<Layer> = {
      width: w,
      height: h,
      x: Math.round(cx - w / 2),
      y: Math.round(cy - h / 2),
    };
    if (base.fontSize) (changes as Partial<TextLayer>).fontSize = Math.max(4, Math.round(base.fontSize * k));
    patch(selected.id, changes);
  };

  const setText = (text: string) => {
    if (!selected || selected.type !== "text") return;
    const next = { ...selected, text } as TextLayer;
    const size = measureText(next);
    const cx = selected.x + selected.width / 2;
    patch(selected.id, { text, width: size.width, height: size.height, x: Math.round(cx - size.width / 2) });
  };

  const downloadPrint = async () => {
    const canvas = document.createElement("canvas");
    await preloadLayerImages(current);
    drawFrame(canvas, frame, current, { scale: PRINT_PX_PER_MM });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `print-${view}-${frame.widthMm}x${frame.heightMm}mm-300dpi.png`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 16px 48px" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>Design Studio v2 — prototype</h1>
      <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 13 }}>
        {spec.label}: the 2D frame is the print rectangle, projected straight onto the garment.
        Use “Test card” to check that the corner markers land on the same points in 2D and 3D.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.values(GARMENTS).map((g) => (
          <button
            key={g.key}
            style={{ ...btn, background: g.key === garmentKey ? "#2563eb" : "#fff", color: g.key === garmentKey ? "#fff" : "#111" }}
            onClick={() => {
              setGarmentKey(g.key);
              setLayers({ front: [], back: [] });
              setSelectedId(null);
            }}
          >
            {g.label}
          </button>
        ))}
        <span style={{ width: 8 }} />
        {(["front", "back"] as StudioView[]).map((v) => (
          <button
            key={v}
            style={{ ...btn, background: v === view ? "#111" : "#fff", color: v === view ? "#fff" : "#111" }}
            onClick={() => {
              setView(v);
              setSelectedId(null);
            }}
          >
            {v.toUpperCase()}
          </button>
        ))}
        <span style={{ width: 8 }} />
        {COLORS.map((c) => (
          <button
            key={c.hex}
            title={c.name}
            aria-label={c.name}
            onClick={() => setColorHex(c.hex)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: c.hex === colorHex ? "3px solid #2563eb" : "1px solid #9ca3af",
              background: c.hex,
              cursor: "pointer",
            }}
          />
        ))}
        <span style={{ width: 8 }} />
        <button style={btn} onClick={addText}>+ Text</button>
        <button style={btn} onClick={() => fileRef.current?.click()}>+ Image</button>
        <button style={btn} onClick={addTestCard}>+ Test card</button>
        <button style={btn} onClick={downloadPrint}>Download print PNG (300 DPI)</button>
        <label style={{ ...btn, display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={showZone} onChange={(e) => setShowZone(e.target.checked)} />
          Show print area on garment
        </label>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <div>
          <FrameEditor
            frame={frame}
            layers={current}
            background={colorHex}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={(id, x, y) => patch(id, { x, y })}
          />

          {selected && (
            <div style={{ marginTop: 12, display: "grid", gap: 8, fontSize: 13 }}>
              <strong>{selected.name}</strong>
              {selected.type === "text" && (
                <input
                  value={(selected as TextLayer).text}
                  onChange={(e) => setText(e.target.value)}
                  style={{ ...btn, cursor: "text" }}
                />
              )}
              <label>
                Size
                <input
                  type="range"
                  min={20}
                  max={250}
                  defaultValue={100}
                  key={selected.id}
                  onPointerDown={startRescale}
                  onKeyDown={startRescale}
                  onChange={(e) => rescale(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </label>
              <label>
                Rotation
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selected.rotation}
                  onChange={(e) => patch(selected.id, { rotation: Number(e.target.value) })}
                  style={{ width: "100%" }}
                />
              </label>
              <button style={btn} onClick={remove}>Delete layer</button>
            </div>
          )}
        </div>

        <div style={{ height: 620, background: "#e5e7eb", borderRadius: 8 }}>
          <GarmentViewer
            spec={spec}
            colorHex={colorHex}
            view={view}
            layers={layers}
            showZone={showZone}
          />
        </div>
      </div>
    </div>
  );
}
