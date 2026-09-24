const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BAG_PRODUCTS = [
  {
    name: "Classic Leather Tote",
    slug: "classic-leather-tote",
    description: "Spacious handcrafted full-grain leather tote designed for daily essentials and a 15-inch laptop.",
    brand: "Cuyana",
    price: "128.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Classic Leather Tote Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", alt: "Classic Leather Tote Side", position: 1 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Classic Leather Tote Detail", position: 2 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Classic Leather Tote Interior", position: 3 },
      { url: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80", alt: "Classic Leather Tote Lifestyle", position: 4 },
    ],
    variants: [
      { sku: "CLT-COG-STD", title: "Cognac Brown / Standard", price: "128.00", stock: 30 },
      { sku: "CLT-BLK-STD", title: "Midnight Black / Standard", price: "128.00", stock: 25 },
    ],
  },
  {
    name: "Minimalist Canvas Backpack",
    slug: "minimalist-canvas-backpack",
    description: "Water-resistant heavy-duty canvas backpack with padded laptop sleeve and ergonomic straps.",
    brand: "Bellroy",
    price: "95.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Canvas Backpack Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Canvas Backpack Angle", position: 1 },
      { url: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80", alt: "Canvas Backpack Back", position: 2 },
      { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", alt: "Canvas Backpack Pocket", position: 3 },
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Canvas Backpack Lifestyle", position: 4 },
    ],
    variants: [
      { sku: "MCB-BLK-20L", title: "Matte Black / 20L", price: "95.00", stock: 40 },
      { sku: "MCB-OLV-20L", title: "Olive Green / 20L", price: "95.00", stock: 20 },
    ],
  },
  {
    name: "Structured Crossbody Bag",
    slug: "structured-crossbody-bag",
    description: "Architectural boxy crossbody bag with polished magnetic closure and adjustable strap.",
    brand: "Ciseco",
    price: "79.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Crossbody Bag Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Crossbody Bag Side", position: 1 },
      { url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80", alt: "Crossbody Bag Detail", position: 2 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Crossbody Bag Strap", position: 3 },
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80", alt: "Crossbody Bag Lifestyle", position: 4 },
    ],
    variants: [
      { sku: "SCB-YEL-SM", title: "Mustard Tan / Small", price: "79.00", stock: 18 },
      { sku: "SCB-CRM-SM", title: "Alabaster Cream / Small", price: "79.00", stock: 15 },
    ],
  },
  {
    name: "Vintage Leather Satchel",
    slug: "vintage-leather-satchel",
    description: "Classic vegetable-tanned leather messenger with brass hardware and reinforced stitching.",
    brand: "Fossil",
    price: "145.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", alt: "Leather Satchel Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Leather Satchel Buckle", position: 1 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Leather Satchel Angle", position: 2 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Leather Satchel Interior", position: 3 },
      { url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", alt: "Leather Satchel Carried", position: 4 },
    ],
    variants: [
      { sku: "VLS-BRN-MED", title: "Chestnut Brown / Medium", price: "145.00", stock: 12 },
    ],
  },
  {
    name: "Urban Commuter Duffel",
    slug: "urban-commuter-duffel",
    description: "Sleek travel duffel with dedicated shoe compartment, storm-proof zippers and padded handles.",
    brand: "Herschel",
    price: "110.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Commuter Duffel Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", alt: "Commuter Duffel Side", position: 1 },
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Commuter Duffel Open", position: 2 },
      { url: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80", alt: "Commuter Duffel Handle", position: 3 },
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Commuter Duffel Travel", position: 4 },
    ],
    variants: [
      { sku: "UCD-GRY-40L", title: "Charcoal Grey / 40L", price: "110.00", stock: 35 },
      { sku: "UCD-NVY-40L", title: "Deep Navy / 40L", price: "110.00", stock: 22 },
    ],
  },
  {
    name: "Woven Straw Beach Tote",
    slug: "woven-straw-beach-tote",
    description: "Artisan handwoven natural raffia straw tote finished with soft vegan leather handles.",
    brand: "Ciseco",
    price: "65.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80", alt: "Straw Beach Tote Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1614179689702-355944cf0918?auto=format&fit=crop&w=800&q=80", alt: "Straw Beach Tote Angle", position: 1 },
      { url: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80", alt: "Straw Beach Tote Weave", position: 2 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Straw Beach Tote Top", position: 3 },
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80", alt: "Straw Beach Tote Beach", position: 4 },
    ],
    variants: [
      { sku: "WSB-NAT-OS", title: "Natural Straw / One Size", price: "65.00", stock: 28 },
    ],
  },
  {
    name: "Sleek Waterproof Sling",
    slug: "sleek-waterproof-sling",
    description: "Hands-free compact sling pack built with weatherproof Cordura fabric and quick-release buckle.",
    brand: "Peak Design",
    price: "85.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", alt: "Waterproof Sling Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Waterproof Sling Angle", position: 1 },
      { url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80", alt: "Waterproof Sling Buckle", position: 2 },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Waterproof Sling Interior", position: 3 },
      { url: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80", alt: "Waterproof Sling Worn", position: 4 },
    ],
    variants: [
      { sku: "SWS-BLK-5L", title: "Obsidian Black / 5L", price: "85.00", stock: 50 },
      { sku: "SWS-SGE-5L", title: "Sage Green / 5L", price: "85.00", stock: 24 },
    ],
  },
  {
    name: "Equestrian Saddle Bag",
    slug: "equestrian-saddle-bag",
    description: "Curved saddle silhouette crafted from smooth bridle leather with gold-toned metallic accents.",
    brand: "Coach",
    price: "165.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Saddle Bag Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Saddle Bag Flap", position: 1 },
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80", alt: "Saddle Bag Profile", position: 2 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Saddle Bag Hardware", position: 3 },
      { url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80", alt: "Saddle Bag Styling", position: 4 },
    ],
    variants: [
      { sku: "ESB-BUR-SM", title: "Burgundy Red / Small", price: "165.00", stock: 14 },
      { sku: "ESB-BLK-SM", title: "Classic Black / Small", price: "165.00", stock: 16 },
    ],
  },
  {
    name: "Executive Leather Briefcase",
    slug: "executive-leather-briefcase",
    description: "Refined professional briefcase with dual file dividers, laptop protection, and trolley sleeve.",
    brand: "Tumi",
    price: "245.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Leather Briefcase Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", alt: "Leather Briefcase Side", position: 1 },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Leather Briefcase Interior", position: 2 },
      { url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", alt: "Leather Briefcase Handle", position: 3 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Leather Briefcase In-Use", position: 4 },
    ],
    variants: [
      { sku: "ELB-DKB-15", title: "Dark Espresso / 15-inch", price: "245.00", stock: 10 },
      { sku: "ELB-BLK-15", title: "Onyx Black / 15-inch", price: "245.00", stock: 15 },
    ],
  },
  {
    name: "Everyday Cotton Canvas Tote",
    slug: "everyday-cotton-canvas-tote",
    description: "Heavyweight 16oz organic cotton grocery and everyday tote with inner zip pocket.",
    brand: "Everlane",
    price: "38.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1614179689702-355944cf0918?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1614179689702-355944cf0918?auto=format&fit=crop&w=800&q=80", alt: "Canvas Tote Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80", alt: "Canvas Tote Folded", position: 1 },
      { url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", alt: "Canvas Tote Handles", position: 2 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Canvas Tote Interior", position: 3 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Canvas Tote Stitched", position: 4 },
    ],
    variants: [
      { sku: "ECT-ECR-OS", title: "Ecru White / One Size", price: "38.00", stock: 65 },
      { sku: "ECT-NVY-OS", title: "Navy Blue / One Size", price: "38.00", stock: 40 },
    ],
  },
  {
    name: "Compact Camera Crossbody",
    slug: "compact-camera-crossbody",
    description: "Retro boxy camera bag featuring top dual-zip entry and detachable webbed guitar strap.",
    brand: "Ciseco",
    price: "72.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80", alt: "Camera Bag Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", alt: "Camera Bag Zipper", position: 1 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Camera Bag Angle", position: 2 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Camera Bag Strap", position: 3 },
      { url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80", alt: "Camera Bag Outdoor", position: 4 },
    ],
    variants: [
      { sku: "CCC-OLV-STD", title: "Olive Camo / Standard", price: "72.00", stock: 22 },
      { sku: "CCC-BLK-STD", title: "Jet Black / Standard", price: "72.00", stock: 30 },
    ],
  },
  {
    name: "Roll-Top Commuter Backpack",
    slug: "roll-top-commuter-backpack",
    description: "Expandable waterproof roll-top rucksack engineered for cycling and rainy city transits.",
    brand: "Bellroy",
    price: "125.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Roll-Top Backpack Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Roll-Top Backpack Unrolled", position: 1 },
      { url: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80", alt: "Roll-Top Backpack Straps", position: 2 },
      { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", alt: "Roll-Top Backpack Closure", position: 3 },
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Roll-Top Backpack Rainy Transit", position: 4 },
    ],
    variants: [
      { sku: "RTB-GRY-25L", title: "Storm Grey / 25L", price: "125.00", stock: 26 },
      { sku: "RTB-BLK-25L", title: "Matte Black / 25L", price: "125.00", stock: 35 },
    ],
  },
  {
    name: "Crescent Leather Hobo",
    slug: "crescent-leather-hobo",
    description: "Slouchy crescent shoulder bag tailored in butter-soft Italian pebble calfskin.",
    brand: "Cuyana",
    price: "155.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80", alt: "Crescent Hobo Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Crescent Hobo Drape", position: 1 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Crescent Hobo Slouch", position: 2 },
      { url: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80", alt: "Crescent Hobo Leather Texture", position: 3 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Crescent Hobo Evening", position: 4 },
    ],
    variants: [
      { sku: "CLH-CAR-MED", title: "Warm Caramel / Medium", price: "155.00", stock: 18 },
      { sku: "CLH-IVR-MED", title: "Ivory / Medium", price: "155.00", stock: 12 },
    ],
  },
  {
    name: "Weekender Travel Duffle",
    slug: "weekender-travel-duffle",
    description: "TSA carry-on compliant duffel crafted with durable twill canvas and genuine leather trims.",
    brand: "Herschel",
    price: "135.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", alt: "Weekender Duffle Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Weekender Duffle Packed", position: 1 },
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Weekender Duffle Zippers", position: 2 },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", alt: "Weekender Duffle Straps", position: 3 },
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Weekender Duffle Airport", position: 4 },
    ],
    variants: [
      { sku: "WTD-TAN-35L", title: "Khaki Tan / 35L", price: "135.00", stock: 25 },
      { sku: "WTD-BLK-35L", title: "Black Twill / 35L", price: "135.00", stock: 20 },
    ],
  },
  {
    name: "Pleated Satin Evening Clutch",
    slug: "pleated-satin-evening-clutch",
    description: "Glamorous handheld evening clutch with delicate pleating and a removable delicate chain strap.",
    brand: "Ciseco",
    price: "58.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1566150902887-9679ec15dcb7?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1566150902887-9679ec15dcb7?auto=format&fit=crop&w=800&q=80", alt: "Satin Evening Clutch Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80", alt: "Satin Evening Clutch Open", position: 1 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Satin Evening Clutch Chain", position: 2 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Satin Evening Clutch Handheld", position: 3 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Satin Evening Clutch Night", position: 4 },
    ],
    variants: [
      { sku: "PSC-CHM-OS", title: "Champagne Gold / One Size", price: "58.00", stock: 20 },
      { sku: "PSC-SLV-OS", title: "Metallic Silver / One Size", price: "58.00", stock: 15 },
    ],
  },
  {
    name: "Heritage Outdoor Rucksack",
    slug: "heritage-outdoor-rucksack",
    description: "Vintage mountaineering-inspired backpack with twin front utility pockets and cinch closure.",
    brand: "Fossil",
    price: "115.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80", alt: "Outdoor Rucksack Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Outdoor Rucksack Flap", position: 1 },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Outdoor Rucksack Pockets", position: 2 },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", alt: "Outdoor Rucksack Side", position: 3 },
      { url: "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80", alt: "Outdoor Rucksack Mountain", position: 4 },
    ],
    variants: [
      { sku: "HOR-FOR-24L", title: "Forest Green / 24L", price: "115.00", stock: 20 },
      { sku: "HOR-BRN-24L", title: "Tobacco Brown / 24L", price: "115.00", stock: 15 },
    ],
  },
  {
    name: "Drawstring Leather Bucket Bag",
    slug: "drawstring-leather-bucket-bag",
    description: "Sculpted bucket bag featuring a secure drawstring cinch cord and versatile top carry handle.",
    brand: "Coach",
    price: "148.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80", alt: "Bucket Bag Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80", alt: "Bucket Bag Cinch", position: 1 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Bucket Bag Base", position: 2 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Bucket Bag Handle", position: 3 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Bucket Bag City", position: 4 },
    ],
    variants: [
      { sku: "DLB-SND-MED", title: "Warm Sand / Medium", price: "148.00", stock: 18 },
      { sku: "DLB-BLK-MED", title: "Noir Black / Medium", price: "148.00", stock: 14 },
    ],
  },
  {
    name: "Active Utility Belt Bag",
    slug: "active-utility-belt-bag",
    description: "Lightweight weather-resistant waist pack worn across the chest or waist for active workouts.",
    brand: "Peak Design",
    price: "48.00",
    isFeatured: false,
    mainImage: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", alt: "Belt Bag Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80", alt: "Belt Bag Buckle", position: 1 },
      { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80", alt: "Belt Bag Zippers", position: 2 },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", alt: "Belt Bag Waist Worn", position: 3 },
      { url: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80", alt: "Belt Bag Crossbody", position: 4 },
    ],
    variants: [
      { sku: "AUB-BLK-2L", title: "Stealth Black / 2L", price: "48.00", stock: 45 },
      { sku: "AUB-LIL-2L", title: "Soft Lilac / 2L", price: "48.00", stock: 30 },
    ],
  },
  {
    name: "Designer Petite Mini Handbag",
    slug: "designer-petite-mini-handbag",
    description: "Statement micro handbag with high-gloss patent finish and structured top handle.",
    brand: "Ciseco",
    price: "98.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80", alt: "Mini Handbag Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1566150902887-9679ec15dcb7?auto=format&fit=crop&w=800&q=80", alt: "Mini Handbag Handle", position: 1 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Mini Handbag Hardware", position: 2 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Mini Handbag Detail", position: 3 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Mini Handbag Fashion", position: 4 },
    ],
    variants: [
      { sku: "DPM-BLU-XS", title: "Powder Blue / XS", price: "98.00", stock: 12 },
      { sku: "DPM-RED-XS", title: "Ruby Red / XS", price: "98.00", stock: 10 },
    ],
  },
  {
    name: "Quilted Chain Shoulder Bag",
    slug: "quilted-chain-shoulder-bag",
    description: "Timeless diamond quilted leather purse with woven gold chain crossbody shoulder strap.",
    brand: "Cuyana",
    price: "175.00",
    isFeatured: true,
    mainImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Quilted Bag Main", position: 0 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Quilted Bag Chain Strap", position: 1 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Quilted Bag Lock", position: 2 },
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80", alt: "Quilted Bag Back", position: 3 },
      { url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=80", alt: "Quilted Bag Evening Out", position: 4 },
    ],
    variants: [
      { sku: "QCS-BLK-MED", title: "Caviar Black / Medium", price: "175.00", stock: 20 },
      { sku: "QCS-BEI-MED", title: "Soft Beige / Medium", price: "175.00", stock: 15 },
    ],
  },
];

