import React, { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchNewArrivals,
  selectNewArrivalsRail,
} from "../redux/slices/productsSlice";
import p4Asset from "../assets/p4.webp";
import p5Asset from "../assets/p5.webp";
import p6Asset from "../assets/p6.webp";
import p7Asset from "../assets/p7.webp";
import p8Asset from "../assets/p8.webp";

const DEMO_DATA = [
  { id: "cashmere-sweater", productId: "cashmere-sweater", slug: "cashmere-sweater", variantId: "ebe78d6f-0418-4eda-a217-ff05d818ccbf", name: "Cashmere Sweater", desc: "Cream", price: "150.00", rating: 4.8, reviews: 75, image: p4Asset, colors: ['#3b474e', '#fc9faf', '#811428'], badge: false },
  { id: "linen-blazer", productId: "linen-blazer", slug: "linen-blazer", variantId: "14ad86c4-f330-401f-9252-3c202a702f68", name: "Linen Blazer", desc: "Beige", price: "95.00", rating: 4.4, reviews: 60, image: p5Asset, colors: ['#f5f5dc', '#000080', '#6b8e23'] },
  { id: "velvet-skirt", productId: "velvet-skirt", slug: "velvet-skirt", variantId: "dd2e22a8-08ae-45c8-8c27-00801ea52b4d", name: "Velvet Skirt", desc: "Wine Red", price: "55.00", rating: 4.2, reviews: 45, image: p6Asset, colors: ['#1e1b4b', '#7f1d1d', '#4ade80'], badge: false },
  { id: "sunrise-on-the-red-sand-dunes", productId: "sunrise-on-the-red-sand-dunes", slug: "sunrise-on-the-red-sand-dunes", variantId: "09c159ef-928b-48ca-9a9f-1c90a337cc5b", name: "Sunrise On The Red Sand Dunes", desc: "Eau De Parfum", price: "180.00", rating: 4.6, reviews: 80, image: p7Asset, colors: ['#c2a27b', '#1c1917', '#78716c'] },
  { id: "zara-lisboa-seoul", productId: "zara-lisboa-seoul", slug: "zara-lisboa-seoul", variantId: "754ba14e-39c1-494e-a36a-9f1a277a3fa1", name: "Zara Lisboa & Seoul", desc: "Eau De Toilette", price: "45.00", rating: 4.1, reviews: 110, image: p8Asset, colors: ['#fbcfe8', '#bae6fd', '#fecdd3'], badge: false },
];

const SectionSliderProductCard = ({ className = "", data, onQuickView }) => {
  const sliderRef = useRef(null);
  const dispatch = useAppDispatch();
  const rail = useAppSelector(selectNewArrivalsRail);

  const isControlled = Array.isArray(data);

  useEffect(() => {
    if (isControlled) return;
    if (rail.status === "idle") {
      dispatch(fetchNewArrivals({ limit: 12 }));
    }
  }, [dispatch, isControlled, rail.status]);

  const items = isControlled
    ? data
    : rail.items && rail.items.length > 0
    ? rail.items
    : DEMO_DATA;

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
  }, [items, updateButtons]);

  return (
    <div
      className={`nc-SectionSliderProductCard ${className}`}
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      <div
        className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] text-neutral-900 dark:text-neutral-50 sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]"
      >
        <div className="w-full max-w-[335.2px] text-left lg:w-[662.2px] lg:max-w-[662.2px] lg:flex-none">
          <h2
            className="font-semibold"
            style={{
              width: "100%",
              maxWidth: "662.2px",
              fontFamily: 'Poppins, "Poppins Fallback"',
              fontSize: "clamp(30px, 2.5vw, 36px)",
              lineHeight: "clamp(36px, 2.8vw, 40px)",
              letterSpacing: "normal",
              margin: "0px",
              textAlign: "left",
              color: "var(--text-main)",
            }}
          >
            New Arrivals.{" "}
            <span className="text-neutral-400">
              New Sports equipment
            </span>
          </h2>
        </div>
        <div className="mt-[16px] flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <div className="nc-NextPrev relative flex items-center gap-[10px] text-neutral-500 dark:text-neutral-400">
            <button
              type="button"
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeArrow === "prev"
                  ? "border border-neutral-300 text-neutral-700"
                  : "border border-transparent text-neutral-500"
              }`}
              aria-label="Prev"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 rtl:rotate-180">
                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeArrow === "next"
                  ? "border border-neutral-300 text-neutral-700"
                  : "border border-transparent text-neutral-500"
              }`}
              aria-label="Next"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 rtl:rotate-180">
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
        <div className="flex pl-[20px] pr-[20px] sm:-ml-[32px] sm:gap-0 sm:pr-0 sm:pl-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 shrink-0 snap-start pl-0 last:pr-0 sm:pl-[32px] sm:last:pr-0 basis-[280px] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard data={item} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionSliderProductCard;
