import React from 'react';

const SectionDiscoverMoreSkeleton = () => {
  return (
    <div className="relative">
      {/* ── Header: Title + Navigation Arrows ── */}
      <div className="relative flex flex-col justify-between sm:flex-row sm:items-end container sm:pl-[18px] sm:pr-0 mb-12 lg:mb-14">
        <div className="text-left w-full max-w-md">
          <div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>

        {/* Navigation Arrows */}
        <div className="mt-4 flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <div className="nc-NextPrev relative flex items-center">
            <div className="w-10 h-10 me-2 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* ── Embla Carousel / Slider ── */}
      <div className="embla pl-[18px]">
        <div className="-ms-5 embla__container flex overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="max-w-2xl shrink-0 ps-5 sm:basis-1/2 lg:basis-1/3 w-[320.26px]">
              <div className="w-full h-[220.18px] sm:h-auto sm:aspect-[16/9] relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDiscoverMoreSkeleton;
