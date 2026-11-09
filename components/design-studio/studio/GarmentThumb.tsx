import type { GarmentImage } from "@/lib/design-studio/garmentImages";
import { garmentTint } from "./FrameEditor";

/** Small tinted picture of one side of the garment (view switcher thumbnails). */
export default function GarmentThumb({
  image,
  color,
}: {
  image?: GarmentImage;
  color: string;
}) {
  if (!image) return null;
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height: "100%",
        isolation: "isolate",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: garmentTint(color),
          WebkitMaskImage: `url(${image.src})`,
          maskImage: `url(${image.src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          mixBlendMode: "multiply",
        }}
      />
    </span>
  );
}
