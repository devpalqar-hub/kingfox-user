"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { getPrintBounds800 } from "@/utils/printBounds";

// ─── Constants ────────────────────────────────────────────────────────────────
const TEX_RES = 2048;

// Editor canvas dimensions (500×600) — the space layers are stored in
const EDITOR_W = 500;
const EDITOR_H = 600;

// GLB snapshot dimensions (800×960) — the space printBounds800 values are in
const SNAP_W = 800;
const SNAP_H = 960;

const IMG_CACHE = new Map<string, HTMLImageElement>();

function loadImg(src: string): Promise<HTMLImageElement> {
  if (IMG_CACHE.has(src)) return Promise.resolve(IMG_CACHE.get(src)!);
  return new Promise((res, rej) => {
    const img = new Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      IMG_CACHE.set(src, img);
      res(img);
    };
    img.onerror = rej;
    img.src = src;
  });
}

// ─── Find largest UV-bearing mesh ─────────────────────────────────────────────
function findMainMesh(root: THREE.Object3D): THREE.Mesh | null {
  let best: { mesh: THREE.Mesh; vol: number } | null = null;
  root.traverse((obj: any) => {
    if (!obj.isMesh || !obj.geometry?.getAttribute("uv")) return;
    const b = new THREE.Box3().setFromObject(obj);
    const s = b.getSize(new THREE.Vector3());
    const vol = s.x * s.y * s.z;
    if (!best || vol > (best as { mesh: THREE.Mesh; vol: number }).vol)
      best = { mesh: obj as THREE.Mesh, vol };
  });
  return (best as { mesh: THREE.Mesh; vol: number } | null)?.mesh ?? null;
}

// ─── Extract base color from material ─────────────────────────────────────────
function getBaseTexture(mesh: THREE.Mesh): THREE.Texture | null {
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return (mat as THREE.MeshStandardMaterial)?.map ?? null;
}

// ─── UV region detection ───────────────────────────────────────────────────────
// Returns the UV bounding box for the left (u<0.5) and right (u>=0.5) halves.
// We then assign front/back based on per-model config (see UV_FRONT_IS_LEFT below).
function detectUvRegions(mesh: THREE.Mesh): {
  left: { u0: number; v0: number; u1: number; v1: number };
  right: { u0: number; v0: number; u1: number; v1: number };
} {
  const uv = mesh.geometry.getAttribute("uv") as THREE.BufferAttribute;
  if (!uv) {
    return {
      left: { u0: 0, v0: 0, u1: 0.5, v1: 1 },
      right: { u0: 0.5, v0: 0, u1: 1, v1: 1 },
    };
  }

  let lU0 = 1,
    lV0 = 1,
    lU1 = 0,
    lV1 = 0;
  let rU0 = 1,
    rV0 = 1,
    rU1 = 0,
    rV1 = 0;
  let hasLeft = false,
    hasRight = false;

  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < 0.5) {
      lU0 = Math.min(lU0, u);
      lV0 = Math.min(lV0, v);
      lU1 = Math.max(lU1, u);
      lV1 = Math.max(lV1, v);
      hasLeft = true;
    } else {
      rU0 = Math.min(rU0, u);
      rV0 = Math.min(rV0, v);
      rU1 = Math.max(rU1, u);
      rV1 = Math.max(rV1, v);
      hasRight = true;
    }
  }

  return {
    left: hasLeft
      ? { u0: lU0, v0: lV0, u1: lU1, v1: lV1 }
      : { u0: 0, v0: 0, u1: 0.5, v1: 1 },
    right: hasRight
      ? { u0: rU0, v0: rV0, u1: rU1, v1: rV1 }
      : { u0: 0.5, v0: 0, u1: 1, v1: 1 },
  };
}

