import React from "react";
import errorNoticeBg from "../assets/error-notice-bg.jpg";

/**
 * What a product rail shows instead of cards.
 * Simple, clean UI with matching background image.
 */
const RailNotice = ({ status, error, onRetry, emptyText = "Nothing here yet. Check back soon." }) => {
  const failed = status === "failed";

  return (
    <div className="relative isolate flex min-h-[260px] sm:min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-neutral-200/60 bg-[#FAF7F5] px-6 py-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
      {/* Background Image matching UI */}
      <img
        src={errorNoticeBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-85 dark:opacity-20"
      />

      {/* Content centered directly without bulky nested cards */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3.5">
        <p
          className={`text-base font-medium ${
            failed
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-600 dark:text-neutral-300"
          }`}
          style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
        >
          {failed
            ? error || "We’re having trouble loading this content."
            : emptyText}
        </p>

        {failed && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-neutral-900 px-5 py-2 text-[13px] font-medium text-white transition-all hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default RailNotice;
