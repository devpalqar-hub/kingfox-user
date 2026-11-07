import * as THREE from "three";
import type { GarmentSpec } from "./printZones";

export interface BakedGarment {
  /** Body fabric only — used to build the print surfaces. Centred, units = cm. */
  body: THREE.BufferGeometry;
  /** Everything (body + collar, buttons, tags…) — what is rendered. Same space as `body`. */
  display: THREE.BufferGeometry;
  /** Bounding-box size of the body in cm. */
  sizeCm: THREE.Vector3;
}

/**
 * Turns a loaded GLB (possibly a rigged / skinned mesh with a scaled root)
 * into static, normalised geometry. Doing this once replaces all the
 * per-model hacks (offsets, scales, duplicate primitives): downstream code
 * only ever sees "centred, cm, front faces +Z".
 *
 * The normalising transform (scale + centre) is computed from the BODY meshes
 * only (small meshes like buttons and neck tags are excluded), so print-zone
 * calibrations are not affected by trims. The small meshes are still baked —
 * into `display` — so the garment renders complete (e.g. the polo collar).
 */
export function bakeGarment(root: THREE.Object3D, spec: GarmentSpec): BakedGarment {
  root.updateMatrixWorld(true);

  // Body = every substantial mesh (some GLBs split front/back/sleeves). Small
  // meshes (buttons, neck tags, labels) only go into the display geometry.
  const meshes: THREE.Mesh[] = [];
  let mainCount = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes.push(mesh);
    mainCount = Math.max(mainCount, mesh.geometry.getAttribute("position").count);
  });
  const isBody = (m: THREE.Mesh) =>
    m.geometry.getAttribute("position").count >= mainCount * 0.2;
  if (!meshes.some(isBody)) throw new Error(`[garment] no mesh found in ${spec.modelUrl}`);

  const merge = (source: THREE.Mesh[]): THREE.BufferGeometry => {
    const positions: number[] = [];
    const indices: number[] = [];
    const v = new THREE.Vector3();
    for (const mesh of source) {
      const skinned = (mesh as THREE.SkinnedMesh).isSkinnedMesh
        ? (mesh as THREE.SkinnedMesh)
        : null;
      skinned?.skeleton.update();
      const geometrySrc = mesh.geometry;
      const position = geometrySrc.getAttribute("position");
      const offset = positions.length / 3;
      for (let i = 0; i < position.count; i++) {
        if (skinned) skinned.getVertexPosition(i, v);
        else v.fromBufferAttribute(position, i);
        v.applyMatrix4(mesh.matrixWorld);
        positions.push(v.x, v.y, v.z);
      }
      if (geometrySrc.index) {
        for (let i = 0; i < geometrySrc.index.count; i++) {
          indices.push(geometrySrc.index.getX(i) + offset);
        }
      } else {
        for (let i = 0; i < position.count; i++) indices.push(i + offset);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(indices);
    return geometry;
  };

  const body = merge(meshes.filter(isBody));
  const display = merge(meshes);

  // Normalising transform from the body bbox, applied to both geometries.
  if (spec.rotateYDeg) {
    body.rotateY(THREE.MathUtils.degToRad(spec.rotateYDeg));
    display.rotateY(THREE.MathUtils.degToRad(spec.rotateYDeg));
  }

  body.computeBoundingBox();
  const rawSize = body.boundingBox!.getSize(new THREE.Vector3());
  const k = spec.realHeightCm / rawSize.y;
  body.scale(k, k, k);
  display.scale(k, k, k);

  body.computeBoundingBox();
  const center = body.boundingBox!.getCenter(new THREE.Vector3());
  body.translate(-center.x, -center.y, -center.z);
  display.translate(-center.x, -center.y, -center.z);

  for (const g of [body, display]) {
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
  }

  return {
    body,
    display,
    sizeCm: body.boundingBox!.getSize(new THREE.Vector3()),
  };
}
