import { useRef, useEffect } from "react";

export default function FilterChip({
  icon,
  label,
  count,
  isOpen,
  onToggle,
  onClose,
  children,
}) {
  const chipRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (chipRef.current && !chipRef.current.contains(e.target)) {
        if (onClose) {
          onClose();
        } else if (onToggle) {
          onToggle();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle, onClose]);

  return (
    <div className="relative" ref={chipRef}>
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all select-none ring-inset ${
          count != null && count > 0
            ? "ring-2 ring-black dark:ring-white"
            : isOpen
              ? "ring-2 ring-black dark:ring-white"
              : "ring-1 ring-black hover:ring-neutral-400 dark:ring-white dark:hover:ring-neutral-500"
        } bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800`}
        style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
      >
        {/* Icon */}
        <span className="flex h-[18px] w-[18px] items-center justify-center text-neutral-900 dark:text-neutral-100">
          {icon}
        </span>
        {/* Label */}
        <span>{label}</span>
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
        {/* Count badge */}
        {count != null && count > 0 && (
          <span className="absolute top-0 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white ring-2 ring-white dark:bg-neutral-200 dark:text-neutral-900 dark:ring-neutral-900">
            {count}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && children && (
        <div className="absolute left-0 top-full z-40 mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {children}
        </div>
      )}
    </div>
  );
}
