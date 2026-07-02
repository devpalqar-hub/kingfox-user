# GLB Snapshot → 2D Editor Background — Implementation Guide

> **Goal:** Automatically render the loaded GLB model to a PNG (front + back), store it in Zustand, and use it as the live background of the 2D design canvas — with design layers positioned precisely over the printable zone.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Dependencies](#2-prerequisites--dependencies)
3. [File Structure](#3-file-structure)
4. [Step 1 — Create `useGLBSnapshot` Hook](#4-step-1--create-useglbsnapshot-hook)
5. [Step 2 — Extend Zustand Store](#5-step-2--extend-zustand-store)
6. [Step 3 — Create `GLBSnapshotProvider`](#6-step-3--create-glbsnapshotprovider)
7. [Step 4 — Create `DesignCanvas` Component](#7-step-4--create-designcanvas-component)
8. [Step 5 — Create `exportDesign` Utility](#8-step-5--create-exportdesign-utility)
9. [Step 6 — Mount Everything](#9-step-6--mount-everything)
10. [Step 7 — Calibrate Print Bounds](#10-step-7--calibrate-print-bounds)
11. [Checklist](#11-checklist)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Architecture Overview

```
categoryId / colorHex changes
        │
        ▼
GLBSnapshotProvider
  └── useGLBSnapshot (off-screen THREE.js renderer — no DOM)
        ├── Renders front view  (rotationY = 0)
        └── Renders back view   (rotationY = π)
              at 800×960 × pixelRatio 2
        │
        ▼
useDesignStore
  └── glbSnapshots { front: string, back: string, loading: boolean }
        │
        ▼
DesignCanvas
  ├── Draws snapshot onto <canvas> background
  ├── Overlays dashed print-area guide box
  └── Positions Fabric.js / Konva editor div
        exactly over the print zone (CSS %)
        │
        ▼
exportDesign()
  └── Composites snapshot + design layers
        at 2400×2880 (300 DPI equivalent)
```

**Key principle:** The THREE.js renderer used for snapshots is completely off-screen. It has no connection to your existing R3F `<Canvas>`. It loads the GLB fresh, renders two frames, captures PNGs, then disposes itself.

---

## 2. Prerequisites & Dependencies

All dependencies below are already present in a standard Next.js + R3F project. No new packages required.

| Dependency | Already used in | Purpose in this feature |
|---|---|---|
| `three` | `ShirtModel.tsx` | Off-screen renderer, GLTFLoader |
| `three/examples/jsm/loaders/GLTFLoader` | via `@react-three/drei` | Load GLB without R3F |
| `zustand` | `useDesignStore` | Store snapshots globally |
| React `useEffect`, `useRef`, `useState` | everywhere | Hook lifecycle |

> **Note:** Import `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader` directly — not from `@react-three/drei` — since this runs outside R3F context.

---

## 3. File Structure

Create the following new files. Do not modify `ShirtModel.tsx`.

```
src/
├── hooks/
│   └── useGLBSnapshot.ts              ← NEW: off-screen renderer hook
├── components/
│   └── design-studio/
│       ├── GLBSnapshotProvider.tsx    ← NEW: mounts near editor root
│       └── DesignCanvas.tsx           ← NEW: 2D canvas with GLB background
├── utils/
│   └── exportDesign.ts               ← NEW: final export utility
└── stores/
    └── design-studio/
        └── useDesignStore.ts          ← MODIFY: add glbSnapshots slice
```

---

## 4. Step 1 — Create `useGLBSnapshot` Hook

**File:** `src/hooks/useGLBSnapshot.ts`

This hook takes a model URL and color hex, renders both views off-screen, and returns `{ front, back, loading }` as data URLs.

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface SnapshotOptions {
  modelUrl: string;
  colorHex: string;
  width?: number;
  height?: number;
}

interface Snapshots {
  front: string | null;
  back: string | null;
  loading: boolean;
}

// Camera config per model type.
// Adjust 'position[2]' (Z distance) if the model appears too close or too far.
const CAMERA_CONFIG: Record<string, {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}> = {
  shirt:    { position: [0, 0, 2.2], fov: 30, near: 0.1, far: 100 },
  hoodie:   { position: [0, 0, 2.8], fov: 30, near: 0.1, far: 100 },
  polo:     { position: [0, 0, 2.2], fov: 30, near: 0.1, far: 100 },
  long:     { position: [0, 0, 2.5], fov: 30, near: 0.1, far: 100 },
  oversize: { position: [0, 0, 2.4], fov: 30, near: 0.1, far: 100 },
};

function getCameraConfig(url: string) {
  const u = url.toLowerCase();
  if (u.includes("hoodie"))                         return CAMERA_CONFIG.hoodie;
  if (u.includes("polo"))                           return CAMERA_CONFIG.polo;
  if (u.includes("long") || u.includes("sleeve"))  return CAMERA_CONFIG.long;
  if (u.includes("oversize"))                       return CAMERA_CONFIG.oversize;
  return CAMERA_CONFIG.shirt;
}

export function useGLBSnapshot({
  modelUrl,
  colorHex,
  width = 800,
  height = 960,
}: SnapshotOptions): Snapshots {
  const [snapshots, setSnapshots] = useState<Snapshots>({
    front: null,
    back: null,
    loading: true,
  });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!modelUrl) return;
    let cancelled = false;

    async function render() {
      setSnapshots(s => ({ ...s, loading: true }));

      // Off-screen renderer — never attached to DOM
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(2);                             // retina quality
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      scene.background = null;                               // transparent

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(2, 4, 3);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.4);
      fill.position.set(-2, 0, 2);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 0.3);
      rim.position.set(0, -2, -3);
      scene.add(rim);

      // Camera
      const camCfg = getCameraConfig(modelUrl);
      const camera = new THREE.PerspectiveCamera(
        camCfg.fov, width / height, camCfg.near, camCfg.far
      );
      camera.position.set(...camCfg.position);
      camera.lookAt(0, 0, 0);

      // Load GLB
      const loader = new GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(modelUrl, resolve, undefined, reject);
      });

      if (cancelled) { renderer.dispose(); return; }

      const modelScene = gltf.scene;

      // Apply brand color
      modelScene.traverse((obj: any) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat: THREE.MeshStandardMaterial) => {
            mat.color.set(colorHex);
            mat.needsUpdate = true;
          });
        }
      });

      scene.add(modelScene);

      // Auto-center
      const box = new THREE.Box3().setFromObject(modelScene);
      const center = box.getCenter(new THREE.Vector3());
      modelScene.position.sub(center);

      // Front render
      modelScene.rotation.set(0, 0, 0);
      renderer.render(scene, camera);
      const frontDataUrl = renderer.domElement.toDataURL("image/png", 1.0);

      // Back render
      modelScene.rotation.set(0, Math.PI, 0);
      renderer.render(scene, camera);
      const backDataUrl = renderer.domElement.toDataURL("image/png", 1.0);

      if (!cancelled) {
        setSnapshots({ front: frontDataUrl, back: backDataUrl, loading: false });
      }

      renderer.dispose();
      rendererRef.current = null;
    }

    render().catch(console.error);

    return () => {
      cancelled = true;
      rendererRef.current?.dispose();
    };
  }, [modelUrl, colorHex, width, height]);

  return snapshots;
}
```

---

## 5. Step 2 — Extend Zustand Store

**File:** `src/stores/design-studio/useDesignStore.ts`

Add the snapshot slice to your existing store. Do not remove or rename existing fields.

### 2a. Add to the interface / type definition

```ts
// Add inside your DesignStore interface:
glbSnapshots: {
  front: string | null;
  back: string | null;
  loading: boolean;
};
setGLBSnapshots: (snapshots: {
  front: string | null;
  back: string | null;
  loading: boolean;
}) => void;
```

### 2b. Add to the initial state

```ts
// Add inside your create() / initial state object:
glbSnapshots: { front: null, back: null, loading: false },
```

### 2c. Add to the actions

```ts
// Add inside your create() / actions object:
setGLBSnapshots: (snapshots) => set({ glbSnapshots: snapshots }),
```

---

## 6. Step 3 — Create `GLBSnapshotProvider`

**File:** `src/components/design-studio/GLBSnapshotProvider.tsx`

This component has no UI. It watches `categoryId` and `colorHex`, calls `useGLBSnapshot`, and writes results to the store. Mount it once near your editor root.

```tsx
"use client";

