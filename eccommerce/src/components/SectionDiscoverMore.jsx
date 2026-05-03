import { useState, useRef, useEffect } from "react";

/* ─── Asset Imports: Card Images ─── */
import card1Img from "../assets/5.webp";
import card2Img from "../assets/4.webp";
import card3Img from "../assets/3.webp";
import card4Img from "../assets/2.webp";

/* ─── Card Data ─── */
const DISCOVER_CARDS = [
  {
    id: 1,
    subtitle: "Explore new arrivals",
    title: "Shop the latest\nfrom top brands",
    image: card1Img,
    bgClass: "bg-orange-50",
    href: "/collections/new-arrivals",
  },
  {
    id: 2,
    subtitle: "Sale collection",
    title: "Up to\n80% off retail",
    image: card2Img,
    bgClass: "bg-green-50",
    href: "/collections/sale-collection-1",
  },
  {
    id: 3,
    subtitle: "Sale collection",
    title: "Up to\n90% off retail",
    image: card3Img,
    bgClass: "bg-sky-50",
    href: "/collections/sale-collection-2",
  },
  {
    id: 4,
    subtitle: "Digital gift cards",
    title: "Give the gift\nof choice",
    image: card4Img,
    bgClass: "bg-red-50",
    href: "/collections/gift-cards",
  },
];

/* ─── Arrow Icons ─── */
const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─── Discover Card Component ─── */
const DiscoverCard = ({ card }) => {
  const titleLines = card.title.split("\n");

  return (
    <div className="max-w-2xl shrink-0 embla__slide ps-5 sm:basis-1/2 lg:basis-1/3">
      <div className="group/CollectionCard3 relative block">
        <div
          className={`w-[320.26px] h-[220.18px] sm:w-full sm:h-auto sm:aspect-[16/9] relative overflow-hidden rounded-2xl ${card.bgClass}`}
        >
          {/* Product Image Container */}
          <div>
            <div className="absolute inset-5 sm:inset-8">
              <div className="absolute end-0 h-full w-full max-w-52">
                <img
                  src={card.image}
                  alt={card.subtitle}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover/CollectionCard3:opacity-40"></span>

          {/* Text Content */}
          <div>
            <div className="absolute inset-5 flex flex-col sm:inset-8">
              <div className="max-w-xs text-left">
                <span className="mb-2 block text-sm text-neutral-700">
                  {card.subtitle}
                </span>
                <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
                  {titleLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < titleLines.length - 1 && <br />}
                    </span>
                  ))}
                </h2>
              </div>

              {/* Button */}
              <div className="mt-auto text-left">
                <span
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all duration-300 group-hover/CollectionCard3:bg-neutral-50 group-hover/CollectionCard3:shadow-md"
                  style={{
                    fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                  }}
                >
                  Show me all
                </span>
              </div>
            </div>
          </div>

          {/* Link Overlay */}
          <a
            href={card.href}
            className="absolute inset-0"
            data-headlessui-state=""
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const SectionDiscoverMore = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

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
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.querySelector(".embla__slide");
    const scrollAmount = slide ? slide.offsetWidth : 400;
    el.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    el.style.cursor = "grabbing";
    el.style.scrollSnapType = "none"; // Disable snap while dragging
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.scrollSnapType = "x mandatory";
    }
  };

  const handleMouseUp = () => {
    setIsDown(false);
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.scrollSnapType = "x mandatory";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 2;
    el.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative">
      {/* ── Header: Title + Navigation Arrows ── */}
      <div className="relative flex flex-col justify-between sm:flex-row sm:items-end container sm:pl-[18px] sm:pr-0 mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50">
        <div className="text-left">
          <h2
            className="text-3xl md:text-[36px] leading-[1.2] md:leading-[40px] font-semibold md:whitespace-nowrap"
            style={{
              fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
              color: "#111111",
            }}
          >
            Discover more.{" "}
            <span className="text-neutral-400 font-normal md:font-semibold">
              Good things are waiting for you
            </span>
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="mt-4 flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <div className="nc-NextPrev relative flex items-center text-neutral-500 dark:text-neutral-400">
            <button
              onClick={() => scroll("prev")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 me-2 flex items-center justify-center rounded-full ${canScrollLeft
                ? "border border-solid border-neutral-200 dark:border-neutral-600"
                : "border-0"
                }`}
              aria-disabled={!canScrollLeft}
              aria-label="Prev"
            >
              <ArrowLeftIcon />
            </button>
            <button
              onClick={() => scroll("next")}
              disabled={!canScrollRight}
              className={`w-10 h-10 flex items-center justify-center rounded-full ${canScrollRight
                ? "border border-solid border-neutral-200 dark:border-neutral-600"
                : "border-0"
                }`}
              aria-disabled={!canScrollRight}
              aria-label="Next"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── Embla Carousel / Slider ── */}
      <div className="embla pl-[18px]">
        <div
          ref={scrollRef}
          className="-ms-5 embla__container flex overflow-x-auto"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            cursor: "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {DISCOVER_CARDS.map((card) => (
            <DiscoverCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDiscoverMore;
