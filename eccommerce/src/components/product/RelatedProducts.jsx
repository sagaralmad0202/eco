import { useState, useCallback, useEffect, useRef } from "react";
import ProductCard from "../ProductCard";
import ProductCardSkeleton from "../skeletons/ProductCardSkeleton";
import productsApi from "../../services/productsApi";
import { toCardProducts, toCardProduct } from "../../utils/productAdapter";
import { PRODUCTS } from "../../data/products";

const PREFERRED_RELATED_SLUGS = [
  "denim-jacket",
  "cashmere-sweater",
  "linen-blazer",
  "velvet-skirt",
  "sunrise-on-the-red-sand-dunes",
  "zara-lisboa-seoul",
  "silk-midi-dress",
  "leather-tote-bag",
];

export default function RelatedProducts({
  currentProductId,
  currentProductSlug,
  category,
  onQuickView,
}) {
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
  const [activeArrow, setActiveArrow] = useState("next");

  const filterOutCurrent = useCallback(
    (items) => {
      return items.filter((p) => {
        if (!p) return false;
        const idMatch =
          currentProductId &&
          (String(p.id) === String(currentProductId) ||
            String(p.productId) === String(currentProductId));
        const slugMatch =
          currentProductSlug &&
          (p.slug === currentProductSlug || p.handle === currentProductSlug);
        return !idMatch && !slugMatch;
      });
    },
    [currentProductId, currentProductSlug]
  );

  const sortByPreferredOrder = useCallback((items) => {
    return [...items].sort((a, b) => {
      const aSlug = a.slug || a.handle || "";
      const bSlug = b.slug || b.handle || "";
      const aIdx = PREFERRED_RELATED_SLUGS.indexOf(aSlug);
      const bIdx = PREFERRED_RELATED_SLUGS.indexOf(bSlug);
      const safeA = aIdx === -1 ? 999 : aIdx;
      const safeB = bIdx === -1 ? 999 : bIdx;
      return safeA - safeB;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchRelated() {
      try {
        let items = [];

        // 1. Fetch general catalogue products from API
        try {
          const generalRes = await productsApi.list({ limit: 20 });
          if (generalRes?.items?.length) {
            const adapted = toCardProducts(generalRes.items);
            items = filterOutCurrent(adapted);
          }
        } catch (err) {
          console.warn("General catalogue fetch failed, falling back to local:", err);
        }

        // 2. Fallback to local products if API returns empty
        if (items.length === 0) {
          const localAdapted = toCardProducts(PRODUCTS);
          items = filterOutCurrent(localAdapted);
        }

        // 3. Sort by signature collection order to match ciseco design
        const ordered = sortByPreferredOrder(items);

        if (!cancelled) {
          setProducts(ordered);
        }
      } catch (err) {
        console.warn("Could not fetch related products:", err);
        if (!cancelled) {
          const localAdapted = toCardProducts(PRODUCTS);
          const filtered = filterOutCurrent(localAdapted);
          setProducts(sortByPreferredOrder(filtered));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [currentProductId, currentProductSlug, filterOutCurrent, sortByPreferredOrder]);

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
  }, [products, updateButtons]);

  if (!loading && products.length === 0) {
    return null;
  }

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
        {loading && products.length === 0 ? (
          <div className="flex sm:-ml-[32px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-0 shrink-0 snap-start pl-0 last:pr-0 sm:pl-[32px] basis-[280px] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex sm:-ml-[32px]">
            {products.map((product) => (
              <div
                key={product.id || product.slug}
                className="min-w-0 shrink-0 snap-start pl-0 last:pr-0 sm:pl-[32px] basis-[280px] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard
                  data={product}
                  onQuickView={onQuickView}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
