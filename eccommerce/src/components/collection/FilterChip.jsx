import { useRef, useEffect } from "react";

export default function FilterChip({
  icon,
  label,
  count,
  isOpen,
  onToggle,
  children,
}) {
  const chipRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (chipRef.current && !chipRef.current.contains(e.target)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={chipRef}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
          isOpen
            ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-white dark:ring-white"
            : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500"
        } bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200`}
        style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
      >
        {/* Icon */}
        <span className="flex h-[18px] w-[18px] items-center justify-center text-neutral-500 dark:text-neutral-400">
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
          <span className="absolute -top-1.5 -right-1.5 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white dark:bg-white dark:text-neutral-900">
            {count}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && children && (
        <div className="absolute left-0 top-full z-40 mt-2 min-w-[220px] rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
          {children}
        </div>
      )}
    </div>
  );
}
