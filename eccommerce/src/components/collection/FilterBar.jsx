import { useState, useCallback } from "react";
import FilterChip from "./FilterChip";
import SortDropdown from "./SortDropdown";

const CATEGORIES = [
  "New Arrivals",
  "Backpacks",
  "Travel Bags",
  "Accessories",
  "Tshirts",
  "Hoodies",
];

const COLORS = ["Beige", "Blue", "Black", "Brown", "Green"];

const SIZES = ["XS", "S", "M", "L", "XL"];

// SVG Icons for filter chips matching Ciseco exact path values
const CategoriesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="h-full w-full"
  >
    <path
      d="M16.5 2V5M7.5 2V5M12 2V5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 3.5H11C7.70017 3.5 6.05025 3.5 5.02513 4.52513C4 5.55025 4 7.20017 4 10.5V15C4 18.2998 4 19.9497 5.02513 20.9749C6.05025 22 7.70017 22 11 22H13C16.2998 22 17.9497 22 18.9749 20.9749C19.9497 20.9497 20 19.497 20 15V10.5C20 7.20017 20 5.55025 18.9749 4.52513C17.9497 3.5 16.2998 3.5 13 3.5Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 15H12M8 11H16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ColorsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="h-full w-full"
  >
    <path
      d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294L10.9184 4.02587M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.8905 2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SizesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="h-full w-full"
  >
    <path
      d="M15.5 7.5H13.5C10.6716 7.5 9.25736 7.5 8.37868 8.37868C7.5 9.25736 7.5 10.6716 7.5 13.5V15.5C7.5 18.3284 7.5 19.7426 8.37868 20.6213C9.25736 21.5 10.6716 21.5 13.5 21.5H15.5C18.3284 21.5 19.7426 21.5 20.6213 20.6213C21.5 19.7426 21.5 18.3284 21.5 15.5V13.5C21.5 10.6716 21.5 9.25736 20.6213 8.37868C19.7426 7.5 18.3284 7.5 15.5 7.5Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 7.5H13V10.5C13 10.9714 13 11.2071 13.1464 11.3536C13.2929 11.5 13.5286 11.5 14 11.5H15C15.4714 11.5 15.7071 11.5 15.8536 11.3536C16 11.2071 16 10.9714 16 10.5V7.5Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 18.5H13.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 3.5H21.5M7.5 3.5V2.5M7.5 3.5V4.5M21.5 3.5V2.5M21.5 3.5V4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 7.5L3.5 21.5M3.5 7.5L4.5 7.5M3.5 7.5L2.5 7.5M3.5 21.5H4.5M3.5 21.5H2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PriceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="h-full w-full"
  >
    <path
      d="M8.67188 14.3298C8.67188 15.6198 9.66188 16.6598 10.8919 16.6598H13.4019C14.4719 16.6598 15.3419 15.7498 15.3419 14.6298C15.3419 13.4098 14.8119 12.9798 14.0219 12.6998L9.99187 11.2998C9.20187 11.0198 8.67188 10.5898 8.67188 9.36984C8.67188 8.24984 9.54187 7.33984 10.6119 7.33984H13.1219C14.3519 7.33984 15.3419 8.37984 15.3419 9.66984"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 6V18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom styled checkbox matching Ciseco target
