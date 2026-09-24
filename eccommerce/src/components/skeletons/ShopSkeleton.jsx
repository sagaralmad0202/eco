import React from "react";
import HeaderSkeleton from "./HeaderSkeleton";
import FooterSkeleton from "./FooterSkeleton";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ShopSkeleton() {
  return (
    <div className="nc-SaleCollection relative min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <HeaderSkeleton />
      </div>

      {/* Main Container */}
      <div className="container mx-auto flex flex-col gap-y-12 py-12 sm:gap-y-16 sm:py-16 lg:gap-y-16 lg:py-20 px-4 sm:px-8 text-left">
        {/* Title + Subtitle */}
        <div className="max-w-2xl space-y-4">
          <div className="h-10 w-64 sm:w-80 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-full max-w-md rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-3/4 max-w-sm rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="space-y-6">
          {/* Subcategory Pills */}
          <div className="flex flex-wrap gap-2.5">
            {[90, 80, 70, 85, 75, 80, 95].map((w, idx) => (
              <div
                key={idx}
                className="h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>

          {/* Filter Dropdowns row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-10 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
            <div className="h-10 w-36 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} gridMode={true} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <FooterSkeleton />
    </div>
  );
}
