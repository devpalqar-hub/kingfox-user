"use client";

import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useFrame, createPortal } from "@react-three/fiber";
import { easing } from "maath";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function ShirtModel() {
  const { project, activeView } = useDesignStore();

  // Attempt to load a category-specific model from /models/{categoryId}.glb.
  // Fall back to the default shirt_baked.glb if the category-specific asset is missing.
  const [modelUrl, setModelUrl] = useState<string>("/models/shirt_baked.glb");

  const MODEL_CONFIG: Record<
    string,
    {
      printW: number;
      printH: number;
      frontZ: number;
      backZ: number;
      decalDepth: number;
      useUniformScale?: boolean;
    }
  > = {
    shirt: {
      printW: 0.36,
      printH: 0.44,
      frontZ: 0.15,
      backZ: -0.15,
      decalDepth: 0.15,
      useUniformScale: false,
    },
    hoodie: {
      printW: 0.53,
      printH: 0.47,
      frontZ: 0.15,
      backZ: -0.15,
      decalDepth: 0.30,
      useUniformScale: true,
    },
  };

  /** Resolve model type from the URL to select the right config */
  function getModelType(url: string): string {
    if (url.toLowerCase().includes("hoodie")) return "hoodie";
    return "shirt"; // default fallback
  }

  useEffect(() => {
    const rawId = (project.apparelConfig.categoryId || "").toString();
    const normalized = rawId.toLowerCase();

    // Fast-path mapping for known categories (avoid HEAD delays)
    if (
      normalized === "classic-hoodie" ||
      normalized.includes("classic-hoodie")
    ) {
      console.debug("[ShirtModel] fast-path hoodie -> /models/hoodie.glb");
      setModelUrl("/models/hoodie.glb");
      return;
    }

    // Build an ordered list of candidate model paths to try (prefer explicit overrides)
    const candidates: string[] = [];
    if (normalized.includes("polo")) {
      candidates.push(
        "/t-shirt-polo.glb",
        `/models/${project.apparelConfig.categoryId}.glb`,
      );
    }
    if (normalized.includes("hoodie")) {
      candidates.push(
        "/models/hoodie.glb",
        "/hoodie.glb",
        `/models/${project.apparelConfig.categoryId}.glb`,
      );
    }
    // Default attempt: category-specific model in /models
    candidates.push(`/models/${project.apparelConfig.categoryId}.glb`);
    // Final fallback is the baked shirt
    candidates.push("/models/shirt_baked.glb");

    let cancelled = false;
    (async () => {
      console.debug("[ShirtModel] trying candidates:", candidates);
      for (const c of candidates) {
        try {
          // Use HEAD so we don't download the full GLB unless it's available
          const res = await fetch(c, { method: "HEAD" });
          console.debug("[ShirtModel] HEAD", c, res.status);
          if (res.ok) {
            if (!cancelled) {
              console.debug("[ShirtModel] selected model:", c);
              setModelUrl(c);
            }
            return;
          }
        } catch (e) {
          console.warn("[ShirtModel] HEAD failed for", c, e);
          // ignore and try next
        }
      }
      if (!cancelled) {
        console.debug("[ShirtModel] falling back to /shirt_baked.glb");
        setModelUrl("/models/shirt_baked.glb");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [project.apparelConfig.categoryId]);

  const gltf: any = useGLTF(modelUrl) as any;
  const { nodes, materials, scene } = gltf || {};

  // Quick debug badge so we can see the chosen model and availability in the page
  useEffect(() => {
    try {
      const id = "shirt-model-debug";
      let badge = document.getElementById(id) as HTMLDivElement | null;
      if (!badge) {
        badge = document.createElement("div");
        badge.id = id;
        badge.style.position = "fixed";
        badge.style.right = "12px";
        badge.style.bottom = "12px";
        badge.style.zIndex = "9999";
        badge.style.padding = "8px 10px";
        badge.style.background = "rgba(0,0,0,0.6)";
        badge.style.color = "#fff";
        badge.style.fontSize = "12px";
        badge.style.borderRadius = "6px";
        document.body.appendChild(badge);
      }
      badge.innerText = `model: ${modelUrl} | nodes:${!!nodes} materials:${!!materials} scene:${!!scene}`;
    } catch (e) {
      // ignore DOM errors in non-browser contexts
    }
  }, [modelUrl, nodes, materials, scene]);
  const group = useRef<THREE.Group>(null);

  const frontLayers = project.designs.front || [];
  const backLayers = project.designs.back || [];

  // Smoothly interpolate color
  useFrame((state, delta) => {
    const mat = materials?.lambert1 || Object.values(materials || {})[0];
    if (mat && mat.color) {
      easing.dampC(mat.color, project.apparelConfig.colorHex, 0.25, delta);
    }

    // Rotate model to show back if active view is back
    const targetRotation = activeView === "back" ? Math.PI : 0;
    if (group.current) {
      easing.dampE(group.current.rotation, [0, targetRotation, 0], 0.25, delta);
    }
  });

  // 2D canvas dimensions (must match DesignEditor2D printArea)
  const CANVAS_W = 500;
  const CANVAS_H = 600;

  const modelType = getModelType(modelUrl);
  const config = MODEL_CONFIG[modelType] ?? MODEL_CONFIG.shirt;
  const PRINT_3D_W = config.printW;
  const PRINT_3D_H = config.printH;

  // Helper to map 2D editor coordinates (500x600 canvas) to 3D spatial offsets
  const get3DPosition = (
    layer: any,
    baseZ: number,
    isBack: boolean = false,
  ) => {
    // Centre of the layer in 2D pixel space
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;

    let offsetX, offsetY;
    if (config.useUniformScale) {
      offsetX = (centerX - CANVAS_W / 2) * (config.printW / CANVAS_W);
      offsetY = -(centerY - CANVAS_H / 2) * (config.printW / CANVAS_W);
    } else {
      offsetX = (centerX / CANVAS_W - 0.5) * PRINT_3D_W;
      offsetY = -(centerY / CANVAS_H - 0.5) * PRINT_3D_H;
    }

    return [isBack ? -offsetX : offsetX, offsetY, baseZ];
  };

  // Avoid early return here; continue and attempt to resolve meshes from `scene` if
  // `nodes`/`materials` are not present. Some GLTFs expose meshes only on `scene`.

  // Resolve mesh geometry and material dynamically for category models.
  // Some GLBs expose meshes via `nodes`, others nest meshes in `scene` children.
  let meshNode: any =
    nodes?.T_Shirt_male ||
    Object.values(nodes || {}).find((n: any) => n && n.geometry);

  // If we didn't find geometry via nodes, traverse the scene to locate the first mesh
  if (!meshNode && scene) {
    scene.traverse((obj: any) => {
      if (!meshNode && obj.isMesh) {
        meshNode = obj;
      }
    });
  }

  if (!meshNode || !scene) return null;

  // Render a small on-page debug badge to help diagnose missing models in dev.
  useEffect(() => {
    try {
      const id = "shirt-model-debug";
      let badge = document.getElementById(id) as HTMLDivElement | null;
      if (!badge) {
        badge = document.createElement("div");
        badge.id = id;
        badge.style.position = "fixed";
        badge.style.right = "12px";
        badge.style.bottom = "12px";
        badge.style.zIndex = "9999";
        badge.style.padding = "8px 10px";
        badge.style.background = "rgba(0,0,0,0.6)";
        badge.style.color = "#fff";
        badge.style.fontSize = "12px";
        badge.style.borderRadius = "6px";
        document.body.appendChild(badge);
      }
      badge.innerText = `model: ${modelUrl} | nodes:${!!nodes} materials:${!!materials}`;
    } catch (e) {
      // ignore DOM errors in non-browser contexts
    }
  }, [modelUrl, nodes, materials]);

  const targetMeshRef = useRef<any>(null);
  targetMeshRef.current = meshNode;

  const getLocalParams = (
    groupPos: [number, number, number],
    groupRotation: [number, number, number],
    groupScale: [number, number, number]
  ) => {
    if (!group.current || !meshNode) {
      return { position: groupPos, rotation: groupRotation, scale: groupScale };
    }

    // Force update of world matrices to ensure they are accurate
    group.current.updateMatrixWorld(true);
    meshNode.updateMatrixWorld(true);

    // 1. Transform position to local space of meshNode
    const worldPos = new THREE.Vector3(...groupPos);
    group.current.localToWorld(worldPos);
    meshNode.worldToLocal(worldPos);

    // 2. Transform rotation to local space of meshNode
    const groupQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(...groupRotation));
    const worldQ = new THREE.Quaternion();
    group.current.getWorldQuaternion(worldQ);
    worldQ.multiply(groupQ);
    const meshWorldQ = new THREE.Quaternion();
    meshNode.getWorldQuaternion(meshWorldQ);
    const localQ = meshWorldQ.clone().invert().multiply(worldQ);
    const localRot = new THREE.Euler().setFromQuaternion(localQ);

    // 3. Transform scale to local space of meshNode
    const meshWorldScale = new THREE.Vector3();
    meshNode.getWorldScale(meshWorldScale);
    const localScale = [
      groupScale[0] / meshWorldScale.x,
      groupScale[1] / meshWorldScale.y,
      groupScale[2] / meshWorldScale.z,
    ];

    return {
      position: [worldPos.x, worldPos.y, worldPos.z] as [number, number, number],
      rotation: [localRot.x, localRot.y, localRot.z] as [number, number, number],
      scale: localScale as [number, number, number],
    };
  };

  return (
    <group ref={group}>
      <primitive object={scene} />
      {createPortal(
        <>
          {frontLayers.map((layer) => {
            if (!layer.isVisible) return null;
            const pos = get3DPosition(layer, config.frontZ, false);

            const rotZ = THREE.MathUtils.degToRad(layer.rotation || 0);
            const frontRotation: [number, number, number] = [0, 0, rotZ];

            const scaleX = config.useUniformScale
              ? (layer.width / CANVAS_W) * config.printW
              : (layer.width / 500) * config.printW;
            const scaleY = config.useUniformScale
              ? (layer.height / CANVAS_W) * config.printW
              : (layer.height / 600) * config.printH;
            const scaleZ = config.decalDepth;

            const local = getLocalParams(
              pos as [number, number, number],
              frontRotation,
              [scaleX, scaleY, scaleZ]
            );

            if (layer.type === "image") {
              return (
                <DecalTexture
                  key={layer.id}
                  layer={layer as any}
                  position={local.position}
                  rotation={local.rotation}
                  scale={local.scale}
                  mesh={targetMeshRef}
                />
              );
            }
            if (layer.type === "text") {
              return (
                <DecalText
                  key={layer.id}
                  layer={layer as any}
                  position={local.position}
                  rotation={local.rotation}
                  scale={local.scale}
                  mesh={targetMeshRef}
                />
              );
            }
            if (layer.type === "line") {
              return (
                <DecalLine
                  key={layer.id}
                  layer={layer as any}
                  position={local.position}
                  rotation={local.rotation}
                  scale={local.scale}
                  mesh={targetMeshRef}
                />
              );
            }
            return null;
          })}

          {backLayers.map((layer) => {
            if (!layer.isVisible) return null;
            const pos = get3DPosition(layer, config.backZ, true);

            const rotZb = THREE.MathUtils.degToRad(layer.rotation || 0);
            const backRotation: [number, number, number] = [0, Math.PI, rotZb];

            const scaleX = config.useUniformScale
              ? (layer.width / CANVAS_W) * config.printW
              : (layer.width / 500) * config.printW;
            const scaleY = config.useUniformScale
              ? (layer.height / CANVAS_W) * config.printW
              : (layer.height / 600) * config.printH;
            const scaleZ = config.decalDepth;

            const local = getLocalParams(
              pos as [number, number, number],
              backRotation,
              [scaleX, scaleY, scaleZ]
            );

            if (layer.type === "image") {
              return (
                <DecalTexture
                  key={layer.id}
                  layer={layer as any}
                  position={local.position}
                  rotation={local.rotation}
                  scale={local.scale}
                  mesh={targetMeshRef}
                />
              );
            }
            if (layer.type === "text") {
              return (
                <DecalText
                  key={layer.id}
                  layer={layer as any}
                  position={local.position}
                  rotation={local.rotation}
                  scale={local.scale}
                  mesh={targetMeshRef}
                />
              );
            }
            if (layer.type === "line") {
              return (
                <DecalLine
                  key={layer.id}
                  layer={layer as any}
                  position={local.position}
                  rotation={local.rotation}
                  scale={local.scale}
                  mesh={targetMeshRef}
                />
              );
            }
            return null;
          })}
        </>,
        meshNode
      )}
    </group>
  );
}

// Subcomponent to load texture for individual decals safely
function DecalTexture({
  layer,
  position,
  rotation = [0, 0, 0],
  scale,
  mesh,
}: any) {
  const texture = useTexture(layer.asset.originalUrl) as THREE.Texture & {
    image?: HTMLImageElement;
  };

  return (
    <Decal
      mesh={mesh}
      position={position}
      rotation={rotation}
      scale={scale}
      map={texture}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={layer.opacity ?? 1}
        polygonOffset
        polygonOffsetFactor={-1}
        depthTest={false}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </Decal>
  );
}

// Subcomponent to generate dynamic text textures
function DecalText({
  layer,
  position,
  rotation = [0, 0, 0],
  scale,
  mesh,
}: any) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Clear background (transparent)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Text
      ctx.fillStyle = layer.colorHex || "#ffffff";
      ctx.font = `bold ${layer.fontSize * 1.5}px ${layer.fontFamily || "Arial"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.text, canvas.width / 2, canvas.height / 2);

      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.needsUpdate = true;
      setTexture(newTexture);
    }
  }, [layer.text, layer.colorHex, layer.fontSize, layer.fontFamily]);

  if (!texture) return null;

  return (
    <Decal
      mesh={mesh}
      position={position}
      rotation={rotation}
      scale={scale}
      map={texture}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={layer.opacity ?? 1}
        polygonOffset
        polygonOffsetFactor={-1}
        depthTest={false}
        depthWrite={true}
      />
    </Decal>
  );
}

// Subcomponent to generate dynamic line textures
function DecalLine({
  layer,
  position,
  rotation = [0, 0, 0],
  scale,
  mesh,
}: any) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = layer.colorHex || "#ffffff";
      // Use thickness relative to height
      const thickness = Math.max(
        1,
        Math.min(layer.thickness * 2, canvas.height),
      );
      const yStart = (canvas.height - thickness) / 2;
      ctx.fillRect(0, yStart, canvas.width, thickness);

      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.needsUpdate = true;
      setTexture(newTexture);
    }
  }, [layer.colorHex, layer.thickness]);

  if (!texture) return null;

  return (
    <Decal
      mesh={mesh}
      position={position}
      rotation={rotation}
      scale={scale}
      map={texture}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={layer.opacity ?? 1}
        polygonOffset
        polygonOffsetFactor={-1}
        depthTest={false}
        depthWrite={true}
      />
    </Decal>
  );
}

useGLTF.preload("/models/shirt_baked.glb");
useGLTF.preload("/models/t-shirt-polo.glb");
useGLTF.preload("/models/hoodie.glb");
