// Resolve all product image URLs at build time via Vite's glob import.
// `eager: true` + `query: '?url'` gives us a synchronous map of
// (source path → resolved URL string) without importing the binary data
// into the JS bundle. This replaces 32 individual static imports.
const imageModules = import.meta.glob('../assets/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Helper: resolve an asset filename (e.g. "p1.webp") to its hashed URL
function asset(filename) {
  const key = `../assets/${filename}`;
  return imageModules[key] ?? '';
}

// Resolved asset URLs (equivalent to the old static imports)
const p1Asset = asset('p1.webp');
const p1_3Asset = asset('p1.3.webp');
const p1_2Asset = asset('p1-2.webp');
const p1_3DashAsset = asset('p1-3.webp');
const p2Asset = asset('p2.webp');
const p2_1Asset = asset('p2-1.webp');
const p2_2Asset = asset('p2-2.webp');
const p2_3Asset = asset('p2-3.webp');
const p3Asset = asset('p3.webp');
const p3_1Asset = asset('p3-1.webp');
const p3_2Asset = asset('p3-2.webp');
const p3_3Asset = asset('p3-3.webp');
const p4Asset = asset('p4.webp');
const p4Asset2 = asset('p4-2.webp');
const p4Asset3 = asset('p4-3.webp');
const p4Asset4 = asset('p4-4.webp');
const p5Asset = asset('p5.webp');
const p5_1Asset = asset('p5-1.webp');
const p5_2Asset = asset('p5-2.webp');
const p5_3Asset = asset('p5-3.webp');
const p6Asset = asset('p6.webp');
const p6_1Asset = asset('p6-1.webp');
const p6_2Asset = asset('p6-2.webp');
const p6_3Asset = asset('p6-3.webp');
const p7Asset = asset('p7.webp');
const p7_1Asset = asset('p7-1.webp');
const p7_2Asset = asset('p7-2.webp');
const p7_3Asset = asset('p7-3.webp');
const p8Asset = asset('p8.webp');
const p8_1Asset = asset('p8-1.webp');
const p8_2Asset = asset('p8-2.webp');
const p8_3Asset = asset('p8-3.webp');


export const PRODUCT_ASSETS_MAP = {
  "leather-tote-bag": {
    image: p1Asset,
    thumbs: [p1Asset, p1Asset, p1_3Asset, p1_2Asset, p1_3DashAsset],
    colors: ["#000000", "#7B4214", "#C6BDB5", "#F2D8CB"],
    badge: "New in",
    desc: "Pink Yarrow",
  },
  "silk-midi-dress": {
    image: p2Asset,
    thumbs: [p2Asset, p2Asset, p2_1Asset, p2_2Asset, p2_3Asset],
    colors: ["#3B9668", "#9ED414", "#060A82", "#FF7E47"],
    badge: null,
    desc: "Emerald Green",
  },
  "denim-jacket": {
    image: p3Asset,
    thumbs: [p3Asset, p3Asset, p3_1Asset, p3_2Asset, p3_3Asset],
    colors: ["#ADD8E6", "#00008B", "#000000"],
    badge: "New in",
    desc: "Light Blue",
  },
  "cashmere-sweater": {
    image: p4Asset,
    thumbs: [p4Asset, p4Asset, p4Asset2, p4Asset3, p4Asset4],
    colors: ["#3b474e", "#fc9faf", "#811428"],
    badge: null,
    desc: "Cream",
  },
  "linen-blazer": {
    image: p5Asset,
    thumbs: [p5Asset, p5Asset, p5_1Asset, p5_2Asset, p5_3Asset],
    colors: ["#F5F5DC", "#000080", "#808000"],
    badge: "New in",
    desc: "Beige",
  },
  "velvet-skirt": {
    image: p6Asset,
    thumbs: [p6Asset, p6Asset, p6_1Asset, p6_2Asset, p6_3Asset],
    colors: ["#191970", "#722F37", "#50C878"],
    badge: null,
    desc: "Wine Red",
  },
  "sunrise-on-the-red-sand-dunes": {
    image: p7Asset,
    thumbs: [p7Asset, p7Asset, p7_1Asset, p7_2Asset, p7_3Asset],
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    desc: "Eau De Parfum",
  },
  "wool-trench-coat": {
    image: p7Asset,
    thumbs: [p7Asset, p7Asset, p7_1Asset, p7_2Asset, p7_3Asset],
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    desc: "Eau De Parfum",
  },
  "zara-lisboa-seoul": {
    image: p8Asset,
    thumbs: [p8Asset, p8Asset, p8_1Asset, p8_2Asset, p8_3Asset],
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    desc: "Eau De Toilette",
  },
  "cotton-shirt": {
    image: p8Asset,
    thumbs: [p8Asset, p8Asset, p8_1Asset, p8_2Asset, p8_3Asset],
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    desc: "Eau De Toilette",
  },
};

const FALLBACK_SWATCHES = ["#3b474e", "#fc9faf", "#811428"];

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

function swatchesFrom(variants, defaultColors) {
  if (defaultColors && defaultColors.length) return defaultColors;
  const seen = new Set();

  for (const variant of variants) {
    const hex = colourFromVariantTitle(variant.title);
    if (hex) seen.add(hex);
  }

  return seen.size ? Array.from(seen).slice(0, 3) : FALLBACK_SWATCHES;
}

function defaultVariant(variants) {
  if (!variants.length) return null;

  return variants.reduce(
    (cheapest, variant) =>
      Number(variant.price) < Number(cheapest.price) ? variant : cheapest,
    variants[0],
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

  const slug = product.slug || "";
  const localMatch = PRODUCT_ASSETS_MAP[slug] || null;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const chosen = defaultVariant(variants);
  const rating = product.rating ?? localMatch?.rating ?? null;

  // Prioritize authentic original product assets (p1.webp - p8.webp)
  const primaryImage =
    localMatch?.image ||
    product.image ||
    rawImages[0]?.url ||
    rawImages[0] ||
    p1Asset;

  const galleryThumbs =
    localMatch?.thumbs ||
    (rawImages.length > 0
      ? rawImages
          .map((i) => (typeof i === "string" ? i : i?.url))
          .filter(Boolean)
      : [primaryImage, primaryImage, primaryImage]);

  const fullDescription =
    localMatch?.desc || product.description || product.brand || "";

  return {
    id: product.id,
    productId: product.id,
    slug: product.slug,
    handle: product.slug,
    name: product.name,

    description: fullDescription,
    desc: fullDescription,
    brand: product.brand ?? "Ciseco",

    price: chosen?.price ?? product.priceFrom ?? product.price ?? "99.00",
    compareAtPrice: chosen?.compareAtPrice ?? null,
    priceFrom: product.priceFrom ?? product.price ?? null,

    image: primaryImage,
    mainImage: primaryImage,
    images: galleryThumbs,
    thumbs: galleryThumbs,

    colors: swatchesFrom(variants, localMatch?.colors),

    rating:
      typeof rating === "object" && rating !== null
        ? (rating.average !== null && rating.average !== undefined ? rating.average : 0)
        : (typeof product.rating === "number" ? product.rating : (typeof rating === "number" ? rating : 0)),
    reviews:
      typeof rating === "object" && rating !== null
        ? (rating.count !== null && rating.count !== undefined ? rating.count : 0)
        : (typeof product.reviews === "number" ? product.reviews : (typeof rating === "number" ? rating : 0)),

    badge: localMatch?.badge ?? (product.isFeatured ? "New in" : null),
    liked: false,

    variantId: chosen?.id ?? null,
    variants,
    inStock: product.inStock ?? variants.some((v) => v.inStock) ?? true,

    category: product.category?.name || product.category || "General",
    categorySlug:
      product.category?.slug ||
      (typeof product.category === "string"
        ? product.category.toLowerCase()
        : null),
    rawCategory: product.category,
    rawReviews: product.reviews,
  };
}

/** Maps a list response's `items` array. */
export function toCardProducts(items) {
  if (!Array.isArray(items)) return [];
  return items.map(toCardProduct).filter(Boolean);
}

/**
 * Wishlist rows carry a flattened product, not the full catalogue shape.
 */
export function wishlistRowToCardProduct(row) {
  if (!row?.product) return null;
  const { product } = row;
  const adapted = toCardProduct(product);
  return {
    ...adapted,
    liked: true,
    addedAt: row.addedAt,
  };
}

export default toCardProduct;
