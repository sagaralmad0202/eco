import React from 'react';

const HeaderSkeleton = () => {
  return (
    <header className="relative w-full bg-white dark:bg-black">
      <div className="relative z-40 container mx-auto flex h-[80px] justify-between border-neutral-200 bg-white px-4 sm:px-8 dark:border-neutral-700 dark:bg-neutral-900">
        
        {/* Mobile Left Area */}
        <div className="flex h-full flex-1 items-center lg:hidden">
          <div className="h-[44px] w-[44px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>

        {/* Logo Area */}
        <div className="flex h-full items-center lg:flex-1">
          <div className="w-[112px] h-[44px] rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>

        {/* Center Navigation (Desktop) */}
        <div className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center lg:flex">
          <ul className="flex items-center gap-x-2">
            {[1, 2, 3, 4].map((item) => (
              <li key={item} className="flex h-[80px] items-center px-4 xl:px-5">
                <div className="w-16 h-6 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side */}
        <div className="flex h-full flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
          <div className="h-[44px] w-[44px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse hidden sm:block"></div>
          <div className="h-[44px] w-[44px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse hidden sm:block"></div>
          <div className="h-[44px] w-[44px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>

      </div>
    </header>
  );
};

export default HeaderSkeleton;
