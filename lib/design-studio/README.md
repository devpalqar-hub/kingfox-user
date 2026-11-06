# Design Studio v2 (prototype)

Route: `/design-studio/v2` (noindex). The old studio under `/design-studio/workspace/[id]` is untouched.

## Idea

One **print rectangle** per garment + view (`printZones.ts`) drives everything:

| Piece | File | What it does |
|---|---|---|
| Zone config | `printZones.ts` | centre (cm on the garment) + size (mm). Size is also the 2D frame size; 1 layer unit = 1 mm. |
| Garment normalising | `garment.ts` | Bakes the GLB (skinned or not) to one static mesh, centred, scaled to `realHeightCm`, front facing +Z. |
| Print surface | `printSurface.ts` | Height-field that follows the outermost fabric under the rectangle; u/v map 1:1 to the frame. Independent of mesh topology and UVs. |
| Frame renderer | `frameRenderer.ts` | `drawFrame()` is used for the 2D editor, the 3D texture and the 300 DPI export. |

## QA flags

- `?testcard=1` puts a numbered calibration card (coloured corners TL/TR/BL/BR, TOP, circle) on both sides.
- `?view=back` opens the back.
- `?garment=shirt|oversized` picks the garment (buttons at the top do the same).

Garments done: `shirt`, `oversized` (`oversized-tee.glb`, 74 cm, zone 300x380 mm, centre 6 cm above middle; rigged A-pose mesh, baked by `garment.ts` with no changes).

The corner squares must sit on the dashed print-area corners in 3D, and text must read the right way round on both sides.

## Adding the next garment

1. Add a `GarmentSpec` to `GARMENTS` (`modelUrl`, `realHeightCm`, `rotateYDeg` so the front faces +Z).
2. Open `/design-studio/v2?testcard=1` with that garment, check the bake looks right (no collapsed mesh, correct facing).
3. Move `centerCm` / `sizeMm` until the dashed rectangle sits where the print should go (front and back).
4. Check the test card on both sides.

Hoodie / long-sleeve GLBs have known problems (offsets, duplicate primitives, scale — see `debug-analysis.md`); expect to clean them first.
