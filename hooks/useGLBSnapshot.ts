"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface SnapshotOptions {
  modelUrl: string;
  colorHex: string;
  width?: number;
  height?: number;
}

interface Snapshots {
  front: string | null;
  back: string | null;
  loading: boolean;
}

// ─── Auto-fit camera to mesh bounding sphere ──────────────────────────────────
// Given the bounding sphere radius, compute the camera Z distance so the model
// fills ~85% of the frame height. Works for any mesh size, no per-model config.
function autoFitCameraZ(
  sphere: THREE.Sphere,
  fovDeg: number,
  aspect: number,
): number {
  const r = sphere.radius;
  // Effective FOV: use the smaller of horizontal / vertical FOV so the model
  // fits fully in the shorter dimension.
  const fovRad = (fovDeg * Math.PI) / 180;
  const effectiveFov = aspect < 1
    ? 2 * Math.atan(Math.tan(fovRad / 2) * aspect)   // horizontal is limiting
    : fovRad;                                          // vertical is limiting

  // Distance so radius = 85% of half-frame
  const fillFactor = 0.85;
  const dist = r / (Math.tan(effectiveFov / 2) * fillFactor);
  return dist;
}

export function useGLBSnapshot({
  modelUrl,
  colorHex,
  width = 800,
  height = 960,
}: SnapshotOptions): Snapshots {
  const [snapshots, setSnapshots] = useState<Snapshots>({
    front: null,
    back: null,
    loading: true,
  });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!modelUrl) return;
    let cancelled = false;

    async function render() {
      setSnapshots(s => ({ ...s, loading: true }));

      // ── Off-screen renderer ─────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(2);                          // retina quality
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = false;                 // not needed for snapshot
      rendererRef.current = renderer;

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = null;                            // transparent PNG

      // ── Lighting ─────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(1.5, 3, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.5);
      fill.position.set(-2, 0, 2);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 0.25);
      rim.position.set(0, -2, -3);
      scene.add(rim);

      // ── Load GLB ─────────────────────────────────────────────────────────
      const loader = new GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(modelUrl, resolve, undefined, reject);
      });

      if (cancelled) { renderer.dispose(); return; }

      const modelScene = gltf.scene;

      // ── Apply brand color to all meshes ───────────────────────────────────
      modelScene.traverse((obj: any) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat: any) => {
            if (mat.color) {
              mat.color.set(colorHex);
            }
            mat.needsUpdate = true;
          });
        }
      });

      scene.add(modelScene);

      // ── Auto-centre and compute bounding sphere ───────────────────────────
      const box = new THREE.Box3().setFromObject(modelScene);
      const center = box.getCenter(new THREE.Vector3());
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);

      // Shift model so its centre is at the world origin
      modelScene.position.sub(center);

      // ── Auto-fit camera ───────────────────────────────────────────────────
      const FOV = 30;
      const aspect = width / height;
      const camZ = autoFitCameraZ(sphere, FOV, aspect);

      const camera = new THREE.PerspectiveCamera(FOV, aspect, 0.01, camZ * 10);
      camera.position.set(0, 0, camZ);
      camera.lookAt(0, 0, 0);

      // ── Front render ──────────────────────────────────────────────────────
      modelScene.rotation.set(0, 0, 0);
      renderer.render(scene, camera);
      const frontDataUrl = renderer.domElement.toDataURL("image/png", 1.0);

      // ── Back render ───────────────────────────────────────────────────────
      modelScene.rotation.set(0, Math.PI, 0);
      renderer.render(scene, camera);
      const backDataUrl = renderer.domElement.toDataURL("image/png", 1.0);

      if (!cancelled) {
        setSnapshots({ front: frontDataUrl, back: backDataUrl, loading: false });
      }

      renderer.dispose();
      rendererRef.current = null;
    }

    render().catch(console.error);

    return () => {
      cancelled = true;
      rendererRef.current?.dispose();
    };
  }, [modelUrl, colorHex, width, height]);

  return snapshots;
}
