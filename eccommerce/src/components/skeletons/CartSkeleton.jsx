import React from "react";
import HeaderSkeleton from "./HeaderSkeleton";
import FooterSkeleton from "./FooterSkeleton";

export default function CartSkeleton() {
  return (
    <div className="nc-CartPage relative min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <HeaderSkeleton />
      </div>

      <main className="container mx-auto px-4 sm:px-8 py-16 lg:pt-20 lg:pb-28 text-left">
        {/* Page Title */}
        <div className="mb-12 sm:mb-16">
          <div className="h-10 w-64 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* Cart Layout: List + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Cart items column */}
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
              >
                {/* Image */}
                <div className="w-24 h-28 sm:w-28 sm:h-32 shrink-0 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-9 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="h-6 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary column */}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
              <div className="h-6 w-36 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                </div>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between">
                <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
              <div className="h-12 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </main>

      <FooterSkeleton />
    </div>
  );
}
