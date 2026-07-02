"use client";

/**
 * PrintAreaMeasurer — Development-only 2D calibration tool.
 *
 * How to use:
 *   1. Mount <PrintAreaMeasurer /> anywhere in the workspace page (it is
 *      invisible in production — NODE_ENV check prevents rendering).
 *   2. Click "📐 Calibrate Print Area" in the floating toolbar.
 *   3. Click and drag over the 2D preview canvas to define the printable zone.
 *   4. The tool outputs values in two coordinate spaces:
 *        • Canvas space  (500×600) — used by DesignEditor2D layer positions
 *        • GLB snapshot  (800×960) — used by DesignCanvas.tsx PRINT_BOUNDS
 *   5. Copy the generated snippet and paste into DesignCanvas.tsx → PRINT_BOUNDS.
 *   6. Click "Stop Measuring" when done.
 *
 * The tool locates the print area element via [data-print-area] attribute on
 * the printArea div inside DesignEditor2D.tsx.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";

// ── Constants ──────────────────────────────────────────────────────────────
const CANVAS_W = 1200;
const CANVAS_H = 1500;
// Same 5:6 ratio — GLB snapshot is 800×960
const TO_GLB_X = 800 / CANVAS_W;  // 1.6
const TO_GLB_Y = 960 / CANVAS_H;  // 1.6

interface BBox { x: number; y: number; w: number; h: number }

// ── Inner component (holds all hooks) ─────────────────────────────────────
function Inner() {
  const { activeView, project } = useDesignStore();

  const [active, setActive]         = useState(false);
  const [dragging, setDragging]     = useState(false);
  const [startPt, setStartPt]       = useState<{ x: number; y: number } | null>(null);
  const [livePt, setLivePt]         = useState<{ x: number; y: number } | null>(null);
  const [measured, setMeasured]     = useState<BBox | null>(null);
  const [overlayBR, setOverlayBR]   = useState<DOMRect | null>(null);
  const [mounted, setMounted]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [side, setSide]             = useState<"front" | "back">("front");

  // Hydration guard for createPortal
  useEffect(() => { setMounted(true); }, []);

  // Recompute overlay position whenever the tool is active or window resizes
  const refresh = useCallback(() => {
    const el = document.querySelector("[data-print-area]") as HTMLElement | null;
    if (el) setOverlayBR(el.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!active) return;
    refresh();
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [active, refresh]);

  // ── Coordinate conversion ────────────────────────────────────────────────
  // getBoundingClientRect() already accounts for CSS transform: scale(0.68),
  // so dividing by the rendered size gives us the logical 0-1 fraction, which
  // we then multiply by the canvas logical size.
  const toCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!overlayBR) return null;
      const relX = clientX - overlayBR.left;
      const relY = clientY - overlayBR.top;
      return {
        x: Math.max(0, Math.min(CANVAS_W, Math.round((relX / overlayBR.width)  * CANVAS_W))),
        y: Math.max(0, Math.min(CANVAS_H, Math.round((relY / overlayBR.height) * CANVAS_H))),
      };
    },
    [overlayBR],
  );

  // ── Mouse handlers on the overlay ────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pt = toCanvas(e.clientX, e.clientY);
    if (!pt) return;
    setStartPt(pt);
    setLivePt(pt);
    setDragging(true);
    setMeasured(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const pt = toCanvas(e.clientX, e.clientY);
    if (pt) setLivePt(pt);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging || !startPt) return;
    const pt = toCanvas(e.clientX, e.clientY);
    if (pt) {
      setMeasured({
        x: Math.min(startPt.x, pt.x),
        y: Math.min(startPt.y, pt.y),
        w: Math.abs(pt.x - startPt.x),
        h: Math.abs(pt.y - startPt.y),
      });
    }
    setDragging(false);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const liveBox: BBox | null =
    dragging && startPt && livePt
      ? {
          x: Math.min(startPt.x, livePt.x),
          y: Math.min(startPt.y, livePt.y),
          w: Math.abs(livePt.x - startPt.x),
          h: Math.abs(livePt.y - startPt.y),
        }
      : measured;

  const glb = measured
    ? {
        x: Math.round(measured.x * TO_GLB_X),
        y: Math.round(measured.y * TO_GLB_Y),
        w: Math.round(measured.w * TO_GLB_X),
        h: Math.round(measured.h * TO_GLB_Y),
      }
    : null;

  const modelKey = (() => {
    const n = (project.apparelConfig.categoryId || "").toLowerCase();
    if (n.includes("hoodie")) return "hoodie";
    if (n.includes("polo"))   return "polo";
    if (n.includes("long") || n.includes("sleeve")) return "long";
    if (n.includes("oversize")) return "oversize";
    return "shirt";
  })();

  const snippet = measured && glb
    ? `// Paste into PRINT_BOUNDS in DesignCanvas.tsx → key: "${modelKey}"\n${modelKey}: {\n  ${side}: { x: ${glb.x}, y: ${glb.y}, w: ${glb.w}, h: ${glb.h} },\n  // (measure back view separately)\n},`
    : null;

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Convert liveBox to % of overlay for SVG rendering ─────────────────
  const toPercX = (v: number) => `${(v / CANVAS_W) * 100}%`;
  const toPercY = (v: number) => `${(v / CANVAS_H) * 100}%`;

  return (
    <>
      {/* ── Floating toolbar ──────────────────────────────────────────────── */}
      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.6px" }}>
            DEV TOOL
          </span>
          <span style={{ color: "#f59e0b", fontSize: 14 }}>📐</span>
        </div>

        {/* Toggle */}
        <button
          onClick={() => { setActive(a => !a); setMeasured(null); setDragging(false); }}
          style={active ? activeBtnStyle : btnStyle}
        >
          {active ? "■ Stop Measuring" : "Calibrate Print Area"}
        </button>

        {/* Side selector */}
        {active && (
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {(["front", "back"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSide(s); setMeasured(null); }}
                style={{
                  flex: 1, padding: "4px 0", background: side === s ? "#3b82f6" : "#1e293b",
                  border: "none", borderRadius: 4, color: "#fff", fontSize: 11, cursor: "pointer",
                  fontWeight: side === s ? 700 : 400,
                }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        {active && !measured && (
          <p style={hintStyle}>
            {dragging ? "Release to confirm" : "Click & drag on the preview to define the printable zone"}
          </p>
        )}

        {/* Live coordinates during drag */}
        {active && dragging && liveBox && (
          <div style={liveStyle}>
            <span style={{ color: "#94a3b8", fontSize: 10 }}>LIVE</span>
            <code style={codeInlineStyle}>
              {liveBox.x},{liveBox.y} → {liveBox.w}×{liveBox.h}
            </code>
          </div>
        )}

        {/* Measurement output */}
        {measured && glb && (
          <div style={outputStyle}>
            <div style={outputRowStyle}>
              <span style={{ color: "#60a5fa", fontSize: 10, fontWeight: 700 }}>CANVAS 500×600</span>
              <code style={codeInlineStyle}>x:{measured.x} y:{measured.y} w:{measured.w} h:{measured.h}</code>
            </div>
            <div style={outputRowStyle}>
              <span style={{ color: "#34d399", fontSize: 10, fontWeight: 700 }}>GLB 800×960</span>
              <code style={codeInlineStyle}>x:{glb.x} y:{glb.y} w:{glb.w} h:{glb.h}</code>
            </div>

            <div style={outputRowStyle}>
              <span style={{ color: "#f59e0b", fontSize: 10, fontWeight: 700 }}>MODEL KEY</span>
              <code style={codeInlineStyle}>{modelKey} / {side}</code>
            </div>

            <div style={{ marginTop: 8, background: "#0f172a", borderRadius: 6, padding: "8px 10px" }}>
              <pre style={{ margin: 0, fontSize: 10, color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                {snippet}
              </pre>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button onClick={handleCopy} style={copyBtnStyle}>
                {copied ? "✓ Copied!" : "Copy Snippet"}
              </button>
              <button
                onClick={() => { setMeasured(null); setStartPt(null); setLivePt(null); }}
                style={{ ...copyBtnStyle, background: "#374151", color: "#9ca3af" }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Capture overlay + SVG guide ────────────────────────────────────── */}
      {active && overlayBR && mounted && createPortal(
        <div
          style={{
            position: "fixed",
            top:    overlayBR.top,
            left:   overlayBR.left,
            width:  overlayBR.width,
            height: overlayBR.height,
            cursor: "crosshair",
            zIndex: 9998,
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {liveBox && liveBox.w > 4 && liveBox.h > 4 && (
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
            >
              <defs>
                {/* Mask punches out the selected area so it stays bright */}
                <mask id="pam-cutout">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={toPercX(liveBox.x)} y={toPercY(liveBox.y)}
                    width={toPercX(liveBox.w)} height={toPercY(liveBox.h)}
                    fill="black"
                  />
                </mask>
              </defs>

              {/* Dark scrim outside selection */}
              <rect
                width="100%" height="100%"
                fill="rgba(0,0,0,0.45)"
                mask="url(#pam-cutout)"
              />

              {/* Selection rectangle */}
              <rect
                x={toPercX(liveBox.x)} y={toPercY(liveBox.y)}
                width={toPercX(liveBox.w)} height={toPercY(liveBox.h)}
                fill="rgba(59, 130, 246, 0.08)"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="7 3"
              />

              {/* Corner markers */}
              {[
                [liveBox.x, liveBox.y],
                [liveBox.x + liveBox.w, liveBox.y],
                [liveBox.x, liveBox.y + liveBox.h],
                [liveBox.x + liveBox.w, liveBox.y + liveBox.h],
              ].map(([cx, cy], i) => (
                <rect
                  key={i}
                  x={toPercX(cx - 4)} y={toPercY(cy - 4)}
                  width={toPercX(8)} height={toPercY(8)}
                  fill="#3b82f6"
                  rx="1"
                />
              ))}

              {/* Top-left coordinate label */}
              <text
                x={toPercX(liveBox.x + 2)}
                y={toPercY(liveBox.y)}
                dy="-4"
                fill="#93c5fd"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {liveBox.x},{liveBox.y}
              </text>

              {/* Width × Height label centred on bottom edge */}
              <text
                x={toPercX(liveBox.x + liveBox.w / 2)}
                y={toPercY(liveBox.y + liveBox.h)}
                dy="14"
                fill="#93c5fd"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {liveBox.w} × {liveBox.h}
              </text>

              {/* Right-edge height label */}
              <text
                x={toPercX(liveBox.x + liveBox.w)}
                y={toPercY(liveBox.y + liveBox.h / 2)}
                dx="6"
                fill="#93c5fd"
                fontSize="10"
                fontFamily="monospace"
                dominantBaseline="middle"
              >
                h:{liveBox.h}
              </text>

              {/* Crosshair at start point */}
              {startPt && (
                <>
                  <line
                    x1={toPercX(startPt.x - 8)} y1={toPercY(startPt.y)}
                    x2={toPercX(startPt.x + 8)} y2={toPercY(startPt.y)}
                    stroke="#f59e0b" strokeWidth="1"
                  />
                  <line
                    x1={toPercX(startPt.x)} y1={toPercY(startPt.y - 8)}
                    x2={toPercX(startPt.x)} y2={toPercY(startPt.y + 8)}
                    stroke="#f59e0b" strokeWidth="1"
                  />
                </>
              )}

              {/* Live cursor coordinates */}
              {livePt && (
                <text
                  x={toPercX(Math.min(livePt.x + 10, CANVAS_W - 60))}
                  y={toPercY(Math.max(livePt.y - 8, 14))}
                  fill="#fbbf24"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {livePt.x},{livePt.y}
                </text>
              )}
            </svg>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 260,
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "12px 14px",
  zIndex: 9999,
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  fontFamily: "system-ui, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  background: "#334155",
  border: "1px solid #475569",
  borderRadius: 6,
  color: "#e2e8f0",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "0.3px",
};

const activeBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#1d4ed8",
  border: "1px solid #3b82f6",
  color: "#fff",
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#64748b",
  margin: "8px 0 0",
  lineHeight: 1.5,
};

const liveStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  marginTop: 8,
  padding: "6px 8px",
  background: "#0f172a",
  borderRadius: 6,
  border: "1px solid #1e3a5f",
};

const codeInlineStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 11,
  color: "#93c5fd",
  letterSpacing: "0.2px",
};

const outputStyle: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const outputRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "6px 8px",
  background: "#0f172a",
  borderRadius: 6,
};

const copyBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "6px 0",
  background: "#2563eb",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.3px",
};

// ── Public export — dev-only guard at the top level ───────────────────────
export function PrintAreaMeasurer() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Inner />;
}