const CustomCheckbox = ({ checked }) => (
  <div
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
      checked
        ? "bg-neutral-900 dark:bg-white"
        : "border-2 border-neutral-300 dark:border-neutral-600"
    }`}
  >
    {checked && (
      <svg
        className="h-3.5 w-3.5 text-white dark:text-neutral-900"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )}
  </div>
);

// Popover footer with Cancel/Apply buttons — matches Ciseco's rounded-b-2xl bg-neutral-50 p-5
const PopoverFooter = ({ onCancel }) => (
  <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
    <button
      type="button"
      onClick={onCancel}
      className="cursor-pointer text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
      style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="cursor-pointer rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
    >
      Apply
    </button>
  </div>
);

export default function FilterBar() {
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([
    "New Arrivals",
    "Backpacks",
  ]);
  const [selectedColors, setSelectedColors] = useState(["Beige", "Blue"]);
  const [selectedSizes, setSelectedSizes] = useState(["XS", "S"]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const handleToggle = useCallback(
    (filterName) => {
      setOpenFilter((prev) => (prev === filterName ? null : filterName));
    },
    []
  );

  const closeFilter = useCallback(() => {
    setOpenFilter(null);
  }, []);

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

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const minPercent = (minPrice / 1000) * 100;
  const maxPercent = (maxPrice / 1000) * 100;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Filter chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Categories */}
          <FilterChip
            icon={<CategoriesIcon />}
            label="Categories"
            count={selectedCategories.length}
            isOpen={openFilter === "categories"}
            onToggle={() => handleToggle("categories")}
          >
            <>
              <div className="hidden-scrollbar max-h-[28rem] w-[382px] overflow-y-auto px-5 py-6">
                <div className="flex flex-col space-y-4">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-center gap-x-4 text-sm leading-6 font-medium text-neutral-700 dark:text-neutral-300 sm:grid-cols-[1.5rem_1fr]"
                      style={{
                        fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                      }}
                    >
                      <CustomCheckbox
                        checked={selectedCategories.includes(cat)}
                      />
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="sr-only"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <PopoverFooter onCancel={closeFilter} />
            </>
          </FilterChip>

          {/* Colors */}
          <FilterChip
            icon={<ColorsIcon />}
            label="Colors"
            count={selectedColors.length}
            isOpen={openFilter === "colors"}
            onToggle={() => handleToggle("colors")}
          >
            <>
              <div className="hidden-scrollbar max-h-[28rem] w-[382px] overflow-y-auto px-5 py-6">
                <div className="flex flex-col space-y-4">
                  {COLORS.map((color) => (
                    <label
                      key={color}
                      className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-center gap-x-4 text-sm leading-6 font-medium text-neutral-700 dark:text-neutral-300 sm:grid-cols-[1.5rem_1fr]"
                      style={{
                        fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                      }}
                    >
                      <CustomCheckbox
                        checked={selectedColors.includes(color)}
                      />
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => toggleColor(color)}
                        className="sr-only"
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>
              <PopoverFooter onCancel={closeFilter} />
            </>
          </FilterChip>

          {/* Sizes */}
          <FilterChip
            icon={<SizesIcon />}
            label="Sizes"
            count={selectedSizes.length}
            isOpen={openFilter === "sizes"}
            onToggle={() => handleToggle("sizes")}
          >
            <>
              <div className="hidden-scrollbar max-h-[28rem] w-[382px] overflow-y-auto px-5 py-6">
                <div className="flex flex-col space-y-4">
                  {SIZES.map((size) => (
                    <label
                      key={size}
                      className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-center gap-x-4 text-sm leading-6 font-medium text-neutral-700 dark:text-neutral-300 sm:grid-cols-[1.5rem_1fr]"
                      style={{
                        fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                      }}
                    >
                      <CustomCheckbox checked={selectedSizes.includes(size)} />
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="sr-only"
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
              <PopoverFooter onCancel={closeFilter} />
            </>
          </FilterChip>

          {/* Price */}
          <FilterChip
            icon={<PriceIcon />}
            label="Price"
            isOpen={openFilter === "price"}
            onToggle={() => handleToggle("price")}
          >
            <>
              <div
                className="hidden-scrollbar max-h-[28rem] w-[382px] overflow-y-auto px-5 py-6"
                style={{
                  fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                }}
              >
                <div className="relative flex flex-col gap-y-8">
                  {/* Slider Section */}
                  <div className="flex flex-col gap-y-5">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      Price
                    </h3>

                    {/* Dual Range Slider */}
                    <div className="relative h-[4px] w-full">
                      <div className="absolute inset-0 rounded-full bg-neutral-200 dark:bg-neutral-600" />
                      <div
                        className="absolute h-full rounded-full bg-sky-400"
                        style={{
                          left: `${minPercent}%`,
                          right: `${100 - maxPercent}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(
                            Math.min(Number(e.target.value), maxPrice - 10)
                          )
                        }
                        className="dual-range"
                      />
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(
                            Math.max(Number(e.target.value), minPrice + 10)
                          )
                        }
                        className="dual-range"
                      />
                    </div>
                  </div>

                  {/* Min/Max Price Inputs */}
                  <div className="flex justify-between gap-x-5">
                    <div className="flex-1">
                      <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Min price
                      </p>
                      <div className="relative mt-1.5 flex h-9 w-full items-center rounded-full bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800">
                        <span className="text-neutral-400 mr-1">$</span>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) =>
                            setMinPrice(
                              Math.max(0, Math.min(Number(e.target.value) || 0, maxPrice - 10))
                            )
                          }
                          className="w-full bg-transparent text-neutral-900 outline-none dark:text-neutral-200 inline"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Max price
                      </p>
                      <div className="relative mt-1.5 flex h-9 w-full items-center rounded-full bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800">
                        <span className="text-neutral-400 mr-1">$</span>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) =>
                            setMaxPrice(
                              Math.min(1000, Math.max(Number(e.target.value) || 0, minPrice + 10))
                            )
                          }
                          className="w-full bg-transparent text-neutral-900 outline-none dark:text-neutral-200 inline"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <PopoverFooter onCancel={closeFilter} />
            </>
          </FilterChip>
        </div>

        {/* Right: Sort */}
        <SortDropdown />
      </div>

      {/* Divider */}
      <hr className="mt-8 w-full border-t border-neutral-950/10 dark:border-white/10" />
    </div>
  );
}
