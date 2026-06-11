import React, { useCallback, useEffect, useRef, useState } from "react";
import p4Asset from "../assets/p4.webp";
import p5Asset from "../assets/p5.webp";
import p6Asset from "../assets/p6.webp";
import p7Asset from "../assets/p7.webp";
import p8Asset from "../assets/p8.webp";
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
  return (
    <div className="relative pb-[20px]" style={{ fontFamily: fontBase }}>

      {/* Main image container */}
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 aspect-[8/5] p-[20px]"
      >
        <img
          src={data.mainImage}
          alt={data.name}
          loading="lazy"
          className="absolute inset-[20px] h-[calc(100%-40px)] w-[calc(100%-40px)] object-contain object-bottom"
        />
      </div>

      {/* Thumbnails row */}
      <div className="relative mt-2.5 flex gap-2.5">
        {data.thumbs.map((thumb, idx) => (
          <div
            key={idx}
            className="flex-1 cursor-pointer overflow-hidden rounded-xl bg-neutral-100 aspect-[1/1] max-h-[120px]"
          >
            <img
              src={thumb}
              alt={`${data.name} view ${idx + 1}`}
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Product info */}
      <div className="relative mt-5 flex justify-between gap-4" style={{ fontFamily: fontBase }}>
        <div className="flex-1">
          <h2 className="text-lg font-semibold sm:text-xl text-left text-neutral-900 dark:text-neutral-50">{data.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <span className="text-sm">
              <span className="line-clamp-1">{data.desc}</span>
            </span>
            <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-orange-400"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="text-sm">
              <span className="line-clamp-1">
                {data.rating} ({data.reviews} reviews)
              </span>
            </span>
          </div>
        </div>
        <div className="mt-0.5">
          <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium">
            <span className="text-green-500 !leading-none">${data.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreItemsCard() {
  return (
    <div className="w-full" style={{ fontFamily: fontBase }}>
      <a
        href="/collections/all"
        className="relative flex flex-col items-center justify-center rounded-2xl bg-neutral-100 transition-colors hover:bg-neutral-200 w-full overflow-hidden"
        style={{ textDecoration: "none", cursor: "pointer" }}
      >
        {/* Invisible spacer mathematically matching adjacent image+thumb height */}
        <div className="opacity-0 pointer-events-none select-none w-full">
          <div className="w-full aspect-[8/5]"></div>
          <div className="mt-2.5 flex gap-2.5">
            <div className="flex-1 aspect-[1/1] max-h-[120px]"></div>
            <div className="flex-1 aspect-[1/1] max-h-[120px]"></div>
            <div className="flex-1 aspect-[1/1] max-h-[120px]"></div>
          </div>
        </div>

        {/* Visible Content Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h3
            className="font-semibold"
            style={{
              fontFamily: fontBase,
              fontSize: "18px",
              lineHeight: "28px",
              color: "#111827",
              margin: "0 0 4px 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            More items
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </h3>
          <p style={{ fontFamily: fontBase, fontSize: "14px", lineHeight: "20px", color: "#6B7280", margin: "0px" }}>
            Show me more
          </p>
        </div>
      </a>
    </div>
  );
}

export default function SectionSliderLargeProduct({ className = "" }) {
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
    <div
      className={`nc-SectionSliderLargeProduct ${className}`}
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      {/* Header */}
      <div
        className="relative mb-12 flex w-full flex-col justify-between text-neutral-900 dark:text-neutral-50 sm:flex-row sm:items-end sm:justify-between lg:mb-14"
      >
        <div className="w-full text-left">
          <h2
            className="text-3xl md:text-4xl font-semibold"
          >
            Chosen by experts.{" "}
            <span className="text-neutral-400">Featured of the week</span>
          </h2>
        </div>
        <div className="mt-[16px] flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <div className="nc-NextPrev relative flex items-center gap-[10px] text-neutral-500 dark:text-neutral-400">
            <button
              type="button"
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${activeArrow === "prev"
                  ? "border border-neutral-300 text-neutral-700"
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
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${activeArrow === "next"
                  ? "border border-neutral-300 text-neutral-700"
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

      {/* Slider */}
      <div
        className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory"
        ref={sliderRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-5 sm:gap-0 sm:-ml-[32px]">
          {LARGE_PRODUCT_DATA.map((item) => (
            <div
              key={item.id}
              className="min-w-0 shrink-0 snap-start w-full sm:w-[33.3333%] sm:pl-[32px]"
            >
              <LargeProductCard data={item} />
            </div>
          ))}
          {/* "More items" card */}
          <div
            className="min-w-0 shrink-0 snap-start w-full sm:w-[33.3333%] sm:pl-[32px]"
          >
            <MoreItemsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
