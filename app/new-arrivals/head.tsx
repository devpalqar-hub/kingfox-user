import React from "react";
import { getSiteUrl } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export default function Head() {
  const site = getSiteUrl();
  const title = "New Arrivals — Kingfox";
  const description =
    "Shop the latest drops and new arrivals at Kingfox — fresh designs, premium materials.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${site}/new-arrivals`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/new-arrivals`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <BreadcrumbJsonLd
        items={[{ name: "New Arrivals", url: `${site}/new-arrivals` }]}
      />
    </>
  );
}
