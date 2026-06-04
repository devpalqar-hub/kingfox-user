import { Suspense } from "react";

import ProductsPage from "./ProductsPage";
import { getProducts } from "@/services/product.service";
import { ProductResponse } from "@/types/product";

const PRODUCTS_LIMIT = 8;

type ProductsRouteSearchParams = {
  categoryId?: string;
  tag?: string;
};

type PageProps = {
  searchParams?: Promise<ProductsRouteSearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const categoryId = resolvedSearchParams.categoryId
    ? Number(resolvedSearchParams.categoryId)
    : undefined;
  const tag = resolvedSearchParams.tag || undefined;

  let initialData: ProductResponse = {
    items: [],
    pagination: {
      page: 1,
      limit: PRODUCTS_LIMIT,
      total: 0,
      totalPages: 0,
    },
  };

  try {
    initialData = await getProducts(
      {
        page: 1,
        limit: PRODUCTS_LIMIT,
        categoryId:
          categoryId !== undefined && !Number.isNaN(categoryId)
            ? categoryId
            : undefined,
        tags: tag ? [tag] : undefined,
      },
      {
        next: {
          revalidate: 60,
        },
      },
    );
  } catch (error) {
    console.error("Initial products fetch failed:", error);
  }

  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsPage initialData={initialData} />
    </Suspense>
  );
}
