import { getCatalogImage, getProductDescription, getProductTitle, isVariantInStock } from "@/lib/catalog";
import type { ProductDetail } from "@/types/product";

const CURRENCY = "INR";

/**
 * Server-rendered schema.org Product JSON-LD, one node per variant.
 * Each node carries the variant id (productID/sku, = catalog item id), the
 * product id (inProductGroupWithID, = catalog item_group_id), the variant's
 * own price and availability, and the product URL.
 * Variants without a valid price are omitted, never guessed.
 */
export default function ProductJsonLd({
  product,
  url,
}: {
  product: ProductDetail;
  url: string;
}) {
  const name = getProductTitle(product);
  const description = getProductDescription(product);

  const nodes = (product.variants || []).flatMap((variant) => {
    const price = Number(variant.sellingPrice);
    const image = getCatalogImage(variant, product);

    if (!name || !Number.isFinite(price) || price <= 0 || !image) return [];

    const id = String(variant.id);

    return [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${url}#variant-${id}`,
        productID: id,
        sku: variant.sku || id,
        inProductGroupWithID: String(product.id),
        name,
        description,
        url,
        image: [image],
        ...(product.brand?.name ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
        ...(variant.color ? { color: variant.color } : {}),
        ...(variant.size ? { size: variant.size } : {}),
        ...(product.category?.name ? { category: product.category.name } : {}),
        offers: {
          "@type": "Offer",
          url,
          price: price.toFixed(2),
          priceCurrency: CURRENCY,
          itemCondition: "https://schema.org/NewCondition",
          availability: isVariantInStock(variant)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    ];
  });

  return (
    <>
      {nodes.map((node) => (
        <script
          key={node["@id"]}
          type="application/ld+json"
          // "<" is escaped so product text can never close the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\u003c"),
          }}
        />
      ))}
    </>
  );
}
