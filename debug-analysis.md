# Root Cause Analysis — 3D Decal Rendering

## shirt_baked.glb (WORKING ✅)
- 1 node: `T_Shirt_male`, 1 mesh, 1 primitive
- Mesh is CENTERED AT ORIGIN: Y from -0.35 to 0.26
- Front face Z: 0.144
- Decal fires at Z=0.15 → lands just in front of mesh ✅
- nodes.T_Shirt_male exists → meshNode resolves correctly ✅

## hoodie.glb (BROKEN ❌)

### Problem 1: Y-OFFSET (critical)
- Mesh Y range: 1.04 → 1.69  (CENTER at Y≈1.37)
- It is NOT at origin — model is 1.37 units ABOVE Y=0
- `<Center>` from drei shifts the visual, but decal positions 
  are in the local group space BEFORE centering
- So decals fire at Y≈0 but mesh exists at Y≈1.37 → MISS!

### Problem 2: 24 primitives on 1 mesh
- The mesh has 24 duplicate primitives (all with identical bounds)
- Drei's Decal applies to one mesh — fine, but the mesh ref 
  needs to point to the rendered Three.js Mesh, not the GLTF node

### Problem 3: Material name changed
- No `lambert1` material — it's `FABRIC_1_FRONT_2212`
- Color interpolation was targeting `lambert1` by name — wrong material

## LongSleeveTshirt.glb (BROKEN ❌)

### Problem 1: SCALE (critical)
- Mesh coordinates in CENTIMETERS not meters (Y: 89 → 165)
- Shirt is in meters (Y: -0.35 → 0.26)
- Long sleeve is ~250x larger in coordinate space
- Our `modelScale = 0.61 / size.y = 0.61 / 75.6 ≈ 0.008` (tiny)
- But decal positions are still computed with PRINT_3D_W=0.36 (meter scale)
- Decals fire at [x, y, 0.15] but mesh exists at [0, 127, 0.008*15] → TOTAL MISS

### Problem 2: Not centered  
- Center of long sleeve: X≈-0.3, Y≈127, Z≈2.4
- Same Y-offset problem as hoodie

### Problem 3: 9 separate meshes
- Front body, back body, sleeves, collar etc. are all separate meshes
- Decal on one mesh = only applies to that piece

## THE FIX

The correct approach is to normalize all models to the same space as shirt_baked.glb:
1. Compute bounding box of scene
2. Translate scene to center it at origin
3. Scale scene so height = shirt_baked height (~0.61 units)
4. The decal positions and Z values (0.15, -0.15) will then be correct
5. Find the "front body" mesh specifically for the decal (largest, most centered mesh)
6. Adjust decal Z to match the actual front face Z of the normalized model

## Per-model decal mesh:
- shirt_baked: nodes.T_Shirt_male (1 mesh, always works)
- hoodie: scene traverse → 1 mesh (g Hoodie_MD) at normalized position
- long sleeve: node `Long_Sleeve_T-Shirt_Bahan_Dasar_FRONT_2657_0` (mesh[0]) = front body

## Decal position in SCALED space:
After normalization (scale ≈ 0.008 for long sleeve):
- Decal Z must use the NORMALIZED front Z: box.max.z * modelScale - modelCenter.z * modelScale
- PRINT_3D_W/H must also scale relative to actual model width/height
