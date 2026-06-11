import React from 'react';

const FooterSkeleton = () => {
  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-700 py-20 lg:pt-28 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-8 text-left grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        
        {/* Column 1: Logo and Socials */}
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <div className="w-[112px] h-[44px] rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <div className="flex flex-col gap-y-3 lg:mt-0">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-x-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                  <div className="w-20 h-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget Columns */}
        {[1, 2, 3, 4].map((widget) => (
          <div key={widget} className="text-sm">
            <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            <ul className="mt-5 space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <li key={item}>
                  <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default FooterSkeleton;
