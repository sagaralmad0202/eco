import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  "Newest",
  "Oldest",
  "Price: low to high",
  "Price: high to low",
  "A to Z",
  "Z to A",
];

export default function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Newest");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
          isOpen
            ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-white dark:ring-white"
            : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500"
        } bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200`}
        style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
      >
        {/* Sort icon */}
        <svg
          className="h-[18px] w-[18px] text-neutral-500 dark:text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
          />
        </svg>
        <span>{selected}</span>
        {/* Chevron */}
        <svg
          className={`h-4 w-4 text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[200px] rounded-2xl bg-white py-2 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                selected === option
                  ? "font-medium text-blue-600 dark:text-blue-400"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
              style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
            >
              {selected === option && (
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
              {selected !== option && <span className="w-4 shrink-0" />}
              <span>{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
