import React from "react";
import { getSiteUrl, createMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export default function Head() {
  const site = getSiteUrl();
  const title = "Customize — Design Studio | Kingfox";
  const description =
    "Pick a canvas and start customizing your apparel in the Kingfox Design Studio.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${site}/design-studio/select`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/design-studio/select`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <BreadcrumbJsonLd
        items={[{ name: "Design Studio", url: `${site}/design-studio/select` }]}
      />
    </>
  );
}