// ─── Per-model UV orientation config ──────────────────────────────────────────
// Set true  → left UV half (u < 0.5) is the FRONT panel
// Set false → right UV half (u ≥ 0.5) is the FRONT panel
// Flip this per-model if the design shows on the wrong side.
const UV_FRONT_IS_LEFT: Record<string, boolean> = {
  shirt: true, // shirt_baked.glb   — left UV = front
  polo: true, // t-shirt-polo.glb  — left UV = front
  hoodie: true, // hoodie.glb        — left UV = front
  long: true, // LongSleeveTShirt.glb
  oversize: false, // oversized-tee.glb — right UV = front (flipped UV layout)
};

function getModelKey(categoryId: string): string {
  const n = (categoryId || "").toLowerCase();
  if (n.includes("hoodie")) return "hoodie";
  if (n.includes("polo")) return "polo";
  if (n.includes("long") || n.includes("sleeve") || n.includes("full"))
    return "long";
  if (n.includes("oversize")) return "oversize";
  return "shirt";
}

// ─── Paint design layers into a UV region on the canvas ───────────────────────
//
// Coordinate mapping strategy:
//   • Layers are stored in editor-canvas space (500 × 600 px).
//   • Print-bounds (pb800) are in GLB-snapshot space (800 × 960).
//   • The UV region covers the entire front or back shirt half in the texture.
//
// We need to paint each layer so it appears at the correct position and scale
// on the physical shirt. The approach:
//
//   1. Convert pb800 → editor pixel space (pb500).
//   2. Compute a uniform scale:  editorPx → texturePx
//        scaleU = (UV region width  in texture px) / (UV region width  as fraction of editor canvas)
//      This maps 1 editor pixel → N texture pixels such that the whole editor
//      canvas is "stretched" over the UV region.
//   3. The UV region top-left in the texture canvas is the anchor.
//   4. Each layer's centre (in editor px) is offset from the UV region anchor
//      and scaled by scaleU/scaleV to arrive at texture canvas coordinates.
//
// This ensures the size and position shown in the 2D editor exactly matches
// what is painted on the 3D texture.

async function paintLayers(
  ctx: CanvasRenderingContext2D,
  layers: any[],
  pb800: { x: number; y: number; w: number; h: number },
  uvRegion: { u0: number; v0: number; u1: number; v1: number },
) {
  const visible = layers.filter((l) => l.isVisible !== false);
  if (!visible.length) return;

  // ── Convert print-bounds from 800×960 snapshot space → 500×600 editor space ──
  const pb500 = {
    x: pb800.x * (EDITOR_W / SNAP_W),
    y: pb800.y * (EDITOR_H / SNAP_H),
    w: pb800.w * (EDITOR_W / SNAP_W),
    h: pb800.h * (EDITOR_H / SNAP_H),
  };

  // ── UV region in texture-canvas pixel space ───────────────────────────────
  // THREE UV: V=0 is bottom, V=1 is top → canvas Y inverted.
  // region top-left in canvas = (u0 * TEX_RES, (1 - v1) * TEX_RES)
  const rX = uvRegion.u0 * TEX_RES;
  const rY = (1 - uvRegion.v1) * TEX_RES;
  const rW = (uvRegion.u1 - uvRegion.u0) * TEX_RES;
  const rH = (uvRegion.v1 - uvRegion.v0) * TEX_RES;

  // ── Unified scale: editor canvas → texture canvas ─────────────────────────
  // The UV region covers the entire half of the shirt in texture space.
  // The editor canvas (EDITOR_W × EDITOR_H) is the full view of that shirt half.
  // So 1 editor pixel = (rW / EDITOR_W) texture pixels horizontally, etc.
  const scaleU = rW / EDITOR_W;
  const scaleV = rH / EDITOR_H;

  for (const layer of visible) {
    // Layer centre in editor space
    const lCX = layer.x + layer.width / 2;
    const lCY = layer.y + layer.height / 2;

    // Map to texture canvas:
    //   editor (0,0) → texture (rX, rY)
    //   editor (EDITOR_W, EDITOR_H) → texture (rX+rW, rY+rH)
    const tCX = rX + lCX * scaleU;
    const tCY = rY + lCY * scaleV;
    const tW = layer.width * scaleU;
    const tH = layer.height * scaleV;

    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.translate(tCX, tCY);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.type === "image") {
      try {
        const img = await loadImg(layer.asset?.originalUrl ?? "");
        ctx.drawImage(img, -tW / 2, -tH / 2, tW, tH);
      } catch (e) {
        console.warn("[ShirtModel] image load failed", e);
      }
    } else if (layer.type === "text") {
      const fs = Math.min(layer.fontSize * scaleV, 400);
      ctx.font = `${layer.fontWeight ?? 700} ${fs}px "${layer.fontFamily || "Inter"}", sans-serif`;
      ctx.fillStyle = layer.colorHex || "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.text || "", 0, 0);
    } else if (layer.type === "line") {
      const thick = Math.max(1, layer.thickness * scaleV);
      ctx.fillStyle = layer.colorHex || "#000";
      ctx.fillRect(-tW / 2, -thick / 2, tW, thick);
    }

    ctx.restore();
  }

  // Debug: draw print-bounds zone outline on the texture (visible in dev)
  if (process.env.NODE_ENV === "development") {
    const dbgX = rX + pb500.x * scaleU;
    const dbgY = rY + pb500.y * scaleV;
    const dbgW = pb500.w * scaleU;
    const dbgH = pb500.h * scaleV;
    ctx.save();
    ctx.strokeStyle = "rgba(59,130,246,0.3)";
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 6]);
    ctx.strokeRect(dbgX, dbgY, dbgW, dbgH);
    ctx.setLineDash([]);
    ctx.restore();
  }
}

