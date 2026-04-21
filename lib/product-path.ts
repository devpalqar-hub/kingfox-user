type ProductPathInput = {
  id?: number | string | null;
  slug?: string | null;
};

export const getProductPath = ({ id, slug }: ProductPathInput) => {
  const normalizedSlug = slug?.trim();

  if (normalizedSlug) {
    return `/products/${encodeURIComponent(normalizedSlug)}`;
  }

  if (id === undefined || id === null || id === "") {
    return "/products";
  }

  return `/products/${encodeURIComponent(String(id))}`;
};
