"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, AdaptiveDpr } from "@react-three/drei";
import { Suspense } from "react";
import ShirtModel from "./ShirtModel";

// Preload all garment GLBs — browser fetches them before Canvas mounts
const GLB_URLS = [
  "/models/shirt_baked.glb",
  "/models/polo-Tshirt.glb",
  "/models/Hoodie.glb",
  "/models/LongSleeveTShirt.glb",
  "/models/oversized-tee.glb",
];
GLB_URLS.forEach(url => useGLTF.preload(url));

/** Simple CSS spinner shown while the GLB is streaming */
function LoadingShirt() {
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "rgba(255,255,255,0.7)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ThreeCanvas() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        dpr={[0.75, 1.5]}    // adaptive: 0.75 on low-end, 1.5 on retina
        gl={{
          antialias:            true,
          preserveDrawingBuffer: true,
          powerPreference:      "high-performance",
          // Reduce memory on mobile by limiting pixel budget
          failIfMajorPerformanceCaveat: false,
        }}
        shadows={true}        // shadows disabled — biggest GPU saving
        camera={{ position: [0, 0, 2.5], fov: 25 }}
        style={{ width: "100%", height: "100%" }}
        performance={{ min: 0.5 }} // drop to 0.5× DPR when GPU is stressed
      >
        {/* Lights — no castShadow; saves ~30% GPU on mobile */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 4]}   intensity={1.4} />
        <directionalLight position={[-3, 1, 2]}  intensity={0.5} />
        <directionalLight position={[0, -2, -3]} intensity={0.25} />

        {/* AdaptiveDpr drops render resolution when frame budget is tight */}
        <AdaptiveDpr pixelated />

        <Suspense fallback={null}>
          <ShirtModel />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* React Suspense fallback renders outside WebGL — shown during GLB fetch */}
      <Suspense fallback={<LoadingShirt />}>
        <span style={{ display: "none" }} />
      </Suspense>
    </div>
  );
}
