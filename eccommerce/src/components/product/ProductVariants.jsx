import { useState } from "react";
import SizeChartModal from "./SizeChartModal";

export const PRODUCT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Brown", value: "oklch(42.1% 0.095 57.708)" },
  { name: "Beige", value: "#D1C9C1" },
  { name: "Peach", value: "#f7e3d4" },
];

export const PRODUCT_SIZES = ["XXS", "XS", "M", "L", "XL"];

export default function ProductVariants({
  product,
  selectedColor: propSelectedColor,
  onColorChange,
  selectedSize: propSelectedSize,
  onSizeChange,
}) {
  const [internalColor, setInternalColor] = useState(1); // Brown selected by default
  const [internalSize, setInternalSize] = useState(0); // XXS selected by default
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const selectedColor = propSelectedColor !== undefined ? propSelectedColor : internalColor;
  const selectedSize = propSelectedSize !== undefined ? propSelectedSize : internalSize;

  const handleColorSelect = (idx) => {
    if (onColorChange) {
      onColorChange(idx);
    } else {
      setInternalColor(idx);
    }
  };

  const handleSizeSelect = (idx) => {
    if (onSizeChange) {
      onSizeChange(idx);
    } else {
      setInternalSize(idx);
    }
  };

  const showSizes =
    product?.hasSizes !== false &&
    product?.category !== "Beauty" &&
    (!product?.sizes || product.sizes.length > 0);

  const availableSizes =
    product?.sizes && product.sizes.length > 0 ? product.sizes : PRODUCT_SIZES;

  return (
    <div className="flex flex-col gap-y-8">
      {/* Color Selector */}
      <div>
        <div aria-label="Color" role="radiogroup">
          <label className="block text-sm font-medium rtl:text-right">
            Color
          </label>
          <div className="mt-2.5 flex gap-x-2.5">
            {PRODUCT_COLORS.map((color, idx) => (
              <div
                key={color.name}
                className={`relative size-9 cursor-pointer rounded-full ${
                  selectedColor === idx
                    ? "ring-2 ring-neutral-900 dark:ring-neutral-300"
                    : ""
                }`}
                role="radio"
                aria-checked={selectedColor === idx}
                tabIndex={selectedColor === idx ? 0 : -1}
                onClick={() => handleColorSelect(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleColorSelect(idx);
                  }
                }}
              >
                <div
                  className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover ring-1 ring-neutral-900/10 dark:ring-white/15"
                  style={{ backgroundColor: color.value }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Size Selector */}
      {showSizes && (
        <div>
          <div aria-label="size" role="radiogroup">
            <div className="flex justify-between text-sm font-medium">
              <label>Size</label>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="cursor-pointer text-primary-600 hover:text-primary-500 font-medium focus:outline-none"
                style={{ color: "#0284c7" }}
              >
                See sizing chart
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
              {availableSizes.map((size, idx) => (
                <div
                  key={size}
                  className={`relative flex h-10 items-center justify-center overflow-hidden rounded-lg text-sm font-medium text-neutral-900 uppercase select-none hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:hover:bg-neutral-700 ${
                    selectedSize === idx
                      ? "ring-2 ring-neutral-900 dark:ring-neutral-200"
                      : "ring-1 ring-neutral-200 dark:ring-neutral-500"
                  }`}
                  role="radio"
                  aria-checked={selectedSize === idx}
                  tabIndex={selectedSize === idx ? 0 : -1}
                  onClick={() => handleSizeSelect(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSizeSelect(idx);
                    }
                  }}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizes && (
        <SizeChartModal
          isOpen={sizeChartOpen}
          onClose={() => setSizeChartOpen(false)}
        />
      )}
    </div>
  );
}
