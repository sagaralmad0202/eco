import React from "react";

const ProductCardSkeleton = ({ gridMode = false }) => {
  return (
    <div 
      className={`relative flex flex-col bg-transparent w-full ${
        gridMode ? "" : "max-w-[305.46px] h-[462.61px] sm:max-w-[340.2px] sm:h-[526.33px]"
      }`}
    >
      {/* Image Block */}
      <div className={`relative z-1 mx-auto shrink-0 overflow-hidden rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse ${gridMode ? "w-full" : "w-[285.46px] sm:mx-0 sm:w-full"}`}>
        <div className="block aspect-[11/12] w-full"></div>
        {/* New in Badge Skeleton */}
        <div className="absolute top-[12px] left-[12px] w-[56px] h-[24px] rounded bg-neutral-300 dark:bg-neutral-700"></div>
        {/* Like Button Skeleton */}
        <div className="absolute top-[12px] right-[12px] w-[36px] h-[36px] rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
      </div>
      
      {/* Content Block */}
      <div className="space-y-[16px] px-[10px] pt-[20px] pb-[10px] h-[155.2px] sm:h-[155.2px]">
        {/* Colors */}
        <div className="flex gap-[8px]">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="w-[16px] h-[16px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          ))}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1 h-[48px]">
          <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mt-1"></div>
          <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mt-1"></div>
        </div>
        
        {/* Price & Rating */}
        <div className="flex items-end justify-between mt-[16px]" style={{ height: "29.2px" }}>
          <div className="w-[76.45px] h-full rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse border-2 border-transparent"></div>
          <div className="w-20 h-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCardSkeleton);
