import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import RailNotice from "./RailNotice";
import SectionSliderProductCardSkeleton from "./skeletons/SectionSliderProductCardSkeleton";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchNewArrivals,
  selectNewArrivalsRail,
} from "../redux/slices/productsSlice";

const PREFERRED_NEW_ARRIVALS_ORDER = [
  "cashmere-sweater",
  "linen-blazer",
  "velvet-skirt",
  "sunrise-on-the-red-sand-dunes",
  "zara-lisboa-seoul",
  "denim-jacket",
  "silk-midi-dress",
  "leather-tote-bag",
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

  const items = useMemo(() => {
    if (isControlled) return data;
    if (!rail.items || rail.items.length === 0) return [];
    return [...rail.items].sort((a, b) => {
      const idxA = PREFERRED_NEW_ARRIVALS_ORDER.indexOf(a.slug || a.id);
      const idxB = PREFERRED_NEW_ARRIVALS_ORDER.indexOf(b.slug || b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [isControlled, data, rail.items]);

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

  if (!isControlled && (rail.status === "loading" || rail.status === "idle")) {
    return <SectionSliderProductCardSkeleton className={className} />;
  }

  if (!isControlled && rail.status === "failed") {
    return (
      <div
        className={`nc-SectionSliderProductCard ${className}`}
        style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto", overflow: "hidden" }}
      >
        <div className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] text-neutral-900 dark:text-neutral-50 sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]">
          <div className="w-full max-w-[335.2px] text-left lg:w-[662.2px] lg:max-w-[662.2px] lg:flex-none">
            <h2
              className="font-semibold"
              style={{
                width: "100%",
                maxWidth: "662.2px",
                fontFamily: 'Poppins, "Poppins Fallback"',
                fontSize: "clamp(30px, 2.5vw, 36px)",
                lineHeight: "1.15",
              }}
            >
              New Arrivals.{" "}
              <span
                className="text-neutral-500"
                style={{
                  fontFamily: 'Poppins, "Poppins Fallback"',
                  fontSize: "clamp(30px, 2.5vw, 36px)",
                  fontWeight: 600,
                  lineHeight: "1.15",
                }}
              >
                New Sports equipment
              </span>
            </h2>
          </div>
        </div>
        <RailNotice
          status="failed"
          error="We’re having trouble loading this content."
          onRetry={() => dispatch(fetchNewArrivals({ limit: 12 }))}
        />
      </div>
    );
  }

  if (!isControlled && items.length === 0) {
    return (
      <div
        className={`nc-SectionSliderProductCard ${className}`}
        style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto", overflow: "hidden" }}
      >
        <div className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] text-neutral-900 dark:text-neutral-50 sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]">
          <div className="w-full max-w-[335.2px] text-left lg:w-[662.2px] lg:max-w-[662.2px] lg:flex-none">
            <h2
              className="font-semibold"
              style={{
                width: "100%",
                maxWidth: "662.2px",
                fontFamily: 'Poppins, "Poppins Fallback"',
                fontSize: "clamp(30px, 2.5vw, 36px)",
                lineHeight: "1.15",
              }}
            >
              New Arrivals.{" "}
              <span
                className="text-neutral-500"
                style={{
                  fontFamily: 'Poppins, "Poppins Fallback"',
                  fontSize: "clamp(30px, 2.5vw, 36px)",
                  fontWeight: 600,
                  lineHeight: "1.15",
                }}
              >
                New Sports equipment
              </span>
            </h2>
          </div>
        </div>
        <RailNotice status="empty" emptyText="No new arrivals found." />
      </div>
    );
  }

  return (
    <div
      className={`nc-SectionSliderProductCard ${className}`}
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto", overflow: "hidden" }}
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
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300"
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
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300"
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
        <div className="flex gap-[16px] pl-[20px] pr-[20px] sm:-ml-[32px] sm:gap-0 sm:pr-0 sm:pl-0">
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
