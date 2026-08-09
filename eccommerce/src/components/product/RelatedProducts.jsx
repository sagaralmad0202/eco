import { useState, useCallback, useEffect, useRef } from "react";
import ProductCard from "../ProductCard";

const RELATED_PRODUCTS = [
  {
    slug: "denim-jacket",
    name: "Denim Jacket",
    variant: "Light Blue",
    price: "65.00",
    rating: 4.3,
    reviews: 120,
    image: "/src/assets/p3.webp",
    badge: "New in",
    liked: true,
    colors: ["#ADD8E6", "#00008B", "#000000"],
  },
  {
    slug: "cashmere-sweater",
    name: "Cashmere Sweater",
    variant: "Cream",
    price: "150.00",
    rating: 4.8,
    reviews: 75,
    image: "/src/assets/p4.webp",
    badge: null,
    liked: true,
    colors: ["#3b474e", "#fc9faf", "#811428"],
  },
  {
    slug: "linen-blazer",
    name: "Linen Blazer",
    variant: "Beige",
    price: "95.00",
    rating: 4.4,
    reviews: 60,
    image: "/src/assets/p5.webp",
    badge: "New in",
    liked: false,
    colors: ["#F5F5DC", "#000080", "#808000"],
  },
  {
    slug: "velvet-skirt",
    name: "Velvet Skirt",
    variant: "Wine Red",
    price: "55.00",
    rating: 4.2,
    reviews: 45,
    image: "/src/assets/p6.webp",
    badge: null,
    liked: true,
    colors: ["#191970", "#722F37", "#50C878"],
  },
  {
    slug: "wool-trench-coat",
    name: "Sunrise On The Red Sand Dunes",
    variant: "Eau De Parfum",
    price: "180.00",
    rating: 4.6,
    reviews: 80,
    image: "/src/assets/p7.webp",
    badge: "New in",
    liked: true,
    colors: ["#c2a27b", "#1c1917", "#78716c"],
  },
  {
    slug: "cotton-shirt",
    name: "Zara Lisboa & Seoul",
    variant: "Eau De Toilette",
    price: "45.00",
    rating: 4.1,
    reviews: 110,
    image: "/src/assets/p8.webp",
    badge: null,
    liked: false,
    colors: ["#fbcfe8", "#bae6fd", "#fecdd3"],
  },
  {
    slug: "leather-tote-bag",
    name: "Leather Tote Bag",
    variant: "Pink Yarrow",
    price: "85.00",
    rating: 4.5,
    reviews: 87,
    image: "/src/assets/p1.webp",
    badge: "New in",
    liked: false,
    colors: ["#000000", "#7B4214", "#C6BDB5"],
  },
  {
    slug: "silk-midi-dress",
    name: "Silk Midi Dress",
    variant: "Emerald Green",
    price: "120.00",
    rating: 4.7,
    reviews: 95,
    image: "/src/assets/p2.webp",
    badge: null,
    liked: false,
    colors: ["#3B9668", "#9ED414", "#060A82"],
  },
];

export default function RelatedProducts({ onQuickView }) {
  const sliderRef = useRef(null);

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
  const [activeArrow, setActiveArrow] = useState("next");

  const updateButtons = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    setPrevBtnDisabled(slider.scrollLeft <= 0);
    setNextBtnDisabled(slider.scrollLeft >= maxScrollLeft - 1);
  }, []);

  const scrollPrev = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    setActiveArrow("prev");
    slider.scrollBy({ left: -slider.clientWidth, behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    setActiveArrow("next");
    slider.scrollBy({ left: slider.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    updateButtons();
    slider.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      slider.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  return (
    <div className="nc-SectionSliderProductCard">
      <div className="relative mb-12 flex w-full flex-col justify-between text-neutral-900 dark:text-neutral-50 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">
            Customers also purchased
          </h2>
        </div>
        <div className="mt-4 flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <div className="nc-NextPrev relative flex items-center gap-[10px] text-neutral-500 dark:text-neutral-400">
            <button
              type="button"
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeArrow === "prev"
                  ? "border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                  : "border border-transparent text-neutral-500"
              }`}
              aria-label="Prev"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 rtl:rotate-180">
                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeArrow === "next"
                  ? "border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                  : "border border-transparent text-neutral-500"
              }`}
              aria-label="Next"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 rtl:rotate-180">
                <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory"
        ref={sliderRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-x-4 sm:gap-x-8">
          {RELATED_PRODUCTS.map((product) => (
            <div
              key={product.slug}
              className="min-w-0 shrink-0 snap-start basis-[260px] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard
                data={{
                  id: product.slug,
                  name: product.name,
                  desc: product.variant,
                  price: product.price,
                  rating: product.rating,
                  reviews: product.reviews,
                  image: product.image,
                  colors: product.colors,
                  badge: product.badge,
                  liked: product.liked,
                  slug: product.slug,
                }}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
