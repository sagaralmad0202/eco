import React from "react";

/**
 * What a product rail shows instead of cards.
 *
 * Two cases, and they are not the same thing:
 *   - failed: the request did not come back. There may well be products; we
 *     just could not read them, so offer a retry.
 *   - empty: the request succeeded and the catalogue genuinely has nothing
 *     matching. A retry button here would be a lie — pressing it changes
 *     nothing.
 *
 * Sized to roughly a card's height so a failing rail does not collapse the
 * page and shove everything below it upward.
 */
const RailNotice = ({ status, error, onRetry, emptyText = "Nothing here yet. Check back soon." }) => {
  const failed = status === "failed";

  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-[12px] rounded-3xl bg-neutral-50 px-[24px] py-[40px] text-center dark:bg-neutral-800">
      <p
        className="text-[15px] leading-[24px] text-neutral-500 dark:text-neutral-400"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {failed
          ? error || "We could not load these products."
          : emptyText}
      </p>

      {failed && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-neutral-900 px-[20px] py-[8px] text-[13px] leading-none text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default RailNotice;
