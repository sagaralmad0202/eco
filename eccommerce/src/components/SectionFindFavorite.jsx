import { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";

/* ─── Asset Imports ─── */
import p4Asset from "../assets/p4.webp";
import p5Asset from "../assets/p5.webp";
import p6Asset from "../assets/p6.webp";
import p7Asset from "../assets/p7.webp";
import p8Asset from "../assets/p8.webp";



/* ─── Tab Data ─── */
const TABS = ["All Items", "Women", "Mans", "Kids", "jewels"];

/* ─── Filter Dropdown Icons ─── */
const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" color="currentColor">
    <path d="M16.5 2V5M7.5 2V5M12 2V5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M13 3.5H11C7.70017 3.5 6.05025 3.5 5.02513 4.52513C4 5.55025 4 7.20017 4 10.5V15C4 18.2998 4 19.9497 5.02513 20.9749C6.05025 22 7.70017 22 11 22H13C16.2998 22 17.9497 22 18.9749 20.9749C20 19.9497 20 18.2998 20 15V10.5C20 7.20017 20 5.55025 18.9749 4.52513C17.9497 3.5 16.2998 3.5 13 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M8 15H12M8 11H16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
  </svg>
);

const ColorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" color="currentColor">
    <path d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83607 16.1811C1.72104 15.0622 1.72104 13.2402 2.83607 12.1294M19 12.1294L10.9184 4.02587M19 12.1294H2.83607M10.9184 4.02587L2.83607 12.1294M10.9184 4.02587L8.89805 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
  </svg>
);

const SizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" color="currentColor">
    <path d="M15.5 7.5H13.5C10.6716 7.5 9.25736 7.5 8.37868 8.37868C7.5 9.25736 7.5 10.6716 7.5 13.5V15.5C7.5 18.3284 7.5 19.7426 8.37868 20.6213C9.25736 21.5 10.6716 21.5 13.5 21.5H15.5C18.3284 21.5 19.7426 21.5 20.6213 20.6213C21.5 19.7426 21.5 18.3284 21.5 15.5V13.5C21.5 10.6716 21.5 9.25736 20.6213 8.37868C19.7426 7.5 18.3284 7.5 15.5 7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M16 7.5H13V10.5C13 10.9714 13 11.2071 13.1464 11.3536C13.2929 11.5 13.5286 11.5 14 11.5H15C15.4714 11.5 15.7071 11.5 15.8536 11.3536C16 11.2071 16 10.9714 16 10.5V7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M10.5 18.5H13.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M7.5 3.5H21.5M7.5 3.5V2.5M7.5 3.5V4.5M21.5 3.5V2.5M21.5 3.5V4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M3.5 7.5L3.5 21.5M3.5 7.5L4.5 7.5M3.5 7.5L2.5 7.5M3.5 21.5H4.5M3.5 21.5H2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
  </svg>
);

const PriceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" color="currentColor">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
    <path d="M14.7102 10.0611C14.6111 9.29844 13.7354 8.66622 12.1608 8.66619C10.3312 8.66616 9.56136 9.07946 9.40515 9.58611C9.16145 10.2638 9.21019 11.6571 11.3547 11.889C14.0354 11.999 15.1093 12.3154 14.9727 13.956C14.836 15.5965 13.3417 15.951 12.1608 15.9129C10.9798 15.875 9.04764 15.3325 8.97266 13.8733M11.9734 6.99805V8.06982M11.9734 15.9031V16.998" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
);

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" color="currentColor">
    <path d="M4 14H10L4 21H10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M4 9L6.10557 4.30527C6.49585 3.43509 6.69099 3 7 3C7.30901 3 7.50415 3.43509 7.89443 4.30527L10 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    <path d="M17.5 20V4M17.5 20C16.7998 20 15.4915 18.0057 15 17.5M17.5 20C18.2002 20 19.5005 18.0057 20 17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

