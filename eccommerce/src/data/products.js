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
    category: "Bags",
    price: "85.00",
    rating: 4.5,
    reviews: 87,
    image: p1Asset,
    colors: ["#000000", "#7B4214", "#C6BDB5", "#F2D8CB"],
    badge: "New in",
    liked: false,
    thumbs: [p1Asset, p1_2Asset, p1_3Asset, p1_3DashAsset]
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
    liked: true,
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
  },
  {
    id: 9,
    name: "Classic Leather Tote",
    slug: "classic-leather-tote",
    desc: "Cognac Brown",
    category: "Bags",
    price: "128.00",
    rating: 4.8,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    colors: ["#7B3F00", "#000000"],
    badge: "Best seller",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 10,
    name: "Minimalist Canvas Backpack",
    slug: "minimalist-canvas-backpack",
    desc: "Matte Black",
    category: "Bags",
    price: "95.00",
    rating: 4.7,
    reviews: 65,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    colors: ["#000000", "#556B2F"],
    badge: "New in",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 11,
    name: "Structured Crossbody Bag",
    slug: "structured-crossbody-bag",
    desc: "Mustard Tan",
    category: "Bags",
    price: "79.00",
    rating: 4.6,
    reviews: 38,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    colors: ["#E1AD01", "#FFFDD0"],
    badge: null,
    liked: true,
    thumbs: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 12,
    name: "Vintage Leather Satchel",
    slug: "vintage-leather-satchel",
    desc: "Chestnut Brown",
    category: "Bags",
    price: "145.00",
    rating: 4.9,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    colors: ["#8B4513"],
    badge: "Popular",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 13,
    name: "Urban Commuter Duffel",
    slug: "urban-commuter-duffel",
    desc: "Charcoal Grey",
    category: "Bags",
    price: "110.00",
    rating: 4.5,
    reviews: 52,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    colors: ["#36454F", "#000080"],
    badge: null,
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 14,
    name: "Woven Straw Beach Tote",
    slug: "woven-straw-beach-tote",
    desc: "Natural Straw",
    category: "Bags",
    price: "65.00",
    rating: 4.4,
    reviews: 29,
    image: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80",
    colors: ["#E4D4C8"],
    badge: "Summer",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614179689702-355944cf0918?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 15,
    name: "Sleek Waterproof Sling",
    slug: "sleek-waterproof-sling",
    desc: "Obsidian Black",
    category: "Bags",
    price: "85.00",
    rating: 4.7,
    reviews: 73,
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    colors: ["#000000", "#77815C"],
    badge: "Trending",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 16,
    name: "Equestrian Saddle Bag",
    slug: "equestrian-saddle-bag",
    desc: "Burgundy Red",
    category: "Bags",
    price: "165.00",
    rating: 4.8,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    colors: ["#800020", "#000000"],
    badge: null,
    liked: true,
    thumbs: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 17,
    name: "Executive Leather Briefcase",
    slug: "executive-leather-briefcase",
    desc: "Dark Espresso",
    category: "Bags",
    price: "245.00",
    rating: 4.9,
    reviews: 58,
    image: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80",
    colors: ["#3B2F2F", "#000000"],
    badge: "Premium",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 18,
    name: "Everyday Cotton Canvas Tote",
    slug: "everyday-cotton-canvas-tote",
    desc: "Ecru White",
    category: "Bags",
    price: "38.00",
    rating: 4.3,
    reviews: 91,
    image: "https://images.unsplash.com/photo-1614179689702-355944cf0918?auto=format&fit=crop&w=800&q=80",
    colors: ["#F5F5DC", "#000080"],
    badge: null,
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1614179689702-355944cf0918?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 19,
    name: "Compact Camera Crossbody",
    slug: "compact-camera-crossbody",
    desc: "Olive Camo",
    category: "Bags",
    price: "72.00",
    rating: 4.5,
    reviews: 34,
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
    colors: ["#556B2F", "#000000"],
    badge: null,
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 20,
    name: "Roll-Top Commuter Backpack",
    slug: "roll-top-commuter-backpack",
    desc: "Storm Grey",
    category: "Bags",
    price: "125.00",
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
    colors: ["#708090", "#000000"],
    badge: "Waterproof",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 21,
    name: "Crescent Leather Hobo",
    slug: "crescent-leather-hobo",
    desc: "Warm Caramel",
    category: "Bags",
    price: "155.00",
    rating: 4.8,
    reviews: 62,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
    colors: ["#C68B59", "#FFFFF0"],
    badge: "New in",
    liked: true,
    thumbs: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 22,
    name: "Weekender Travel Duffle",
    slug: "weekender-travel-duffle",
    desc: "Khaki Tan",
    category: "Bags",
    price: "135.00",
    rating: 4.7,
    reviews: 77,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    colors: ["#C3B091", "#000000"],
    badge: "Travel pick",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 23,
    name: "Pleated Satin Evening Clutch",
    slug: "pleated-satin-evening-clutch",
    desc: "Champagne Gold",
    category: "Bags",
    price: "58.00",
    rating: 4.6,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1566150902887-9679ec15dcb7?auto=format&fit=crop&w=800&q=80",
    colors: ["#F7E7CE", "#C0C0C0"],
    badge: null,
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1566150902887-9679ec15dcb7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 24,
    name: "Heritage Outdoor Rucksack",
    slug: "heritage-outdoor-rucksack",
    desc: "Forest Green",
    category: "Bags",
    price: "115.00",
    rating: 4.6,
    reviews: 49,
    image: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
    colors: ["#228B22", "#8B4513"],
    badge: null,
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 25,
    name: "Drawstring Leather Bucket Bag",
    slug: "drawstring-leather-bucket-bag",
    desc: "Warm Sand",
    category: "Bags",
    price: "148.00",
    rating: 4.7,
    reviews: 43,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
    colors: ["#D8C4B6", "#000000"],
    badge: null,
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 26,
    name: "Active Utility Belt Bag",
    slug: "active-utility-belt-bag",
    desc: "Stealth Black",
    category: "Bags",
    price: "48.00",
    rating: 4.5,
    reviews: 82,
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    colors: ["#000000", "#C8A2C8"],
    badge: "Popular",
    liked: false,
    thumbs: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 27,
    name: "Designer Petite Mini Handbag",
    slug: "designer-petite-mini-handbag",
    desc: "Powder Blue",
    category: "Bags",
    price: "98.00",
    rating: 4.8,
    reviews: 39,
    image: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80",
    colors: ["#B0E0E6", "#E0115F"],
    badge: "New in",
    liked: true,
    thumbs: [
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150902887-9679ec15dcb7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 28,
    name: "Quilted Chain Shoulder Bag",
    slug: "quilted-chain-shoulder-bag",
    desc: "Caviar Black",
    category: "Bags",
    price: "175.00",
    rating: 4.9,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    colors: ["#000000", "#F5F5DC"],
    badge: "Featured",
    liked: true,
    thumbs: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80"
    ]
  }
];
