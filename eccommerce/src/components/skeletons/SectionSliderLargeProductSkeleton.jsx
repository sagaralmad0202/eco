import React from 'react';

const SectionSliderLargeProductSkeleton = ({ className = "" }) => {
  return (
    <div
      className={`nc-SectionSliderLargeProduct ${className}`}
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      {/* Header */}
      <div className="relative mb-12 flex w-full flex-col justify-between sm:flex-row sm:items-end sm:justify-between lg:mb-14">
        <div className="w-full text-left">
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

      {/* Slider */}
      <div className="overflow-hidden">
        <div className="flex gap-5 sm:gap-0 sm:-ml-[32px]">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="min-w-0 shrink-0 w-full sm:w-[33.3333%] sm:pl-[32px]"
            >
              <div className="relative pb-[20px]">
                {/* Main image container */}
                <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse aspect-[8/5] p-[20px]"></div>

                {/* Thumbnails row */}
                <div className="relative mt-2.5 flex gap-2.5">
                  {[1, 2, 3].map((thumb) => (
                    <div
                      key={thumb}
                      className="flex-1 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse aspect-[1/1] max-h-[120px]"
                    ></div>
                  ))}
                </div>

                {/* Product info */}
                <div className="relative mt-5 flex justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                    <div className="mt-3 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                  </div>
                  <div className="mt-0.5">
                    <div className="h-8 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionSliderLargeProductSkeleton;
