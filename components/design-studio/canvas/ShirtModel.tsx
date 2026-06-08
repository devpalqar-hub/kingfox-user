"use client";

import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function ShirtModel() {
  const { project, activeView } = useDesignStore();

  // The user will need the shirt_baked.glb in their public folder
  const { nodes, materials } = useGLTF("/shirt_baked.glb") as any;
  const group = useRef<THREE.Group>(null);

  const frontLayers = project.designs.front || [];
  const backLayers = project.designs.back || [];

  // Smoothly interpolate color
  useFrame((state, delta) => {
    if (materials?.lambert1) {
      easing.dampC(
        materials.lambert1.color,
        project.apparelConfig.colorHex,
        0.25,
        delta,
      );
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

  // The 3D shirt mesh printable area spans roughly this many Three.js units.
  // These were measured against the shirt_baked.glb geometry so that a
  // full-width layer in 2D maps edge-to-edge on the 3D mesh.
  const PRINT_3D_W = 0.36; // total printable width  in Three.js units
  const PRINT_3D_H = 0.44; // total printable height in Three.js units

  // Helper to map 2D editor coordinates (500x600 canvas) to 3D spatial offsets
  const get3DPosition = (
    layer: any,
    baseZ: number,
    isBack: boolean = false,
  ) => {
    // Centre of the layer in 2D pixel space
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;

    // Normalise to [-0.5, +0.5] range, then scale by the 3D print area.
    const offsetX = (centerX / CANVAS_W - 0.5) * PRINT_3D_W;
    // Y is inverted in 3D vs DOM
    const offsetY = -(centerY / CANVAS_H - 0.5) * PRINT_3D_H;

    return [isBack ? -offsetX : offsetX, offsetY, baseZ];
  };

  if (!nodes || !materials) return null;

  return (
    <group ref={group}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
      >
        {/* Render Decals dynamically */}
        {frontLayers.map((layer) => {
          if (!layer.isVisible) return null;
          const pos = get3DPosition(layer, 0.15, false);

          const rotZ = THREE.MathUtils.degToRad(layer.rotation || 0);
          const frontRotation: [number, number, number] = [0, 0, rotZ];

          if (layer.type === "image") {
            return (
              <DecalTexture
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={frontRotation}
              />
            );
          }
          if (layer.type === "text") {
            return (
              <DecalText
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={frontRotation}
              />
            );
          }
          if (layer.type === "line") {
            return (
              <DecalLine
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={frontRotation}
              />
            );
          }
          return null;
        })}

        {backLayers.map((layer) => {
          if (!layer.isVisible) return null;
          const pos = get3DPosition(layer, -0.15, true);

          const rotZb = THREE.MathUtils.degToRad(layer.rotation || 0);
          const backRotation: [number, number, number] = [0, Math.PI, rotZb];

          if (layer.type === "image") {
            return (
              <DecalTexture
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={backRotation}
              />
            );
          }
          if (layer.type === "text") {
            return (
              <DecalText
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={backRotation}
              />
            );
          }
          if (layer.type === "line") {
            return (
              <DecalLine
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={backRotation}
              />
            );
          }
          return null;
        })}
      </mesh>
    </group>
  );
}

// Subcomponent to load texture for individual decals safely
function DecalTexture({ layer, position, rotation = [0, 0, 0] }: any) {
  const texture = useTexture(layer.asset.originalUrl) as THREE.Texture & {
    image?: HTMLImageElement;
  };

  const scaleX = (layer.width / 500) * 0.36;
  const scaleY = (layer.height / 600) * 0.44;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[scaleX, scaleY, 0.15]}
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

// Subcomponent to generate dynamic text textures
function DecalText({ layer, position, rotation = [0, 0, 0] }: any) {
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

  const scaleX = (layer.width / 500) * 0.36;
  const scaleY = (layer.height / 600) * 0.44;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[scaleX, scaleY, 0.15]}
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
function DecalLine({ layer, position, rotation = [0, 0, 0] }: any) {
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

  const scaleX = (layer.width / 500) * 0.36;
  const scaleY = (layer.height / 600) * 0.44;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[scaleX, scaleY, 0.15]}
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

useGLTF.preload("/shirt_baked.glb");