import { useEffect } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useGLBSnapshot } from "@/hooks/useGLBSnapshot";

// Must mirror the logic in ShirtModel.tsx exactly
function resolveModelUrl(categoryId: string): string {
  const n = categoryId.toLowerCase();
  if (n.includes("polo"))                                     return "/models/t-shirt-polo.glb";
  if (n.includes("hoodie") || n === "classic-hoodie")        return "/models/hoodie.glb";
  if (n.includes("long") || n.includes("full") || n.includes("sleeve")) return "/models/LongSleeveTShirt.glb";
  if (n.includes("oversize"))                                return "/models/oversized-tee.glb";
  return "/models/shirt_baked.glb";
}

export function GLBSnapshotProvider() {
  const { project, setGLBSnapshots } = useDesignStore();

  const modelUrl = resolveModelUrl(
    (project.apparelConfig.categoryId || "").toString()
  );

  const snapshots = useGLBSnapshot({
    modelUrl,
    colorHex: project.apparelConfig.colorHex,
    width: 800,
    height: 960,
  });

  useEffect(() => {
    setGLBSnapshots(snapshots);
  }, [snapshots, setGLBSnapshots]);

  return null;
}
```

---

## 7. Step 4 — Create `DesignCanvas` Component

**File:** `src/components/design-studio/DesignCanvas.tsx`

This renders the GLB snapshot as a background canvas, overlays the dashed print-area guide, and positions your Fabric.js or Konva editor div directly over the printable zone.

### 4a. Define print bounds

`PRINT_BOUNDS` maps model type → pixel coordinates of the printable area within the 800×960 snapshot. **These values must be calibrated** (see Step 7).

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";

const PRINT_BOUNDS: Record<string, {
  front: { x: number; y: number; w: number; h: number };
  back:  { x: number; y: number; w: number; h: number };
}> = {
  shirt: {
    front: { x: 200, y: 180, w: 400, h: 380 },
    back:  { x: 200, y: 180, w: 400, h: 380 },
  },
  hoodie: {
    front: { x: 220, y: 200, w: 360, h: 420 },
    back:  { x: 220, y: 200, w: 360, h: 420 },
  },
  // Add polo, long, oversize after calibration
};

function getModelKey(categoryId: string): string {
  const n = categoryId.toLowerCase();
  if (n.includes("hoodie")) return "hoodie";
  return "shirt";
}

export function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { glbSnapshots, activeView, project } = useDesignStore();

  const snapshot = activeView === "back" ? glbSnapshots.back : glbSnapshots.front;
  const modelKey = getModelKey((project.apparelConfig.categoryId || "").toString());
  const printBounds = PRINT_BOUNDS[modelKey] ?? PRINT_BOUNDS.shirt;
  const bounds = activeView === "back" ? printBounds.back : printBounds.front;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background: GLB render
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Print area guide
      ctx.save();
      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);

      // Corner markers
      ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
      [
        [bounds.x,           bounds.y],
        [bounds.x + bounds.w, bounds.y],
        [bounds.x,           bounds.y + bounds.h],
        [bounds.x + bounds.w, bounds.y + bounds.h],
      ].forEach(([cx, cy]) => {
        ctx.fillRect(cx - 4, cy - 4, 8, 8);
      });

      ctx.restore();
    };
    img.src = snapshot;
  }, [snapshot, bounds]);

  if (glbSnapshots.loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500 animate-pulse">Generating preview…</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Layer 1: GLB snapshot background */}
      <canvas
        ref={canvasRef}
        width={800}
        height={960}
        className="w-full h-full rounded-lg shadow-md"
      />

      {/* Layer 2: Design editor — positioned over print zone only */}
      <div
        className="absolute"
        style={{
          left:   `${(bounds.x / 800) * 100}%`,
          top:    `${(bounds.y / 960) * 100}%`,
          width:  `${(bounds.w / 800) * 100}%`,
          height: `${(bounds.h / 960) * 100}%`,
        }}
      >
        {/*
          Mount your Fabric.js canvas or Konva Stage here.
          Its internal coordinate space (500×600) maps to these CSS dimensions.
        */}
        <div id="design-layer" className="w-full h-full" />
      </div>
    </div>
  );
}
```

