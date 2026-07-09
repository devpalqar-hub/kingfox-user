import React from "react";
import { getSiteUrl } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export default function Head() {
  const site = getSiteUrl();
  const title = "Cart — Kingfox";
  const description =
    "Your shopping cart — review items, update quantities, and proceed to checkout at Kingfox.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${site}/cart`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/cart`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <BreadcrumbJsonLd items={[{ name: "Cart", url: `${site}/cart` }]} />
    </>
  );
}
