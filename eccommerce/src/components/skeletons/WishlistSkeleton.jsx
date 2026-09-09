import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

const WishlistSkeleton = ({ count = 6, showHeader = false }) => {
  return (
    <div className="flex flex-col gap-y-10 text-left sm:gap-y-12">
      {showHeader && (
        <div className="space-y-3">
          <div className="h-8 w-44 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-72 sm:w-96 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <ProductCardSkeleton
            key={`wishlist-skeleton-${index}`}
            gridMode={true}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(WishlistSkeleton);