---

## 8. Step 5 — Create `exportDesign` Utility

**File:** `src/utils/exportDesign.ts`

Composites the GLB snapshot and the design layer canvas into a single high-resolution PNG.

```ts
export async function exportFlatDesign(
  glbSnapshot: string,
  designCanvas: HTMLCanvasElement,
  printBounds: { x: number; y: number; w: number; h: number },
  outputWidth = 2400,
  outputHeight = 2880,
): Promise<string> {
  const scale = outputWidth / 800;

  const output = document.createElement("canvas");
  output.width = outputWidth;
  output.height = outputHeight;
  const ctx = output.getContext("2d")!;

  // 1. GLB snapshot as background (scaled up)
  const bg = new Image();
  await new Promise<void>(r => { bg.onload = () => r(); bg.src = glbSnapshot; });
  ctx.drawImage(bg, 0, 0, outputWidth, outputHeight);

  // 2. Design layers composited over the print zone
  ctx.drawImage(
    designCanvas,
    printBounds.x * scale,
    printBounds.y * scale,
    printBounds.w * scale,
    printBounds.h * scale,
  );

  return output.toDataURL("image/png", 1.0);
}
```

### Usage in your export button handler:

```ts
import { exportFlatDesign } from "@/utils/exportDesign";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";

// Inside your component:
const { glbSnapshots, activeView } = useDesignStore();

async function handleExport() {
  const snapshot = activeView === "back" ? glbSnapshots.back : glbSnapshots.front;
  const designEl = document.querySelector<HTMLCanvasElement>("#your-fabric-canvas");

  if (!snapshot || !designEl) return;

  const dataUrl = await exportFlatDesign(
    snapshot,
    designEl,
    { x: 200, y: 180, w: 400, h: 380 }, // use correct bounds for model
  );

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `design-${activeView}.png`;
  a.click();
}
```

