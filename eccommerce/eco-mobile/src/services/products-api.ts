import { API_BASE_URL } from './auth-api';
import { apiRequest } from './api-client';

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  title: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface ProductImageItem {
  id?: string;
  productId?: string;
  url: string;
  alt?: string;
  position?: number;
}

export interface ProductReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  image?: string;
  images?: Array<ProductImageItem | string>;
  categoryId?: string;
  category?: { id: string; name: string; slug: string } | string;
  variants?: ProductVariant[];
  priceFrom?: string;
  price?: string;
  compareAtPrice?: string | null;
  isFeatured?: boolean;
  inStock?: boolean;
  rating?: { average?: number; count?: number } | number;
  reviews?: ProductReviewItem[];
}

export interface CardProduct {
  id: string;
  slug: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  images?: string[];
  subtitle: string;
  tag?: string | null;
  colors: string[];
  rating: string;
  reviewsCount?: number;
  category: string;
  categorySlug: string;
  inStock: boolean;
  description?: string;
  brand?: string;
  variants?: ProductVariant[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  emoji: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '✨',
  women: '👗',
  men: '👔',
  bags: '👜',
  jackets: '🧥',
  fragrance: '🌸',
  accessories: '⌚',
  beauty: '💄',
  footwear: '👟',
};

export const COLOUR_HEX: Record<string, string> = {
  black: '#111111',
  white: '#f8f8f8',
  cream: '#f5f0e1',
  beige: '#f5f5dc',
  ivory: '#fffff0',
  grey: '#808080',
  gray: '#808080',
  charcoal: '#36454f',
  navy: '#000080',
  indigo: '#4b0082',
  blue: '#1e40af',
  teal: '#008080',
  green: '#166534',
  olive: '#808000',
  yellow: '#eab308',
  mustard: '#d4a017',
  orange: '#ea580c',
  rust: '#b7410e',
  red: '#b91c1c',
  wine: '#722f37',
  maroon: '#800000',
  pink: '#ec4899',
  blush: '#f2c1c1',
  purple: '#7e22ce',
  lavender: '#e6e6fa',
  brown: '#7c4a2d',
  tan: '#d2b48c',
  sienna: '#a0522d',
  khaki: '#c3b091',
  denim: '#4a6f8a',
  silver: '#c0c0c0',
  gold: '#d4af37',
};

export const PRODUCT_METADATA_MAP: Record<
  string,
  { colors: string[]; badge?: string | null; subtitle: string; rating?: number; reviews?: number; desc?: string }
> = {
  'leather-tote-bag': {
    colors: ['#000000', '#7B4214', '#C6BDB5', '#F2D8CB'],
    badge: 'New in',
    subtitle: 'Pink Yarrow',
    rating: 4.5,
    reviews: 87,
    desc: 'Pink Yarrow',
  },
  'silk-midi-dress': {
    colors: ['#3B9668', '#9ED414', '#060A82', '#FF7E47'],
    badge: 'Hot 🔥',
    subtitle: 'Emerald Green',
    rating: 4.7,
    reviews: 95,
    desc: 'Emerald Green',
  },
  'denim-jacket': {
    colors: ['#ADD8E6', '#00008B', '#000000'],
    badge: 'New in',
    subtitle: 'Light Blue',
    rating: 4.3,
    reviews: 120,
    desc: 'Light Blue',
  },
  'cashmere-sweater': {
    colors: ['#3B474E', '#FC9FAF', '#811428'],
    badge: null,
    subtitle: 'Cream',
    rating: 4.8,
    reviews: 75,
    desc: 'Cream',
  },
  'linen-blazer': {
    colors: ['#F5F5DC', '#000080', '#808000'],
    badge: 'New in',
    subtitle: 'Beige',
    rating: 4.4,
    reviews: 60,
    desc: 'Beige',
  },
  'velvet-skirt': {
    colors: ['#722F37', '#191970', '#50C878'],
    badge: 'Hot 🔥',
    subtitle: 'Wine Red',
    rating: 4.6,
    reviews: 45,
    desc: 'Wine Red',
  },
  'sunrise-on-the-red-sand-dunes': {
    colors: ['#D4AF37', '#A0522D', '#808080'],
    badge: 'New in',
    subtitle: 'Eau de Parfum',
    rating: 4.9,
    reviews: 80,
    desc: 'Eau de Parfum',
  },
  'wool-trench-coat': {
    colors: ['#C19A6B', '#000000', '#808080'],
    badge: 'New in',
    subtitle: 'Eau de Parfum',
    rating: 4.6,
    reviews: 80,
  },
  'zara-lisboa-seoul': {
    colors: ['#1E40AF', '#4B0082', '#FFFFFF'],
    badge: null,
    subtitle: 'Eau de Toilette',
    rating: 4.5,
    reviews: 110,
    desc: 'Eau de Toilette',
  },
  'cotton-shirt': {
    colors: ['#FFFFFF', '#FFB6C1', '#87CEEB'],
    badge: null,
    subtitle: 'Eau de Toilette',
    rating: 4.1,
    reviews: 110,
  },
  'quilted-chain-shoulder-bag': {
    colors: ['#111111', '#D4AF37'],
    badge: 'New in',
    subtitle: 'Black Quilted',
    rating: 4.7,
    reviews: 50,
  },
  'designer-petite-mini-handbag': {
    colors: ['#EC4899', '#F5F5DC'],
    badge: 'Hot 🔥',
    subtitle: 'Pastel Blossom',
    rating: 4.6,
    reviews: 42,
  },
  'active-utility-belt-bag': {
    colors: ['#166534', '#111111'],
    badge: null,
    subtitle: 'Olive Cargo',
    rating: 4.4,
    reviews: 35,
  },
  'drawstring-leather-bucket-bag': {
    colors: ['#7C4A2D', '#111111'],
    badge: 'New in',
    subtitle: 'Cognac Brown',
    rating: 4.8,
    reviews: 58,
  },
};

const DEFAULT_COLORS = ['#111111', '#7B4214'];

function colourFromVariantTitle(title?: string): string | null {
  if (typeof title !== 'string') return null;
  const name = title.split('/')[0].trim().toLowerCase();
  return COLOUR_HEX[name] ?? null;
}

function extractColorsFromVariants(variants?: ProductVariant[], defaultColors?: string[]): string[] {
  if (defaultColors && defaultColors.length > 0) return defaultColors;
  if (!variants || variants.length === 0) return DEFAULT_COLORS;

  const seen = new Set<string>();
  for (const variant of variants) {
    const hex = colourFromVariantTitle(variant.title);
    if (hex) seen.add(hex);
  }
  return seen.size > 0 ? Array.from(seen).slice(0, 4) : DEFAULT_COLORS;
}

export function adaptProduct(product: BackendProduct): CardProduct {
  const slug = product.slug || '';
  const meta = PRODUCT_METADATA_MAP[slug];

  const categoryName =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : typeof product.category === 'string'
      ? product.category
      : 'General';

  const categorySlug =
    typeof product.category === 'object' && product.category?.slug
      ? product.category.slug
      : typeof product.category === 'string'
      ? product.category.toLowerCase()
      : 'general';

  // Format price with leading $
  const rawPrice = product.priceFrom || product.price || '85.00';
  const numPrice = parseFloat(rawPrice);
  const formattedPrice = isNaN(numPrice) ? `$${rawPrice}` : `$${numPrice.toFixed(2)}`;

  // CompareAt price if available
  let formattedOldPrice: string | undefined;
  if (product.compareAtPrice) {
    const numOld = parseFloat(product.compareAtPrice);
    if (!isNaN(numOld) && numOld > numPrice) {
      formattedOldPrice = `$${numOld.toFixed(2)}`;
    }
  }

  // Tag
  const tag = meta?.badge ?? (product.isFeatured ? 'New in' : null);

  // Rating and reviews count
  let ratingStr = '4.5';
  let reviewsCount = meta?.reviews ?? 50;

  if (typeof product.rating === 'object' && product.rating?.average) {
    ratingStr = product.rating.average.toFixed(1);
    reviewsCount = product.rating.count || reviewsCount;
  } else if (typeof product.rating === 'number' && product.rating > 0) {
    ratingStr = product.rating.toFixed(1);
  } else if (meta?.rating) {
    ratingStr = meta.rating.toFixed(1);
  }

  // Extract images
  const imagesList: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach((img) => {
      const u = typeof img === 'string' ? img : img?.url;
      if (u) imagesList.push(u);
    });
  }

