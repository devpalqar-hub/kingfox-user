import type { ProductDetail, Variant } from "@/types/product";

/**
 * Shared catalog rules used by BOTH the Meta product feed
 * (app/feeds/meta-catalog.xml) and the product-page JSON-LD, so the two can
 * never disagree on id, price, availability or image.
 *
 * Item id = variant id, group id = product id.
 */

// Mirrors the storefront: ProductDetailClient treats totalStock <= 2 as out of stock.
const OUT_OF_STOCK_THRESHOLD = 2;

export const isVariantInStock = (variant: Variant) =>
  (variant.totalStock ?? 0) > OUT_OF_STOCK_THRESHOLD;

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|m4v|ogv|ogg)$/i.test(url.split(/[?#]/, 1)[0]);

export const getProductTitle = (product: ProductDetail) =>
  (product.onlineName?.trim() || product.name || "").trim();

export const getProductDescription = (product: ProductDetail) =>
  stripHtml(product.description || product.metaInfo?.[0]?.text || "") ||
  getProductTitle(product);

/** First absolute, non-video image: variant first, then the product's. */
export const getCatalogImage = (variant: Variant | undefined, product: ProductDetail) =>
  [variant?.image, ...(variant?.images || []), ...(product.images || [])].find(
    (url): url is string =>
      !!url && /^https?:\/\//i.test(url) && !isVideoUrl(url),
  );
