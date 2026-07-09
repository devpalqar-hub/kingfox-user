import React from "react";
import { getSiteUrl } from "@/lib/seo";
import BreadcrumbJsonLd from "@/lib/BreadcrumbJsonLd";

export default function Head() {
  const site = getSiteUrl();
  const title = "Login — Kingfox";
  const description =
    "Sign in to your Kingfox account to manage orders, wishlist, and more.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${site}/auth/login`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/auth/login`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <BreadcrumbJsonLd
        items={[{ name: "Login", url: `${site}/auth/login` }]}
      />
    </>
  );
}
