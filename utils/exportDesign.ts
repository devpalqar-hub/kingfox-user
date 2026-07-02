/**
 * exportDesign.ts
 *
 * Composites the GLB snapshot background and the design layer canvas into a
 * single high-resolution PNG suitable for print (300 DPI equivalent at
 * default 2400×2880 output).
 *
 * Usage:
 *   import { exportFlatDesign } from "@/utils/exportDesign";
 *
 *   const dataUrl = await exportFlatDesign(
 *     glbSnapshots.front,           // base64 data URL from useGLBSnapshot
 *     designCanvasElement,          // HTMLCanvasElement (Fabric / Konva)
 *     { x: 200, y: 180, w: 400, h: 380 }, // PRINT_BOUNDS for active model
 *   );
 *
 *   const a = document.createElement("a");
 *   a.href = dataUrl;
 *   a.download = "design-front.png";
 *   a.click();
 */

export async function exportFlatDesign(
  glbSnapshot: string,
  designCanvas: HTMLCanvasElement,
  printBounds: { x: number; y: number; w: number; h: number },
  outputWidth = 2400,
  outputHeight = 2880,
): Promise<string> {
  const scale = outputWidth / 800;

  const output = document.createElement("canvas");
  output.width = outputWidth;
  output.height = outputHeight;
  const ctx = output.getContext("2d")!;

  // 1. GLB snapshot as background (scaled up to output resolution)
  const bg = new Image();
  await new Promise<void>(r => { bg.onload = () => r(); bg.src = glbSnapshot; });
  ctx.drawImage(bg, 0, 0, outputWidth, outputHeight);

  // 2. Design layers composited over the scaled print zone
  ctx.drawImage(
    designCanvas,
    printBounds.x * scale,
    printBounds.y * scale,
    printBounds.w * scale,
    printBounds.h * scale,
  );

  return output.toDataURL("image/png", 1.0);
}
