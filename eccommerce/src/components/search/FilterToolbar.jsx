import { useState, useEffect, useRef } from "react";

function FilterPopover({ label, icon, count, children, isOpen, onToggle, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none hover:bg-neutral-50 focus:outline-none transition-colors cursor-pointer ${
          count > 0 ? "ring-2 ring-inset ring-black" : "ring-1 ring-inset ring-neutral-200"
        }`}
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
      >
        {icon}
        <span className="ms-2">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`ms-3 w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        {count > 0 && (
          <span className="absolute top-0 -right-0.5 flex w-[18px] h-[18px] items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -start-5 top-full z-50 mt-3 w-80 sm:w-96">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({ items, selected, onToggle }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isChecked = selected.includes(item);
        return (
          <label key={item} className="flex items-center gap-x-4 cursor-pointer group" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
            <span
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onClick={() => onToggle(item)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(item); }}}
              className={`relative flex w-5 h-5 sm:w-[22px] sm:h-[22px] items-center justify-center rounded-[5px] border transition-colors ${
                isChecked
                  ? "bg-neutral-900 border-transparent"
                  : "bg-white border-neutral-300 group-hover:border-neutral-400"
              }`}
            >
              {isChecked && (
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
                  <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                </svg>
              )}
            </span>
            <span className="text-sm" onClick={() => onToggle(item)}>{item}</span>
          </label>
        );
      })}
    </div>
  );
}

function ColorCheckboxGroup({ items, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((color) => {
        const isChecked = selected.includes(color.name);
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => onToggle(color.name)}
            className={`relative w-10 h-10 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isChecked ? "border-black ring-1 ring-black" : "border-neutral-200 hover:border-neutral-400"
            }`}
            title={color.name}
            aria-label={color.name}
          >
            <span
              className="absolute inset-1 rounded-full"
              style={{ backgroundColor: color.value }}
            />
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
  );
}

function PriceRangeSlider({ min, max, value, onChange }) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  return (
    <div className="px-2">
      <div className="flex justify-between mb-4 text-sm text-neutral-600" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
        <span>${localMin}</span>
        <span>${localMax}</span>
      </div>
      <div className="relative h-1 bg-neutral-200 rounded-full">
        <div
          className="absolute h-1 rounded-full"
          style={{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
            backgroundColor: "#38bdf8",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), localMax - 5);
            setLocalMin(val);
            onChange([val, localMax]);
          }}
          className="dual-range"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), localMin + 5);
            setLocalMax(val);
            onChange([localMin, val]);
          }}
          className="dual-range"
        />
      </div>
    </div>
  );
}

