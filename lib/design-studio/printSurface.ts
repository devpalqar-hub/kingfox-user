import * as THREE from "three";
import type { PrintZone, StudioView } from "./printZones";

// Grid spacing of the print surface, in cm. 0.25 cm = 2.5 mm.
const STEP_CM = 0.25;
// How far the print floats above the fabric, in cm (prevents z-fighting).
const LIFT_CM = 0.06;
const SAMPLE_EPS = 1e-4;

/**
 * Builds the surface the print is drawn on: a height-field that follows the
 * OUTERMOST fabric under the print rectangle.
 *
 * For every point of the rectangle we look straight along the view axis and
 * take the outermost garment surface, so the result does not depend on how the
 * mesh is triangulated, whether it has an inner lining, or on folds/overhangs.
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
  const dirZ = view === "front" ? 1 : -1;
  const [cx, cy] = zone.centerCm;
  const w = zone.sizeMm[0] / 10;
  const h = zone.sizeMm[1] / 10;

  const nx = Math.ceil(w / STEP_CM) + 1;
  const ny = Math.ceil(h / STEP_CM) + 1;
  const dx = w / (nx - 1);
  const dy = h / (ny - 1);
  // World x of grid column i. The viewer's "right" is +X from the front and -X from the back.
  const worldX = (i: number) => cx + dirZ * (-w / 2 + i * dx);
  const worldY = (j: number) => cy - h / 2 + j * dy;

  const src = garment.index ? garment.toNonIndexed() : garment;
  const pos = src.getAttribute("position");

  const xLo = cx - w / 2;
  const xHi = cx + w / 2;
  const yLo = cy - h / 2;
  const yHi = cy + h / 2;

  // Outermost distance along the view axis at every grid vertex.
  const depth = new Float32Array(nx * ny).fill(-Infinity);

  for (let t = 0; t < pos.count; t += 3) {
    const ax = pos.getX(t), ay = pos.getY(t), az = pos.getZ(t) * dirZ;
    const bx = pos.getX(t + 1), by = pos.getY(t + 1), bz = pos.getZ(t + 1) * dirZ;
    const qx = pos.getX(t + 2), qy = pos.getY(t + 2), qz = pos.getZ(t + 2) * dirZ;

    const tMinX = Math.min(ax, bx, qx), tMaxX = Math.max(ax, bx, qx);
    const tMinY = Math.min(ay, by, qy), tMaxY = Math.max(ay, by, qy);
    if (tMaxX < xLo || tMinX > xHi || tMaxY < yLo || tMinY > yHi) continue;

    const det = (by - qy) * (ax - qx) + (qx - bx) * (ay - qy);
    if (Math.abs(det) < 1e-9) continue; // edge-on in this projection

    // Grid columns covered by this triangle. Columns run +X from the front and -X from the back.
    const colA = dirZ > 0 ? (tMinX - xLo) / dx : (xHi - tMinX) / dx;
    const colB = dirZ > 0 ? (tMaxX - xLo) / dx : (xHi - tMaxX) / dx;
    const lo = Math.max(0, Math.floor(Math.min(colA, colB)) - 1);
    const hi = Math.min(nx - 1, Math.ceil(Math.max(colA, colB)) + 1);
    const j0 = Math.max(0, Math.floor((tMinY - yLo) / dy) - 1);
    const j1 = Math.min(ny - 1, Math.ceil((tMaxY - yLo) / dy) + 1);

    for (let j = j0; j <= j1; j++) {
      const py = worldY(j);
      for (let i = lo; i <= hi; i++) {
        const px = worldX(i);
        const l1 = ((by - qy) * (px - qx) + (qx - bx) * (py - qy)) / det;
        const l2 = ((qy - ay) * (px - qx) + (ax - qx) * (py - qy)) / det;
        const l3 = 1 - l1 - l2;
        if (l1 < -SAMPLE_EPS || l2 < -SAMPLE_EPS || l3 < -SAMPLE_EPS) continue;
        const z = l1 * az + l2 * bz + l3 * qz;
        const idx = j * nx + i;
        if (z > depth[idx]) depth[idx] = z;
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
      positions[idx * 3] = worldX(i);
      positions[idx * 3 + 1] = worldY(j);
      positions[idx * 3 + 2] = (d === -Infinity ? 0 : d + LIFT_CM) * dirZ;
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
