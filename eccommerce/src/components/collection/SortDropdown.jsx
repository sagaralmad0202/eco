import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  "Newest",
  "Oldest",
  "Price: low to high",
  "Price: high to low",
  "A to Z",
  "Z to A",
];

export default function SortDropdown({
  selected = "Newest",
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(selected);
  const dropdownRef = useRef(null);

  const currentSelected = onChange ? selected : internalSelected;

  const handleSelect = (option) => {
    if (onChange) {
      onChange(option);
    } else {
      setInternalSelected(option);
    }
    setIsOpen(false);
  };

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
        className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all select-none ring-inset ${
          isOpen
            ? "ring-1 ring-neutral-300 dark:ring-neutral-700"
            : "ring-1 ring-neutral-300 hover:ring-neutral-400 dark:ring-neutral-700 dark:hover:ring-neutral-600"
        } bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800`}
        style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
      >
        {/* Sort icon */}
        <svg
          className="h-[18px] w-[18px] text-neutral-900 dark:text-neutral-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M4 14H8.42109C9.35119 14 9.81624 14 9.94012 14.2801C10.064 14.5603 9.74755 14.8963 9.11466 15.5684L5.47691 19.4316C4.84402 20.1037 4.52757 20.4397 4.65145 20.7199C4.77533 21 5.24038 21 6.17048 21H10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M4 9L6.10557 4.30527C6.49585 3.43509 6.69098 3 7.00002 3C7.30907 3 7.50419 3.43509 7.89443 4.30527L10 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M17.5 20V4M17.5 20C16.7998 20 15.4915 18.0057 15 17.5M17.5 20C18.2002 20 19.5085 18.0057 20 17.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        <span>{currentSelected}</span>
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
        <div className="absolute right-0 top-full z-50 mt-2 max-h-60 w-52 overflow-y-auto hidden-scrollbar rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-neutral-700">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`relative flex w-full cursor-pointer select-none py-2.5 ps-10 pe-4 text-left text-sm transition-colors hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-neutral-800 dark:hover:text-sky-400 ${
                currentSelected === option
                  ? "font-medium text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-900 dark:text-neutral-200"
              }`}
              style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
            >
              <span className="block truncate">{option}</span>
              {currentSelected === option && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-900 dark:text-neutral-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M20.25 7.5l-9 9-4.5-4.5a.75.75 0 00-1.06 1.06l5.03 5.03a.75.75 0 001.06 0l9.53-9.53a.75.75 0 00-1.06-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
