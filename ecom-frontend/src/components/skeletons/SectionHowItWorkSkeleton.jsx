import React from 'react';

const SectionHowItWorkSkeleton = ({ className = "" }) => {
  return (
    <div 
      className={`nc-SectionHowItWork ${className}`} 
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="relative mx-auto flex w-full flex-col items-center gap-2"
            style={{ width: "100%", maxWidth: "304.2px", minHeight: "321.74px" }}
          >
            <div className="mb-4 sm:mb-10 max-w-[140px] w-full mx-auto">
              <div className="rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse w-full aspect-square"></div>
            </div>
            <div className="mt-auto text-center flex flex-col items-center w-full">
              <div className="h-6 w-16 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
              <div className="mt-[20px] h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
              <div className="mt-4 h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
              <div className="mt-2 h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHowItWorkSkeleton;
