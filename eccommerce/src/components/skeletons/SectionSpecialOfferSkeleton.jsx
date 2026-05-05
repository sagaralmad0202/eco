import React from 'react';

const SectionSpecialOfferSkeleton = () => {
  return (
    <section className="xl:pt-10 2xl:pt-24" style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}>
      <div className="relative flex flex-col rounded-2xl bg-neutral-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:p-14 xl:min-h-[670px] xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        
        {/* Text content */}
        <div className="relative z-10 max-w-lg text-left lg:w-1/2">
          <div className="h-[48px] md:h-[60px] w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          <div className="h-[48px] md:h-[60px] w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mt-2"></div>
          
          <div className="mt-7 h-[48px] w-4/5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>

          <ul className="mt-10 flex flex-col gap-y-4">
            {[1, 2, 3].map((item) => (
              <li key={item} className="flex items-center gap-x-4">
                <div className="h-6 w-8 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                <div className="h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
              </li>
            ))}
          </ul>

          <div className="relative mt-10 max-w-sm">
            <div className="h-[42px] w-full rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        </div>

        {/* Promo image */}
        <div className="relative mt-10 block lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:max-w-[calc(50%-40px)] w-full">
          <div className="mx-auto h-[300px] sm:h-[400px] lg:h-full w-full max-w-[280px] sm:max-w-sm lg:max-w-none rounded-t-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default SectionSpecialOfferSkeleton;
