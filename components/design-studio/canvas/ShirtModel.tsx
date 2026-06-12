"use client";

import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";

const DEBUG_DECALS = false;

// ─── Model URL resolution ─────────────────────────────────────────────────────

function resolveModelUrl(categoryId: string): string {
  const n = (categoryId || "").toLowerCase();
  if (n.includes("classic-hoodie") || n === "hoodie")
    return "/models/hoodie.glb";
  if (n.includes("hoodie")) return "/models/hoodie.glb";
  if (n.includes("long-sleeve") || n.includes("full-sleeve"))
    return "/models/LongSleeveTShirt.glb";
  if (n.includes("polo")) return "/models/short_sleeve_polo.glb";
  if (n.includes("oversized")) return "/models/oversized-tee.glb";
  // "crewneck-sweatshirt" (Half Sleeve T-shirt) & default → shirt_baked
  return "/models/shirt_baked.glb";
}

// ─── Per-model config ─────────────────────────────────────────────────────────

interface ModelConfig {
  frontMeshName: string | null;
  backMeshName: string | null;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "/models/shirt_baked.glb": {
    frontMeshName: "T_Shirt_male",
    backMeshName: "T_Shirt_male",
  },
  "/models/hoodie.glb": {
    // 24-primitive mesh under Group "g Hoodie_MD".
    // Three.js names children: "g Hoodie_MD", "g Hoodie_MD_1" … "g Hoodie_MD_23".
    // We rely on the improved area-weighted Z heuristic to pick the
    // largest front/back body panels automatically.
    frontMeshName: null,
    backMeshName: null,
  },
  "/models/LongSleeveTShirt.glb": {
    frontMeshName: "Long_Sleeve_T-Shirt_Bahan_Dasar_FRONT_2657_0",
    backMeshName: "Long_Sleeve_T-Shirt_Bahan_Dasar_FRONT_2657_0_1",
  },
  "/models/short_sleeve_polo.glb": {
    // Two nodes share the name "Short Sleeve Polo_Cotton_Heavy_Canvas_FRONT_232020_0":
    //   Node[4]: Z max ≈ 16.9, area ≈ 4325 → front body
    //   Node[5]: Z max ≈  2.3, area ≈ 2483 → back body
    // The improved heuristic picks front-most/back-most among same-name matches.
    frontMeshName: "Short Sleeve Polo_Cotton_Heavy_Canvas_FRONT_232020_0",
    backMeshName: "Short Sleeve Polo_Cotton_Heavy_Canvas_FRONT_232020_0",
  },
  "/models/oversized-tee.glb": {
    // 4 meshes: Object_2 (largest area) through Object_5.
    // Object_2 is the main torso panel; fallback heuristic handles front/back.
    frontMeshName: null,
    backMeshName: null,
  },
};

// ─── Mesh Detection Helpers ───────────────────────────────────────────────────

interface MeshInfo {
  mesh: THREE.Mesh;
  box: THREE.Box3;
  area: number; // frontal area (width × height)
}

function collectMeshes(root: THREE.Object3D): MeshInfo[] {
  const result: MeshInfo[] = [];
  root.traverse((obj: any) => {
    if (obj.isMesh) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      result.push({ mesh: obj, box, area: size.x * size.y });
    }
  });
  return result;
}

/**
 * Picks the best mesh for front or back decal placement.
 *
 * Strategy:
 * 1. If meshName is provided, filter to meshes with that name.
 * 2. Discard tiny meshes (< 5% of the largest candidate's area) — these are
 *    buttons, stitching, zippers, etc.
 * 3. Among remaining candidates, pick the one with the most extreme Z value
 *    in the desired direction (highest Z for front, lowest Z for back).
 */
