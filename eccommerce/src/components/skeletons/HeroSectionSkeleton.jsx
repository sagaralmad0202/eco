import React from 'react';

const HeroSectionSkeleton = () => {
  return (
    <section className="relative text-left">
      <div className="container mx-auto px-[20px] sm:px-4">
        <div className="relative mx-auto h-[601.54px] w-full max-w-full overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-800 lg:h-[637.35px] lg:w-[1456.6px]">
          
          {/* Text Content */}
          <div className="relative inset-x-0 z-10 h-[243.1px] px-8 pt-8 pb-0 lg:absolute lg:top-1/5 lg:h-[325.2px] lg:pt-0 lg:px-8">
            <div className="flex flex-col items-start gap-y-4 lg:h-[325.2px] lg:w-[672px] lg:max-w-lg xl:max-w-2xl xl:gap-y-8 mt-4 lg:mt-0">
              
              {/* Subtitle */}
              <div className="h-6 w-48 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>

              {/* Title */}
              <div className="flex flex-col gap-2 w-full max-w-[220px] lg:max-w-[860px]">
                <div className="h-[40px] sm:h-[60px] lg:h-[80px] w-full rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
                <div className="h-[40px] sm:h-[60px] lg:h-[80px] w-3/4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
              </div>

              {/* Button */}
              <div className="h-[46px] w-[180px] rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse mt-4"></div>
            </div>
          </div>

          {/* Hero Image Block */}
          <div className="pointer-events-none absolute right-0 bottom-0 h-[56%] w-full lg:h-full lg:w-[54%]">
            <div className="h-full w-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSectionSkeleton;
