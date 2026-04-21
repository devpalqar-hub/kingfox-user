import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getProductPath } from "@/lib/product-path";
import { findProductById, findProductBySlug } from "@/services/product.service";
import type { ProductDetail } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const getMetaDescription = (product: ProductDetail) => {
  const source =
    product.description || product.metaInfo?.[0]?.text || "Explore the latest KINGFOX drop.";

  return source.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
};

const resolveProduct = cache(async (slugOrId: string) => {
  const productBySlug = await findProductBySlug(slugOrId, { cache: "no-store" });

  if (productBySlug) {
    return {
      canonicalPath: getProductPath(productBySlug),
      product: productBySlug,
    };
  }

  if (/^\d+$/.test(slugOrId)) {
    const productById = await findProductById(slugOrId, { cache: "no-store" });

    if (productById) {
      return {
        canonicalPath: getProductPath(productById),
        product: productById,
      };
    }
  }

  return null;
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedProduct = await resolveProduct(slug);

  if (!resolvedProduct) {
    return {
      title: "Product not found | KINGFOX",
      description: "The product you are looking for is no longer available.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { canonicalPath, product } = resolvedProduct;
  const description = getMetaDescription(product);
  const title = `${product.name} | KINGFOX`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images?.map((image) => ({ url: image })) || [],
    },
    twitter: {
      card: product.images?.length ? "summary_large_image" : "summary",
      title,
      description,
      images: product.images || [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const resolvedProduct = await resolveProduct(slug);

  if (!resolvedProduct) {
    notFound();
  }

  const currentPath = `/products/${encodeURIComponent(slug)}`;

  if (resolvedProduct.canonicalPath !== currentPath) {
    redirect(resolvedProduct.canonicalPath);
  }

  return <ProductDetailClient initialProduct={resolvedProduct.product} />;
}
