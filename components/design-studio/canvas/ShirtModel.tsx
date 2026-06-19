"use client";

import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { CgArrowLongRight } from "react-icons/cg";
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

      centerX?: number;

      centerY?: number;

    }

  > = {

    shirt: {

      printW: 0.66,

      printH: 0.54,

      frontZ: 0.15,

      backZ: -0.15,

      decalDepth: 0.15,

      useUniformScale: false,

      centerX: 0,

      centerY: 0,

    },

     hoodie: {
    printW: 0.7,
    printH: 1.3,
    frontZ: 0.06,
    backZ: -0.11,
    decalDepth: 0.2,
    centerX: 0,
    centerY: -0.08,
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

    if (normalized.includes("long") || normalized.includes("full") || normalized.includes("sleeve")) {

      candidates.push(

        "/models/LongSleeveTShirt.glb",

      );

    }

    if (normalized.includes("oversize")) {

      candidates.push(

        "/models/oversized-tee.glb",

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

  const targetMeshRef = useRef<THREE.Mesh | null>(null);

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

  // Helper to map 2D editor coordinates (500x600 canvas) to 3D spatial offsets

  const get3DPosition = (

    layer: any,

    baseZ: number,

    isBack: boolean = false,

  ) => {

    const visualWidth = layer.width * (layer.scaleX || 1);

    const visualHeight = layer.height * (layer.scaleY || 1);

    const centerX = layer.x + visualWidth / 2;

    const centerY = layer.y + visualHeight / 2;

    const PRINT_3D_W = activeConfig.printW || config.printW;

    const PRINT_3D_H = activeConfig.printH || config.printH;

    let offsetX, offsetY;

    if (activeConfig.useUniformScale) {

      offsetX = (centerX - CANVAS_W / 2) * (PRINT_3D_W / CANVAS_W);

      offsetY = -(centerY - CANVAS_H / 2) * (PRINT_3D_W / CANVAS_W);

    } else {

      offsetX = (centerX / CANVAS_W - 0.5) * PRINT_3D_W;

      offsetY = -(centerY / CANVAS_H - 0.5) * PRINT_3D_H;

    }

    const cx = activeConfig.centerX || 0;

    const cy = activeConfig.centerY || 0;

    return [(isBack ? -offsetX : offsetX) + cx, offsetY + cy, baseZ];

  };

  const allMeshesRef = useRef<THREE.Mesh[]>([]);

  // Collect all meshes in the scene

  useEffect(() => {

    if (scene) {

      const arr: THREE.Mesh[] = [];

      scene.traverse((obj: any) => {

        if (obj.isMesh && obj.geometry) {

          arr.push(obj);

        }

      });

      allMeshesRef.current = arr;

    }

  }, [scene]);

  if (!scene || allMeshesRef.current.length === 0) return null;

  targetMeshRef.current = allMeshesRef.current[0] as THREE.Mesh;

  // const activeConfig = (() => {

  //   if (!group.current) return config;

  //   const groupInverse = new THREE.Matrix4().copy(group.current.matrixWorld).invert();

  //   const combinedBounds = new THREE.Box3();

  //   for (const obj of allMeshesRef.current) {

  //     obj.geometry.computeBoundingBox();

  //     if (obj.geometry.boundingBox) {

  //       const meshToGroup = groupInverse.clone().multiply(obj.matrixWorld);

  //       const localBox = new THREE.Box3().copy(obj.geometry.boundingBox).applyMatrix4(meshToGroup);

  //       combinedBounds.union(localBox);

  //     }

  //   }

  //   if (combinedBounds.isEmpty()) return config;

  //   const size = new THREE.Vector3();

  //   combinedBounds.getSize(size);

  //   const center = new THREE.Vector3();


  //   combinedBounds.getCenter(center);

  //   const scale = Math.max(size.x / 500, size.y / 600);

  //   return {
  //     ...config,
  //     frontZ: combinedBounds.max.z,
  //     backZ: combinedBounds.min.z,
  //     decalDepth: THREE.MathUtils.clamp(size.z * 0.2, 0.05, 0.2),
  //     printW: 500 * scale,
  //     printH: 600 * scale,
  //     useUniformScale: false,
  //     centerX: center.x,
  //     centerY: center.y,
  //   };

  // })();

  const activeConfig = config;

  const getLocalParams = (

    groupPos: [number, number, number],

    groupRotation: [number, number, number],

    groupScale: [number, number, number],

    meshNode: THREE.Mesh

  ) => {

    if (!group.current || !meshNode) {

      return { position: groupPos, rotation: groupRotation, scale: groupScale };

    }

    group.current.updateMatrixWorld(true);

    meshNode.updateMatrixWorld(true);

    const worldPos = new THREE.Vector3(...groupPos);

    group.current.localToWorld(worldPos);

    const groupQ = new THREE.Quaternion().setFromEuler(

      new THREE.Euler(...groupRotation),

    );

    const worldQ = new THREE.Quaternion();

    group.current.getWorldQuaternion(worldQ);

    worldQ.multiply(groupQ);

    const meshInverse = new THREE.Matrix4().copy(meshNode.matrixWorld).invert();



    // Calculate local position

    const localPos = worldPos.clone().applyMatrix4(meshInverse);

    // Calculate local rotation correctly without decompose

    const meshWorldQ = new THREE.Quaternion();

    meshNode.getWorldQuaternion(meshWorldQ);

    const localQ = meshWorldQ.clone().invert().multiply(worldQ);

    const localRot = new THREE.Euler().setFromQuaternion(localQ);

    // Keep scale intact for the projector box. DecalGeometry applies scale AFTER rotation, 

    // so it must represent the dimensions of the projector box itself, not mapped to the mesh axes.

    const groupWorldScale = new THREE.Vector3();

    group.current.getWorldScale(groupWorldScale);



    const meshWorldScale = new THREE.Vector3();

    meshNode.getWorldScale(meshWorldScale);



    const finalScale = new THREE.Vector3(...groupScale)

      .multiply(groupWorldScale)

      .divide(new THREE.Vector3(

        meshWorldScale.x || 1,

        meshWorldScale.y || 1,

        meshWorldScale.z || 1

      ));

    return {

      position: [localPos.x, localPos.y, localPos.z] as [

        number,

        number,

        number,

      ],

      rotation: [localRot.x, localRot.y, localRot.z] as [
        number,
        number,
        number,
      ],

      scale: [finalScale.x, finalScale.y, finalScale.z] as [
        number,
        number,
        number,
      ],

    };

  };

  return (

    <group ref={group}>

      <primitive object={scene} />

      {allMeshesRef.current.map((meshObj, meshIdx) => {

        const meshRef = { current: meshObj };

        return (

          <DecalWrapper key={meshIdx} meshRef={meshRef} groupRef={group}>

            {frontLayers.map((layer) => {

              if (!layer.isVisible) return null;

              const local = (() => {

                const pos = get3DPosition(layer, activeConfig.frontZ, false);

                const rotZ = THREE.MathUtils.degToRad(layer.rotation || 0);

                const frontRotation: [number, number, number] = [0, 0, rotZ];

                const visualWidth = layer.width * (layer.scaleX || 1);

                const visualHeight = layer.height * (layer.scaleY || 1);

                const scaleX = activeConfig.useUniformScale ? (visualWidth / CANVAS_W) * activeConfig.printW : (visualWidth / 500) * activeConfig.printW;

                const scaleY = activeConfig.useUniformScale ? (visualHeight / CANVAS_W) * activeConfig.printW : (visualHeight / 600) * activeConfig.printH;

                const scaleZ = activeConfig.decalDepth;

                return getLocalParams(pos as [number, number, number], frontRotation, [scaleX, scaleY, scaleZ], meshObj);

              })();

              if (!local) return null;

              if (layer.type === "image") return <DecalTexture key={layer.id} layer={layer as any} position={local.position} rotation={local.rotation} scale={local.scale} mesh={meshRef} />;

              if (layer.type === "text") return <DecalText key={layer.id} layer={layer as any} position={local.position} rotation={local.rotation} scale={local.scale} mesh={meshRef} />;

              if (layer.type === "line") return <DecalLine key={layer.id} layer={layer as any} position={local.position} rotation={local.rotation} scale={local.scale} mesh={meshRef} />;

              return null;

            })}

            {backLayers.map((layer) => {

              if (!layer.isVisible) return null;

              const local = (() => {

                const pos = get3DPosition(layer, activeConfig.backZ, true);

                const rotZb = THREE.MathUtils.degToRad(layer.rotation || 0);

                const backRotation: [number, number, number] = [0, Math.PI, rotZb];

                const visualWidth = layer.width * (layer.scaleX || 1);

                const visualHeight = layer.height * (layer.scaleY || 1);

                const scaleX = activeConfig.useUniformScale ? (visualWidth / CANVAS_W) * activeConfig.printW : (visualWidth / 500) * activeConfig.printW;

                const scaleY = activeConfig.useUniformScale ? (visualHeight / CANVAS_W) * activeConfig.printW : (visualHeight / 600) * activeConfig.printH;

                const scaleZ = activeConfig.decalDepth;

                return getLocalParams(pos as [number, number, number], backRotation, [scaleX, scaleY, scaleZ], meshObj);

              })();

              if (!local) return null;

              if (layer.type === "image") return <DecalTexture key={layer.id} layer={layer as any} position={local.position} rotation={local.rotation} scale={local.scale} mesh={meshRef} />;

              if (layer.type === "text") return <DecalText key={layer.id} layer={layer as any} position={local.position} rotation={local.rotation} scale={local.scale} mesh={meshRef} />;

              if (layer.type === "line") return <DecalLine key={layer.id} layer={layer as any} position={local.position} rotation={local.rotation} scale={local.scale} mesh={meshRef} />;

              return null;

            })}

          </DecalWrapper>

        );

      })}

    </group>

  );

}

function DecalWrapper({ meshRef, groupRef, children }: any) {

  const wrapperRef = useRef<THREE.Group>(null);

  useFrame(() => {

    if (wrapperRef.current && meshRef.current && groupRef.current) {

      const groupInverse = new THREE.Matrix4().copy(groupRef.current.matrixWorld).invert();

      const meshToGroup = groupInverse.multiply(meshRef.current.matrixWorld);



      wrapperRef.current.matrixAutoUpdate = false;

      wrapperRef.current.matrix.copy(meshToGroup);

    }

  });

  return <group ref={wrapperRef}>{children}</group>;

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

  if (!mesh?.current) return null;

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

        polygonOffsetFactor={-10}

        depthWrite={true}

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

  if (!texture || !mesh?.current) return null;

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

        polygonOffsetFactor={-10}

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

  if (!texture || !mesh?.current) return null;

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

        polygonOffsetFactor={-10}

        depthWrite={true}

      />

    </Decal>

  );

}

useGLTF.preload("/models/shirt_baked.glb");

useGLTF.preload("/models/t-shirt-polo.glb");

useGLTF.preload("/models/short_sleeve_polo.glb");

useGLTF.preload("/models/hoodie.glb");

useGLTF.preload("/models/LongSleeveTShirt.glb");

useGLTF.preload("/models/oversized-tee.glb");