function pickBestMesh(
  allMeshes: MeshInfo[],
  meshName: string | null,
  isFront: boolean,
): THREE.Mesh | null {
  if (allMeshes.length === 0) return null;

  // Step 1: filter by name if provided
  let candidates = meshName
    ? allMeshes.filter((m) => m.mesh.name === meshName)
    : allMeshes;

  // If name didn't match anything, fall back to all meshes
  if (candidates.length === 0) candidates = allMeshes;

  // Step 2: discard tiny meshes (< 5% of the largest candidate)
  const maxArea = Math.max(...candidates.map((c) => c.area));
  if (maxArea > 0) {
    const filtered = candidates.filter((c) => c.area >= maxArea * 0.05);
    if (filtered.length > 0) candidates = filtered;
  }

  // Step 3: pick by most extreme Z
  let best: MeshInfo | null = null;
  for (const c of candidates) {
    if (!best) {
      best = c;
      continue;
    }
    if (isFront) {
      if (c.box.max.z > best.box.max.z) best = c;
      // Break ties by area (prefer larger)
      else if (c.box.max.z === best.box.max.z && c.area > best.area) best = c;
    } else {
      if (c.box.min.z < best.box.min.z) best = c;
      else if (c.box.min.z === best.box.min.z && c.area > best.area) best = c;
    }
  }

  return best?.mesh ?? null;
}

// ─── ShirtModel ───────────────────────────────────────────────────────────────

