/**
 * Design Studio v2 — single source of truth for the print rectangle.
 *
 * The 2D editor frame and the 3D decal are BOTH derived from `PrintZone`:
 *   - frame size  = zone.sizeMm            (1 layer unit = 1 mm)
 *   - 3D placement = zone.centerCm + sizeMm/10, projected straight onto the garment
 * so a point in the frame and its point on the garment can never drift apart.
 *
 * 3D scene units are centimetres. The garment is normalised on load
 * (see garment.ts): baked to a static mesh, centred on its bounding box and
 * scaled so its height equals `realHeightCm`.
 */

export type StudioView = "front" | "back";

export interface PrintZone {
  /** Zone centre in cm from the garment's bounding-box centre (x right, y up, as seen by the viewer). */
  centerCm: [number, number];
  /** Printable size in mm: [width, height]. This is also the 2D frame size. */
  sizeMm: [number, number];
}

export interface GarmentSpec {
  key: string;
  label: string;
  modelUrl: string;
  /** Real-world height (hem to collar top) the GLB is scaled to, in cm. */
  realHeightCm: number;
  /** Rotation about Y, in degrees, applied so the garment front faces +Z. */
  rotateYDeg: number;
  zones: Record<StudioView, PrintZone>;
}

export const GARMENTS: Record<string, GarmentSpec> = {
  shirt: {
    key: "shirt",
    label: "T-Shirt",
    modelUrl: "/models/shirt_baked.glb",
    realHeightCm: 72,
    rotateYDeg: 0,
    zones: {
      front: { centerCm: [0, 6], sizeMm: [280, 360] },
      back: { centerCm: [0, 6], sizeMm: [280, 360] },
    },
  },
  oversized: {
    key: "oversized",
    label: "Oversized T-Shirt",
    modelUrl: "/models/oversized-tee.glb",
    realHeightCm: 74,
    rotateYDeg: 0,
    zones: {
      front: { centerCm: [0, 6], sizeMm: [300, 380] },
      back: { centerCm: [0, 6], sizeMm: [300, 380] },
    },
  },
  polo: {
    key: "polo",
    label: "Polo",
    modelUrl: "/models/polo-Tshirt.glb",
    realHeightCm: 70,
    rotateYDeg: 0,
    zones: {
      front: { centerCm: [0, 4], sizeMm: [260, 320] },
      back: { centerCm: [0, 4], sizeMm: [260, 320] },
    },
  },
};

export const DEFAULT_GARMENT = "shirt";

/** Pixels-per-mm used when rendering the frame to a texture / export. */
export const PREVIEW_PX_PER_MM = 4;
/** 300 DPI print export. */
export const PRINT_PX_PER_MM = 300 / 25.4;
