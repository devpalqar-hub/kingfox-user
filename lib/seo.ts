import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Kingfox";

export function getSiteUrl() {
  return SITE_URL.replace(/\/$/, "");
}

export function createMetadata({
  title,
  description,
  pathname = "/",
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  pathname?: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${getSiteUrl()}${pathname}`;

  const images = image
    ? [{ url: image.startsWith("http") ? image : `${getSiteUrl()}${image}` }]
    : undefined;

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i) => i.url),
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
  };
}

export default createMetadata;
