import ProductCard from "../ProductCard";
import ProductCardSkeleton from "../skeletons/ProductCardSkeleton";

export default function ProductGrid({ products = [], loading = false, onQuickView }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))
        : products.map((product) => (
            <ProductCard
              key={product.id}
              data={product}
              gridMode={true}
              onQuickView={onQuickView}
            />
          ))}
    </div>
  );
}
