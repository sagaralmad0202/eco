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
          {/* Search */}
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-neutral-300 dark:text-neutral-700 bg-neutral-100/50 dark:bg-neutral-800/50 animate-pulse hidden sm:flex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21L16.65 16.65" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Account */}
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-neutral-300 dark:text-neutral-700 bg-neutral-100/50 dark:bg-neutral-800/50 animate-pulse hidden sm:flex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Cart */}
          <div className="relative flex h-[44px] w-[44px] items-center justify-center rounded-full text-neutral-300 dark:text-neutral-700 bg-neutral-100/50 dark:bg-neutral-800/50 animate-pulse">
            <div className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium leading-none text-white">
              3
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2H3.74L4.82 12.8C4.91 13.72 5.68 14.44 6.61 14.44H18.23C19.12 14.44 19.86 13.79 20 12.91L21 4.5H4.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
          </div>
        </div>

      </div>
    </header>
  );
};

export default HeaderSkeleton;
