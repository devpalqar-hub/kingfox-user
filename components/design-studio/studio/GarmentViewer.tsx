"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { Layer } from "@/types/design-studio";
import {
  PREVIEW_PX_PER_MM,
  VIEW_BASES,
  viewsOf,
  type GarmentSpec,
  type StudioView,
} from "@/lib/design-studio/printZones";
import { bakeGarment } from "@/lib/design-studio/garment";
import { buildPrintSurface } from "@/lib/design-studio/printSurface";
import {
  createZoneGuideCanvas,
  drawFrame,
  preloadLayerImages,
  type FrameSpec,
} from "@/lib/design-studio/frameRenderer";

/** Imperative handle used at checkout to snapshot the garment per view. */
export interface ViewerApi {
  capture: (view: StudioView) => string;
}

interface SceneProps {
  spec: GarmentSpec;
  colorHex: string;
  view: StudioView;
  layers: Partial<Record<StudioView, Layer[]>>;
  showZone: boolean;
  apiRef?: React.MutableRefObject<ViewerApi | null>;
}

function GarmentScene({ spec, colorHex, view, layers, showZone, apiRef }: SceneProps) {
  const { scene } = useGLTF(spec.modelUrl);
  const group = useRef<THREE.Group>(null);
  const { gl, scene: rootScene, camera, size } = useThree();

  const views = useMemo(() => viewsOf(spec), [spec]);
  const garment = useMemo(() => bakeGarment(scene, spec), [scene, spec]);

  // Pull the camera back until the whole garment (arms out) fits the canvas,
  // however narrow the viewer card is. 1.87 = 1 / (2·tan(fov/2)) for fov 30°.
  const aspect = Math.max(0.2, size.width / size.height);
  const fitDistance = Math.max(150, (Math.max(garment.sizeCm.x, garment.sizeCm.z) * 1.12 * 1.87) / aspect);
  useEffect(() => {
    camera.position.setLength(fitDistance);
  }, [camera, fitDistance]);

  const surfaces3d = useMemo(() => {
    const out: Partial<Record<StudioView, THREE.BufferGeometry | null>> = {};
    for (const v of views) out[v] = buildPrintSurface(garment.body, spec.zones[v]!, v);
    return out;
  }, [garment, spec, views]);

  // One transparent texture per view, redrawn from the layers with the SAME
  // drawFrame() the 2D editor uses.
  const surfaces = useMemo(() => {
    const make = (v: StudioView) => {
      const canvas = document.createElement("canvas");
      // Size the canvas up front: WebGL textures can't change size after the
      // first upload, so an early render at the default 300x150 would leave
      // the print blank.
      const [w, h] = spec.zones[v]!.sizeMm;
      drawFrame(canvas, { widthMm: w, heightMm: h }, [], { scale: PREVIEW_PX_PER_MM });
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      const guide = new THREE.CanvasTexture(createZoneGuideCanvas({ widthMm: w, heightMm: h }));
      guide.colorSpace = THREE.SRGBColorSpace;
      return { canvas, texture, guide };
    };
    const out: Partial<Record<StudioView, ReturnType<typeof make>>> = {};
    for (const v of views) out[v] = make(v);
    return out;
  }, [spec, views]);

  useEffect(() => {
    let cancelled = false;
    views.forEach((v) => {
      const [w, h] = spec.zones[v]!.sizeMm;
      const frame: FrameSpec = { widthMm: w, heightMm: h };
      const content = layers[v] ?? [];
      preloadLayerImages(content).then(() => {
        if (cancelled) return;
        drawFrame(surfaces[v]!.canvas, frame, content, { scale: PREVIEW_PX_PER_MM });
        surfaces[v]!.texture.needsUpdate = true;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [layers, spec, surfaces, views]);

  // Checkout snapshots: rotate instantly to the requested view and render once.
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      capture: (v: StudioView) => {
        const g = group.current;
        const prevRot = g ? g.rotation.y : 0;
        const prevPos = camera.position.clone();
        const prevQuat = camera.quaternion.clone();
        if (g) g.rotation.set(0, VIEW_BASES[v].rotationY, 0);
        // Canonical straight-on camera so snapshots don't depend on how the
        // user last orbited the preview.
        camera.position.set(0, 0, fitDistance);
        camera.lookAt(0, 0, 0);
        gl.render(rootScene, camera);
        const url = gl.domElement.toDataURL("image/png");
        camera.position.copy(prevPos);
        camera.quaternion.copy(prevQuat);
        if (g) g.rotation.set(0, prevRot, 0);
        return url;
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, gl, rootScene, camera, fitDistance]);

  useFrame((_s, delta) => {
    if (group.current) {
      easing.dampE(group.current.rotation, [0, VIEW_BASES[view].rotationY, 0], 0.25, delta);
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={garment.display}>
        <meshStandardMaterial color={colorHex} roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {views.map((v) => {
        const printGeometry = surfaces3d[v];
        if (!printGeometry) return null;
        return (
          <group key={v}>
            <mesh geometry={printGeometry} renderOrder={2}>
              <meshStandardMaterial
                map={surfaces[v]!.texture}
                transparent
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-4}
                roughness={0.9}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
            {showZone && v === view && (
              <mesh geometry={printGeometry} renderOrder={3}>
                <meshBasicMaterial
                  map={surfaces[v]!.guide}
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
      <OrbitControls
        enablePan={false}
        minDistance={70}
        maxDistance={420}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}
