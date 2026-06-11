import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

const SectionSliderProductCardSkeleton = ({ className = "" }) => {
  return (
    <div
      className={`nc-SectionSliderProductCard ${className}`}
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      <div className="relative mb-[48px] flex w-full flex-col justify-between px-[20px] sm:px-0 sm:flex-row sm:items-end sm:justify-between lg:mb-[56px]">
        <div className="w-full max-w-[335.2px] text-left lg:w-[662.2px] lg:max-w-[662.2px] lg:flex-none">
          <div className="flex flex-col gap-2">
            <div className="h-10 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-[16px] flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <div className="nc-NextPrev relative flex items-center gap-[10px]">
            <div className="h-[40px] w-[40px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            <div className="h-[40px] w-[40px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div style={{ minHeight: "526.33px", overflow: "hidden" }}>
        <div className="flex pl-[20px] pr-[20px] sm:-ml-[32px] sm:gap-0 sm:pr-0 sm:pl-0">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="min-w-0 w-[305.46px] max-w-[calc(100vw-40px)] shrink-0 pl-0 sm:w-auto sm:max-w-none sm:pl-[32px] md:basis-1/2 lg:basis-1/3 xl:basis-[372.2px]"
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionSliderProductCardSkeleton;
