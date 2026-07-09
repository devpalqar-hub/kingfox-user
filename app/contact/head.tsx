import React from "react";
import { getSiteUrl } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export default function Head() {
  const site = getSiteUrl();
  const title = "Contact — Kingfox";
  const description =
    "Get in touch with Kingfox support for orders, sizing help, and general inquiries.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${site}/contact`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/contact`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <BreadcrumbJsonLd items={[{ name: "Contact", url: `${site}/contact` }]} />
    </>
  );
}
