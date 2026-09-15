import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RailNotice from "./RailNotice";
import SectionSliderLargeProductSkeleton from "./skeletons/SectionSliderLargeProductSkeleton";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchShowcaseProducts,
  selectShowcaseRail,
} from "../redux/slices/productsSlice";
import denimMain from "../assets/Denim jacket.webp";
import denimThumb1 from "../assets/Denim jacket1.webp";
import denimThumb2 from "../assets/Denim jacket2.webp";
import denimThumb3 from "../assets/Denim jacket3.webp";
import cashmereMain from "../assets/Cashmere Sweater.webp";
import cashmereThumb1 from "../assets/Cashmere Sweater1.webp";
import cashmereThumb2 from "../assets/Cashmere Sweater2.webp";
import cashmereThumb3 from "../assets/Cashmere Sweater3.webp";
import linenMain from "../assets/Linen Blazer.webp";
import linenThumb1 from "../assets/Linen Blazer1.webp";
import linenThumb2 from "../assets/Linen Blazer2.webp";
import linenThumb3 from "../assets/Linen Blazer3.webp";
import velvetMain from "../assets/Velvet Skirt.webp";
import velvetThumb1 from "../assets/Velvet Skirt1.webp";
import velvetThumb2 from "../assets/Velvet Skirt2.webp";
import velvetThumb3 from "../assets/Velvet Skirt3.webp";

const fontBase = 'Poppins, "Poppins Fallback", sans-serif';

const LARGE_PRODUCT_DATA = [
  {
    id: 1,
    slug: "denim-jacket",
    name: "Denim Jacket",
    desc: "Light Blue",
    price: "65.00",
    rating: 4.3,
    reviews: 120,
    mainImage: denimMain,
    thumbs: [denimThumb1, denimThumb2, denimThumb3],
  },
  {
    id: 2,
    slug: "cashmere-sweater",
    name: "Cashmere Sweater",
    desc: "Cream",
    price: "150.00",
    rating: 4.8,
    reviews: 75,
    mainImage: cashmereMain,
    thumbs: [cashmereThumb1, cashmereThumb2, cashmereThumb3],
  },
  {
    id: 3,
    slug: "linen-blazer",
    name: "Linen Blazer",
    desc: "Beige",
    price: "95.00",
    rating: 4.4,
    reviews: 60,
    mainImage: linenMain,
    thumbs: [linenThumb1, linenThumb2, linenThumb3],
  },
  {
    id: 4,
    slug: "velvet-skirt",
    name: "Velvet Skirt",
    desc: "Wine Red",
    price: "55.00",
    rating: 4.2,
    reviews: 45,
    mainImage: velvetMain,
    thumbs: [velvetThumb1, velvetThumb2, velvetThumb3],
  },
];

