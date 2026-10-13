import { API_BASE_URL } from './auth-api';

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  title: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  inStock?: boolean;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  image?: string;
  images?: Array<{ id?: string; url: string; alt?: string; position?: number } | string>;
  categoryId?: string;
  category?: { id: string; name: string; slug: string } | string;
  variants?: ProductVariant[];
  priceFrom?: string;
  price?: string;
  compareAtPrice?: string;
  isFeatured?: boolean;
  inStock?: boolean;
  rating?: { average?: number; count?: number } | number;
}

export interface CardProduct {
  id: string;
  slug: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  subtitle: string;
  tag?: string | null;
  colors: string[];
  rating: string;
  reviewsCount?: number;
  category: string;
  categorySlug: string;
  inStock: boolean;
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
  fragrance: '🧴',
  accessories: '⌚',
  beauty: '💄',
  footwear: '👟',
};

export const PRODUCT_METADATA_MAP: Record<
  string,
  { colors: string[]; badge?: string | null; subtitle: string; rating?: number }
> = {
  'leather-tote-bag': {
    colors: ['#000000', '#7B4214', '#C6BDB5'],
    badge: 'New',
    subtitle: 'Pink Yarrow',
    rating: 4.5,
  },
  'silk-midi-dress': {
    colors: ['#3B9668', '#9ED414', '#060A82'],
    badge: 'Hot 🔥',
    subtitle: 'Emerald Green',
    rating: 4.7,
  },
  'denim-jacket': {
    colors: ['#ADD8E6', '#00008B', '#000000'],
    badge: 'New',
    subtitle: 'Light Blue',
    rating: 4.3,
  },
  'cashmere-sweater': {
    colors: ['#3B474E', '#FC9FAF', '#811428'],
    badge: null,
    subtitle: 'Cream',
    rating: 4.8,
  },
  'linen-blazer': {
    colors: ['#F5F5DC', '#000080', '#808000'],
    badge: 'New',
    subtitle: 'Beige',
    rating: 4.4,
  },
  'velvet-skirt': {
    colors: ['#722F37', '#191970'],
    badge: 'Hot 🔥',
    subtitle: 'Wine Red',
    rating: 4.6,
  },
  'sunrise-on-the-red-sand-dunes': {
    colors: ['#D4AF37', '#A0522D'],
    badge: 'New',
    subtitle: 'Eau de Parfum',
    rating: 4.9,
  },
  'zara-lisboa-seoul': {
    colors: ['#1E40AF', '#4B0082'],
    badge: null,
    subtitle: 'Eau de Toilette',
    rating: 4.5,
  },
  'quilted-chain-shoulder-bag': {
    colors: ['#111111', '#D4AF37'],
    badge: 'New',
    subtitle: 'Black Quilted',
    rating: 4.7,
  },
  'designer-petite-mini-handbag': {
    colors: ['#EC4899', '#F5F5DC'],
    badge: 'Hot 🔥',
    subtitle: 'Pastel Blossom',
    rating: 4.6,
  },
  'active-utility-belt-bag': {
    colors: ['#166534', '#111111'],
    badge: null,
    subtitle: 'Olive Cargo',
    rating: 4.4,
  },
  'drawstring-leather-bucket-bag': {
    colors: ['#7C4A2D', '#111111'],
    badge: 'New',
    subtitle: 'Cognac Brown',
    rating: 4.8,
  },
};

const DEFAULT_COLORS = ['#111111', '#7B4214'];

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
  const tag = meta?.badge ?? (product.isFeatured ? 'New' : null);

  // Rating
  let ratingStr = '4.5';
  if (typeof product.rating === 'object' && product.rating?.average) {
    ratingStr = product.rating.average.toFixed(1);
  } else if (typeof product.rating === 'number' && product.rating > 0) {
    ratingStr = product.rating.toFixed(1);
  } else if (meta?.rating) {
    ratingStr = meta.rating.toFixed(1);
  }

  // Image URL
  let imageUrl = product.image || '';
  if (!imageUrl && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url;
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: formattedPrice,
    oldPrice: formattedOldPrice,
    image: imageUrl,
    subtitle: meta?.subtitle || categoryName,
    tag,
    colors: meta?.colors || DEFAULT_COLORS,
    rating: ratingStr,
    category: categoryName,
    categorySlug,
    inStock: product.inStock ?? true,
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

    const url = `${API_BASE_URL}/products?${query.toString()}`;
    console.log(`📡 [NETWORK REQ] GET ${url}`);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`✅ [NETWORK RES] ${res.status} ${url}`);

    if (!res.ok) {
      throw new Error(`Failed to load products (${res.status})`);
    }

    const data = await res.json();
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

  async listCategories(): Promise<CategoryItem[]> {
    const url = `${API_BASE_URL}/products/categories`;
    console.log(`📡 [NETWORK REQ] GET ${url}`);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`✅ [NETWORK RES] ${res.status} ${url}`);

    if (!res.ok) {
      throw new Error(`Failed to load categories (${res.status})`);
    }

    const json = await res.json();
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
