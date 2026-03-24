export interface Brand {

  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}


export interface Variant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  barcode: string;
  costPrice: string;
  sellingPrice: string;
  image: string | null;
}
export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  images: string[];
  brand: Brand;
  category: Category;
  tags: string[];
  variants: Variant[];
  metaInfo: MetaInfo[];
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
  brand: Brand;
  category: Category;
  tags: string[];
  priceRange: PriceRange;
  colors: string[];
  sizes: string[];
  variantCount: number;
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
