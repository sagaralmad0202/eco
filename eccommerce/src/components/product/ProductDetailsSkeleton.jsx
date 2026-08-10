import React from "react";

export default function ProductDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Product Section: Gallery + Info Skeleton */}
      <div className="lg:flex">
        {/* Gallery Skeleton - Left side */}
        <div className="w-full lg:w-[55%]">
          {/* Main Hero Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow-sm" />

          {/* 2×2 Grid of secondary images */}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow-sm" />
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow-sm" />
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow-sm" />
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow-sm" />
          </div>
        </div>

        {/* Info Skeleton - Right side */}
        <div className="w-full pt-10 lg:w-[45%] lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
          <div className="flex flex-col gap-y-10">
            {/* Header: Breadcrumb, Title, Price, Rating */}
            <div>
              {/* Breadcrumb skeleton */}
              <div className="h-4 w-48 rounded-md bg-neutral-200 dark:bg-neutral-800" />
              {/* Title skeleton */}
              <div className="mt-4 h-9 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              {/* Price & Rating skeleton */}
              <div className="mt-7 flex items-center gap-x-4">
                <div className="h-10 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-6 w-36 rounded-md bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>

            {/* Variants skeleton */}
            <div className="flex flex-col gap-y-8">
              {/* Colors */}
              <div>
                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 mb-3" />
                <div className="flex gap-x-3">
                  <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>

              {/* Quantity + Add to Cart button */}
              <div className="flex gap-x-3.5 mt-2">
                <div className="h-12 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-12 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>

            <hr className="w-full border-t border-neutral-200 dark:border-neutral-800" />

            {/* Accordion items skeleton */}
            <div className="space-y-3">
              <div className="h-12 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-12 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-12 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