export default function FilterToolbar({
  isOpen,
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
  sortOption,
  onSortChange,
  sortOptions,
  // Mobile
  onMobileFilterToggle,
  totalFilterCount,
}) {
  const [openPopover, setOpenPopover] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Temp states for cancel/apply in popovers
  const [tempSubcategories, setTempSubcategories] = useState(selectedSubcategories);
  const [tempColors, setTempColors] = useState(selectedColors);
  const [tempSizes, setTempSizes] = useState(selectedSizes);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  useEffect(() => { setTempSubcategories(selectedSubcategories); }, [selectedSubcategories]);
  useEffect(() => { setTempColors(selectedColors); }, [selectedColors]);
  useEffect(() => { setTempSizes(selectedSizes); }, [selectedSizes]);
  useEffect(() => { setTempPriceRange(priceRange); }, [priceRange]);

  // Close sort on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    const handleEsc = (e) => { if (e.key === "Escape") setSortOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [sortOpen]);

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleOpenPopover = (name) => {
    if (openPopover === name) {
      setOpenPopover(null);
    } else {
      setOpenPopover(name);
      if (name === "categories") setTempSubcategories(selectedSubcategories);
      if (name === "colors") setTempColors(selectedColors);
      if (name === "sizes") setTempSizes(selectedSizes);
      if (name === "price") setTempPriceRange(priceRange);
    }
  };

  const handleApply = (name) => {
    if (name === "categories") onSubcategoriesChange(tempSubcategories);
    if (name === "colors") onColorsChange(tempColors);
    if (name === "sizes") onSizesChange(tempSizes);
    if (name === "price") onPriceRangeChange(tempPriceRange);
    setOpenPopover(null);
  };

  const handleCancel = () => {
    setOpenPopover(null);
  };

  // Icon components
  const CategoriesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2V5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2V5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13H15" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17H12" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.5C19.33 3.68 21 4.95 21 9.65V15.83C21 19.95 20 22.01 15 22.01H9C4 22.01 3 19.95 3 15.83V9.65C3 4.95 4.67 3.69 8 3.5H16Z" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const ColorsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" strokeLinecap="round" />
    </svg>
  );

  const SizesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 9L21 3M21 3H15M21 3L13 11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15L3 21M3 21H9M3 21L11 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const PriceIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" />
      <path d="M14.7635 10.2265C14.6064 8.42012 13.1394 7 11.3 7C9.29086 7 7.6625 8.6883 7.6625 10.7725C7.6625 12.2939 8.54688 13.5997 9.82456 14.1376" strokeLinecap="round" />
      <path d="M9.23618 13.7735C9.39328 15.5799 10.8603 17 12.6997 17C14.7088 17 16.3372 15.3117 16.3372 13.2275C16.3372 11.7061 15.4528 10.4003 14.1751 9.86243" strokeLinecap="round" />
      <path d="M12 5.5V7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17V18.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const SortIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 21L7 18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21L17 15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6L17 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9L7 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 18C6.06812 18 5.60218 18 5.23463 17.8478C4.74458 17.6448 4.35523 17.2554 4.15224 16.7654C4 16.3978 4 15.9319 4 15C4 14.0681 4 13.6022 4.15224 13.2346C4.35523 12.7446 4.74458 12.3552 5.23463 12.1522C5.60218 12 6.06812 12 7 12C7.93188 12 8.39782 12 8.76537 12.1522C9.25542 12.3552 9.64477 12.7446 9.84776 13.2346C10 13.6022 10 14.0681 10 15C10 15.9319 10 16.3978 9.84776 16.7654C9.64477 17.2554 9.25542 17.6448 8.76537 17.8478C8.39782 18 7.93188 18 7 18Z" />
      <path d="M17 12C16.0681 12 15.6022 12 15.2346 11.8478C14.7446 11.6448 14.3552 11.2554 14.1522 10.7654C14 10.3978 14 9.93188 14 9C14 8.06812 14 7.60218 14.1522 7.23463C14.3552 6.74458 14.7446 6.35523 15.2346 6.15224C15.6022 6 16.0681 6 17 6C17.9319 6 18.3978 6 18.7654 6.15224C19.2554 6.35523 19.6448 6.74458 19.8478 7.23463C20 7.60218 20 8.06812 20 9C20 9.93188 20 10.3978 19.8478 10.7654C19.6448 11.2554 19.2554 11.6448 18.7654 11.8478C18.3978 12 17.9319 12 17 12Z" />
    </svg>
  );

  const PopoverActions = ({ name }) => (
    <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
      <button
        type="button"
        onClick={handleCancel}
        className="text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors"
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => handleApply(name)}
        className="rounded-full bg-neutral-900 text-white px-6 py-2 text-sm font-medium hover:bg-neutral-800 cursor-pointer transition-colors"
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
      >
        Apply
      </button>
    </div>
  );

  const currentSort = sortOptions.find((s) => s.value === sortOption);

  return (
    <div
      className={`grid transition-all duration-150 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <hr className="my-8 w-full border-t border-neutral-200" />
        <div className="flex flex-wrap items-center gap-2.5 pb-4">
            {/* Mobile: All filters button */}
            <div className="shrink-0 md:hidden">
              <button
                type="button"
                onClick={onMobileFilterToggle}
                className="relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-2 ring-inset ring-black hover:bg-neutral-50 focus:outline-none cursor-pointer"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 21L7 18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 21L17 15" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 6L17 3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 9L7 3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 18C6.06812 18 5.60218 18 5.23463 17.8478C4.74458 17.6448 4.35523 17.2554 4.15224 16.7654C4 16.3978 4 15.9319 4 15C4 14.0681 4 13.6022 4.15224 13.2346C4.35523 12.7446 4.74458 12.3552 5.23463 12.1522C5.60218 12 6.06812 12 7 12C7.93188 12 8.39782 12 8.76537 12.1522C9.25542 12.3552 9.64477 12.7446 9.84776 13.2346C10 13.6022 10 14.0681 10 15C10 15.9319 10 16.3978 9.84776 16.7654C9.64477 17.2554 9.25542 17.6448 8.76537 17.8478C8.39782 18 7.93188 18 7 18Z" />
                  <path d="M17 12C16.0681 12 15.6022 12 15.2346 11.8478C14.7446 11.6448 14.3552 11.2554 14.1522 10.7654C14 10.3978 14 9.93188 14 9C14 8.06812 14 7.60218 14.1522 7.23463C14.3552 6.74458 14.7446 6.35523 15.2346 6.15224C15.6022 6 16.0681 6 17 6C17.9319 6 18.3978 6 18.7654 6.15224C19.2554 6.35523 19.6448 6.74458 19.8478 7.23463C20 7.60218 20 8.06812 20 9C20 9.93188 20 10.3978 19.8478 10.7654C19.6448 11.2554 19.2554 11.6448 18.7654 11.8478C18.3978 12 17.9319 12 17 12Z" />
                </svg>
                <span className="ms-2">All filters</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ms-3 w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                {totalFilterCount > 0 && (
                  <span className="absolute top-0 -right-0.5 flex w-[18px] h-[18px] items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white ring-2 ring-white">
                    {totalFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop filter pills */}
            <div className="hidden md:flex md:flex-wrap md:gap-x-4 md:gap-y-2 flex-1">
              <FilterPopover
                label="Categories"
                icon={CategoriesIcon}
                count={selectedSubcategories.length}
                isOpen={openPopover === "categories"}
                onToggle={() => handleOpenPopover("categories")}
                onClose={() => setOpenPopover(null)}
              >
                <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                  <CheckboxGroup
                    items={subcategories}
                    selected={tempSubcategories}
                    onToggle={(item) => setTempSubcategories(toggleArrayItem(tempSubcategories, item))}
                  />
                </div>
                <PopoverActions name="categories" />
              </FilterPopover>

              <FilterPopover
                label="Colors"
                icon={ColorsIcon}
                count={selectedColors.length}
                isOpen={openPopover === "colors"}
                onToggle={() => handleOpenPopover("colors")}
                onClose={() => setOpenPopover(null)}
              >
                <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                  <ColorCheckboxGroup
                    items={colorOptions}
                    selected={tempColors}
                    onToggle={(name) => setTempColors(toggleArrayItem(tempColors, name))}
                  />
                </div>
                <PopoverActions name="colors" />
              </FilterPopover>

              <FilterPopover
                label="Sizes"
                icon={SizesIcon}
                count={selectedSizes.length}
                isOpen={openPopover === "sizes"}
                onToggle={() => handleOpenPopover("sizes")}
                onClose={() => setOpenPopover(null)}
              >
                <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => {
                      const isSelected = tempSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTempSizes(toggleArrayItem(tempSizes, size))}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                          }`}
                          style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <PopoverActions name="sizes" />
              </FilterPopover>

              <FilterPopover
                label="Price"
                icon={PriceIcon}
                count={0}
                isOpen={openPopover === "price"}
                onToggle={() => handleOpenPopover("price")}
                onClose={() => setOpenPopover(null)}
              >
                <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                  <PriceRangeSlider
                    min={0}
                    max={300}
                    value={tempPriceRange}
                    onChange={setTempPriceRange}
                  />
                </div>
                <PopoverActions name="price" />
              </FilterPopover>
            </div>

            {/* Sort */}
            <div className="ml-auto relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50 focus:outline-none cursor-pointer transition-colors"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
              >
                {SortIcon}
                <span className="ms-2">{currentSort?.label || "Newest"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`ms-3 w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-52">
                  <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl py-2">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-5 py-2.5 text-sm hover:bg-neutral-50 cursor-pointer transition-colors ${
                          sortOption === opt.value ? "font-semibold text-neutral-900" : "text-neutral-600"
                        }`}
                        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

