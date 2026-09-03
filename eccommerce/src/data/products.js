// Resolve product image URLs via Vite's glob import (same pattern as productAdapter.js)
const imageModules = import.meta.glob('../assets/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function asset(filename) {
  const key = `../assets/${filename}`;
  return imageModules[key] ?? '';
}

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


export const PRODUCTS = [
  {
    id: 1,
    name: "Leather Tote Bag",
    slug: "leather-tote-bag",
    desc: "Pink Yarrow",
    category: "Jackets",
    price: "85.00",
    rating: 4.5,
    reviews: 87,
    image: p1Asset,
    colors: ["#000000", "#7B4214", "#C6BDB5", "#F2D8CB"],
    badge: "New in",
    liked: false,
    thumbs: [p1Asset, p1Asset, p1_3Asset, p1_2Asset, p1_3DashAsset]
  },
  {
    id: 2,
    name: "Silk Midi Dress",
    slug: "silk-midi-dress",
    desc: "Emerald Green",
    category: "Women",
    price: "120.00",
    rating: 4.7,
    reviews: 95,
    image: p2Asset,
    colors: ["#3B9668", "#9ED414", "#060A82", "#FF7E47"],
    badge: null,
    liked: false,
    thumbs: [p2Asset, p2Asset, p2_2Asset, p2_1Asset, p2_3Asset]
  },
  {
    id: 3,
    name: "Denim Jacket",
    slug: "denim-jacket",
    desc: "Light Blue",
    category: "Jackets",
    price: "65.00",
    rating: 4.3,
    reviews: 120,
    image: p3Asset,
    colors: ["#ADD8E6", "#00008B", "#000000"],
    badge: "New in",
    liked: false,
    thumbs: [p3Asset, p3Asset, p3_1Asset, p3_2Asset, p3_3Asset]
  },
  {
    id: 4,
    name: "Cashmere Sweater",
    slug: "cashmere-sweater",
    desc: "Cream",
    category: "Men",
    price: "150.00",
    rating: 4.8,
    reviews: 75,
    image: p4Asset,
    colors: ["#3b474e", "#fc9faf", "#811428"],
    badge: null,
    liked: true,
    thumbs: [p4Asset, p4Asset, p4Asset2, p4Asset3, p4Asset4]
  },
  {
    id: 5,
    name: "Linen Blazer",
    slug: "linen-blazer",
    desc: "Beige",
    category: "Bags",
    price: "95.00",
    rating: 4.4,
    reviews: 60,
    image: p5Asset,
    colors: ["#F5F5DC", "#000080", "#808000"],
    badge: "New in",
    liked: false,
    thumbs: [p5Asset, p5Asset, p5_1Asset, p5_2Asset, p5_3Asset]
  },
  {
    id: 6,
    name: "Velvet Skirt",
    slug: "velvet-skirt",
    desc: "Wine Red",
    category: "Men",
    price: "55.00",
    rating: 4.2,
    reviews: 45,
    image: p6Asset,
    colors: ["#191970", "#722F37", "#50C878"],
    badge: null,
    liked: false,
    thumbs: [p6Asset, p6Asset, p6_1Asset, p6_2Asset, p6_3Asset]
  },
  {
    id: 7,
    name: "Sunrise On The Red Sand Dunes",
    slug: "sunrise-on-the-red-sand-dunes",
    desc: "Eau De Parfum",
    category: "Beauty",
    hasSizes: false,
    sizes: [],
    price: "180.00",
    rating: 4.6,
    reviews: 80,
    image: p7Asset,
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    liked: true,
    thumbs: [p7Asset, p7Asset, p7_1Asset, p7_2Asset, p7_3Asset]
  },
  {
    id: 8,
    name: "Zara Lisboa & Seoul",
    slug: "zara-lisboa-seoul",
    desc: "Eau De Toilette",
    category: "Beauty",
    hasSizes: false,
    sizes: [],
    price: "45.00",
    rating: 4.1,
    reviews: 110,
    image: p8Asset,
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    liked: false,
    thumbs: [p8Asset, p8Asset, p8_1Asset, p8_2Asset, p8_3Asset]
  }
];
