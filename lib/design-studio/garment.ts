import * as THREE from "three";
import type { GarmentSpec } from "./printZones";

export interface BakedGarment {
  /** Static geometry, centred on its bounding box, units = cm. */
  geometry: THREE.BufferGeometry;
  /** Bounding-box size in cm. */
  sizeCm: THREE.Vector3;
}

/**
 * Turns a loaded GLB (possibly a rigged / skinned mesh with a scaled root)
 * into one static, normalised geometry. Doing this once replaces all the
 * per-model hacks (offsets, scales, duplicate primitives): downstream code
 * only ever sees "centred, cm, front faces +Z".
 */
export function bakeGarment(root: THREE.Object3D, spec: GarmentSpec): BakedGarment {
  root.updateMatrixWorld(true);

  // Body = every substantial mesh (some GLBs split front/back/sleeves). Small
  // meshes (buttons, neck tags, labels) are ignored.
  const meshes: THREE.Mesh[] = [];
  let mainCount = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes.push(mesh);
    mainCount = Math.max(mainCount, mesh.geometry.getAttribute("position").count);
  });
  const body = meshes.filter((m) => m.geometry.getAttribute("position").count >= mainCount * 0.2);
  if (!body.length) throw new Error(`[garment] no mesh found in ${spec.modelUrl}`);

  const positions: number[] = [];
  const indices: number[] = [];
  const v = new THREE.Vector3();
  for (const mesh of body) {
    const skinned = (mesh as THREE.SkinnedMesh).isSkinnedMesh ? (mesh as THREE.SkinnedMesh) : null;
    skinned?.skeleton.update();
    const source = mesh.geometry;
    const position = source.getAttribute("position");
    const offset = positions.length / 3;
    for (let i = 0; i < position.count; i++) {
      if (skinned) skinned.getVertexPosition(i, v);
      else v.fromBufferAttribute(position, i);
      v.applyMatrix4(mesh.matrixWorld);
      positions.push(v.x, v.y, v.z);
    }
    if (source.index) {
      for (let i = 0; i < source.index.count; i++) indices.push(source.index.getX(i) + offset);
    } else {
      for (let i = 0; i < position.count; i++) indices.push(i + offset);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(indices);

  if (spec.rotateYDeg) geometry.rotateY(THREE.MathUtils.degToRad(spec.rotateYDeg));

  geometry.computeBoundingBox();
  const rawSize = geometry.boundingBox!.getSize(new THREE.Vector3());
  const k = spec.realHeightCm / rawSize.y;
  geometry.scale(k, k, k);

  geometry.computeBoundingBox();
  const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return {
    geometry,
    sizeCm: geometry.boundingBox!.getSize(new THREE.Vector3()),
  };
}
