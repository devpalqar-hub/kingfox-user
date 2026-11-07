"use client";

import { use } from "react";
import Studio from "@/components/design-studio/studio/Studio";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <Studio categoryId={decodeURIComponent(id)} />;
}
