import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

import p1 from "../../assets/p1.webp";
import p2 from "../../assets/p2.webp";
import p3 from "../../assets/p3.webp";
import p4 from "../../assets/p4.webp";

// Thumbnail variants for each product
import p1t1 from "../../assets/Linen Blazer.webp";
import p1t2 from "../../assets/Linen Blazer1.webp";
import p1t3 from "../../assets/Linen Blazer2.webp";

import p2t1 from "../../assets/Denim jacket.webp";
import p2t2 from "../../assets/Denim jacket1.webp";
import p2t3 from "../../assets/Denim jacket2.webp";

import p3t1 from "../../assets/Velvet Skirt.webp";
import p3t2 from "../../assets/Velvet Skirt1.webp";
import p3t3 from "../../assets/Velvet Skirt2.webp";

const expertProducts = [
  {
    id: 1,
    slug: "leather-tote-bag",
    name: "Leather Tote Bag",
    desc: "Pink Yarrow",
    price: "85.00",
    rating: "4.5",
    reviews: "87",
    mainImage: p1,
    thumbnails: [p1t1, p1t2, p1t3],
  },
  {
    id: 2,
    slug: "silk-midi-dress",
    name: "Silk Midi Dress",
    desc: "Emerald Green",
    price: "120.00",
    rating: "4.7",
    reviews: "95",
    mainImage: p2,
    thumbnails: [p2t1, p2t2, p2t3],
  },
  {
    id: 3,
    slug: "denim-jacket",
    name: "Denim Jacket",
    desc: "Light Blue",
    price: "65.00",
    rating: "4.3",
    reviews: "120",
    mainImage: p3,
    thumbnails: [p3t1, p3t2, p3t3],
  },
  {
    id: 4,
    slug: "cashmere-sweater",
    name: "Cashmere Sweater",
    desc: "Cream",
    price: "150.00",
    rating: "4.8",
    reviews: "75",
    mainImage: p4,
    thumbnails: [p1t1, p1t2, p1t3],
  },
];

export default function ChosenByExperts() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 400);
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 lg:py-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2
          className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl lg:text-[32px]"
          style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
        >
          Chosen by experts.{" "}
          <span className="font-normal text-neutral-400 dark:text-neutral-500">
            Featured of the week
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              canScrollLeft
                ? "cursor-pointer border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300"
                : "cursor-not-allowed border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-600"
            }`}
            aria-label="Scroll left"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300"
            aria-label="Scroll right"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="hidden-scrollbar flex gap-6 overflow-x-auto scroll-smooth"
      >
        {expertProducts.map((product) => {
          const productUrl = `/products/${product.slug || product.name.toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <div
              key={product.id}
              className="w-[340px] shrink-0 sm:w-[380px] lg:w-[calc(33.333%-16px)]"
            >
              {/* Main image - clickable Link to product detail */}
              <Link
                to={productUrl}
                className="block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:opacity-95 transition-opacity"
              >
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="h-full w-full object-contain object-center hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Thumbnails - clickable */}
              <div className="mt-3 flex gap-2.5">
                {product.thumbnails.map((thumb, idx) => (
                  <Link
                    key={idx}
                    to={productUrl}
                    className="aspect-[4/3] w-1/3 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={thumb}
                      alt={`${product.name} view ${idx + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </Link>
                ))}
              </div>

              {/* Info row */}
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h3
                    className="text-base font-semibold text-neutral-900 dark:text-neutral-50"
                    style={{
                      fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                    }}
                  >
                    <Link
                      to={productUrl}
                      className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      style={{ textDecoration: "none" }}
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <div
                    className="mt-1 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
                    style={{
                      fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                    }}
                  >
                    <span>{product.desc}</span>
                    <span className="text-neutral-300 dark:text-neutral-600">
                      |
                    </span>
                    <svg
                      className="h-4 w-4 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span>
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>
                <Link
                  to={productUrl}
                  className="flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1.5 text-sm font-medium leading-none text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  ${product.price}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

