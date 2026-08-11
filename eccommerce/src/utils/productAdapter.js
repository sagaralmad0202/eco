import p1Asset from "../assets/p1.webp";
import p1_3Asset from "../assets/p1.3.webp";
import p1_2Asset from "../assets/p1-2.webp";
import p1_3DashAsset from "../assets/p1-3.webp";
import p2Asset from "../assets/p2.webp";
import p2_1Asset from "../assets/p2-1.webp";
import p2_2Asset from "../assets/p2-2.webp";
import p2_3Asset from "../assets/p2-3.webp";
import p3Asset from "../assets/p3.webp";
import p3_1Asset from "../assets/p3-1.webp";
import p3_2Asset from "../assets/p3-2.webp";
import p3_3Asset from "../assets/p3-3.webp";
import p4Asset from "../assets/p4.webp";
import p4Asset2 from "../assets/p4-2.webp";
import p4Asset3 from "../assets/p4-3.webp";
import p4Asset4 from "../assets/p4-4.webp";
import p5Asset from "../assets/p5.webp";
import p5_1Asset from "../assets/p5-1.webp";
import p5_2Asset from "../assets/p5-2.webp";
import p5_3Asset from "../assets/p5-3.webp";
import p6Asset from "../assets/p6.webp";
import p6_1Asset from "../assets/p6-1.webp";
import p6_2Asset from "../assets/p6-2.webp";
import p6_3Asset from "../assets/p6-3.webp";
import p7Asset from "../assets/p7.webp";
import p7_1Asset from "../assets/p7-1.webp";
import p7_2Asset from "../assets/p7-2.webp";
import p7_3Asset from "../assets/p7-3.webp";
import p8Asset from "../assets/p8.webp";
import p8_1Asset from "../assets/p8-1.webp";
import p8_2Asset from "../assets/p8-2.webp";
import p8_3Asset from "../assets/p8-3.webp";

export const PRODUCT_ASSETS_MAP = {
  "leather-tote-bag": {
    image: p1Asset,
    thumbs: [p1Asset, p1Asset, p1_3Asset, p1_2Asset, p1_3DashAsset],
    colors: ["#000000", "#7B4214", "#C6BDB5", "#F2D8CB"],
    badge: "New in",
    rating: 4.5,
    reviews: 87,
    desc: "Pink Yarrow",
  },
  "silk-midi-dress": {
    image: p2Asset,
    thumbs: [p2Asset, p2Asset, p2_1Asset, p2_2Asset, p2_3Asset],
    colors: ["#3B9668", "#9ED414", "#060A82", "#FF7E47"],
    badge: null,
    rating: 4.7,
    reviews: 95,
    desc: "Emerald Green",
  },
  "denim-jacket": {
    image: p3Asset,
    thumbs: [p3Asset, p3Asset, p3_1Asset, p3_2Asset, p3_3Asset],
    colors: ["#ADD8E6", "#00008B", "#000000"],
    badge: "New in",
    rating: 4.3,
    reviews: 120,
    desc: "Light Blue",
  },
  "cashmere-sweater": {
    image: p4Asset,
    thumbs: [p4Asset, p4Asset, p4Asset2, p4Asset3, p4Asset4],
    colors: ["#3b474e", "#fc9faf", "#811428"],
    badge: null,
    rating: 4.8,
    reviews: 75,
    desc: "Cream",
  },
  "linen-blazer": {
    image: p5Asset,
    thumbs: [p5Asset, p5Asset, p5_1Asset, p5_2Asset, p5_3Asset],
    colors: ["#F5F5DC", "#000080", "#808000"],
    badge: "New in",
    rating: 4.4,
    reviews: 60,
    desc: "Beige",
  },
  "velvet-skirt": {
    image: p6Asset,
    thumbs: [p6Asset, p6Asset, p6_1Asset, p6_2Asset, p6_3Asset],
    colors: ["#191970", "#722F37", "#50C878"],
    badge: null,
    rating: 4.2,
    reviews: 45,
    desc: "Wine Red",
  },
  "sunrise-on-the-red-sand-dunes": {
    image: p7Asset,
    thumbs: [p7Asset, p7Asset, p7_1Asset, p7_2Asset, p7_3Asset],
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    rating: 4.6,
    reviews: 80,
    desc: "Eau De Parfum",
  },
  "wool-trench-coat": {
    image: p7Asset,
    thumbs: [p7Asset, p7Asset, p7_1Asset, p7_2Asset, p7_3Asset],
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    rating: 4.6,
    reviews: 80,
    desc: "Eau De Parfum",
  },
  "zara-lisboa-seoul": {
    image: p8Asset,
    thumbs: [p8Asset, p8Asset, p8_1Asset, p8_2Asset, p8_3Asset],
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    rating: 4.1,
    reviews: 110,
    desc: "Eau De Toilette",
  },
  "cotton-shirt": {
    image: p8Asset,
    thumbs: [p8Asset, p8Asset, p8_1Asset, p8_2Asset, p8_3Asset],
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    rating: 4.1,
    reviews: 110,
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
        ? rating.average
        : rating || 4.5,
    reviews:
      typeof rating === "object" && rating !== null
        ? rating.count
        : (product.reviews ?? localMatch?.reviews ?? 50),

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
