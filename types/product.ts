export interface Brand {

  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Variant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  barcode: string | null;
  costPrice: string | null;
  sellingPrice: string;
  image: string | null;
  isAddedInCart?: boolean;
  totalStock?: number;
}
export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  images: string[];
  brand: Brand | null;
  category: Category;
  tags: Tag[];
  variants: Variant[];
  metaInfo: MetaInfo[];
  isWishlisted?: boolean;
  isAddedInCart?: boolean;
}
export interface MetaInfo {
  title: string;
  text: string;
  imageUrl?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}



export interface Product {
  id: number;
  name: string;
  description: string;
  images: string[];
  brand: Brand | null;
  category: Category;
  tags: string[];
  priceRange: PriceRange;
  colors: string[];
  sizes: string[];
  variantCount: number;
  isWishlisted?: boolean;
  isAddedInCart?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductResponse {
  items: Product[];
  pagination: Pagination;
}