async function seed() {
  console.log("Seeding 20 Bag Category Products with 5 Images Each...");

  // Ensure "Bags" category exists
  let bagsCategory = await prisma.category.findUnique({
    where: { slug: "bags" },
  });

  if (!bagsCategory) {
    bagsCategory = await prisma.category.create({
      data: {
        name: "Bags",
        slug: "bags",
        isActive: true,
      },
    });
    console.log("Created Bags category:", bagsCategory.id);
  } else {
    console.log("Found existing Bags category:", bagsCategory.id);
  }

  // Also update Leather Tote Bag with 5 real bag images
  const existingTote = await prisma.product.findUnique({
    where: { slug: "leather-tote-bag" },
  });
  if (existingTote) {
    await prisma.product.update({
      where: { id: existingTote.id },
      data: {
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      },
    });

    const toteImages = [
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", alt: "Leather Tote Front", position: 0 },
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", alt: "Leather Tote Angle", position: 1 },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", alt: "Leather Tote Detail", position: 2 },
      { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80", alt: "Leather Tote Interior", position: 3 },
      { url: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80", alt: "Leather Tote Carried", position: 4 },
    ];

    for (const img of toteImages) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: existingTote.id, position: img.position },
      });
      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: img.url, alt: img.alt },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: existingTote.id,
            url: img.url,
            alt: img.alt,
            position: img.position,
          },
        });
      }
    }
    console.log("Updated Leather Tote Bag with 5 real bag images");
  }

  let count = 0;
  for (const item of BAG_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        brand: item.brand,
        image: item.mainImage,
        categoryId: bagsCategory.id,
        isActive: true,
        isFeatured: item.isFeatured,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        brand: item.brand,
        image: item.mainImage,
        categoryId: bagsCategory.id,
        isActive: true,
        isFeatured: item.isFeatured,
      },
    });

    // Seed 5 gallery images
    for (const img of item.images) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: product.id, position: img.position },
      });
      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: img.url, alt: img.alt },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            alt: img.alt,
            position: img.position,
          },
        });
      }
    }

    // Variants
    for (const v of item.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          price: v.price,
          stock: v.stock,
          title: v.title,
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          price: v.price,
          stock: v.stock,
          isActive: true,
        },
      });
    }

    count++;
    console.log(`[${count}/20] Seeded with 5 images: ${item.name} (${item.slug})`);
  }

  console.log("Successfully seeded 20 bag category products with 5 images each!");
}

if (require.main === module) {
  seed()
    .catch((err) => {
      console.error("Failed to seed bags:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { BAG_PRODUCTS, seed };
