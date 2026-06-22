"use client";

import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

export default function ShirtModel({ ...props }: any) {

  const { project, activeView } = useDesignStore();

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
      bounds2D?: { x: number; y: number; width: number; height: number };
      uvMapping?: { enabled: boolean };
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
      centerY: -0.08,
      bounds2D: { x: 0, y: 0, width: 500, height: 600 },
      uvMapping: { enabled: false },
    },
     hoodie: {
      printW: 0.7,
      printH: 1.3,
      frontZ: 0.06,
      backZ: -0.11,
      decalDepth: 0.2,
      centerX: 0.07,
      centerY: -0.08,
      bounds2D: { x: 0, y: 0, width: 500, height: 600 },
      uvMapping: { enabled: false },
    },

  };

  function getModelType(url: string): string {

    if (url.toLowerCase().includes("hoodie")) return "hoodie";

    return "shirt";

  }

  useEffect(() => {

    const rawId = (project.apparelConfig.categoryId || "").toString();

    const normalized = rawId.toLowerCase();

    if (

      normalized === "classic-hoodie" ||

      normalized.includes("classic-hoodie")

    ) {

      setModelUrl("/models/hoodie.glb");

      return;

    }

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

    candidates.push(`/models/${project.apparelConfig.categoryId}.glb`);

    candidates.push("/models/shirt_baked.glb");

    let cancelled = false;

    (async () => {

      for (const c of candidates) {

        try {

          const res = await fetch(c, { method: "HEAD" });

          if (res.ok) {

            if (!cancelled) {

              setModelUrl(c);

            }

            return;

          }

        } catch (e) {

        }

      }

      if (!cancelled) {

        setModelUrl("/models/shirt_baked.glb");

      }

    })();

    return () => {

      cancelled = true;

    };

  }, [project.apparelConfig.categoryId]);

  const { scene: gltfScene, nodes, materials } = useGLTF(modelUrl) as any;

  const clonedScene = useMemo(() => {
    return gltfScene ? SkeletonUtils.clone(gltfScene) : null;
  }, [gltfScene]);

  const group = useRef<THREE.Group>(null);

  const frontLayers = project.designs.front || [];

  const backLayers = project.designs.back || [];

  useFrame((state, delta) => {

    const mat = materials?.lambert1 || Object.values(materials || {})[0];

    if (mat && mat.color) {

      easing.dampC(mat.color, project.apparelConfig.colorHex, 0.25, delta);

    }

    const targetRotation = activeView === "back" ? Math.PI : 0;

    if (group.current) {

      easing.dampE(group.current.rotation, [0, targetRotation, 0], 0.25, delta);

    }

  });

  const CANVAS_W = 500;

  const CANVAS_H = 600;

  const modelType = getModelType(modelUrl);

  const config = MODEL_CONFIG[modelType] ?? MODEL_CONFIG.shirt;

  const get3DPosition = (
    layer: any,
    baseZ: number,
    isBack: boolean = false,
  ) => {
    const visualWidth = layer.width * (layer.scaleX || 1);
    const visualHeight = layer.height * (layer.scaleY || 1);
    const centerX = layer.x + visualWidth / 2;
    const centerY = layer.y + visualHeight / 2;

    const bounds = activeConfig.bounds2D || { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H };

    const u = (centerX - bounds.x) / bounds.width;
    const v = (centerY - bounds.y) / bounds.height;

    const PRINT_3D_W = activeConfig.printW || config.printW;
    const PRINT_3D_H = activeConfig.printH || config.printH;

    let offsetX, offsetY;
    if (activeConfig.useUniformScale) {
      offsetX = (u - 0.5) * PRINT_3D_W;
      offsetY = -(v - 0.5) * PRINT_3D_W * (bounds.height / bounds.width);
    } else {
      offsetX = (u - 0.5) * PRINT_3D_W;
      offsetY = -(v - 0.5) * PRINT_3D_H;
    }

    const cx = activeConfig.centerX || 0;
    const cy = activeConfig.centerY || 0;

    return [(isBack ? -offsetX : offsetX) + cx, offsetY + cy, baseZ];

  };

  const allMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {

    if (clonedScene) {

      const arr: THREE.Mesh[] = [];

      clonedScene.traverse((obj: any) => {

        if (obj.isMesh && obj.geometry) {

          arr.push(obj);

        }

      });

      allMeshesRef.current = arr;

    }

  }, [clonedScene]);

  if (!clonedScene || allMeshesRef.current.length === 0) return null;

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

    const localPos = worldPos.clone().applyMatrix4(meshInverse);

    const meshWorldQ = new THREE.Quaternion();

    meshNode.getWorldQuaternion(meshWorldQ);

    const localQ = meshWorldQ.clone().invert().multiply(worldQ);

    const localRot = new THREE.Euler().setFromQuaternion(localQ);

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

    <group ref={group} {...props} dispose={null}>
      <primitive object={clonedScene} />

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

                const bounds = activeConfig.bounds2D || { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H };
                const scaleX = activeConfig.useUniformScale ? (visualWidth / bounds.width) * activeConfig.printW : (visualWidth / bounds.width) * activeConfig.printW;
                const scaleY = activeConfig.useUniformScale ? (visualHeight / bounds.width) * activeConfig.printW : (visualHeight / bounds.height) * activeConfig.printH;

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

                const bounds = activeConfig.bounds2D || { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H };
                const scaleX = activeConfig.useUniformScale ? (visualWidth / bounds.width) * activeConfig.printW : (visualWidth / bounds.width) * activeConfig.printW;
                const scaleY = activeConfig.useUniformScale ? (visualHeight / bounds.width) * activeConfig.printW : (visualHeight / bounds.height) * activeConfig.printH;

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

      // Use a fresh matrix for the multiplication to avoid in-place mutation bugs
      const groupInverse = new THREE.Matrix4().copy(groupRef.current.matrixWorld).invert();
      const meshToGroup = new THREE.Matrix4().multiplyMatrices(groupInverse, meshRef.current.matrixWorld);

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