---

## 9. Step 6 — Mount Everything

### 6a. Mount `GLBSnapshotProvider` at editor root

```tsx
// app/design-studio/page.tsx  (or your layout file)
import { GLBSnapshotProvider } from "@/components/design-studio/GLBSnapshotProvider";
import { DesignCanvas } from "@/components/design-studio/DesignCanvas";

export default function DesignStudioPage() {
  return (
    <>
      {/* Invisible — just triggers snapshot generation */}
      <GLBSnapshotProvider />

      {/* Your existing 3D viewer stays unchanged */}
      <ThreeDViewer />

      {/* New 2D editor with GLB background */}
      <DesignCanvas />
    </>
  );
}
```

### 6b. Do NOT modify `ShirtModel.tsx`

The existing 3D viewer and `ShirtModel.tsx` remain entirely unchanged. The snapshot system is independent.

---

## 10. Step 7 — Calibrate Print Bounds

Print bounds define where the printable garment area sits within the 800×960 snapshot image. You need to set these once per model.

### Method A — Dev tool overlay (recommended)

Temporarily add this to `DesignCanvas.tsx` to render the raw snapshot in a browser tab:

```tsx
// Temporary calibration aid — remove after tuning
<img src={glbSnapshots.front ?? ""} style={{ position: "fixed", top: 0, left: 0, width: 800, height: 960, zIndex: 9999 }} />
```

Open DevTools → Inspector, use the element picker to measure pixel coordinates of the garment chest area. Update `PRINT_BOUNDS` accordingly.

### Method B — PrintBoundsCalibrator component

