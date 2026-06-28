import ProductCard from "../ProductCard";

import p1 from "../../assets/p1.webp";
import p2 from "../../assets/p2.webp";
import p3 from "../../assets/p3.webp";
import p4 from "../../assets/p4.webp";
import p5 from "../../assets/p5.webp";
import p6 from "../../assets/p6.webp";
import p7 from "../../assets/p7.webp";
import p8 from "../../assets/p8.webp";

const products = [
  {
    id: 101,
    name: "Leather Tote Bag",
    desc: "Pink Yarrow",
    price: "85.00",
    image: p1,
    badge: "New in",
    liked: true,
    rating: "4.5",
    reviews: "87",
    colors: ["#111111", "#8B4513", "#C0C0C0", "#FFE4C4"],
  },
  {
    id: 102,
    name: "Silk Midi Dress",
    desc: "Emerald Green",
    price: "120.00",
    image: p2,
    badge: false,
    liked: false,
    rating: "4.7",
    reviews: "95",
    colors: ["#228B22", "#9ACD32", "#00008B", "#FF6347"],
  },
  {
    id: 103,
    name: "Denim Jacket",
    desc: "Light Blue",
    price: "65.00",
    image: p3,
    badge: "New in",
    liked: true,
    rating: "4.3",
    reviews: "120",
    colors: ["#87CEEB", "#0000CD", "#111111"],
  },
  {
    id: 104,
    name: "Cashmere Sweater",
    desc: "Cream",
    price: "150.00",
    image: p4,
    badge: false,
    liked: false,
    rating: "4.8",
    reviews: "75",
    colors: ["#444444", "#FFB6C1", "#8B0000"],
  },
  {
    id: 105,
    name: "Linen Blazer",
    desc: "Beige",
    price: "95.00",
    image: p5,
    badge: "New in",
    liked: false,
    rating: "4.4",
    reviews: "60",
    colors: ["#DCDCDC", "#00008B", "#556B2F"],
  },
  {
    id: 106,
    name: "Velvet Skirt",
    desc: "Wine Red",
    price: "55.00",
    image: p6,
    badge: false,
    liked: false,
    rating: "4.2",
    reviews: "45",
    colors: ["#0000CD", "#4B0082", "#2E8B57"],
  },
  {
    id: 107,
    name: "Wool Trench Coat",
    desc: "Camel",
    price: "180.00",
    image: p7,
    badge: "New in",
    liked: true,
    rating: "4.6",
    reviews: "80",
    colors: ["#D2B48C", "#111111", "#808080"],
  },
  {
    id: 108,
    name: "Cotton Shirt",
    desc: "White",
    price: "45.00",
    image: p8,
    badge: false,
    liked: true,
    rating: "4.1",
    reviews: "110",
    colors: ["#FF6347", "#4682B4", "#FFB6C1"],
  },
];

export default function ProductGrid({ onQuickView }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          data={product}
          gridMode={true}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}