// ─── Build full garment canvas ─────────────────────────────────────────────────
async function buildGarmentCanvas(
  baseTexture: THREE.Texture | null,
  colorHex: string,
  frontLayers: any[],
  backLayers: any[],
  frontBounds800: { x: number; y: number; w: number; h: number },
  backBounds800: { x: number; y: number; w: number; h: number },
  frontUvRegion: { u0: number; v0: number; u1: number; v1: number },
  backUvRegion: { u0: number; v0: number; u1: number; v1: number },
): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = TEX_RES;
  c.height = TEX_RES;
  const ctx = c.getContext("2d")!;

  // 1. Base layer: original baked texture tinted with garment colour,
  //    or a solid colour fill if the model has no base texture.
  if (baseTexture?.image) {
    // Fill with the garment colour first (clean base)
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, TEX_RES, TEX_RES);
    // Blend the baked texture on top at reduced opacity so shading detail
    // is preserved but baked-in shadows don't cause unwanted darkening on
    // the opposite panel when the model is rotated.
    ctx.globalAlpha = 0.18;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(
      baseTexture.image as HTMLImageElement,
      0,
      0,
      TEX_RES,
      TEX_RES,
    );
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  } else {
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, TEX_RES, TEX_RES);
  }

  // 2. Paint design layers for each panel
  await paintLayers(ctx, frontLayers, frontBounds800, frontUvRegion);
  await paintLayers(ctx, backLayers, backBounds800, backUvRegion);

  return c;
}

