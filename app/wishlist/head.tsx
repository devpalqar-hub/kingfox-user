import React from "react";
import { getSiteUrl } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export default function Head() {
  const site = getSiteUrl();
  const title = "Wishlist — Kingfox";
  const description =
    "Your saved items and wishlist on Kingfox. Save favorites and move them to cart anytime.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${site}/wishlist`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/wishlist`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <BreadcrumbJsonLd
        items={[{ name: "Wishlist", url: `${site}/wishlist` }]}
      />
    </>
  );
}
