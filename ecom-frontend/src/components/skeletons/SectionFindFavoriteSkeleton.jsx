import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

const SectionFindFavoriteSkeleton = () => {
  return (
    <div className="nc-SectionFindFavorite relative container sm:px-[18px]">
      <div className="relative flex flex-col mb-12">
        <div className="relative flex flex-col justify-between sm:flex-row sm:items-end text-neutral-900 dark:text-neutral-50" style={{ marginBottom: '3.6px' }}>
          <div className="h-10 w-64 md:w-96 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>
      </div>

      {/* ── Tab Navigation + Filter Toggle ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto hidden-scrollbar pb-2">
          {[1, 2, 3, 4, 5].map((tab) => (
             <div key={tab} className="h-[42px] w-[80px] sm:w-[100px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0"></div>
          ))}
        </div>

        <div className="!hidden md:!flex h-[42px] w-[100px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0"></div>
      </div>

      <hr role="presentation" className="my-8 w-full border-t border-neutral-950/10 dark:border-white/10" />

      {/* ── Filter Bar ── */}
      <div className="flex justify-between items-center mb-8">
        {/* Mobile All Filters Button */}
        <div className="flex md:hidden">
          <div className="h-[42px] w-[120px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>

        <div className="!hidden md:!flex gap-2">
          {[1, 2, 3, 4].map((filter) => (
             <div key={filter} className="h-[42px] w-[120px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          ))}
        </div>
        <div className="relative">
          <div className="h-[42px] w-[120px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8 lg:mt-10">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <ProductCardSkeleton key={item} gridMode={true} />
        ))}
      </div>

      {/* ── Show Me More Button ── */}
      <div className="mt-10 flex justify-center">
        <div className="h-[46px] w-[180px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
      </div>
    </div>
  );
};

export default SectionFindFavoriteSkeleton;
