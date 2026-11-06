"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { Layer } from "@/types/design-studio";
import type { GarmentSpec, StudioView } from "@/lib/design-studio/printZones";
import { PREVIEW_PX_PER_MM } from "@/lib/design-studio/printZones";
import { bakeGarment } from "@/lib/design-studio/garment";
import { buildPrintSurface } from "@/lib/design-studio/printSurface";
import {
  createZoneGuideCanvas,
  drawFrame,
  preloadLayerImages,
  type FrameSpec,
} from "@/lib/design-studio/frameRenderer";

interface SceneProps {
  spec: GarmentSpec;
  colorHex: string;
  view: StudioView;
  layers: Record<StudioView, Layer[]>;
  showZone: boolean;
}

const VIEWS: StudioView[] = ["front", "back"];

function GarmentScene({ spec, colorHex, view, layers, showZone }: SceneProps) {
  const { scene } = useGLTF(spec.modelUrl);
  const group = useRef<THREE.Group>(null);

  const garment = useMemo(() => bakeGarment(scene, spec), [scene, spec]);

  const surfaces3d = useMemo(
    () => ({
      front: buildPrintSurface(garment.geometry, spec.zones.front, "front"),
      back: buildPrintSurface(garment.geometry, spec.zones.back, "back"),
    }),
    [garment, spec],
  );

  // One transparent texture per view, redrawn from the layers with the SAME
  // drawFrame() the 2D editor uses.
  const surfaces = useMemo(() => {
    const make = (v: StudioView) => {
      const canvas = document.createElement("canvas");
      // Size the canvas up front: WebGL textures can't change size after the
      // first upload, so an early render at the default 300x150 would leave
      // the print blank.
      drawFrame(canvas, { widthMm: spec.zones[v].sizeMm[0], heightMm: spec.zones[v].sizeMm[1] }, [], {
        scale: PREVIEW_PX_PER_MM,
      });
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      const [w, h] = spec.zones[v].sizeMm;
      const guide = new THREE.CanvasTexture(createZoneGuideCanvas({ widthMm: w, heightMm: h }));
      guide.colorSpace = THREE.SRGBColorSpace;
      return { canvas, texture, guide };
    };
    return { front: make("front"), back: make("back") };
  }, [spec]);

  useEffect(() => {
    let cancelled = false;
    VIEWS.forEach((v) => {
      const [w, h] = spec.zones[v].sizeMm;
      const frame: FrameSpec = { widthMm: w, heightMm: h };
      preloadLayerImages(layers[v]).then(() => {
        if (cancelled) return;
        drawFrame(surfaces[v].canvas, frame, layers[v], { scale: PREVIEW_PX_PER_MM });
        surfaces[v].texture.needsUpdate = true;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [layers, spec, surfaces]);

  useFrame((_s, delta) => {
    if (group.current) {
      easing.dampE(group.current.rotation, [0, view === "back" ? Math.PI : 0, 0], 0.25, delta);
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={garment.geometry}>
        <meshStandardMaterial color={colorHex} roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {VIEWS.map((v) => {
        const printGeometry = surfaces3d[v];
        if (!printGeometry) return null;
        return (
          <group key={v}>
            <mesh geometry={printGeometry} renderOrder={2}>
              <meshStandardMaterial
                map={surfaces[v].texture}
                transparent
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-4}
                roughness={0.9}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
            {showZone && (
              <mesh geometry={printGeometry} renderOrder={3}>
                <meshBasicMaterial
                  map={surfaces[v].guide}
                  transparent
                  depthWrite={false}
                  polygonOffset
                  polygonOffsetFactor={-6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function GarmentViewer(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 150], fov: 30 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[2, 4, 5]} intensity={1.0} />
      <directionalLight position={[-2, 4, 5]} intensity={0.6} />
      <directionalLight position={[2, 4, -5]} intensity={1.0} />
      <directionalLight position={[-2, 4, -5]} intensity={0.6} />
      <Suspense fallback={null}>
        <GarmentScene {...props} />
      </Suspense>
      <OrbitControls enablePan={false} enableRotate={false} minDistance={70} maxDistance={260} />
    </Canvas>
  );
}
