import React from 'react';

const ExploringCardSkeleton = () => (
  <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-8 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
    <div className="flex flex-col justify-between" style={{ height: "292px" }}>
      <div className="flex items-center justify-between gap-x-2.5">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        <div className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
      </div>

      <div className="mt-12" style={{ height: "64px" }}>
        <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-2"></div>
        <div className="h-8 w-40 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
      </div>

      <div className="mt-10 sm:mt-20">
        <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SectionStartExploringSkeleton = () => {
  return (
    <div className="relative pt-24 pb-20 lg:pt-28">
      {/* Background Section */}
      <div className="nc-BackgroundSection absolute inset-y-0 w-screen xl:max-w-[1340px] 2xl:max-w-[1536px] left-1/2 transform -translate-x-1/2 xl:rounded-[40px] z-0 bg-neutral-100/70 dark:bg-black/20" />

      {/* Content */}
      <div className="relative" style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div className="relative flex flex-col justify-between sm:flex-row sm:items-end mb-12 lg:mb-14">
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <div className="h-10 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="relative mb-12 flex w-full justify-center lg:mb-14">
          <ul className="flex overflow-hidden rounded-full bg-white p-1 shadow-lg dark:bg-neutral-800">
            {[1, 2, 3, 4, 5, 6].map((tab) => (
              <li key={tab}>
                <div className="h-10 w-24 mx-1 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Grid of Cards */}
        <div className="grid gap-4 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <ExploringCardSkeleton key={card} />
          ))}
        </div>

        {/* Explore All Button */}
        <div className="mt-10 sm:mt-20 flex justify-center">
          <div className="h-[52px] w-[240px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SectionStartExploringSkeleton;
