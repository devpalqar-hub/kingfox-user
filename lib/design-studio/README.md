# Design Studio

Route: `/design-studio/select` → `/design-studio/workspace/[categoryId]`.
UI lives in `components/design-studio/studio/` (`Studio.tsx`, `FrameEditor.tsx`,
`GarmentViewer.tsx`).

## Idea

One **print rectangle** per garment + view (`printZones.ts`) drives everything:

| Piece | File | What it does |
|---|---|---|
| Zone config | `printZones.ts` | centre (cm on the garment) + size (mm) per view (`front`, `back`, `left`, `right` sleeve). Size is also the 2D frame size; 1 layer unit = 1 mm. `VIEW_BASES` holds each view's projection axes and rotation. |
| Garment normalising | `garment.ts` | Bakes the GLB (skinned or not) to static meshes, centred, scaled to `realHeightCm`, front facing +Z. `body` (big meshes) is used for the print surfaces; `display` (everything, incl. collar/buttons) is rendered. |
| Print surface | `printSurface.ts` | Height-field that follows the outermost fabric under the rectangle, projected along the view's axis (±Z chest, ±X sleeves); u/v map 1:1 to the frame. Independent of mesh topology and UVs. |
| Frame renderer | `frameRenderer.ts` | `drawFrame()` is used for the 2D editor, the 3D texture and the 300 DPI export. |

The 2D editor (`FrameEditor`) IS the print rectangle: whatever the user places
inside the dashed boundary is exactly what lands on the garment and in the
300 DPI print file sent with the order.

## Garments

`shirt`, `oversized`, `polo`, `hoodie`, `longsleeve` — all with front, back and both sleeve zones.
`CATEGORY_TO_GARMENT` maps the select-page category ids to these specs.

Zone centres were calibrated headlessly from the baked GLB geometry (chest
depth, per-band sleeve extents). Tees: mid-sleeve face; hoodie and long-sleeve: upper arm of the A-pose sleeve.

## QA

Open the workspace and use a high-contrast image to check:

- the artwork's corners land on the dashed print-area corners in 3D,
- text reads the right way round on every view (back and both sleeves),
- `createTestCardDataUrl()` in `frameRenderer.ts` still produces a numbered
  calibration card if precise checking is needed.

## Adding the next garment

1. Add a `GarmentSpec` to `GARMENTS` (`modelUrl`, `realHeightCm`, `rotateYDeg`
   so the front faces +Z) and map its category id in `CATEGORY_TO_GARMENT`.
2. Check the bake looks right (no collapsed mesh, correct facing).
3. Move `centerCm` / `sizeMm` until the dashed rectangle sits where the print
   should go on every view you enable.
