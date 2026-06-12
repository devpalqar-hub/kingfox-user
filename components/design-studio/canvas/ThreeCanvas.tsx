"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Center, OrbitControls } from "@react-three/drei";
import ShirtModel from "./ShirtModel";

export default function ThreeCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
      }}
      shadows
      camera={{ position: [0, 0, 2.5], fov: 25 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.5} />
      <Environment preset="city" />

      <Center>
        <ShirtModel />
      </Center>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
