// Translates a backend product into the shape the existing cards were written
// against. One place, because five sections read these fields and a mismatch
// shows up as "undefined" printed on a live page rather than as an error.
//
// Two rules worth keeping:
//   1. `price` stays a STRING exactly as the API sent it ("2999.00"). The
//      backend serialises Decimal columns to strings so paise cannot be lost
//      to a float; parsing it here would reintroduce that.
//   2. `badge` is explicitly null. ProductCard hides the badge only when the
//      value is `false` or `null` — leaving it undefined renders "New in" on
//      every card, which is not a claim the data supports.

const FALLBACK_SWATCHES = [
  "rgb(245, 245, 220)",
  "rgb(0, 0, 128)",
  "rgb(128, 128, 0)",
];

// Variant titles read "Indigo / M", so the colour is the segment before the
// slash. There is no hex on the variant, so known names are mapped and
// anything unrecognised is dropped rather than rendered as a broken swatch.
//
// Exported because the quick view needs to look a colour up BY NAME. The
// `colors` array below is deduped and capped at three for the card layout, so
// indexing into it by swatch position pairs the wrong hex with the wrong label
// as soon as a product has four colours or one this map does not know.
export const COLOUR_HEX = {
  black: "#111111",
  white: "#f8f8f8",
  cream: "#f5f0e1",
  beige: "#f5f5dc",
  ivory: "#fffff0",
  grey: "#808080",
  gray: "#808080",
  charcoal: "#36454f",
  navy: "#000080",
  indigo: "#4b0082",
  blue: "#1e40af",
  teal: "#008080",
  green: "#166534",
  olive: "#808000",
  yellow: "#eab308",
  mustard: "#d4a017",
  orange: "#ea580c",
  rust: "#b7410e",
  red: "#b91c1c",
  wine: "#722f37",
  maroon: "#800000",
  pink: "#ec4899",
  blush: "#f2c1c1",
  purple: "#7e22ce",
  lavender: "#e6e6fa",
  brown: "#7c4a2d",
  tan: "#d2b48c",
  sienna: "#a0522d",
  khaki: "#c3b091",
  denim: "#4a6f8a",
  silver: "#c0c0c0",
  gold: "#d4af37",
};

function colourFromVariantTitle(title) {
  if (typeof title !== "string") return null;
  const name = title.split("/")[0].trim().toLowerCase();
  return COLOUR_HEX[name] ?? null;
}

function swatchesFrom(variants) {
  const seen = new Set();

  for (const variant of variants) {
    const hex = colourFromVariantTitle(variant.title);
    if (hex) seen.add(hex);
  }

  // Cards render three swatches, so an empty or single-colour product would
  // otherwise leave a visibly ragged row next to its neighbours.
  return seen.size ? Array.from(seen).slice(0, 3) : FALLBACK_SWATCHES;
}

// The cheapest active variant. `priceFrom` is computed from the same set on the
// backend, so this is the variant that price label refers to — which makes it
// the honest default for "add to bag" from a card.
function defaultVariant(variants) {
  if (!variants.length) return null;

  return variants.reduce(
    (cheapest, variant) =>
      Number(variant.price) < Number(cheapest.price) ? variant : cheapest,
    variants[0]
  );
}

/**
 * Backend product -> card product.
 *
 * @param {Object} product - a row from GET /products or GET /products/:slug
 * @returns {Object|null}
 */
export function toCardProduct(product) {
  if (!product) return null;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const images = Array.isArray(product.images) ? product.images : [];
  const chosen = defaultVariant(variants);
  const rating = product.rating ?? null;

  return {
    // Kept as the product uuid, not an index. The wishlist is keyed by product
    // id and the quick view fetches by slug, so both need to survive the trip.
    id: product.id,
    productId: product.id,
    slug: product.slug,
    handle: product.slug,
    name: product.name,

    // Cards show a one-line subtitle. Brand is the closest honest fill when a
    // product has no description; an empty string beats the word "undefined".
    desc: product.description || product.brand || "",
    brand: product.brand ?? null,

    price: chosen?.price ?? product.priceFrom ?? null,
    compareAtPrice: chosen?.compareAtPrice ?? null,
    priceFrom: product.priceFrom ?? null,

    image: images[0]?.url ?? null,
    // The large-product card reads `mainImage`; every other card reads
    // `image`. Same url under both names beats making one of them wrong.
    mainImage: images[0]?.url ?? null,
    images: images.map((img) => img.url),

    // Exactly three, because the large-product card indexes into thumbs
    // without checking length. Falls back to repeating the main image rather
    // than rendering holes.
    thumbs: buildThumbs(images),

    colors: swatchesFrom(variants),

    // The list endpoint does not aggregate reviews — only GET /products/:slug
    // does. Null rather than 0 so the card can hide the row instead of
    // advertising a zero-star product that simply has not been rated.
    rating: typeof rating === "object" && rating !== null ? rating.average : rating,
    reviews:
      typeof rating === "object" && rating !== null ? rating.count : null,

    badge: null,
    liked: false,

    // What the cart actually needs. Price and stock live on the variant, so
    // "add the product" has no answer once there is more than one size.
    variantId: chosen?.id ?? null,
    variants,
    inStock: product.inStock ?? variants.some((v) => v.inStock),

    category: product.category ?? null,
  };
}

function buildThumbs(images) {
  const urls = images.map((img) => img.url).filter(Boolean);
  if (!urls.length) return [];

  const thumbs = urls.slice(0, 3);
  while (thumbs.length < 3) thumbs.push(urls[0]);
  return thumbs;
}

/** Maps a list response's `items` array. Tolerates a missing/failed payload. */
export function toCardProducts(items) {
  if (!Array.isArray(items)) return [];
  return items.map(toCardProduct).filter(Boolean);
}

/**
 * Wishlist rows carry a flattened product, not the full catalogue shape — no
 * variants, and `image` already resolved. Adapted separately so the saved-items
 * grid can reuse ProductCard.
 */
export function wishlistRowToCardProduct(row) {
  if (!row?.product) return null;

  const { product } = row;

  return {
    id: product.id,
    productId: product.id,
    slug: product.slug,
    handle: product.slug,
    name: product.name,
    desc: product.brand || "",
    brand: product.brand ?? null,
    price: product.priceFrom ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    priceFrom: product.priceFrom ?? null,
    image: product.image ?? null,
    images: product.image ? [product.image] : [],
    thumbs: product.image ? [product.image, product.image, product.image] : [],
    colors: FALLBACK_SWATCHES,
    rating: null,
    reviews: null,
    badge: null,
    liked: true,
    // A wishlist saves products, not variants, so there is no variant to add
    // from here — the size is chosen on the product page.
    variantId: null,
    variants: [],
    inStock: product.inStock,
    available: product.available,
    addedAt: row.addedAt,
  };
}

export default toCardProduct;
