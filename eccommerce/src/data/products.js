import p1Asset from "../assets/p1.webp";
import p2Asset from "../assets/p2.webp";
import p3Asset from "../assets/p3.webp";
import p4Asset from "../assets/p4.webp";
import p4Asset2 from "../assets/p4-2.webp";
import p4Asset3 from "../assets/p4-3.webp";
import p4Asset4 from "../assets/p4-4.webp";
import p5Asset from "../assets/p5.webp";
import p6Asset from "../assets/p6.webp";
import p7Asset from "../assets/p7.webp";
import p8Asset from "../assets/p8.webp";

export const PRODUCTS = [
  {
    id: 1,
    name: "Leather Tote Bag",
    slug: "leather-tote-bag",
    desc: "Pink Yarrow",
    price: "85.00",
    rating: 4.5,
    reviews: 87,
    image: p1Asset,
    colors: ["#000000", "#7B4214", "#C6BDB5", "#F2D8CB"],
    badge: "New in",
    liked: false,
    thumbs: [p1Asset, p2Asset, p3Asset, p4Asset]
  },
  {
    id: 2,
    name: "Silk Midi Dress",
    slug: "silk-midi-dress",
    desc: "Emerald Green",
    price: "120.00",
    rating: 4.7,
    reviews: 95,
    image: p2Asset,
    colors: ["#3B9668", "#9ED414", "#060A82", "#FF7E47"],
    badge: null,
    liked: false,
    thumbs: [p2Asset, p3Asset, p4Asset, p5Asset]
  },
  {
    id: 3,
    name: "Denim Jacket",
    slug: "denim-jacket",
    desc: "Light Blue",
    price: "65.00",
    rating: 4.3,
    reviews: 120,
    image: p3Asset,
    colors: ["#ADD8E6", "#00008B", "#000000"],
    badge: "New in",
    liked: false,
    thumbs: [p3Asset, p4Asset, p5Asset, p6Asset]
  },
  {
    id: 4,
    name: "Cashmere Sweater",
    slug: "cashmere-sweater",
    desc: "Cream",
    price: "150.00",
    rating: 4.8,
    reviews: 75,
    image: p4Asset,
    colors: ["#3b474e", "#fc9faf", "#811428"],
    badge: null,
    liked: true,
    thumbs: [p4Asset, p4Asset2, p4Asset3, p4Asset4, p4Asset]
  },
  {
    id: 5,
    name: "Linen Blazer",
    slug: "linen-blazer",
    desc: "Beige",
    price: "95.00",
    rating: 4.4,
    reviews: 60,
    image: p5Asset,
    colors: ["#F5F5DC", "#000080", "#808000"],
    badge: "New in",
    liked: false,
    thumbs: [p5Asset, p6Asset, p7Asset, p8Asset]
  },
  {
    id: 6,
    name: "Velvet Skirt",
    slug: "velvet-skirt",
    desc: "Wine Red",
    price: "55.00",
    rating: 4.2,
    reviews: 45,
    image: p6Asset,
    colors: ["#191970", "#722F37", "#50C878"],
    badge: null,
    liked: false,
    thumbs: [p6Asset, p7Asset, p8Asset, p1Asset]
  },
  {
    id: 7,
    name: "Wool Trench Coat",
    slug: "wool-trench-coat",
    desc: "Camel",
    price: "180.00",
    rating: 4.6,
    reviews: 80,
    image: p7Asset,
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    liked: true,
    thumbs: [p7Asset, p8Asset, p1Asset, p2Asset]
  },
  {
    id: 8,
    name: "Cotton Shirt",
    slug: "cotton-shirt",
    desc: "White",
    price: "45.00",
    rating: 4.1,
    reviews: 110,
    image: p8Asset,
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    liked: false,
    thumbs: [p8Asset, p1Asset, p2Asset, p3Asset]
  }
];
