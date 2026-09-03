import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import productsApi from "../../services/productsApi";
import { toCardProducts, toCardProduct } from "../../utils/productAdapter";
import { PRODUCTS } from "../../data/products";

import p1 from "../../assets/p1.webp";
import p2 from "../../assets/p2.webp";
import p3 from "../../assets/p3.webp";
import p4 from "../../assets/p4.webp";
import p1t1 from "../../assets/Linen Blazer.webp";
import p1t2 from "../../assets/Linen Blazer1.webp";
import p1t3 from "../../assets/Linen Blazer2.webp";
import p2t1 from "../../assets/Denim jacket.webp";
import p2t2 from "../../assets/Denim jacket1.webp";
import p2t3 from "../../assets/Denim jacket2.webp";
import p3t1 from "../../assets/Velvet Skirt.webp";
import p3t2 from "../../assets/Velvet Skirt1.webp";
import p3t3 from "../../assets/Velvet Skirt2.webp";

const fallbackExpertProducts = [
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
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function loadProducts() {
      try {
        // Try to fetch featured products or general product list
        const res = await productsApi.listFeatured({ limit: 6 });
        let items = res?.items || [];

        if (!items.length) {
          const fallbackRes = await productsApi.list({ limit: 6, sort: "newest" });
          items = fallbackRes?.items || [];
        }

        if (!cancelled) {
          if (items.length > 0) {
            setProducts(toCardProducts(items));
          } else {
            const localProducts = PRODUCTS.slice(0, 6).map(toCardProduct);
            setProducts(localProducts.length ? localProducts : fallbackExpertProducts);
          }
        }
      } catch (err) {
        console.warn("Could not fetch expert products from API:", err);
        if (!cancelled) {
          const localProducts = PRODUCTS.slice(0, 6).map(toCardProduct);
          setProducts(localProducts.length ? localProducts : fallbackExpertProducts);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products, loading, checkScroll]);

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
            disabled={!canScrollRight}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              canScrollRight
                ? "cursor-pointer border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300"
                : "cursor-not-allowed border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-600"
            }`}
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
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`expert-skeleton-${idx}`}
                className="w-[340px] shrink-0 sm:w-[380px] lg:w-[calc(33.333%-16px)] animate-pulse"
              >
                {/* Main image skeleton */}
                <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />

                {/* Thumbnails skeleton */}
                <div className="mt-3 flex gap-2.5">
                  <div className="aspect-[4/3] w-1/3 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="aspect-[4/3] w-1/3 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="aspect-[4/3] w-1/3 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                </div>

                {/* Info row skeleton */}
                <div className="mt-4 flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                  <div className="h-8 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))
          : products.map((product) => {
              const productId =
                product.id ||
                product.productId ||
                product.slug ||
                product.name?.toLowerCase().replace(/\s+/g, "-");
              const productUrl = `/products/${productId}`;
              const mainImg =
                product.mainImage ||
                product.image ||
                product.images?.[0] ||
                p1;
              const thumbs =
                Array.isArray(product.thumbnails) && product.thumbnails.length >= 3
                  ? product.thumbnails
                  : Array.isArray(product.thumbs) && product.thumbs.length >= 3
                  ? product.thumbs
                  : Array.isArray(product.images) && product.images.length >= 3
                  ? product.images
                  : [mainImg, mainImg, mainImg];

              return (
                <div
                  key={product.id || productId}
                  className="w-[340px] shrink-0 sm:w-[380px] lg:w-[calc(33.333%-16px)]"
                >
                  {/* Main image - clickable Link to product detail */}
                  <Link
                    to={productUrl}
                    className="block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={mainImg}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain object-center hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Thumbnails - clickable */}
                  <div className="mt-3 flex gap-2.5">
                    {thumbs.slice(0, 3).map((thumb, idx) => (
                      <Link
                        key={idx}
                        to={productUrl}
                        className="aspect-[4/3] w-1/3 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={thumb}
                          alt={`${product.name} view ${idx + 1}`}
                          loading="lazy"
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
                        <span>{product.desc || product.description || "In stock"}</span>
                        {Number(product.reviews) > 0 && (
                          <>
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
                              {product.rating} ({product.reviews} {product.reviews === 1 ? "review" : "reviews"})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link
                      to={productUrl}
                      className="flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1.5 text-sm font-medium leading-none text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                      style={{ textDecoration: "none" }}
                    >
                      ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                    </Link>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
