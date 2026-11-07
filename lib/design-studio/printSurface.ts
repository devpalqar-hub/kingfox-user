import * as THREE from "three";
import { VIEW_BASES, type PrintZone, type StudioView } from "./printZones";

// Grid spacing of the print surface, in cm. 0.25 cm = 2.5 mm.
const STEP_CM = 0.25;
// How far the print floats above the fabric, in cm (prevents z-fighting).
const LIFT_CM = 0.06;
const SAMPLE_EPS = 1e-4;

/**
 * Builds the surface the print is drawn on: a height-field that follows the
 * OUTERMOST fabric under the print rectangle.
 *
 * For every point of the rectangle we look straight along the view axis
 * (±Z for front/back, ±X for the sleeves) and take the outermost garment
 * surface, so the result does not depend on how the mesh is triangulated,
 * whether it has an inner lining, or on folds/overhangs.
 * u/v map 1:1 onto the 2D frame:
 *   u = 0..1 left→right and v = 0..1 bottom→top, as the viewer sees it.
 *
 * Quads where there is no garment under the rectangle are left out, so the
 * print never floats in empty air past the garment's edge.
 */
export function buildPrintSurface(
  garment: THREE.BufferGeometry,
  zone: PrintZone,
  view: StudioView,
): THREE.BufferGeometry | null {
  const { out, right } = VIEW_BASES[view];
  const [ca, cb] = zone.centerCm; // a = along viewer-right, b = up (world Y)
  const w = zone.sizeMm[0] / 10;
  const h = zone.sizeMm[1] / 10;

  const nx = Math.ceil(w / STEP_CM) + 1;
  const ny = Math.ceil(h / STEP_CM) + 1;
  const dx = w / (nx - 1);
  const dy = h / (ny - 1);
  const gridA = (i: number) => ca - w / 2 + i * dx;
  const gridB = (j: number) => cb - h / 2 + j * dy;

  const src = garment.index ? garment.toNonIndexed() : garment;
  const pos = src.getAttribute("position");

  const aLo = ca - w / 2;
  const aHi = ca + w / 2;
  const bLo = cb - h / 2;
  const bHi = cb + h / 2;

  // World → view space: a = dot(p, right), b = p.y, d = dot(p, out).
  const toA = (x: number, y: number, z: number) => right[0] * x + right[1] * y + right[2] * z;
  const toD = (x: number, y: number, z: number) => out[0] * x + out[1] * y + out[2] * z;

  // Outermost distance along the view axis at every grid vertex.
  const depth = new Float32Array(nx * ny).fill(-Infinity);

  for (let t = 0; t < pos.count; t += 3) {
    const x0 = pos.getX(t), y0 = pos.getY(t), z0 = pos.getZ(t);
    const x1 = pos.getX(t + 1), y1 = pos.getY(t + 1), z1 = pos.getZ(t + 1);
    const x2 = pos.getX(t + 2), y2 = pos.getY(t + 2), z2 = pos.getZ(t + 2);

    const ax = toA(x0, y0, z0), ay = y0, az = toD(x0, y0, z0);
    const bx = toA(x1, y1, z1), by = y1, bz = toD(x1, y1, z1);
    const qx = toA(x2, y2, z2), qy = y2, qz = toD(x2, y2, z2);

    const tMinA = Math.min(ax, bx, qx), tMaxA = Math.max(ax, bx, qx);
    const tMinB = Math.min(ay, by, qy), tMaxB = Math.max(ay, by, qy);
    if (tMaxA < aLo || tMinA > aHi || tMaxB < bLo || tMinB > bHi) continue;

    const det = (by - qy) * (ax - qx) + (qx - bx) * (ay - qy);
    if (Math.abs(det) < 1e-9) continue; // edge-on in this projection

    // Grid columns / rows covered by this triangle.
    const lo = Math.max(0, Math.floor((tMinA - aLo) / dx) - 1);
    const hi = Math.min(nx - 1, Math.ceil((tMaxA - aLo) / dx) + 1);
    const j0 = Math.max(0, Math.floor((tMinB - bLo) / dy) - 1);
    const j1 = Math.min(ny - 1, Math.ceil((tMaxB - bLo) / dy) + 1);

    for (let j = j0; j <= j1; j++) {
      const pb = gridB(j);
      for (let i = lo; i <= hi; i++) {
        const pa = gridA(i);
        const l1 = ((by - qy) * (pa - qx) + (qx - bx) * (pb - qy)) / det;
        const l2 = ((qy - ay) * (pa - qx) + (ax - qx) * (pb - qy)) / det;
        const l3 = 1 - l1 - l2;
        if (l1 < -SAMPLE_EPS || l2 < -SAMPLE_EPS || l3 < -SAMPLE_EPS) continue;
        const d = l1 * az + l2 * bz + l3 * qz;
        const idx = j * nx + i;
        if (d > depth[idx]) depth[idx] = d;
      }
    }
  }

  // Close pinholes (vertices that fell between triangles) from valid neighbours.
  for (let pass = 0; pass < 2; pass++) {
    const next = depth.slice();
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        if (depth[j * nx + i] !== -Infinity) continue;
        let sum = 0;
        let n = 0;
        for (let oj = -1; oj <= 1; oj++) {
          for (let oi = -1; oi <= 1; oi++) {
            if (!oi && !oj) continue;
            const ii = i + oi;
            const jj = j + oj;
            if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue;
            const d = depth[jj * nx + ii];
            if (d !== -Infinity) {
              sum += d;
              n++;
            }
          }
        }
        if (n >= 5) next[j * nx + i] = sum / n;
      }
    }
    depth.set(next);
  }

  const positions = new Float32Array(nx * ny * 3);
  const uvs = new Float32Array(nx * ny * 2);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j * nx + i;
      const d = depth[idx];
      const a = gridA(i);
      const dd = d === -Infinity ? 0 : d + LIFT_CM;
      // View space → world: p = right*a + Y*b + out*d.
      positions[idx * 3] = right[0] * a + out[0] * dd;
      positions[idx * 3 + 1] = gridB(j) + right[1] * a + out[1] * dd;
      positions[idx * 3 + 2] = right[2] * a + out[2] * dd;
      uvs[idx * 2] = i / (nx - 1);
      uvs[idx * 2 + 1] = j / (ny - 1);
    }
  }

  const indices: number[] = [];
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      if (
        depth[a] === -Infinity || depth[b] === -Infinity ||
        depth[c] === -Infinity || depth[d] === -Infinity
      ) {
        continue;
      }
      indices.push(a, c, b, b, c, d);
    }
  }
  if (!indices.length) return null;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
