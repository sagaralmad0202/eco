import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useWishlistToggle from "../hooks/useWishlistToggle";
import { showAddedToCartToast } from "../utils/cartToast";

const ProductCard = ({ data, gridMode = false, onQuickView }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const {
    isLiked,
    isPending: wishlistPending,
    toggle: toggleWishlist,
  } = useWishlistToggle(data);

  const productId =
    data.id ||
    data.productId ||
    data.slug ||
    (data.name ? data.name.toLowerCase().replace(/\s+/g, "-") : "");

  const rating = Number(data.rating) || 0;
  const reviews = Number(data.reviews) || 0;

  const notifyAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isAdding) return;
    setIsAdding(true);
    try {
      const result = await addToCart(
        data,
        1,
        data.desc || "Default",
        "M",
        false,
      );
      showAddedToCartToast({
        product: data,
        quantity: result?.totalQuantity || 1,
        color: data.desc || "Standard",
        size: "M",
      });
    } catch (err) {
      console.error("[ProductCard] Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`product-card relative flex flex-col bg-transparent w-full`}
    >
      <Link
        className="absolute inset-0 z-0"
        to={`/products/${productId}`}
        aria-label={data.name}
      />
      <div
        className={`group relative z-1 mx-auto shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-800 ${gridMode ? "w-full" : "w-full"}`}
      >
        <Link
          to={`/products/${productId}`}
          className="block aspect-[11/12] w-full"
        >
          <img
            src={data.image}
            className="object-cover w-full h-full drop-shadow-xl"
            alt={data.name || "product"}
          />
        </Link>
        {data.badge !== false && data.badge !== null && (
          <div className="nc-shadow-lg rounded-full flex items-center justify-center absolute top-[12px] start-[12px] px-[10px] py-[6px] text-[12px] bg-white dark:bg-neutral-900 text-neutral-700 dark:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              className="w-[14px] h-[14px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <span className="ms-[4px] leading-none">
              {data.badge || "New in"}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void toggleWishlist();
          }}
          disabled={wishlistPending}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isLiked}
          className="flex w-[36px] h-[36px] items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg dark:bg-neutral-900 dark:text-neutral-200 absolute top-[12px] end-[12px] z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isLiked ? "#ef4444" : "none"}
            stroke={isLiked ? "#ef4444" : "currentColor"}
            strokeWidth="1.5"
            className="w-[18px] h-[18px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
        <div className="invisible absolute inset-x-1 bottom-0 flex justify-center gap-1.5 opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100 z-10">
          <button
            type="button"
            onClick={notifyAddToCart}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs/normal text-white shadow-lg hover:bg-neutral-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              className="-ml-1 size-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span>Add to bag</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onQuickView) onQuickView(data);
            }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs/normal text-neutral-950 shadow-lg hover:bg-neutral-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              className="-ml-1 size-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
            <span>Quick view</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 mt-[16px] text-start">
        {data.colors && (
          <div className="flex items-center gap-[6px] mb-[10px]">
            {data.colors.map((c, i) => (
              <span
                key={i}
                className="w-[14px] h-[14px] rounded-full border border-black/10 dark:border-white/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-[8px]">
            <h3 className="font-semibold text-[16px] text-neutral-900 dark:text-white truncate">
              <Link
                to={`/products/${productId}`}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {data.name}
              </Link>
            </h3>
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 truncate mt-[2px]">
              {data.desc}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-[12px]">
          <span className="inline-block px-[10px] py-[4px] text-[14px] font-semibold text-emerald-600 border-2 border-emerald-500 rounded-lg">
            ${data.price}
          </span>
          {Number(reviews) > 0 && Number(rating) > 0 ? (
            <div className="flex items-center gap-[4px] text-[13px] text-neutral-500 dark:text-neutral-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#fbbf24"
                className="w-[14px] h-[14px]"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {Number(rating).toFixed(1)}
              </span>
              <span>({reviews} {reviews === 1 ? "review" : "reviews"})</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
