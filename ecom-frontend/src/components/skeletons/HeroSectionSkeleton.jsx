import React from 'react';

const HeroSectionSkeleton = () => {
  return (
    <section className="relative text-left">
      <div className="container mx-auto px-[20px] sm:px-4">
        <div className="relative mx-auto h-[601.54px] w-full max-w-full overflow-hidden rounded-2xl bg-[#F7F0EA] dark:bg-neutral-800 lg:h-[637.35px] lg:w-[1456.6px]">
          
          {/* Text Content */}
          <div className="relative inset-x-0 z-10 h-[243.1px] px-8 pt-8 pb-0 lg:absolute lg:top-1/5 lg:h-[325.2px] lg:pt-0 lg:px-8">
            <div className="flex flex-col items-start gap-y-4 lg:h-[325.2px] lg:w-[672px] lg:max-w-lg xl:max-w-2xl xl:gap-y-8 mt-4 lg:mt-0">
              
              {/* Subtitle */}
              <div className="h-6 w-48 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>

              {/* Title */}
              <div className="flex flex-col gap-2 w-full max-w-[220px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[860px]">
                <div className="h-[40px] sm:h-[60px] lg:h-[80px] w-full rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
                <div className="h-[40px] sm:h-[60px] lg:h-[80px] w-3/4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
              </div>

              {/* Button */}
              <div className="relative isolate inline-flex h-[46px] items-center justify-center gap-x-2 rounded-full px-6 bg-neutral-200 dark:bg-neutral-700 animate-pulse mt-4">
                <div className="h-4 w-32 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400">
                  <path d="M17 17L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Hero Image Block */}
          <div className="pointer-events-none absolute right-0 bottom-0 h-[56%] w-full lg:h-full lg:w-[54%]">
            <div className="h-full w-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
          </div>
          
        </div>
      </div>

      {/* Background Line */}
      <div className="absolute inset-10 hidden lg:block opacity-10">
        <div className="h-full w-full border border-neutral-300 dark:border-neutral-700 rounded-3xl animate-pulse"></div>
      </div>
    </section>
  );
};

export default HeroSectionSkeleton;
