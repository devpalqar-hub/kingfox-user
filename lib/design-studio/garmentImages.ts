import type { StudioView } from "./printZones";

/**
 * Static garment pictures used by the 2D editor, one per garment and side.
 * Each is a white, shaded render of the 3D model on a transparent background
 * (tinted to the chosen colour in the editor).
 *
 * `rect` is the print boundary inside the picture as fractions of its size:
 * [left, top, width, height]. It is the same rectangle the 3D decal uses
 * (printZones.ts), projected straight onto the picture. The pictures and rects
 * are generated from the 3D models — regenerate them whenever a model or a
 * print zone changes.
 */
export interface GarmentImage {
  src: string;
  width: number;
  height: number;
  rect: [number, number, number, number];
}

export const GARMENT_IMAGES: Record<string, Partial<Record<StudioView, GarmentImage>>> = {
  "shirt": {
    "front": {
      "src": "/design-studio/garments/shirt-front.png",
      "width": 1228,
      "height": 1120,
      "rect": [0.34041, 0.2, 0.31917, 0.45]
    },
    "back": {
      "src": "/design-studio/garments/shirt-back.png",
      "width": 1228,
      "height": 1120,
      "rect": [0.34041, 0.2, 0.31917, 0.45]
    },
    "left": {
      "src": "/design-studio/garments/shirt-left.png",
      "width": 591,
      "height": 1120,
      "rect": [0.36972, 0.30625, 0.16581, 0.0875]
    },
    "right": {
      "src": "/design-studio/garments/shirt-right.png",
      "width": 591,
      "height": 1120,
      "rect": [0.46447, 0.30625, 0.16581, 0.0875]
    }
  },
  "oversized": {
    "front": {
      "src": "/design-studio/garments/oversized-front.png",
      "width": 1523,
      "height": 1148,
      "rect": [0.36215, 0.19512, 0.27571, 0.46341]
    },
    "back": {
      "src": "/design-studio/garments/oversized-back.png",
      "width": 1523,
      "height": 1148,
      "rect": [0.36215, 0.19512, 0.27571, 0.46341]
    },
    "left": {
      "src": "/design-studio/garments/oversized-left.png",
      "width": 588,
      "height": 1148,
      "rect": [0.42857, 0.30488, 0.16668, 0.08537]
    },
    "right": {
      "src": "/design-studio/garments/oversized-right.png",
      "width": 588,
      "height": 1148,
      "rect": [0.40475, 0.30488, 0.16668, 0.08537]
    }
  },
  "polo": {
    "front": {
      "src": "/design-studio/garments/polo-front.png",
      "width": 937,
      "height": 1092,
      "rect": [0.30575, 0.24359, 0.3885, 0.41026]
    },
    "back": {
      "src": "/design-studio/garments/polo-back.png",
      "width": 937,
      "height": 1092,
      "rect": [0.30575, 0.24359, 0.3885, 0.41026]
    },
    "left": {
      "src": "/design-studio/garments/polo-left.png",
      "width": 559,
      "height": 1092,
      "rect": [0.3246, 0.27564, 0.20045, 0.10256]
    },
    "right": {
      "src": "/design-studio/garments/polo-right.png",
      "width": 559,
      "height": 1092,
      "rect": [0.47494, 0.27564, 0.20045, 0.10256]
    }
  },
  "hoodie": {
    "front": {
      "src": "/design-studio/garments/hoodie-front.png",
      "width": 1739,
      "height": 1120,
      "rect": [0.38731, 0.2375, 0.22539, 0.375]
    },
    "back": {
      "src": "/design-studio/garments/hoodie-back.png",
      "width": 1739,
      "height": 1120,
      "rect": [0.38731, 0.225, 0.22539, 0.45]
    },
    "left": {
      "src": "/design-studio/garments/hoodie-left.png",
      "width": 687,
      "height": 1120,
      "rect": [0.47962, 0.35, 0.16307, 0.1]
    },
    "right": {
      "src": "/design-studio/garments/hoodie-right.png",
      "width": 687,
      "height": 1120,
      "rect": [0.35732, 0.35, 0.16307, 0.1]
    }
  },
  "longsleeve": {
    "front": {
      "src": "/design-studio/garments/longsleeve-front.png",
      "width": 1829,
      "height": 1120,
      "rect": [0.39282, 0.225, 0.21436, 0.45]
    },
    "back": {
      "src": "/design-studio/garments/longsleeve-back.png",
      "width": 1829,
      "height": 1120,
      "rect": [0.39282, 0.225, 0.21436, 0.45]
    },
    "left": {
      "src": "/design-studio/garments/longsleeve-left.png",
      "width": 589,
      "height": 1120,
      "rect": [0.36687, 0.3375, 0.19018, 0.1]
    },
    "right": {
      "src": "/design-studio/garments/longsleeve-right.png",
      "width": 589,
      "height": 1120,
      "rect": [0.44295, 0.3375, 0.19018, 0.1]
    }
  }
};
