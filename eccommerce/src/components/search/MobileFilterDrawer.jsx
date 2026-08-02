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
  // Use a key to reset temp state when drawer opens
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
  const scrollRef = useRef(null);

  // Sync temp state when openCount changes (drawer just opened)
  const lastSyncedCount = useRef(openCount);
  if (lastSyncedCount.current !== openCount) {
    lastSyncedCount.current = openCount;
    // These are synchronous updates during render, which is fine
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

  const handleClear = () => {
    setTempSubcategories([]);
    setTempColors([]);
    setTempSizes([]);
    setTempPriceRange([0, 300]);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-900" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>All Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 cursor-pointer transition-colors"
            aria-label="Close filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1" ref={scrollRef} style={{ height: "calc(100vh - 140px)" }}>
          {/* Categories */}
          <div className="px-5 py-5 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Categories</h3>
            <div className="space-y-3">
              {subcategories.map((item) => {
                const isChecked = tempSubcategories.includes(item);
                return (
                  <label key={item} className="flex items-center gap-x-3 cursor-pointer">
                    <span
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onClick={() => setTempSubcategories(toggleArrayItem(tempSubcategories, item))}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTempSubcategories(toggleArrayItem(tempSubcategories, item)); }}}
                      className={`flex w-5 h-5 items-center justify-center rounded-[5px] border transition-colors ${
                        isChecked ? "bg-neutral-900 border-transparent" : "bg-white border-neutral-300"
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
                          <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-neutral-700" onClick={() => setTempSubcategories(toggleArrayItem(tempSubcategories, item))} style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="px-5 py-5 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Colors</h3>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => {
                const isChecked = tempColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setTempColors(toggleArrayItem(tempColors, color.name))}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      isChecked ? "border-black" : "border-neutral-200"
                    }`}
                    title={color.name}
                    aria-label={color.name}
                  >
                    <span className="absolute inset-1 rounded-full" style={{ backgroundColor: color.value }} />
                    {isChecked && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
                          <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color.value === "#FFFFFF" || color.value === "#F5F5DC" || color.value === "#FFC1CC" || color.value === "#ADD8E6" ? "#000" : "#fff"} />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div className="px-5 py-5 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => {
                const isSelected = tempSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTempSizes(toggleArrayItem(tempSizes, size))}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                      isSelected ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200"
                    }`}
                    style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className="px-5 py-5">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Price Range</h3>
            <div className="px-2">
              <div className="flex justify-between mb-4 text-sm text-neutral-600" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                <span>${tempPriceRange[0]}</span>
                <span>${tempPriceRange[1]}</span>
              </div>
              <div className="relative h-1 bg-neutral-200 rounded-full">
                <div
                  className="absolute h-1 rounded-full"
                  style={{
                    left: `${(tempPriceRange[0] / 300) * 100}%`,
                    right: `${100 - (tempPriceRange[1] / 300) * 100}%`,
                    backgroundColor: "#38bdf8",
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={tempPriceRange[0]}
                  onChange={(e) => setTempPriceRange([Math.min(Number(e.target.value), tempPriceRange[1] - 5), tempPriceRange[1]])}
                  className="dual-range"
                />
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={tempPriceRange[1]}
                  onChange={(e) => setTempPriceRange([tempPriceRange[0], Math.max(Number(e.target.value), tempPriceRange[0] + 5)])}
                  className="dual-range"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors"
            style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-neutral-900 text-white px-8 py-2.5 text-sm font-medium hover:bg-neutral-800 cursor-pointer transition-colors"
            style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