  let imageUrl = product.image || '';
  if (!imageUrl && imagesList.length > 0) {
    imageUrl = imagesList[0];
  }
  if (imageUrl && !imagesList.includes(imageUrl)) {
    imagesList.unshift(imageUrl);
  }

  const colors = meta?.colors || extractColorsFromVariants(product.variants);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: formattedPrice,
    oldPrice: formattedOldPrice,
    image: imageUrl,
    images: imagesList,
    subtitle: meta?.subtitle || categoryName,
    tag,
    colors,
    rating: ratingStr,
    reviewsCount,
    category: categoryName,
    categorySlug,
    inStock: product.inStock ?? true,
    description: product.description || meta?.desc || '',
    brand: product.brand || 'Ciseco',
    variants: product.variants,
  };
}

export const productsApi = {
  async list(params: Record<string, any> = {}): Promise<{ success: boolean; items: CardProduct[]; pagination?: any }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });

    const endpoint = `/products?${query.toString()}`;
    const data = await apiRequest<{ success?: boolean; items?: BackendProduct[]; pagination?: any }>(endpoint);
    const rawItems: BackendProduct[] = data.items || [];
    return {
      success: data.success ?? true,
      items: rawItems.map(adaptProduct),
      pagination: data.pagination,
    };
  },

  async listNewest(limit: number = 8): Promise<CardProduct[]> {
    const res = await this.list({ sort: 'newest', limit });
    return res.items;
  },

  async getBySlug(slugOrId: string): Promise<{ success: boolean; data: BackendProduct }> {
    const endpoint = `/products/${encodeURIComponent(slugOrId)}`;
    const result = await apiRequest<{ success: boolean; data: BackendProduct }>(endpoint);
    return result;
  },

  async listCategories(): Promise<CategoryItem[]> {
    const endpoint = '/products/categories';
    const json = await apiRequest<{ success: boolean; data: any[] }>(endpoint);
    const list = json.data || [];

    const mapped = list.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount || 0,
      emoji: CATEGORY_EMOJIS[cat.slug?.toLowerCase()] || '🏷️',
    }));

    return [
      { id: 'all', name: 'All Items', slug: 'all', emoji: '✨' },
      ...mapped,
    ];
  },
};

export default productsApi;