export default function ShirtModel() {
  const { project, activeView } = useDesignStore();

  const modelUrl = useMemo(
    () => resolveModelUrl(project.apparelConfig.categoryId || ""),
    [project.apparelConfig.categoryId],
  );

  const gltf = useGLTF(modelUrl) as any;
  const { nodes, materials, scene } = gltf || {};

  // ── Normalisation (position + scale + print-area dimensions) ──
  const { sceneClone, norm } = useMemo(() => {
    if (!scene) return { sceneClone: null, norm: null };

    // Clone scene so we can mutate transforms without messing up cached GLTF
    const clone = scene.clone();

    // Reset transforms to raw
    clone.position.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const rawBox = new THREE.Box3().setFromObject(clone);
    const rawSize = new THREE.Vector3();
    const rawCenter = new THREE.Vector3();
    rawBox.getSize(rawSize);
    rawBox.getCenter(rawCenter);

    const scale = rawSize.y > 0 ? 0.61 / rawSize.y : 1;

    // Apply normalising transform to centre it and scale to 0.61 height
    clone.position.set(
      -rawCenter.x * scale,
      -rawCenter.y * scale,
      -rawCenter.z * scale,
    );
    clone.scale.set(scale, scale, scale);
    clone.updateMatrixWorld(true);

    // Get final world bounds for precise Z placement
    const finalBox = new THREE.Box3().setFromObject(clone);

    const normData = {
      frontZ: finalBox.max.z,
      backZ: finalBox.min.z,
      printW: rawSize.x * scale,
      printH: 0.61,
    };

    return { sceneClone: clone, norm: normData };
  }, [scene]);

  // Debug: log normalization and scene info when available
  useEffect(() => {
    if (!DEBUG_DECALS) return;
    if (!sceneClone || !norm) return;
    try {
      const meshes = collectMeshes(sceneClone);
      console.log(
        "[ShirtModel] modelUrl:",
        modelUrl,
        "meshes:",
        meshes.length,
        "norm:",
        norm,
      );
    } catch (e) {
      console.log("[ShirtModel] debug error", e);
    }
  }, [sceneClone, norm, modelUrl]);

  // ── Resolve front & back mesh refs from the CLONE ──
  const config = MODEL_CONFIGS[modelUrl] ?? {
    frontMeshName: null,
    backMeshName: null,
  };

  const frontMeshRef = useRef<THREE.Mesh | null>(null);
  const backMeshRef = useRef<THREE.Mesh | null>(null);

  useMemo(() => {
    if (!sceneClone) {
      frontMeshRef.current = null;
      backMeshRef.current = null;
      return;
    }

    const allMeshes = collectMeshes(sceneClone);

    if (allMeshes.length === 0) {
      frontMeshRef.current = null;
      backMeshRef.current = null;
      return;
    }

    // Single mesh → use for both sides (e.g. shirt_baked)
    if (allMeshes.length === 1) {
      frontMeshRef.current = allMeshes[0].mesh;
      backMeshRef.current = allMeshes[0].mesh;
      return;
    }

    frontMeshRef.current = pickBestMesh(allMeshes, config.frontMeshName, true);
    backMeshRef.current = pickBestMesh(allMeshes, config.backMeshName, false);
  }, [sceneClone, config.frontMeshName, config.backMeshName]);

  // Debug: log selected front/back mesh and boxes
  useEffect(() => {
    if (!DEBUG_DECALS) return;
    if (!sceneClone) return;
    console.log(
      "[ShirtModel] frontMeshRef:",
      frontMeshRef.current?.name,
      frontMeshRef.current,
    );
    console.log(
      "[ShirtModel] backMeshRef:",
      backMeshRef.current?.name,
      backMeshRef.current,
    );
    if (frontMeshRef.current) {
      const b = new THREE.Box3().setFromObject(frontMeshRef.current);
      console.log("[ShirtModel] frontBox:", b.min.toArray(), b.max.toArray());
    }
    if (backMeshRef.current) {
      const b2 = new THREE.Box3().setFromObject(backMeshRef.current);
      console.log("[ShirtModel] backBox:", b2.min.toArray(), b2.max.toArray());
    }
  }, [sceneClone, modelUrl]);

  const group = useRef<THREE.Group>(null);

  const frontLayers = project.designs.front || [];
  const backLayers = project.designs.back || [];
  if (typeof window !== "undefined")
    console.log(
      "[ShirtModel] frontLayers:",
      frontLayers.length,
      "backLayers:",
      backLayers.length,
    );

  // ── Smooth colour interpolation across all materials ──
  useFrame((_state, delta) => {
    if (materials) {
      Object.values(materials).forEach((mat: any) => {
        if (mat?.color) {
          easing.dampC(mat.color, project.apparelConfig.colorHex, 0.25, delta);
        }
      });
    }
    // Also tint meshes that don't expose materials via gltf.materials
    if (sceneClone) {
      sceneClone.traverse((obj: any) => {
        if (obj.isMesh && obj.material?.color) {
          easing.dampC(
            obj.material.color,
            project.apparelConfig.colorHex,
            0.25,
            delta,
          );
        }
      });
    }

    const targetRotation = activeView === "back" ? Math.PI : 0;
    if (group.current) {
      easing.dampE(group.current.rotation, [0, targetRotation, 0], 0.25, delta);
    }
  });

  const CANVAS_W = 500;
  const CANVAS_H = 600;

  if (!sceneClone || !norm) return null;

  // ── Position helper: maps 2D pixel coords → 3D space ──
  const get3DPosition = (
    layer: any,
    baseZ: number,
    isBack = false,
  ): [number, number, number] => {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;

    const offsetX = (cx / CANVAS_W - 0.5) * norm.printW;
    const offsetY = -(cy / CANVAS_H - 0.5) * norm.printH;

    return [isBack ? -offsetX : offsetX, offsetY, baseZ];
  };

  // ── Decal Z values: just beyond the front / back surface ──
  const FRONT_Z = norm.frontZ + 0.005;
  const BACK_Z = norm.backZ - 0.005;

  const decalScale = (layer: any): [number, number, number] => [
    (layer.width / CANVAS_W) * norm.printW,
    (layer.height / CANVAS_H) * norm.printH,
    0.5, // Thick enough to penetrate any surface curves
  ];

  return (
    <group ref={group}>
      {/* We mount the pre-normalised clone */}
      <primitive object={sceneClone} />

      {/* ── Front decals ── */}
      {frontLayers.map((layer: any) => {
        if (!layer.isVisible || !frontMeshRef.current) return null;
        const pos = get3DPosition(layer, FRONT_Z, false);
        const rotZ = THREE.MathUtils.degToRad(layer.rotation || 0);
        const rot: [number, number, number] = [0, 0, rotZ];
        const sc = decalScale(layer);

        if (layer.type === "image")
          return (
            <group key={layer.id}>
              <DecalTexture
                layer={layer}
                position={pos}
                rotation={rot}
                scale={sc}
                meshRef={frontMeshRef}
              />
              {DEBUG_DECALS && (
                <mesh position={pos} renderOrder={9999}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="red" depthTest={false} />
                </mesh>
              )}
            </group>
          );
        if (layer.type === "text")
          return (
            <group key={layer.id}>
              <DecalText
                layer={layer}
                position={pos}
                rotation={rot}
                scale={sc}
                meshRef={frontMeshRef}
              />
              {DEBUG_DECALS && (
                <mesh position={pos} renderOrder={9999}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="red" depthTest={false} />
                </mesh>
              )}
            </group>
          );
        if (layer.type === "line")
          return (
            <group key={layer.id}>
              <DecalLine
                layer={layer}
                position={pos}
                rotation={rot}
                scale={sc}
                meshRef={frontMeshRef}
              />
              {DEBUG_DECALS && (
                <mesh position={pos} renderOrder={9999}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="red" depthTest={false} />
                </mesh>
              )}
            </group>
          );
        return null;
      })}

      {/* ── Back decals ── */}
      {backLayers.map((layer: any) => {
        if (!layer.isVisible || !backMeshRef.current) return null;
        const pos = get3DPosition(layer, BACK_Z, true);
        const rotZ = THREE.MathUtils.degToRad(layer.rotation || 0);
        const rot: [number, number, number] = [0, Math.PI, rotZ];
        const sc = decalScale(layer);

        if (layer.type === "image")
          return (
            <group key={layer.id}>
              <DecalTexture
                layer={layer}
                position={pos}
                rotation={rot}
                scale={sc}
                meshRef={backMeshRef}
              />
              {DEBUG_DECALS && (
                <mesh position={pos} renderOrder={9999}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="red" depthTest={false} />
                </mesh>
              )}
            </group>
          );
        if (layer.type === "text")
          return (
            <group key={layer.id}>
              <DecalText
                layer={layer}
                position={pos}
                rotation={rot}
                scale={sc}
                meshRef={backMeshRef}
              />
              {DEBUG_DECALS && (
                <mesh position={pos} renderOrder={9999}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="red" depthTest={false} />
                </mesh>
              )}
            </group>
          );
        if (layer.type === "line")
          return (
            <group key={layer.id}>
              <DecalLine
                layer={layer}
                position={pos}
                rotation={rot}
                scale={sc}
                meshRef={backMeshRef}
              />
              {DEBUG_DECALS && (
                <mesh position={pos} renderOrder={9999}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="red" depthTest={false} />
                </mesh>
              )}
            </group>
          );
        return null;
      })}
    </group>
  );
}

