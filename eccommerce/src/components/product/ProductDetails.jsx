export default function ProductDetails({ product }) {
  const description =
    product?.description ||
    "Thoughtfully crafted using high-grade materials designed for lasting durability and effortless everyday versatility. Every seam, edge, and finish is completed to rigorous craftsmanship standards.";

  const category =
    typeof product?.category === "object"
      ? product.category?.name
      : product?.category || "General";

  const brand = product?.brand || "Eco Studio";
  const sku = product?.sku || product?.slug?.toUpperCase() || "ECO-PRD";

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        Product Details
      </h2>
      <div className="mt-4 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-4xl">
        <p>{description}</p>
      </div>

      {/* Specifications grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Brand
          </span>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            {brand}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Category
          </span>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            {category}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Item Reference
          </span>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            {sku}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Dispatch
          </span>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            1–2 Business Days
          </p>
        </div>
      </div>
    </div>
  );
}