function LargeProductCard({ data }) {
  const productId = data.id || data.productId || data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
  const productUrl = `/products/${productId}`;
  const displayImage = data.mainImage || data.image;
  const displayThumbs = Array.isArray(data.thumbs) && data.thumbs.length >= 3 ? data.thumbs : [displayImage, displayImage, displayImage];

  return (
    <div className="relative pb-[20px]" style={{ fontFamily: fontBase }}>
      {/* Main image container */}
      <Link
        to={productUrl}
        className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 aspect-[8/5] p-[20px] block group cursor-pointer hover:opacity-95 transition-opacity"
      >
        <img
          src={displayImage}
          alt={data.name}
          loading="lazy"
          className="absolute inset-[20px] h-[calc(100%-40px)] w-[calc(100%-40px)] object-contain object-bottom"
        />
      </Link>

      {/* Thumbnails removed to reduce visual density (Issues 14, 19, 23) — gallery on product page */}

      {/* Info: Name, Price, Description, Rating */}
      <div className="mt-5 flex justify-between items-baseline gap-2">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
          <Link
            to={productUrl}
            className="hover:text-primary-600 transition-colors"
          >
            {data.name}
          </Link>
        </h2>
        <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex-shrink-0">
          ${data.price}
        </span>
      </div>

      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {data.desc}
      </p>

      {/* Rating */}
      {Number(data.reviews) > 0 ? (
        <div className="mt-2 flex items-center text-sm">
          <svg
            className="w-4 h-4 text-amber-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="ml-1 font-medium text-neutral-800 dark:text-neutral-200">
            {data.rating}
          </span>
          <span className="text-neutral-400 dark:text-neutral-500 ml-1">
            ({data.reviews} {data.reviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      ) : null}
    </div>
  );
}

function MoreItemsCard() {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 p-6 md:p-8"
      style={{ fontFamily: fontBase, height: "calc(100% - 20px)" }}
    >
      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Explore more
        </span>
        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Discover hundreds of other products
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Browse through our curated catalog with exclusive seasonal discounts and new releases.
        </p>
      </div>

      <Link
        to="/shop"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-6 py-3 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        <span>View all products</span>
        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </Link>
    </div>
  );
}

export default function SectionSliderLargeProduct({ className = "" }) {
  const sliderRef = useRef(null);
  const dispatch = useAppDispatch();
  const rail = useAppSelector(selectShowcaseRail);

  useEffect(() => {
    if (rail.status === "idle") {
      dispatch(fetchShowcaseProducts({ limit: 8 }));
    }
  }, [dispatch, rail.status]);

  const PREFERRED_SHOWCASE_ORDER = [
    "denim-jacket",
    "cashmere-sweater",
    "linen-blazer",
    "velvet-skirt",
    "sunrise-on-the-red-sand-dunes",
    "silk-midi-dress",
    "leather-tote-bag",
    "zara-lisboa-seoul",
  ];

  const items = useMemo(() => {
    if (!rail.items || rail.items.length === 0) return [];
    return [...rail.items].sort((a, b) => {
      const idxA = PREFERRED_SHOWCASE_ORDER.indexOf(a.slug || a.id);
      const idxB = PREFERRED_SHOWCASE_ORDER.indexOf(b.slug || b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [rail.items]);

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

  if (rail.status === "loading" || rail.status === "idle") {
    return <SectionSliderLargeProductSkeleton className={className} />;
  }

  if (rail.status === "failed") {
    return (
      <div
        className={`nc-SectionSliderLargeProduct ${className}`}
        style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto", overflow: "hidden" }}
      >
        <div className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]">
          <div>
            <h2
              className="font-semibold"
              style={{
                fontFamily: fontBase,
                fontSize: "clamp(30px, 2.5vw, 36px)",
                lineHeight: "clamp(36px, 2.8vw, 40px)",
                letterSpacing: "normal",
              }}
            >
              Chosen by experts.{" "}
              <span
                className="text-neutral-500 font-semibold"
                style={{ fontFamily: fontBase }}
              >
                Featured of the week
              </span>
            </h2>
          </div>
        </div>
        <RailNotice
          status="failed"
          error="We’re having trouble loading this content."
          onRetry={() => dispatch(fetchShowcaseProducts({ limit: 8 }))}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={`nc-SectionSliderLargeProduct ${className}`}
        style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto", overflow: "hidden" }}
      >
        <div className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]">
          <div>
            <h2
              className="font-semibold"
              style={{
                fontFamily: fontBase,
                fontSize: "clamp(30px, 2.5vw, 36px)",
                lineHeight: "clamp(36px, 2.8vw, 40px)",
                letterSpacing: "normal",
              }}
            >
              Chosen by experts.{" "}
              <span
                className="text-neutral-500 font-semibold"
                style={{ fontFamily: fontBase }}
              >
                Featured of the week
              </span>
            </h2>
          </div>
        </div>
        <RailNotice status="empty" emptyText="No showcase products available." />
      </div>
    );
  }

  return (
    <div
      className={`nc-SectionSliderLargeProduct ${className}`}
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto", overflow: "hidden" }}
    >
      {/* Header */}
      <div className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]">
        <div>
          <h2
            className="font-semibold"
            style={{
              fontFamily: fontBase,
              fontSize: "clamp(30px, 2.5vw, 36px)",
              lineHeight: "clamp(36px, 2.8vw, 40px)",
              color: "var(--text-main)",
              margin: 0,
            }}
          >
            Chosen by experts.{" "}
            <span className="text-neutral-400">Featured of the week</span>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 rtl:rotate-180">
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 rtl:rotate-180">
                <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div
        className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory"
        ref={sliderRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-5 sm:gap-0 sm:-ml-[32px]">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 shrink-0 snap-start w-full sm:w-[33.3333%] sm:pl-[32px]"
            >
              <LargeProductCard data={item} />
            </div>
          ))}
          {/* "More items" card */}
          <div className="min-w-0 shrink-0 snap-start w-full sm:w-[33.3333%] sm:pl-[32px]">
            <MoreItemsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