// ─── Apply or update the override texture on the mesh material ────────────────
function applyTexture(mesh: THREE.Mesh, tex: THREE.CanvasTexture) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m: any) => {
    if (m.map !== tex) {
      m.map = tex;
      m.needsUpdate = true;
    }
    tex.needsUpdate = true;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ShirtModel({ ...props }: any) {
  const { project, activeView } = useDesignStore();

  const modelUrl = useMemo(() => {
    const n = (project.apparelConfig.categoryId || "").toString().toLowerCase();
    if (n.includes("polo")) return "/models/polo-Tshirt.glb";
    if (n.includes("hoodie") || n === "classic-hoodie")
      return "/models/Hoodie.glb";
    if (n.includes("long") || n.includes("full") || n.includes("sleeve"))
      return "/models/LongSleeveTShirt.glb";
    if (n.includes("oversize")) return "/models/oversized-tee.glb";
    return "/models/shirt_baked.glb";
  }, [project.apparelConfig.categoryId]);

  const { scene: gltfScene } = useGLTF(modelUrl) as any;

  const clonedScene = useMemo(
    () => (gltfScene ? SkeletonUtils.clone(gltfScene) : null),
    [gltfScene],
  );

  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const baseTexRef = useRef<THREE.Texture | null>(null);
  const uvRegions = useRef<{
    front: { u0: number; v0: number; u1: number; v1: number };
    back: { u0: number; v0: number; u1: number; v1: number };
  } | null>(null);
  const overrideTex = useRef<THREE.CanvasTexture | null>(null);

  const catId = (project.apparelConfig.categoryId || "").toString();
  const modelKey = getModelKey(catId);
  const frontBounds = useMemo(() => getPrintBounds800(catId, "front"), [catId]);
  const backBounds = useMemo(() => getPrintBounds800(catId, "back"), [catId]);

  // ── Scene setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!clonedScene) return;

    overrideTex.current?.dispose();
    overrideTex.current = null;
    meshRef.current = null;
    baseTexRef.current = null;
    uvRegions.current = null;

    clonedScene.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(clonedScene);
    const center = bb.getCenter(new THREE.Vector3());
    clonedScene.position.sub(center);
    clonedScene.updateMatrixWorld(true);

    const mesh = findMainMesh(clonedScene);
    if (!mesh) {
      console.error("[ShirtModel] No mesh found");
      return;
    }

    meshRef.current = mesh;
    baseTexRef.current = getBaseTexture(mesh);

    // Detect UV left/right halves, then assign front/back per model config
    const frontIsLeft = UV_FRONT_IS_LEFT[modelKey] ?? true;

    if (modelKey === "hoodie") {
      uvRegions.current = {
        front: {
          u0: 0.04,
          v0: 0.34,
          u1: 0.39,
          v1: 0.82,
        },
        back: {
          u0: 0.04,
          v0: 0.02,
          u1: 0.39,
          v1: 0.46,
        },
      };
    } else {
      const { left, right } = detectUvRegions(mesh);

      uvRegions.current = {
        front: frontIsLeft ? left : right,
        back: frontIsLeft ? right : left,
      };
    }

    console.log(
      "[ShirtModel] UV regions:",
      uvRegions.current,
      "| modelKey:",
      modelKey,
      "| frontIsLeft:",
      frontIsLeft,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene, modelKey]);

  // ── Rebuild texture whenever design, color, or model changes ──────────────
  useEffect(() => {
    if (!meshRef.current || !uvRegions.current) return;

    const mesh = meshRef.current;
    const regions = uvRegions.current;
    let cancelled = false;

    const rebuild = async () => {
      const canvas = await buildGarmentCanvas(
        baseTexRef.current,
        project.apparelConfig.colorHex,
        project.designs.front || [],
        project.designs.back || [],
        frontBounds,
        backBounds,
        regions.front,
        regions.back,
      );
      if (cancelled) return;

      if (!overrideTex.current) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.flipY = false;
        overrideTex.current = tex;
      } else {
        (overrideTex.current as any).image = canvas;
        overrideTex.current.needsUpdate = true;
      }

      applyTexture(mesh, overrideTex.current);
      console.log("[ShirtModel] Texture rebuilt and applied");
    };

    rebuild().catch((e) =>
      console.error("[ShirtModel] Texture build error:", e),
    );
    return () => {
      cancelled = true;
    };
  }, [
    clonedScene,
    project.apparelConfig.colorHex,
    project.designs.front,
    project.designs.back,
    frontBounds,
    backBounds,
  ]);

  // ── Animation ──────────────────────────────────────────────────────────────
  useFrame((_s, delta) => {
    if (group.current) {
      easing.dampE(
        group.current.rotation,
        [0, activeView === "back" ? Math.PI : 0, 0],
        0.25,
        delta,
      );
    }
  });

  if (!clonedScene) return null;
  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}
