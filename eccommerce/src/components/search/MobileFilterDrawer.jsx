import { useState, useEffect, useRef } from "react";

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  subcategories,
  selectedSubcategories,
  onSubcategoriesChange,
  colorOptions,
  selectedColors,
  onColorsChange,
  sizeOptions,
  selectedSizes,
  onSizesChange,
  priceRange,
  onPriceRangeChange,
}) {
  const [openCount, setOpenCount] = useState(0);
  const prevIsOpen = useRef(false);

  if (isOpen && !prevIsOpen.current) {
    setOpenCount((c) => c + 1);
  }
  prevIsOpen.current = isOpen;

  const [tempSubcategories, setTempSubcategories] = useState(selectedSubcategories);
  const [tempColors, setTempColors] = useState(selectedColors);
  const [tempSizes, setTempSizes] = useState(selectedSizes);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);
  const [tempMinPrice, setTempMinPrice] = useState(priceRange[0]);
  const [tempMaxPrice, setTempMaxPrice] = useState(priceRange[1]);
  const scrollRef = useRef(null);

  const lastSyncedCount = useRef(openCount);
  if (lastSyncedCount.current !== openCount) {
    lastSyncedCount.current = openCount;
  }

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleApply = () => {
    onSubcategoriesChange(tempSubcategories);
    onColorsChange(tempColors);
    onSizesChange(tempSizes);
    onPriceRangeChange(tempPriceRange);
    onClose();
  };

  const handleCancel = () => {
    setTempSubcategories(selectedSubcategories);
    setTempColors(selectedColors);
    setTempSizes(selectedSizes);
    setTempPriceRange(priceRange);
    onClose();
  };

  // Checkbox component matching Ciseco style
  const Checkbox = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-x-3 cursor-pointer group py-0.5">
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={onChange}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(); }}}
        className={`flex w-[22px] h-[22px] items-center justify-center rounded-md border transition-colors ${
          checked ? "bg-neutral-900 border-transparent" : "bg-white border-neutral-300 group-hover:border-neutral-400"
        }`}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
            <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
          </svg>
        )}
      </span>
      <span
        className="text-sm text-neutral-700"
        onClick={onChange}
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
      >
        {label}
      </span>
    </label>
  );

  // Price slider
  const minPercent = (tempPriceRange[0] / 1000) * 100;
  const maxPercent = (tempPriceRange[1] / 1000) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Drawer — slides from BOTTOM to TOP with minimal top gap */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col w-full max-h-[96vh] rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div /> {/* spacer for centering */}
          <h2 className="text-base font-semibold text-neutral-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 cursor-pointer transition-colors"
            aria-label="Close filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          {/* Categories */}
          <div className="px-6 py-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-5">Categories</h3>
            <div className="space-y-4">
              {subcategories.map((item) => (
                <Checkbox
                  key={item}
                  checked={tempSubcategories.includes(item)}
                  onChange={() => setTempSubcategories(toggleArrayItem(tempSubcategories, item))}
                  label={item}
                />
              ))}
            </div>
          </div>

          {/* Colors — checkbox list like Ciseco */}
          <div className="px-6 py-6 border-t border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900 mb-5">Colors</h3>
            <div className="space-y-4">
              {colorOptions.map((color) => (
                <Checkbox
                  key={color.name}
                  checked={tempColors.includes(color.name)}
                  onChange={() => setTempColors(toggleArrayItem(tempColors, color.name))}
                  label={color.name}
                />
              ))}
            </div>
          </div>

          {/* Sizes — checkbox list like Ciseco */}
          <div className="px-6 py-6 border-t border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900 mb-5">Sizes</h3>
            <div className="space-y-4">
              {sizeOptions.map((size) => (
                <Checkbox
                  key={size}
                  checked={tempSizes.includes(size)}
                  onChange={() => setTempSizes(toggleArrayItem(tempSizes, size))}
                  label={size}
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="px-6 py-6 border-t border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Price</h3>
            <p className="text-sm text-neutral-500 mb-5">Price</p>

            {/* Dual Range Slider */}
            <div className="relative h-[4px] w-full mb-6">
              <div className="absolute inset-0 rounded-full bg-neutral-200" />
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
                value={tempPriceRange[0]}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), tempPriceRange[1] - 10);
                  setTempPriceRange([val, tempPriceRange[1]]);
                  setTempMinPrice(val);
                }}
                className="dual-range"
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={tempPriceRange[1]}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), tempPriceRange[0] + 10);
                  setTempPriceRange([tempPriceRange[0], val]);
                  setTempMaxPrice(val);
                }}
                className="dual-range"
              />
            </div>

            {/* Min/Max Price Inputs */}
            <div className="flex justify-between gap-x-5">
              <div className="flex-1">
                <p className="block text-sm font-medium text-neutral-700 mb-1.5">Min price</p>
                <div className="relative flex h-9 w-full items-center rounded-full bg-neutral-100 px-4 py-2 text-sm">
                  <span className="text-neutral-400 mr-1">$</span>
                  <input
                    type="number"
                    value={tempMinPrice}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(Number(e.target.value) || 0, tempPriceRange[1] - 10));
                      setTempMinPrice(val);
                      setTempPriceRange([val, tempPriceRange[1]]);
                    }}
                    className="w-full bg-transparent text-neutral-900 outline-none"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="block text-sm font-medium text-neutral-700 mb-1.5">Max price</p>
                <div className="relative flex h-9 w-full items-center rounded-full bg-neutral-100 px-4 py-2 text-sm">
                  <span className="text-neutral-400 mr-1">$</span>
                  <input
                    type="number"
                    value={tempMaxPrice}
                    onChange={(e) => {
                      const val = Math.min(1000, Math.max(Number(e.target.value) || 0, tempPriceRange[0] + 10));
                      setTempMaxPrice(val);
                      setTempPriceRange([tempPriceRange[0], val]);
                    }}
                    className="w-full bg-transparent text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — Cancel + Apply filters */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-neutral-900 text-white px-8 py-2.5 text-sm font-medium hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}
