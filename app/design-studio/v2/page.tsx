import type { Metadata } from "next";
import StudioV2 from "@/components/design-studio/v2/StudioV2";

export const metadata: Metadata = {
  title: "Design Studio v2 (prototype) | KINGFOX",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <StudioV2 />;
}
