"use client";

import { useGLTF, Decal, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function ShirtModel() {
  const { project, activeView } = useDesignStore();

  // The user will need the shirt_baked.glb in their public folder
  const { nodes, materials } = useGLTF('/shirt_baked.glb') as any;
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
        delta
      );
    }

    // Rotate model to show back if active view is back
    const targetRotation = activeView === 'back' ? Math.PI : 0;
    if (group.current) {
      easing.dampE(
        group.current.rotation,
        [0, targetRotation, 0],
        0.25,
        delta
      );
    }
  });

  // Helper to map 2D editor coordinates (500x600 canvas) to 3D spatial offsets
  const get3DPosition = (layer: any, baseZ: number, isBack: boolean = false) => {
    // Canvas center is 250, 300
    const centerX = layer.x + (layer.width / 2);
    const centerY = layer.y + (layer.height / 2);

    // 500px in 2D roughly equals 1 unit in 3D (based on scale factor)
    const offsetX = (centerX - 250) / 500;
    // Y is inverted in 3D vs DOM
    const offsetY = -(centerY - 300) / 500;

    // Adjust base Y to be around the chest (0.05 is the baseline we used)
    return [isBack ? -offsetX : offsetX, 0.05 + offsetY, baseZ];
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

          if (layer.type === 'image') {
            return (
              <DecalTexture
                key={layer.id}
                layer={layer as any}
                position={pos}
              />
            );
          }
          if (layer.type === 'text') {
            return (
              <DecalText
                key={layer.id}
                layer={layer as any}
                position={pos}
              />
            );
          }
          if (layer.type === 'line') {
            return (
              <DecalLine
                key={layer.id}
                layer={layer as any}
                position={pos}
              />
            );
          }
          return null;
        })}

        {backLayers.map((layer) => {
          if (!layer.isVisible) return null;
          const pos = get3DPosition(layer, -0.15, true);

          if (layer.type === 'image') {
            return (
              <DecalTexture
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={[0, Math.PI, 0]}
              />
            );
          }
          if (layer.type === 'text') {
            return (
              <DecalText
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={[0, Math.PI, 0]}
              />
            );
          }
          if (layer.type === 'line') {
            return (
              <DecalLine
                key={layer.id}
                layer={layer as any}
                position={pos}
                rotation={[0, Math.PI, 0]}
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
  const texture = useTexture(
    layer.asset.originalUrl
  ) as THREE.Texture & {
    image?: HTMLImageElement;
  };

  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 1;
  const baseScale = layer.width / 500; // Use layer width as scale factor

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[baseScale * aspect, baseScale, 0.15]}
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
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Clear background (transparent)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Text
      ctx.fillStyle = layer.colorHex || '#ffffff';
      ctx.font = `bold ${layer.fontSize * 1.5}px ${layer.fontFamily || 'Arial'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.text, canvas.width / 2, canvas.height / 2);

      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.needsUpdate = true;
      setTexture(newTexture);
    }
  }, [layer.text, layer.colorHex, layer.fontSize, layer.fontFamily]);

  if (!texture) return null;

  const baseScale = layer.width / 500;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[baseScale, baseScale * 0.25, 0.15]} // Text aspect ratio normalized to the canvas (1024x256)
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
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = layer.colorHex || '#ffffff';
      // Use thickness relative to height
      const thickness = Math.max(1, Math.min(layer.thickness * 2, canvas.height));
      const yStart = (canvas.height - thickness) / 2;
      ctx.fillRect(0, yStart, canvas.width, thickness);

      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.needsUpdate = true;
      setTexture(newTexture);
    }
  }, [layer.colorHex, layer.thickness]);

  if (!texture) return null;

  const baseScale = layer.width / 500;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[baseScale, baseScale * 0.125, 0.15]}
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

useGLTF.preload('/shirt_baked.glb');
