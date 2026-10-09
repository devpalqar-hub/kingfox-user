import { getSiteUrl } from "@/lib/seo";
import { getProductPath } from "@/lib/product-path";
import { getProductById, getProducts } from "@/services/product.service";
import type { ProductDetail, Variant } from "@/types/product";

// Meta fetches this on its own schedule; regenerate from the backend hourly.
export const revalidate = 3600;

const PAGE_SIZE = 50;
const DETAIL_CONCURRENCY = 6;
// Mirrors the storefront: ProductDetailClient treats totalStock <= 2 as out of stock.
const OUT_OF_STOCK_THRESHOLD = 2;
const FALLBACK_BRAND = "Kingfox";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|m4v|ogv|ogg)$/i.test(url.split(/[?#]/, 1)[0]);

const pickImage = (variant: Variant, product: ProductDetail) =>
  [variant.image, ...(variant.images || []), ...(product.images || [])].find(
    (url): url is string =>
      !!url && /^https?:\/\//i.test(url) && !isVideoUrl(url),
  );

const formatPrice = (amount: number) => `${amount.toFixed(2)} INR`;

const tag = (name: string, value?: string | number | null) =>
  value === undefined || value === null || value === ""
    ? ""
    : `<g:${name}>${escapeXml(String(value))}</g:${name}>`;

const buildItems = (product: ProductDetail, site: string) => {
  const title = (product.onlineName?.trim() || product.name || "").trim();
  const description = stripHtml(product.description || "") || title;
  const link = `${site}${getProductPath(product)}`;

  return (product.variants || []).flatMap((variant) => {
    const selling = Number(variant.sellingPrice);
    const image = pickImage(variant, product);

    // Meta rejects items without price/image; skip rather than invent values.
    if (!title || !Number.isFinite(selling) || selling <= 0 || !image) {
      return [];
    }

    // The storefront shows costPrice as the struck-through list price.
    const listPrice = Number(variant.costPrice);
    const hasSale = Number.isFinite(listPrice) && listPrice > selling;
    const inStock = (variant.totalStock ?? 0) > OUT_OF_STOCK_THRESHOLD;

    return [
      `<item>${[
        tag("id", variant.id),
        tag("item_group_id", product.id),
        tag("title", title),
        tag("description", description),
        tag("link", link),
        tag("image_link", image),
        tag("availability", inStock ? "in stock" : "out of stock"),
        tag("condition", "new"),
        tag("price", formatPrice(hasSale ? listPrice : selling)),
        hasSale ? tag("sale_price", formatPrice(selling)) : "",
        tag("brand", product.brand?.name || FALLBACK_BRAND),
        tag("product_type", product.category?.name),
        tag("color", variant.color),
        tag("size", variant.size),
        tag("mpn", variant.sku),
      ].join("")}</item>`,
    ];
  });
};

const fetchAllProductIds = async () => {
  const ids: number[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await getProducts(
      { page, limit: PAGE_SIZE },
      { next: { revalidate } },
    );
    res.items.forEach((item) => ids.push(item.id));
    totalPages = res.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return ids;
};

export async function GET() {
  const site = getSiteUrl();

  try {
    const ids = await fetchAllProductIds();
    const items: string[] = [];

    for (let i = 0; i < ids.length; i += DETAIL_CONCURRENCY) {
      const batch = ids.slice(i, i + DETAIL_CONCURRENCY);
      const products = await Promise.all(
        batch.map((id) =>
          getProductById(String(id), { next: { revalidate } }).catch(
            () => null,
          ),
        ),
      );
      products.forEach((product) => {
        if (product) items.push(...buildItems(product, site));
      });
    }

    // Never publish an empty feed: a scheduled fetch would delist the catalog.
    if (items.length === 0) {
      return new Response("Catalog unavailable", { status: 503 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Kingfox</title>
<link>${escapeXml(site)}</link>
<description>Kingfox product catalog</description>
${items.join("\n")}
</channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Meta catalog feed failed", error);
    return new Response("Catalog unavailable", { status: 503 });
  }
}
