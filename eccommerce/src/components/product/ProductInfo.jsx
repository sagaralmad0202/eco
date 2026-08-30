import { useState, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { showAddedToCartToast } from "../../utils/cartToast";
import ProductVariants from "./ProductVariants";
import QuantitySelector from "./QuantitySelector";
import ProductAccordion from "./ProductAccordion";
import PolicyCards from "./PolicyCards";

function Breadcrumb({ productName, category = "Jackets" }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs font-medium text-neutral-900 sm:text-sm/6 dark:text-neutral-300"
    >
      <ol role="list" className="flex flex-wrap items-center gap-3.5">
        <li>
          <div className="flex items-center gap-3.5">
            <a href="/">Home</a>
            <svg
              viewBox="0 0 6 20"
              aria-hidden="true"
              className="h-5 w-auto text-neutral-400 dark:text-neutral-500"
            >
              <path
                d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
                fill="currentColor"
              />
            </svg>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3.5">
            <a href="/shop">{category}</a>
            <svg
              viewBox="0 0 6 20"
              aria-hidden="true"
              className="h-5 w-auto text-neutral-400 dark:text-neutral-500"
            >
              <path
                d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
                fill="currentColor"
              />
            </svg>
          </div>
        </li>
        <li>
          <span
            aria-current="page"
            className="text-neutral-500 dark:text-neutral-400"
          >
            {productName}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function PriceBadge({ price }) {
  return (
    <div>
      <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold">
        <span className="leading-none! text-green-500">${price}</span>
      </div>
    </div>
  );
}

function RatingAndStock({ rating, reviews }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <a href="#reviews" className="flex items-center text-sm font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="size-5 pb-px text-yellow-400"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ms-1.5 flex">
          <span>{rating}</span>
          <span className="mx-2 block">·</span>
          <span className="text-neutral-600 underline dark:text-neutral-400">
            {reviews} reviews
          </span>
        </div>
      </a>
      <span>·</span>
      <div className="flex items-center justify-center text-sm/normal text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
        <span className="ml-1 leading-none">In Stock</span>
      </div>
    </div>
  );
}

function AddToCartButton() {
  return (
    <button
      type="submit"
      className="flex-1 relative isolate inline-flex items-center justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:outline-hidden border-transparent bg-zinc-900 text-white before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-zinc-900 before:shadow-sm after:absolute after:inset-0 after:-z-10 after:rounded-full hover:brightness-110 transition-all px-4 py-2.5 sm:px-6 sm:py-3 sm:text-sm/6 cursor-pointer dark:bg-white dark:text-zinc-950 dark:before:hidden dark:border-white/5"
    >
      {/* Shopping bag icon - hidden on mobile */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        color="currentColor"
        className="hidden sm:block"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          d="M7.00003 6C7.00003 7.65685 8.34318 9 10 9C11.6569 9 13 7.65685 13 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M11.1118 3H8.88827C6.21723 3 4.88171 3 4.01971 3.82064C3.15772 4.64128 3.08364 5.98325 2.93548 8.66719L2.60427 14.6672C2.44028 17.6379 2.35829 19.1233 3.24033 20.0616C4.12238 21 5.60061 21 8.55706 21H11.443C14.3995 21 15.8777 21 16.7597 20.0616C17.6418 19.1233 17.5598 17.6379 17.3958 14.6672L17.0645 8.66717C16.9164 5.98324 16.8423 4.64127 15.9803 3.82064C15.1183 3 13.7828 3 11.1118 3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M12.8883 3H15.1118C17.7828 3 19.1183 3 19.9803 3.82064C20.8423 4.64127 20.9164 5.98324 21.0645 8.66717L21.3958 14.6672C21.5598 17.6379 21.6418 19.1233 20.7597 20.0616C19.8777 21 18.3995 21 15.443 21H12.5571"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
      <span className="text-base/6 font-normal sm:ml-2.5">Add to cart</span>
    </button>
  );
}

export default function ProductInfo({ product }) {
  const {
    name = "Leather Tote Bag",
    price = "85.00",
    rating = 4.5,
    reviews = 87,
    category = "Jackets",
  } = product || {};

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const { addToCart, openCart } = useCart();

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  const sizeNames = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) return product.sizes;
    if (variants.length > 0) {
      const extracted = variants.map((v) => {
        const parts = String(v.title ?? "").split("/");
        return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
      });
      const unique = Array.from(new Set(extracted)).filter(Boolean);
      if (unique.length > 0) return unique;
    }
    return ["S", "M", "L", "XL"];
  }, [product?.sizes, variants]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product) return;
    const sizeName = sizeNames[selectedSize] || "M";
    
    const result = await addToCart(product, quantity, null, sizeName, false);
    showAddedToCartToast({
      product,
      quantity: result?.totalQuantity || quantity,
      color: "Standard",
      size: sizeName,
    });
  };

  return (
    <div className="flex flex-col gap-y-10">
      {/* Header: Breadcrumb, Title, Price, Rating */}
      <div>
        <Breadcrumb productName={name} category={category} />
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
          {name}
        </h1>
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:gap-x-6">
          <PriceBadge price={price} />
          <div className="hidden h-7 border-l border-neutral-300 sm:block dark:border-neutral-700" />
          <RatingAndStock rating={rating} reviews={reviews} />
        </div>
      </div>

      {/* Form: Variants + Quantity + Add to Cart */}
      <form
        onSubmit={handleAddToCart}
      >
        <fieldset className="flex flex-col gap-y-10">
          <ProductVariants
            product={product}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
          />
          <div className="flex gap-x-3.5">
            <QuantitySelector onChange={setQuantity} />
            <AddToCartButton />
          </div>
        </fieldset>
      </form>

      {/* Divider */}
      <hr
        role="presentation"
        className="w-full border-t border-neutral-950/10 dark:border-white/10"
      />

      {/* Accordion sections */}
      <ProductAccordion />

      {/* Policy Cards - visible only on xl+ */}
      <PolicyCards className="hidden xl:block" />
    </div>
  );
}