// ─── Decal sub-components ─────────────────────────────────────────────────────

function DecalTexture({ layer, position, rotation, scale, meshRef }: any) {
  const texture = useTexture(layer.asset.originalUrl) as THREE.Texture;
  if (texture) texture.colorSpace = THREE.SRGBColorSpace;
  if (!meshRef.current) {
    if (typeof window !== "undefined")
      console.log(
        "[DecalTexture] missing meshRef for layer",
        layer.id,
        meshRef,
      );
    return null;
  }
  const [decalPos, setDecalPos] = useState<THREE.Vector3 | null>(null);
  const [decalRot, setDecalRot] = useState<[number, number, number] | null>(
    null,
  );

  useEffect(() => {
    if (!texture) return;
    if (typeof window !== "undefined")
      console.log(
        "[DecalTexture] mount",
        layer.id,
        "mesh:",
        meshRef.current?.name,
        "pos:",
        position,
        "scale:",
        scale,
      );

    // Raycast from the decal position into the model along local Z to find the true surface
    const mesh = meshRef.current as THREE.Mesh;
    if (!mesh) return;
    const origin = new THREE.Vector3(position[0], position[1], position[2]);
    // Determine if this is a back decal by checking y-rotation === PI
    const isBack = Math.abs((rotation?.[1] ?? 0) - Math.PI) < 0.1;
    const dir = new THREE.Vector3(0, 0, isBack ? 1 : -1);
    const ray = new THREE.Raycaster(
      origin.clone().add(dir.clone().multiplyScalar(0.01)),
      dir,
      0,
      2,
    );
    const hits = ray.intersectObject(mesh, true);
    if (hits && hits.length > 0) {
      const hit = hits[0];
      const worldPoint = hit.point.clone();
      const normal = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 0, 1);
      // Transform normal to world space
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(
        mesh.matrixWorld,
      );
      normal.applyMatrix3(normalMatrix).normalize();

      // Build quaternion aligning +Z to surface normal, then rotate by layer rotation around normal
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal,
      );
      const rotZ = rotation ? rotation[2] : 0;
      const extra = new THREE.Quaternion().setFromAxisAngle(normal, rotZ);
      q.multiply(extra);
      const euler = new THREE.Euler().setFromQuaternion(q, "XYZ");

      // Slightly offset along normal to avoid z-fighting
      worldPoint.add(normal.clone().multiplyScalar(0.001));

      setDecalPos(worldPoint);
      setDecalRot([euler.x, euler.y, euler.z]);
      return;
    }

    // fallback
    setDecalPos(new THREE.Vector3(position[0], position[1], position[2]));
    setDecalRot([rotation[0], rotation[1], rotation[2]]);
  }, [texture, meshRef, position, rotation, layer.id, scale]);
  if (!decalPos || !decalRot) return null;
  // Ensure the target mesh is a proper Mesh and is attached to the scene
  if (
    !meshRef.current ||
    !(meshRef.current as any).isMesh ||
    !meshRef.current.parent
  )
    return null;
  return (
    <group>
      <DecalErrorBoundary
        fallback={
          texture ? (
            <mesh
              position={[decalPos.x, decalPos.y, decalPos.z]}
              rotation={decalRot as [number, number, number]}
              renderOrder={10001}
            >
              <planeGeometry args={[scale[0], scale[1]]} />
              <meshStandardMaterial
                map={texture}
                transparent={layer.opacity ? layer.opacity < 1 : false}
                opacity={layer.opacity ?? 1}
                polygonOffset
                polygonOffsetFactor={1}
                depthTest={true}
                depthWrite={false}
                alphaTest={0.01}
                side={THREE.DoubleSide}
              />
            </mesh>
          ) : null
        }
      >
        <Decal
          mesh={meshRef.current as any}
          position={[decalPos.x, decalPos.y, decalPos.z]}
          rotation={decalRot as [number, number, number]}
          scale={scale}
          map={texture}
        >
          <meshStandardMaterial
            map={texture}
            transparent={layer.opacity ? layer.opacity < 1 : false}
            opacity={layer.opacity ?? 1}
            polygonOffset
            polygonOffsetFactor={1}
            depthTest={true}
            depthWrite={false}
            alphaTest={0.01}
            side={THREE.DoubleSide}
          />
        </Decal>
      </DecalErrorBoundary>
      {DEBUG_DECALS && texture && (
        <mesh
          position={[decalPos.x, decalPos.y, decalPos.z]}
          rotation={decalRot as [number, number, number]}
          renderOrder={10001}
        >
          <planeGeometry args={[scale[0], scale[1]]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={layer.opacity ?? 1}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}

function DecalText({ layer, position, rotation, scale, meshRef }: any) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 950; // was 950 — match a power-of-two closer to decal aspect
    canvas.height = 256; // was 256
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = layer.colorHex || "#ffffff";
    // Removed "bold", use layer.fontWeight if needed, fallback to normal
    const weight = layer.fontWeight || "normal";
    ctx.font = `${weight} ${layer.fontSize * 2}px ${layer.fontFamily || "Arial"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.text, canvas.width / 2, canvas.height / 2);
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    setTexture(t);
  }, [
    layer.text,
    layer.colorHex,
    layer.fontSize,
    layer.fontFamily,
    layer.fontWeight,
  ]);
  const [decalPosT, setDecalPosT] = useState<THREE.Vector3 | null>(null);
  const [decalRotT, setDecalRotT] = useState<[number, number, number] | null>(
    null,
  );

  useEffect(() => {
    if (!texture) return;
    if (typeof window !== "undefined")
      console.log(
        "[DecalText] mount",
        layer.id,
        "mesh:",
        meshRef.current?.name,
        "pos:",
        position,
        "scale:",
        scale,
      );
    const mesh = meshRef.current as THREE.Mesh;
    if (!mesh) return;
    const origin = new THREE.Vector3(position[0], position[1], position[2]);
    // Determine if this is a back decal by checking y-rotation === PI
    const isBack = Math.abs((rotation?.[1] ?? 0) - Math.PI) < 0.1;
    // Raycast along local Z (same as DecalTexture) to reliably hit curved/multi-part meshes
    const dir = new THREE.Vector3(0, 0, isBack ? 1 : -1);
    const ray = new THREE.Raycaster(
      origin.clone().add(dir.clone().multiplyScalar(0.01)),
      dir,
      0,
      2,
    );
    const hits = ray.intersectObject(mesh, true);
    if (hits && hits.length > 0) {
      const hit = hits[0];
      const worldPoint = hit.point.clone();
      const normal = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 0, 1);
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(
        mesh.matrixWorld,
      );
      normal.applyMatrix3(normalMatrix).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal,
      );
      const rotZ = rotation ? rotation[2] : 0;
      const extra = new THREE.Quaternion().setFromAxisAngle(normal, rotZ);
      q.multiply(extra);
      const euler = new THREE.Euler().setFromQuaternion(q, "XYZ");
      worldPoint.add(normal.clone().multiplyScalar(0.001));
      setDecalPosT(worldPoint);
      setDecalRotT([euler.x, euler.y, euler.z]);
      return;
    }
    setDecalPosT(new THREE.Vector3(position[0], position[1], position[2]));
    setDecalRotT([rotation[0], rotation[1], rotation[2]]);
  }, [texture, meshRef, position, rotation, layer.id, scale]);
  if (!texture || !meshRef.current || !decalPosT || !decalRotT) {
    if (typeof window !== "undefined")
      console.log(
        "[DecalText] missing texture or meshRef or computed decal",
        layer.id,
        !!texture,
        meshRef.current,
        !!decalPosT,
      );
    return null;
  }
  // Ensure the target mesh is a proper Mesh and is attached to the scene
  if (
    !meshRef.current ||
    !(meshRef.current as any).isMesh ||
    !meshRef.current.parent
  )
    return null;
  return (
    <group>
      <DecalErrorBoundary
        fallback={
          texture ? (
            <mesh
              position={[decalPosT.x, decalPosT.y, decalPosT.z]}
              rotation={decalRotT as [number, number, number]}
              renderOrder={10001}
            >
              <planeGeometry args={[scale[0], scale[1]]} />
              <meshStandardMaterial
                map={texture}
                transparent={layer.opacity ? layer.opacity < 1 : false}
                opacity={layer.opacity ?? 1}
                polygonOffset
                polygonOffsetFactor={1}
                depthTest={true}
                depthWrite={false}
                alphaTest={0.01}
                side={THREE.DoubleSide}
              />
            </mesh>
          ) : null
        }
      >
        
        <Decal
          mesh={meshRef.current as any}
          position={[decalPosT.x, decalPosT.y, decalPosT.z]}
          rotation={decalRotT as [number, number, number]}
          scale={scale}
          map={texture}
        >
          <meshStandardMaterial
            map={texture}
            transparent={layer.opacity ? layer.opacity < 1 : false}
            opacity={layer.opacity ?? 1}
            polygonOffset
            polygonOffsetFactor={1}
            depthTest={true}
            depthWrite={false}
            alphaTest={0.01}
            side={THREE.DoubleSide}
          />
        </Decal>
      </DecalErrorBoundary>
      {DEBUG_DECALS && texture && (
        <mesh
          position={[decalPosT.x, decalPosT.y, decalPosT.z]}
          rotation={decalRotT as [number, number, number]}
          renderOrder={10001}
        >
          <planeGeometry args={[scale[0], scale[1]]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={layer.opacity ?? 1}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}

function DecalLine({ layer, position, rotation, scale, meshRef }: any) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = layer.colorHex || "#ffffff";
    const thickness = Math.max(1, Math.min(layer.thickness * 2, canvas.height));
    ctx.fillRect(0, (canvas.height - thickness) / 2, canvas.width, thickness);
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    t.colorSpace = THREE.SRGBColorSpace;
    setTexture(t);
  }, [layer.colorHex, layer.thickness]);
  const [decalPosL, setDecalPosL] = useState<THREE.Vector3 | null>(null);
  const [decalRotL, setDecalRotL] = useState<[number, number, number] | null>(
    null,
  );
  useEffect(() => {
    if (!texture) return;
    if (typeof window !== "undefined")
      console.log(
        "[DecalLine] mount",
        layer.id,
        "mesh:",
        meshRef.current?.name,
        "pos:",
        position,
        "scale:",
        scale,
      );
    const mesh = meshRef.current as THREE.Mesh;
    if (!mesh) return;
    const origin = new THREE.Vector3(position[0], position[1], position[2]);
    // Determine if this is a back decal by checking y-rotation === PI
    const isBack = Math.abs((rotation?.[1] ?? 0) - Math.PI) < 0.1;
    // Raycast along local Z to match DecalTexture behavior
    const dir = new THREE.Vector3(0, 0, isBack ? 1 : -1);
    const ray = new THREE.Raycaster(
      origin.clone().add(dir.clone().multiplyScalar(0.01)),
      dir,
      0,
      2,
    );
    const hits = ray.intersectObject(mesh, true);
    if (hits && hits.length > 0) {
      const hit = hits[0];
      const worldPoint = hit.point.clone();
      const normal = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 0, 1);
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(
        mesh.matrixWorld,
      );
      normal.applyMatrix3(normalMatrix).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal,
      );
      const rotZ = rotation ? rotation[2] : 0;
      const extra = new THREE.Quaternion().setFromAxisAngle(normal, rotZ);
      q.multiply(extra);
      const euler = new THREE.Euler().setFromQuaternion(q, "XYZ");
      worldPoint.add(normal.clone().multiplyScalar(0.001));
      setDecalPosL(worldPoint);
      setDecalRotL([euler.x, euler.y, euler.z]);
      return;
    }
    setDecalPosL(new THREE.Vector3(position[0], position[1], position[2]));
    setDecalRotL([rotation[0], rotation[1], rotation[2]]);
  }, [texture, meshRef, position, rotation, layer.id, scale]);
  if (!texture || !meshRef.current || !decalPosL || !decalRotL) {
    if (typeof window !== "undefined")
      console.log(
        "[DecalLine] missing texture or meshRef or computed decal",
        layer.id,
        !!texture,
        meshRef.current,
        !!decalPosL,
      );
    return null;
  }
  // Ensure the target mesh is a proper Mesh and is attached to the scene
  if (
    !meshRef.current ||
    !(meshRef.current as any).isMesh ||
    !meshRef.current.parent
  )
    return null;
  return (
    <group>
      <DecalErrorBoundary
        fallback={
          texture ? (
            <mesh
              position={[decalPosL.x, decalPosL.y, decalPosL.z]}
              rotation={decalRotL as [number, number, number]}
              renderOrder={10001}
            >
              <planeGeometry args={[scale[0], scale[1]]} />
              <meshStandardMaterial
                map={texture}
                transparent={layer.opacity ? layer.opacity < 1 : false}
                opacity={layer.opacity ?? 1}
                polygonOffset
                polygonOffsetFactor={1}
                depthTest={true}
                depthWrite={false}
                alphaTest={0.01}
                side={THREE.DoubleSide}
              />
            </mesh>
          ) : null
        }
      >
        <Decal
          mesh={meshRef.current as any}
          position={[decalPosL.x, decalPosL.y, decalPosL.z]}
          rotation={decalRotL as [number, number, number]}
          scale={scale}
          map={texture}
        >
          <meshStandardMaterial
            map={texture}
            transparent={layer.opacity ? layer.opacity < 1 : false}
            opacity={layer.opacity ?? 1}
            polygonOffset
            polygonOffsetFactor={1}
            depthTest={true}
            depthWrite={false}
            alphaTest={0.01}
            side={THREE.DoubleSide}
          />
        </Decal>
      </DecalErrorBoundary>
      {DEBUG_DECALS && texture && (
        <mesh
          position={[decalPosL.x, decalPosL.y, decalPosL.z]}
          rotation={decalRotL as [number, number, number]}
          renderOrder={10001}
        >
          <planeGeometry args={[scale[0], scale[1]]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={layer.opacity ?? 1}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}

// Simple ErrorBoundary to catch Decal runtime errors and render a fallback plane
class DecalErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    // Log for debugging but don't crash the whole canvas
    console.warn("DecalErrorBoundary caught:", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

useGLTF.preload("/models/shirt_baked.glb");
useGLTF.preload("/models/hoodie.glb");
useGLTF.preload("/models/LongSleeveTShirt.glb");
useGLTF.preload("/models/short_sleeve_polo.glb");
useGLTF.preload("/models/oversized-tee.glb");
