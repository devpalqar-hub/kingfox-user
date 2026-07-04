"use client";

import { useEffect } from "react";
import { useDesignStore } from "@/stores/design-studio/useDesignStore";
import { useGLBSnapshot } from "@/hooks/useGLBSnapshot";

// Must mirror the logic in ShirtModel.tsx exactly
function resolveModelUrl(categoryId: string): string {
  const n = categoryId.toLowerCase();
  if (n.includes("polo"))                                     return "/models/t-shirt-polo.glb";
  if (n.includes("hoodie") || n === "classic-hoodie")        return "/models/hoodie.glb";
  if (n.includes("long") || n.includes("full") || n.includes("sleeve")) return "/models/LongSleeveTShirt.glb";
  if (n.includes("oversize"))                                return "/models/oversized-tee.glb";
  return "/models/shirt_baked.glb";
}

export function GLBSnapshotProvider() {
  const { project, setGLBSnapshots } = useDesignStore();

  const modelUrl = resolveModelUrl(
    (project.apparelConfig.categoryId || "").toString()
  );

  const snapshots = useGLBSnapshot({
    modelUrl,
    colorHex: project.apparelConfig.colorHex,
    width: 800,
    height: 960,
  });

  useEffect(() => {
    setGLBSnapshots(snapshots);
  }, [snapshots, setGLBSnapshots]);

  return null;
}
