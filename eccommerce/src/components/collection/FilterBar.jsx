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

const COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Black", hex: "#000000" },
  { name: "Green", hex: "#22C55E" },
  { name: "Red", hex: "#EF4444" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];

// SVG Icons for filter chips
const CategoriesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="h-full w-full"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75l-5.571-3m11.142 0l4.179 2.25L12 17.25l-9.75-5.25 4.179-2.25m11.142 0l4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25"
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
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
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
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
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
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function FilterBar() {
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([
    "New Arrivals",
    "Backpacks",
  ]);
  const [selectedColors, setSelectedColors] = useState(["Blue", "Black"]);
  const [selectedSizes, setSelectedSizes] = useState(["M", "L"]);

  const handleToggle = useCallback(
    (filterName) => {
      setOpenFilter((prev) => (prev === filterName ? null : filterName));
    },
    []
  );

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

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
        {/* Left: Filter chips */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Categories */}
          <FilterChip
            icon={<CategoriesIcon />}
            label="Categories"
            count={selectedCategories.length}
            isOpen={openFilter === "categories"}
            onToggle={() => handleToggle("categories")}
          >
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  style={{
                    fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="h-[18px] w-[18px] rounded border-neutral-300 text-blue-600 accent-blue-600"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </FilterChip>

          {/* Colors */}
          <FilterChip
            icon={<ColorsIcon />}
            label="Colors"
            count={selectedColors.length}
            isOpen={openFilter === "colors"}
            onToggle={() => handleToggle("colors")}
          >
            <div className="flex flex-col gap-1">
              {COLORS.map((color) => (
                <label
                  key={color.name}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  style={{
                    fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color.name)}
                    onChange={() => toggleColor(color.name)}
                    className="h-[18px] w-[18px] rounded border-neutral-300 text-blue-600 accent-blue-600"
                  />
                  <span
                    className="inline-block h-4 w-4 rounded-full ring-1 ring-neutral-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </label>
              ))}
            </div>
          </FilterChip>

          {/* Sizes */}
          <FilterChip
            icon={<SizesIcon />}
            label="Sizes"
            count={selectedSizes.length}
            isOpen={openFilter === "sizes"}
            onToggle={() => handleToggle("sizes")}
          >
            <div className="flex flex-col gap-1">
              {SIZES.map((size) => (
                <label
                  key={size}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  style={{
                    fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                    className="h-[18px] w-[18px] rounded border-neutral-300 text-blue-600 accent-blue-600"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </FilterChip>

          {/* Price */}
          <FilterChip
            icon={<PriceIcon />}
            label="Price"
            isOpen={openFilter === "price"}
            onToggle={() => handleToggle("price")}
          >
            <div
              className="flex flex-col gap-4"
              style={{
                fontFamily: "Poppins, 'Poppins Fallback', sans-serif",
              }}
            >
              <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                <span>$0</span>
                <span>$500</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                defaultValue="250"
                className="w-full accent-neutral-900 dark:accent-white"
              />
            </div>
          </FilterChip>
        </div>

        {/* Right: Sort */}
        <SortDropdown />
      </div>

      {/* Divider */}
      <hr className="border-t border-neutral-200 dark:border-neutral-700" />
    </div>
  );
}