```tsx
// src/components/design-studio/dev/PrintBoundsCalibrator.tsx
// Only use in development. Gate with process.env.NODE_ENV check.

"use client";
import { useState, useRef } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";

export function PrintBoundsCalibrator() {
  if (process.env.NODE_ENV !== "development") return null;

  const { glbSnapshots } = useDesignStore();
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCoords = (e: React.MouseEvent) => {
    const el = imgRef.current!.getBoundingClientRect();
    const scaleX = 800 / el.width;
    const scaleY = 960 / el.height;
    return {
      x: Math.round((e.clientX - el.left) * scaleX),
      y: Math.round((e.clientY - el.top)  * scaleY),
    };
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, background: "#000a" }}>
      <img
        ref={imgRef}
        src={glbSnapshots.front ?? ""}
        style={{ width: 400, height: 480, display: "block", cursor: "crosshair" }}
        onMouseDown={e => setStart(getCoords(e))}
        onMouseUp={e => {
          if (!start) return;
          const end = getCoords(e);
          const r = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            w: Math.abs(end.x - start.x),
            h: Math.abs(end.y - start.y),
          };
          setRect(r);
          console.log("PRINT_BOUNDS →", JSON.stringify(r));
        }}
      />
      {rect && (
        <pre style={{ color: "#0f0", padding: 8, fontSize: 12 }}>
          {JSON.stringify(rect, null, 2)}
        </pre>
      )}
      <p style={{ color: "#fff", fontSize: 11, padding: "4px 8px" }}>
        Click and drag to define print area. Copy values from console.
      </p>
    </div>
  );
}
```

Mount temporarily in your page, drag the print area box, copy the logged coordinates into `PRINT_BOUNDS`, then remove the component.

---

## 11. Checklist

Work through these in order:

- [ ] Create `src/hooks/useGLBSnapshot.ts`
- [ ] Add `glbSnapshots` + `setGLBSnapshots` to `useDesignStore`
- [ ] Create `src/components/design-studio/GLBSnapshotProvider.tsx`
- [ ] Create `src/components/design-studio/DesignCanvas.tsx` with placeholder `PRINT_BOUNDS`
- [ ] Create `src/utils/exportDesign.ts`
- [ ] Mount `<GLBSnapshotProvider />` and `<DesignCanvas />` in the studio page
- [ ] Run dev server — confirm snapshot appears as background when a garment is selected
- [ ] Use `PrintBoundsCalibrator` to tune `PRINT_BOUNDS` for each model type
  - [ ] `shirt_baked.glb` — front & back
  - [ ] `hoodie.glb` — front & back
  - [ ] `t-shirt-polo.glb` — front & back
  - [ ] `LongSleeveTShirt.glb` — front & back
  - [ ] `oversized-tee.glb` — front & back
- [ ] Remove `PrintBoundsCalibrator` from production
- [ ] Test color change → snapshot regenerates with new color
- [ ] Test view toggle (front / back) → correct snapshot shown
- [ ] Test export — composite PNG downloads at correct resolution

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Snapshot is blank / all black | `alpha: true` not set on renderer | Confirm `alpha: true` in `WebGLRenderer` constructor |
| Model appears tiny in snapshot | Camera Z too far or model not centered | Check `auto-center` block and adjust `CAMERA_CONFIG` Z value |
| Color does not update | `colorHex` not passed or material traverse skips non-standard materials | `console.log` material names in traverse; check for `MeshBasicMaterial` vs `MeshStandardMaterial` |
| Design layers misaligned on export | `PRINT_BOUNDS` not calibrated | Run `PrintBoundsCalibrator` and update values |
| Snapshot re-renders on every keystroke | `colorHex` updating too frequently | Debounce the color picker input before it writes to the store |
| `GLTFLoader` not found | Wrong import path | Use `three/examples/jsm/loaders/GLTFLoader` not drei |
| TypeScript error on `renderer.domElement.toDataURL` | `preserveDrawingBuffer` not set | Add `preserveDrawingBuffer: true` to `WebGLRenderer` options |
| CORS error loading GLB | Model hosted on different origin | Serve models from same origin or add `crossOrigin` header to model server |