/**
 * Design Studio — single source of truth for the print rectangles.
 *
 * The 2D editor frame and the 3D decal are BOTH derived from `PrintZone`:
 *   - frame size  = zone.sizeMm            (1 layer unit = 1 mm)
 *   - 3D placement = zone.centerCm + sizeMm/10, projected straight onto the garment
 * so a point in the frame and its point on the garment can never drift apart.
 *
 * 3D scene units are centimetres. The garment is normalised on load
 * (see garment.ts): baked to a static mesh, centred on its bounding box and
 * scaled so its height equals `realHeightCm`.
 *
 * Zone centres were measured headlessly from the baked GLB geometry
 * (sleeve shells, chest depth) — see the repo history for the calibration
 * script if a model changes.
 */

export type StudioView = "front" | "back" | "left" | "right";

export const VIEW_LABELS: Record<StudioView, string> = {
  front: "Front",
  back: "Back",
  left: "Left Sleeve",
  right: "Right Sleeve",
};

/**
 * Per-view basis in garment space (garment front faces +Z, up is +Y):
 *   out   — axis pointing at the viewer for this view
 *   right — the viewer's right
 *   rotationY — group rotation that turns this view toward the camera
 */
export const VIEW_BASES: Record<
  StudioView,
  { out: [number, number, number]; right: [number, number, number]; rotationY: number }
> = {
  front: { out: [0, 0, 1], right: [1, 0, 0], rotationY: 0 },
  back: { out: [0, 0, -1], right: [-1, 0, 0], rotationY: Math.PI },
  // "left"/"right" are the viewer's left/right when facing the garment's front.
  left: { out: [-1, 0, 0], right: [0, 0, 1], rotationY: Math.PI / 2 },
  right: { out: [1, 0, 0], right: [0, 0, -1], rotationY: -Math.PI / 2 },
};

export const VIEW_ORDER: StudioView[] = ["front", "back", "left", "right"];

export interface PrintZone {
  /** Zone centre in cm, as seen by the viewer of that view: [along viewer-right, up]. */
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
  /** Only the views listed here are offered in the studio. */
  zones: Partial<Record<StudioView, PrintZone>>;
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
      // Mid-sleeve band (|x| ≈ 28–34 cm): y ≈ 5–13, z centre ≈ −2.
      left: { centerCm: [-2, 9], sizeMm: [70, 70] },
      right: { centerCm: [2, 9], sizeMm: [70, 70] },
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
      // Upper drop-shoulder sleeve (|x| ≈ 31–39 cm): y ≈ 7–14, z centre ≈ +0.5.
      left: { centerCm: [0.5, 10.5], sizeMm: [70, 70] },
      right: { centerCm: [-0.5, 10.5], sizeMm: [70, 70] },
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
      // Sleeve faces measured from the baked mesh: outer shell y ≈ 4–17 cm,
      // z centre ≈ −3 cm (sleeves angle slightly backwards).
      left: { centerCm: [-3, 10.5], sizeMm: [80, 80] },
      right: { centerCm: [3, 10.5], sizeMm: [80, 80] },
    },
  },
  hoodie: {
    key: "hoodie",
    label: "Hoodie",
    modelUrl: "/models/hoodie.glb",
    realHeightCm: 72,
    rotateYDeg: 0,
    zones: {
      front: { centerCm: [0, 6], sizeMm: [280, 300] },
      back: { centerCm: [0, 4], sizeMm: [280, 360] },
      // Upper arm of the A-pose sleeve (|x| ≈ 28–36 cm): y ≈ 1–9, z centre ≈ +3.
      left: { centerCm: [3, 5], sizeMm: [80, 80] },
      right: { centerCm: [-3, 5], sizeMm: [80, 80] },
    },
  },
  longsleeve: {
    key: "longsleeve",
    label: "Long Sleeve Tee",
    modelUrl: "/models/LongSleeveTShirt.glb",
    realHeightCm: 72,
    rotateYDeg: 0,
    zones: {
      front: { centerCm: [0, 4], sizeMm: [280, 360] },
      back: { centerCm: [0, 4], sizeMm: [280, 360] },
      // Upper arm of the A-pose sleeve (|x| ≈ 29–38 cm): y ≈ 2–10, z centre ≈ −1.6.
      left: { centerCm: [-1.6, 6], sizeMm: [80, 80] },
      right: { centerCm: [1.6, 6], sizeMm: [80, 80] },
    },
  },
};

export const DEFAULT_GARMENT = "polo";

/** Apparel category ids (select page / variants API) → garment spec key. */
export const CATEGORY_TO_GARMENT: Record<string, string> = {
  "oversized-tee": "oversized",
  "classic-hoodie": "hoodie",
  "crewneck-sweatshirt": "shirt",
  "long-sleeve-tee": "longsleeve",
  "polo-Tshirt": "polo",
};

export function garmentForCategory(categoryId: string): GarmentSpec {
  return GARMENTS[CATEGORY_TO_GARMENT[categoryId] ?? DEFAULT_GARMENT] ?? GARMENTS[DEFAULT_GARMENT];
}

/** The views a garment actually supports, in display order. */
export function viewsOf(spec: GarmentSpec): StudioView[] {
  return VIEW_ORDER.filter((v) => spec.zones[v]);
}

/** Pixels-per-mm used when rendering the frame to a texture / export. */
export const PREVIEW_PX_PER_MM = 4;
/** 300 DPI print export. */
export const PRINT_PX_PER_MM = 300 / 25.4;
