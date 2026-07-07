/**
 * printBounds.ts — Single source of truth for garment print-zone coordinates.
 *
 * All PRINT_BOUNDS values are in the GLB snapshot coordinate space (800×960).
 * Use `toPrintBounds500()` to convert to the DesignEditor2D canvas space (500×600).
 *
 * To calibrate values:
 *   1. Run in dev mode and open the design studio workspace.
 *   2. Use the 📐 "Calibrate Print Area" floating tool (bottom-right of screen).
 *   3. Drag a rectangle over the garment's chest / back area.
 *   4. Copy the generated snippet and update PRINT_BOUNDS_800 below.
 */

export interface PrintBoundsRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ModelPrintBounds {
  front: PrintBoundsRect;
  back: PrintBoundsRect;
}

// ─── Calibrated values (800×960 GLB snapshot coordinate space) ───────────────
export const PRINT_BOUNDS_800: Record<string, ModelPrintBounds> = {
  shirt: {
    front: { x: 5, y: 449, w: 784, h: 667 },
    back: { x: 5, y: 449, w: 784, h: 667 },
  },
  hoodie: {
    front: { x: 90, y: 210, w: 619, h: 535 },
    back: { x: 262, y: 408, w: 250, h: 309 },
  },
  polo: {
    front: { x: 210, y: 190, w: 380, h: 370 },
    back: { x: 210, y: 190, w: 380, h: 370 },
  },
  long: {
    front: { x: -200, y: -10, w: 777, h: 952 },
    back: { x: -200, y: -10, w: 777, h: 952 },
  },
  oversize: {
    front: { x: 36, y: 455, w: 763, h: 708 },
    back: {
      x: 2,
      y: 11,
      w: 798,
      h: 610,
    }, // keep existing until calibrated
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getModelKey(categoryId: string): string {
  const n = (categoryId || "").toLowerCase();
  if (n.includes("hoodie")) return "hoodie";
  if (n.includes("polo")) return "polo";
  if (n.includes("long") || n.includes("sleeve") || n.includes("full"))
    return "long";
  if (n.includes("oversize")) return "oversize";
  return "shirt";
}

/**
 * Return the print bounds for a given model + view in 800×960 space.
 * Falls back to shirt if the model key is not found.
 */
export function getPrintBounds800(
  categoryId: string,
  view: "front" | "back",
): PrintBoundsRect {
  const key = getModelKey(categoryId);
  return (PRINT_BOUNDS_800[key] ?? PRINT_BOUNDS_800.shirt)[view];
}

// Scale factors: 800×960 → 500×600  (both 5:6 ratio, scale = 0.625)
const SX = 500 / 800; // 0.625
const SY = 600 / 960; // 0.625

/**
 * Convert a 800×960 rect to the 500×600 DesignEditor2D canvas space.
 * Returns undefined if the input rect is falsy (safe guard for early renders).
 */
export function toPrintBounds500(
  r: PrintBoundsRect | undefined,
): PrintBoundsRect | undefined {
  if (!r) return undefined;
  return {
    x: Math.round(r.x * SX),
    y: Math.round(r.y * SY),
    w: Math.round(r.w * SX),
    h: Math.round(r.h * SY),
  };
}

/**
 * Return the print bounds for a given model + view, already converted to
 * the DesignEditor2D canvas space (500×600).
 * Returns undefined when categoryId/view cannot be resolved (safe for early renders).
 */
export function getPrintBounds500(
  categoryId: string,
  view: "front" | "back",
): PrintBoundsRect | undefined {
  if (!view) return undefined;
  return toPrintBounds500(getPrintBounds800(categoryId, view));
}