/* ─── Product Data ─── */
const ALL_PRODUCTS = [
  /* Row 1 */
  {
    id: 1,
    name: "Leather Tote Bag",
    desc: "Pink Yarrow",
    price: "85.00",
    rating: 4.5,
    reviews: 87,
    image: p4Asset,
    colors: ["#000000", "#2d2d2d", "#808080", "#FFD700"],
    badge: null,
    liked: false,
  },
  {
    id: 2,
    name: "Silk Midi Dress",
    desc: "Emerald Green",
    price: "120.00",
    rating: 4.7,
    reviews: 95,
    image: p8Asset,
    colors: ["#228B22", "#000080", "#800020", "#50C878"],
    badge: null,
    liked: false,
  },
  {
    id: 3,
    name: "Denim Jacket",
    desc: "Light Blue",
    price: "65.00",
    rating: 4.3,
    reviews: 120,
    image: p6Asset,
    colors: ["#ADD8E6", "#000080"],
    badge: "New in",
    liked: false,
  },
  {
    id: 4,
    name: "Cashmere Sweater",
    desc: "Cream",
    price: "150.00",
    rating: 4.8,
    reviews: 75,
    image: p4Asset,
    colors: ["#3b474e", "#fc9faf", "#811428"],
    badge: null,
    liked: true,
  },
  /* Row 2 */
  {
    id: 5,
    name: "Linen Blazer",
    desc: "Beige",
    price: "95.00",
    rating: 4.4,
    reviews: 60,
    image: p5Asset,
    colors: ["#F5F5DC", "#000080", "#808000"],
    badge: "New in",
    liked: false,
  },
  {
    id: 6,
    name: "Velvet Skirt",
    desc: "Wine Red",
    price: "55.00",
    rating: 4.2,
    reviews: 45,
    image: p8Asset,
    colors: ["#191970", "#722F37", "#50C878"],
    badge: null,
    liked: false,
  },
  {
    id: 7,
    name: "Wool Trench Coat",
    desc: "Camel",
    price: "180.00",
    rating: 4.6,
    reviews: 80,
    image: p6Asset,
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: "New in",
    liked: false,
  },
  {
    id: 8,
    name: "Cotton Shirt",
    desc: "White",
    price: "45.00",
    rating: 4.1,
    reviews: 110,
    image: p7Asset,
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    liked: true,
  },
  /* Row 3 */
  {
    id: 9,
    name: "Linen Blazer",
    desc: "Beige",
    price: "95.00",
    rating: 4.4,
    reviews: 80,
    image: p5Asset,
    colors: ["#F5F5DC", "#000080", "#808000"],
    badge: null,
    liked: false,
  },
  {
    id: 10,
    name: "Velvet Skirt",
    desc: "Wine Red",
    price: "55.00",
    rating: 4.2,
    reviews: 45,
    image: p8Asset,
    colors: ["#191970", "#722F37", "#50C878"],
    badge: null,
    liked: false,
  },
  {
    id: 11,
    name: "Wool Trench Coat",
    desc: "Camel",
    price: "180.00",
    rating: 4.6,
    reviews: 80,
    image: p6Asset,
    colors: ["#C19A6B", "#000000", "#808080"],
    badge: null,
    liked: false,
  },
  {
    id: 12,
    name: "Cotton Shirt",
    desc: "White",
    price: "45.00",
    rating: 4.1,
    reviews: 110,
    image: p7Asset,
    colors: ["#FFC1CC", "#ADD8E6", "#FFC1CC"],
    badge: null,
    liked: false,
  },
];

/* ─── Filter Badge Component ─── */
const FilterBadge = ({ count }) => {
  if (!count) return null;
  return (
    <span className="find-fav-filter-badge">
      {count}
    </span>
  );
};

