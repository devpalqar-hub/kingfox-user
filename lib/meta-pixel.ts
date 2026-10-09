/**
 * Thin, SSR-safe wrapper around the Meta Pixel that is initialised once in
 * components/MetaPixel.tsx. Nothing here loads or initialises the pixel.
 *
 * Catalog ID strategy (must match the feed in app/feeds/meta-catalog.xml):
 *  - catalog item `id`            = variant id  (one row per size/colour)
 *  - catalog item `item_group_id` = product id
 *  - ViewContent    -> content_type "product_group", content_ids [productId]
 *  - AddToCart / InitiateCheckout / Purchase
 *                   -> content_type "product",       content_ids [variantId]
 */

export const META_CURRENCY = "INR";

type FbqParams = Record<string, unknown>;

export type MetaLineItem = {
  /** Catalog id (variant id). */
  id: string | number;
  quantity: number;
  /** Unit price, used only to compute `value`. */
  price?: number | string;
};

const FBQ_WAIT_STEP_MS = 250;
const FBQ_WAIT_MAX_MS = 8000;

const sentKey = (orderId: string | number) => `meta_purchase_sent_${orderId}`;

/**
 * The pixel script is loaded `afterInteractive`, so child effects can run
 * before `window.fbq` exists. Wait briefly instead of silently dropping.
 */
const withFbq = (run: (fbq: NonNullable<Window["fbq"]>) => void) => {
  if (typeof window === "undefined") return;

  let waited = 0;
  const attempt = () => {
    if (window.fbq) {
      run(window.fbq);
      return;
    }
    waited += FBQ_WAIT_STEP_MS;
    if (waited <= FBQ_WAIT_MAX_MS) {
      window.setTimeout(attempt, FBQ_WAIT_STEP_MS);
    }
  };
  attempt();
};

export const trackMeta = (
  event: string,
  params?: FbqParams,
  options?: { eventId?: string },
) => {
  withFbq((fbq) => {
    if (options?.eventId) {
      fbq("track", event, params ?? {}, { eventID: options.eventId });
    } else {
      fbq("track", event, params ?? {});
    }
  });
};

const toNumber = (value: number | string | undefined) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const buildCommerceParams = (items: MetaLineItem[], value?: number) => {
  const valid = items.filter((i) => i.quantity > 0);
  return {
    content_ids: valid.map((i) => String(i.id)),
    content_type: "product",
    contents: valid.map((i) => ({ id: String(i.id), quantity: i.quantity })),
    num_items: valid.reduce((sum, i) => sum + i.quantity, 0),
    value:
      value ??
      valid.reduce((sum, i) => sum + toNumber(i.price) * i.quantity, 0),
    currency: META_CURRENCY,
  };
};

export const trackViewContent = (product: {
  id: number | string;
  name: string;
  category?: string;
  value: number;
}) => {
  trackMeta("ViewContent", {
    content_ids: [String(product.id)],
    content_type: "product_group",
    content_name: product.name,
    content_category: product.category,
    value: product.value,
    currency: META_CURRENCY,
  });
};

export const trackAddToCart = (
  item: MetaLineItem & { name?: string; category?: string },
) => {
  trackMeta("AddToCart", {
    ...buildCommerceParams([item]),
    content_name: item.name,
    content_category: item.category,
  });
};

export const trackInitiateCheckout = (items: MetaLineItem[], value: number) => {
  trackMeta("InitiateCheckout", buildCommerceParams(items, value));
};

/** Deterministic id shared with the server-side (Conversions API) event. */
export const getPurchaseEventId = (orderId: string | number) =>
  `purchase_${orderId}`;

export const hasTrackedPurchase = (orderId: string | number) => {
  try {
    return !!localStorage.getItem(sentKey(orderId));
  } catch {
    return false;
  }
};

/**
 * Fires Purchase at most once per order per browser. The flag is written
 * synchronously before dispatch, so React Strict Mode double-effects, refreshes
 * and repeated API responses cannot re-send it. The deterministic eventID also
 * lets Meta drop a duplicate if the flag was lost (cleared storage).
 */
export const trackPurchaseOnce = (
  orderId: string | number,
  items: MetaLineItem[],
  value: number,
) => {
  if (typeof window === "undefined") return false;

  try {
    if (localStorage.getItem(sentKey(orderId))) return false;
    localStorage.setItem(sentKey(orderId), String(Date.now()));
  } catch {
    // Storage blocked: fall through; eventID dedupe still protects us.
  }

  trackMeta("Purchase", buildCommerceParams(items, value), {
    eventId: getPurchaseEventId(orderId),
  });
  return true;
};