/* ─── Filter Dropdown Button ─── */
const FilterDropdown = ({ icon, label, count, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="find-fav-filter-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span className="ml-2">{label}</span>
        {count > 0 && <FilterBadge count={count} />}
        <ChevronDownIcon className={`ml-3 w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && children && (
        <div className="absolute -left-5 top-full z-50 mt-3 w-96 rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {typeof children === "function" ? children(() => setIsOpen(false)) : children}
        </div>
      )}
    </div>
  );
};

/* ─── Custom Checkbox ─── */
const CustomCheckbox = ({ label, checked, onChange }) => (
  <div
    className="flex items-center px-4 py-1.5 cursor-pointer"
    onClick={() => onChange(!checked)}
  >
    <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors mr-4 ${checked ? "bg-neutral-900 border-neutral-900 dark:bg-white dark:border-white" : "bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600"}`}>
      {checked && (
        <svg className="w-3 h-3 text-white dark:text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
    <span
      className={`select-none ${checked ? "font-medium" : "font-normal"}`}
      style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', lineHeight: '24px', color: '#111827' }}
    >{label}</span>
  </div>
);

/* ─── Price Range Slider ─── */
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [minVal, maxVal] = value;
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="relative w-full" style={{ height: '4px', margin: '20px 0 24px' }}>
      {/* Track background (rail) */}
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#e5e7eb' }} />
      {/* Active track fill */}
      <div
        className="absolute h-full rounded-full"
        style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%`, backgroundColor: '#96dbfa' }}
      />
      {/* Min range input */}
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(e) => {
          const val = Math.min(Number(e.target.value), maxVal - 1);
          onChange([val, maxVal]);
        }}
        className="price-range-input"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
      />
      {/* Max range input */}
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(e) => {
          const val = Math.max(Number(e.target.value), minVal + 1);
          onChange([minVal, val]);
        }}
        className="price-range-input"
        style={{ zIndex: 4 }}
      />
    </div>
  );
};

/* ─── Main Component ─── */
const SectionFindFavorite = () => {
  const [activeTab, setActiveTab] = useState("All Items");
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(["New Arrivals", "Backpacks"]);

  const [selectedColors, setSelectedColors] = useState(["Beige", "Blue"]);

  const CATEGORY_OPTIONS = [
    "New Arrivals",
    "Backpacks",
    "Travel Bags",
    "Accessories",
    "Tshirts",
    "Hoodies",
  ];

  const COLOR_OPTIONS = [
    "Beige",
    "Blue",
    "Black",
    "Brown",
    "Green",
  ];

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const [selectedSizes, setSelectedSizes] = useState(["XS", "S"]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("Newest");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  const SORT_OPTIONS = [
    "Newest",
    "Oldest",
    "Price: low to high",
    "Price: high to low",
    "A to Z",
    "Z to A",
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="nc-SectionFindFavorite relative container sm:px-[18px]">
      <div className="relative flex flex-col mb-12">
        <div className="relative flex flex-col justify-between sm:flex-row sm:items-end text-neutral-900 dark:text-neutral-50" style={{ marginBottom: '3.6px' }}>
          <div className="">
            <h2
              className="text-3xl md:text-4xl font-semibold"
              style={{
                fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                color: "#111111",
              }}
            >
              Find your favorite products.
            </h2>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation + Filter Toggle ── */}
      <div className="find-fav-tabs-row">
        <div className="find-fav-tabs-wrapper">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`find-fav-tab ${activeTab === tab ? "find-fav-tab--active" : "find-fav-tab--inactive"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="find-fav-filter-toggle !hidden md:!flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" color="currentColor" className="-ml-1" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          <span className="ml-2">Filter</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            className={`w-5 h-5 sm:w-4 sm:h-4 text-neutral-400 transition-transform ${showFilters ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      <hr role="presentation" className="my-8 w-full border-t border-neutral-950/10 dark:border-white/10" />

      {/* ── Filter Bar ── */}
      {showFilters && (
        <div className="find-fav-filter-bar">
          {/* Mobile All Filters Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="find-fav-filter-btn relative"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" color="currentColor" className="w-5 h-5">
                <path d="M7 21L7 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M17 21L17 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M17 6L17 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M7 9L7 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M7 18C6.06812 18 5.60218 18 5.23463 17.8478C4.74458 17.6448 4.35523 17.2554 4.15224 16.7654C4 16.3978 4 15.9319 4 15C4 14.0681 4 13.6022 4.15224 13.2346C4.35523 12.7446 4.74458 12.3552 5.23463 12.1522C5.60218 12 6.06812 12 7 12C7.93188 12 8.39782 12 8.76537 12.1522C9.25542 12.3552 9.64477 12.7446 9.84776 13.2346C10 13.6022 10 14.0681 10 15C10 15.9319 10 16.3978 9.84776 16.7654C9.64477 17.2554 9.25542 17.6448 8.76537 17.8478C8.39782 18 7.93188 18 7 18Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M17 12C16.0681 12 15.6022 12 15.2346 11.8478C14.7446 11.6448 14.3552 11.2554 14.1522 10.7654C14 10.3978 14 9.93188 14 9C14 8.06812 14 7.60218 14.1522 7.23463C14.3552 6.74458 14.7446 6.35523 15.2346 6.15224C15.6022 6 16.0681 6 17 6C17.9319 6 18.3978 6 18.7654 6.15224C19.2554 6.35523 19.6448 6.74458 19.8478 7.23463C20 7.60218 20 8.06812 20 9C20 9.93188 20 10.3978 19.8478 10.7654C19.6448 11.2554 19.2554 11.6448 18.7654 11.8478C18.3978 12 17.9319 12 17 12Z" stroke="currentColor" strokeWidth="1.5"></path>
              </svg>
              <span className="ml-2">All filters</span>
              <FilterBadge count={3} />
              <ChevronDownIcon className="ml-3 w-4 h-4" />
            </button>
          </div>

          <div className="find-fav-filter-bar-left !hidden md:!flex">
            <FilterDropdown icon={<CategoryIcon />} label="Categories" count={selectedCategories.length}>
              {(closeDropdown) => (
                <>
                  <div className="hidden-scrollbar overflow-y-auto px-5 py-5" style={{ height: '272px' }}>
                    <div className="space-y-1">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <CustomCheckbox
                          key={cat}
                          label={cat}
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <button
                      type="button"
                      className="find-fav-cancel-btn"
                      style={{
                        fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                        fontSize: '14px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#111827',
                        padding: '9px 23px',
                        margin: '0 -12px',
                        background: 'none',
                        border: '1px solid transparent',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                      onClick={() => {
                        setSelectedCategories([]);
                        closeDropdown();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="find-fav-apply-btn"
                      onClick={closeDropdown}
                    >
                      Apply
                    </button>
                  </div>
                </>
              )}
            </FilterDropdown>
            <FilterDropdown icon={<ColorIcon />} label="Colors" count={selectedColors.length}>
              {(closeDropdown) => (
                <>
                  <div className="hidden-scrollbar overflow-y-auto px-5 py-6 max-h-[28rem]">
                    <div className="space-y-1">
                      {COLOR_OPTIONS.map((color) => (
                        <CustomCheckbox
                          key={color}
                          label={color}
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <button
                      type="button"
                      className="find-fav-cancel-btn"
                      style={{
                        fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                        fontSize: '14px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#111827',
                        padding: '9px 23px',
                        margin: '0 -12px',
                        background: 'none',
                        border: '1px solid transparent',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                      onClick={() => { setSelectedColors([]); closeDropdown(); }}
                    >
                      Cancel
                    </button>
                    <button type="button" className="find-fav-apply-btn" onClick={closeDropdown}>
                      Apply
                    </button>
                  </div>
                </>
              )}
            </FilterDropdown>
            <FilterDropdown icon={<SizeIcon />} label="Sizes" count={selectedSizes.length}>
              {(closeDropdown) => (
                <>
                  <div className="hidden-scrollbar overflow-y-auto px-5 py-6" style={{ height: '233px' }}>
                    <div className="space-y-1">
                      {SIZE_OPTIONS.map((size) => (
                        <CustomCheckbox
                          key={size}
                          label={size}
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleSize(size)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <button
                      type="button"
                      className="find-fav-cancel-btn"
                      style={{
                        fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                        fontSize: '14px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#111827',
                        padding: '9px 23px',
                        margin: '0 -12px',
                        background: 'none',
                        border: '1px solid transparent',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                      onClick={() => { setSelectedSizes([]); closeDropdown(); }}
                    >
                      Cancel
                    </button>
                    <button type="button" className="find-fav-apply-btn" onClick={closeDropdown}>
                      Apply
                    </button>
                  </div>
                </>
              )}
            </FilterDropdown>
            <FilterDropdown icon={<PriceIcon />} label="Price" count={0}>
              {(closeDropdown) => (
                <>
                  <div className="px-5 py-6">
                    <p style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '16px', textAlign: 'start' }}>Price</p>
                    <PriceRangeSlider
                      min={0}
                      max={1000}
                      value={priceRange}
                      onChange={setPriceRange}
                    />
                    <div className="flex gap-x-3 mt-5">
                      <div className="flex-1">
                        <label style={{ display: 'block', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', textAlign: 'left' }}>Min price</label>
                        <div className="flex items-center rounded-full px-4 py-2" style={{ backgroundColor: '#f3f4f6' }}>
                          <span style={{ color: '#111827', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px' }}>$</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            min={0}
                            max={priceRange[1] - 1}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', color: '#111827', background: 'transparent', marginLeft: '4px' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label style={{ display: 'block', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', textAlign: 'left' }}>Max price</label>
                        <div className="flex items-center rounded-full px-4 py-2" style={{ backgroundColor: '#f3f4f6' }}>
                          <span style={{ color: '#111827', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px' }}>$</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            min={priceRange[0] + 1}
                            max={1000}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', color: '#111827', background: 'transparent', marginLeft: '4px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <button
                      type="button"
                      className="find-fav-cancel-btn"
                      style={{
                        fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                        fontSize: '14px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#111827',
                        padding: '9px 23px',
                        margin: '0 -12px',
                        background: 'none',
                        border: '1px solid transparent',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                      onClick={() => { setPriceRange([0, 1000]); closeDropdown(); }}
                    >
                      Cancel
                    </button>
                    <button type="button" className="find-fav-apply-btn" onClick={closeDropdown}>
                      Apply
                    </button>
                  </div>
                </>
              )}
            </FilterDropdown>
          </div>
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              className="find-fav-sort-btn"
              onClick={() => setShowSort((v) => !v)}
            >
              <SortIcon />
              <span>{sortBy}</span>
              <ChevronDownIcon />
            </button>
            {showSort && (
              <div
                className="absolute right-0 z-50 mt-2 w-52 overflow-auto rounded-xl bg-white py-1 text-sm text-neutral-900 shadow-lg"
                style={{ maxHeight: '240px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', ring: '1px solid rgba(0,0,0,0.05)' }}
              >
                {SORT_OPTIONS.map((option) => (
                  <div
                    key={option}
                    onClick={() => { setSortBy(option); setShowSort(false); }}
                    className="relative flex cursor-pointer select-none items-center py-2 pe-4"
                    style={{
                      paddingInlineStart: '40px',
                      backgroundColor: 'transparent',
                      fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                      fontSize: '14px',
                      color: '#111827',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#111827'; }}
                  >
                    {option === sortBy && (
                      <span className="absolute inset-y-0 left-0 flex items-center" style={{ paddingLeft: '10px', color: '#4f46e5' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" data-slot="icon">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Product Grid ── */}
      <div className="find-fav-grid mt-8 lg:mt-10">
        {ALL_PRODUCTS.slice(0, 8).map((product) => (
          <ProductCard key={product.id} data={product} gridMode={true} />
        ))}
      </div>

      {/* ── Show Me More Button ── */}
      <div className="find-fav-show-more-wrapper">
        <button
          type="button"
          className="find-fav-show-more-btn"
          style={{
            fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
          }}
        >
          <span>Show me more</span>
          <ArrowRightIcon />
        </button>
      </div>

      {/* ── Mobile Filters Modal ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-neutral-900/60 md:hidden">
          <div className="relative flex flex-col w-full h-[calc(100%-12px)] bg-white dark:bg-neutral-900 rounded-t-2xl shadow-xl overflow-hidden mt-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-medium text-[18px] mx-auto text-gray-900 dark:text-neutral-50" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Filters</span>
              <button
                type="button"
                className="absolute right-5 p-2 text-neutral-500 hover:text-neutral-700"
                onClick={() => setShowMobileFilters(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="font-medium text-[18px] mb-4 text-left text-gray-900 dark:text-neutral-50" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Categories</h3>
                <div className="space-y-4">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <CustomCheckbox
                      key={cat}
                      label={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-medium text-[18px] mb-4 text-left text-gray-900 dark:text-neutral-50" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Colors</h3>
                <div className="space-y-4">
                  {COLOR_OPTIONS.map((color) => (
                    <CustomCheckbox
                      key={color}
                      label={color}
                      checked={selectedColors.includes(color)}
                      onChange={() => toggleColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="font-medium text-[18px] mb-4 text-left text-gray-900 dark:text-neutral-50" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Sizes</h3>
                <div className="space-y-4">
                  {SIZE_OPTIONS.map((size) => (
                    <CustomCheckbox
                      key={size}
                      label={size}
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                    />
                  ))}
                </div>
              </div>

              <hr className="border-t border-neutral-200 dark:border-neutral-800" />

              {/* Price */}
              <div>
                <h3 className="font-medium text-[18px] mb-4 text-left text-gray-900 dark:text-neutral-50" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Price</h3>
                <p style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '16px', textAlign: 'start' }}>Price</p>
                <PriceRangeSlider
                  min={0}
                  max={1000}
                  value={priceRange}
                  onChange={setPriceRange}
                />
                <div className="flex gap-x-3 mt-5">
                  <div className="flex-1">
                    <label style={{ display: 'block', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', textAlign: 'left' }}>Min price</label>
                    <div className="flex items-center rounded-full px-4 py-2" style={{ backgroundColor: '#f3f4f6' }}>
                      <span style={{ color: '#111827', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px' }}>$</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        min={0}
                        max={priceRange[1] - 1}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', color: '#111827', background: 'transparent', marginLeft: '4px' }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label style={{ display: 'block', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', textAlign: 'left' }}>Max price</label>
                    <div className="flex items-center rounded-full px-4 py-2" style={{ backgroundColor: '#f3f4f6' }}>
                      <span style={{ color: '#111827', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px' }}>$</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        min={priceRange[0] + 1}
                        max={1000}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: '14px', color: '#111827', background: 'transparent', marginLeft: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <button
                type="button"
                className="font-medium text-[16px] text-gray-900 dark:text-neutral-50 px-2"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedColors([]);
                  setSelectedSizes([]);
                  setPriceRange([0, 1000]);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 px-6 py-3 font-medium text-[16px] transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                onClick={() => setShowMobileFilters(false)}
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionFindFavorite;
