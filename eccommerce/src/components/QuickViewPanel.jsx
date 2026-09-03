import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SizeChartModal from "./product/SizeChartModal";
import { useCart } from "../context/CartContext";
import useWishlistToggle from "../hooks/useWishlistToggle";
import { showAddedToCartToast } from "../utils/cartToast";
import productsApi from "../services/productsApi";
import { toCardProduct, COLOUR_HEX } from "../utils/productAdapter";

function parseVariant(variant) {
  const parts = String(variant.title ?? "").split("/");

  return {
    id: variant.id,
    title: variant.title,
    color: parts[0]?.trim() || "",
    size: parts.length > 1 ? parts[parts.length - 1].trim() : "",
    price: variant.price,
    stock: variant.stock ?? 0,
    inStock: variant.inStock ?? (variant.stock ?? 0) > 0,
  };
}

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const SWATCH_FALLBACK = "#d4d4d4";

const HEX_COLOR_NAMES = {
  "#1e1b4b": "Dark Navy",
  "#7f1d1d": "Wine Red",
  "#4ade80": "Emerald Green",
  "#3b474e": "Charcoal Grey",
  "#fc9faf": "Soft Pink",
  "#811428": "Burgundy",
  "#f5f5dc": "Beige",
  "#000080": "Navy",
  "#6b8e23": "Olive Green",
  "#c2a27b": "Tan",
  "#1c1917": "Black",
  "#78716c": "Grey",
  "#fbcfe8": "Light Pink",
  "#bae6fd": "Sky Blue",
  "#fecdd3": "Rose",
  "#d4d4d4": "Neutral",
};

const formatColorName = (name) => {
  if (!name) return "";
  const str = String(name).trim();
  if (HEX_COLOR_NAMES[str.toLowerCase()]) {
    return HEX_COLOR_NAMES[str.toLowerCase()];
  }
  if (str.startsWith("#")) {
    return "Selected Color";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const swatchFor = (name) => {
  const str = String(name).trim();
  if (str.startsWith("#")) return str;
  return COLOUR_HEX[str.toLowerCase()] ?? SWATCH_FALLBACK;
};

function QuickViewSkeleton() {
  return (
    <div className="animate-pulse lg:flex">
      {/* Left: Gallery Skeleton */}
      <div className="w-full lg:w-[50%]">
        <div className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-700 shadow-sm" />
        <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
          <div className="aspect-[3/4] w-full rounded-xl bg-neutral-200 dark:bg-neutral-700" />
          <div className="aspect-[3/4] w-full rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>

      {/* Right: Info Skeleton */}
      <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">
        <div className="space-y-6">
          {/* Title */}
          <div className="h-8 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-700" />

          {/* Price + Rating row */}
          <div className="flex items-center gap-x-4">
            <div className="h-10 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-6 w-36 rounded-md bg-neutral-200 dark:bg-neutral-700" />
          </div>

          {/* Color skeleton */}
          <div>
            <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-700 mb-3" />
            <div className="flex gap-x-2.5">
              <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              <div className="size-9 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>

          {/* Size skeleton */}
          <div>
            <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-700 mb-3" />
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
              <div className="h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex gap-x-3.5 mt-6">
            <div className="h-12 w-28 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-12 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </div>

          <hr className="w-full border-t border-neutral-200 dark:border-neutral-700 my-6" />

          {/* Accordions */}
          <div className="space-y-2.5">
            <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuickViewPanel({ isOpen, onClose, product }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const scrollRef = useRef(null);
  const { addToCart } = useCart();

  const lookupKey = product?.id || product?.productId || product?.slug || null;
  const {
    isLiked,
    isPending: wishlistPending,
    toggle: toggleWishlist,
  } = useWishlistToggle(detail ?? product);

  // Reset and fetch from API whenever a new product is selected
  useEffect(() => {
    if (!isOpen || !lookupKey) {
      setDetail(null);
      setDetailStatus("idle");
      return;
    }

    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setDescOpen(true);
    setShippingOpen(false);
    setCareOpen(false);
    setDetail(null);
    setDetailStatus("loading");

    let cancelled = false;

    productsApi
      .getBySlug(lookupKey)
      .then((response) => {
        if (cancelled) return;
        if (response?.data) {
          const adapted = toCardProduct(response.data);
          setDetail(adapted);
          setDetailStatus("succeeded");
        } else {
          setDetail(toCardProduct(product));
          setDetailStatus("succeeded");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setDetail(toCardProduct(product));
        setDetailStatus("succeeded");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, lookupKey]);

  // Prevent background page scrolling while QuickView is open
  useEffect(() => {
    if (!isOpen) return undefined;

    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalHtmlOverscroll = html.style.overscrollBehavior;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyOverscroll = body.style.overscrollBehavior;
    const originalBodyPaddingRight = body.style.paddingRight;

    // Compensate for scrollbar disappearance to prevent background layout shift
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    const blockScroll = (e) => {
      // If the event didn't originate from inside the scrollable modal area, block it
      if (!scrollRef.current || !scrollRef.current.contains(e.target)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("wheel", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      html.style.overflow = originalHtmlOverflow;
      html.style.overscrollBehavior = originalHtmlOverscroll;
      body.style.overflow = originalBodyOverflow;
      body.style.overscrollBehavior = originalBodyOverscroll;
      body.style.paddingRight = originalBodyPaddingRight;

      document.removeEventListener("wheel", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const view = detail || product;
  const isLoading = detailStatus === "loading" || !detail;

  const variants = useMemo(
    () =>
      Array.isArray(view?.variants) ? view.variants.map(parseVariant) : [],
    [view],
  );

  const colorNames = useMemo(() => {
    if (variants.length > 0) {
      const extracted = unique(variants.map((variant) => variant.color));
      if (extracted.length > 0) return extracted;
    }
    if (Array.isArray(view?.colors) && view.colors.length > 0) {
      return view.colors;
    }
    if (view?.color) return [view.color];
    return [];
  }, [variants, view]);

  const sizesForColor = useMemo(() => {
    if (variants.length > 0) {
      const filtered = variants.filter(
        (variant) => !selectedColor || variant.color === selectedColor,
      );
      const extracted = unique(filtered.map((variant) => variant.size));
      if (extracted.length > 0) return extracted;
    }
    if (Array.isArray(view?.sizes) && view.sizes.length > 0) {
      return view.sizes;
    }
    if (view?.sizes !== false && !view?.isFragrance && !view?.isAccessory) {
      return ["S", "M", "L", "XL"];
    }
    return [];
  }, [variants, selectedColor, view]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    return (
      variants.find(
        (variant) =>
          (!selectedColor || variant.color === selectedColor) &&
          (!selectedSize || variant.size === selectedSize),
      ) ?? null
    );
  }, [variants, selectedColor, selectedSize]);

  if (!product) return null;

  const linkId = view?.id ?? view?.productId ?? view?.slug ?? lookupKey ?? null;
  const productUrl = linkId ? `/products/${linkId}` : null;

  const galleryImages = (
    view?.images?.length ? view.images : [view?.image]
  ).filter(Boolean);

  const price =
    selectedVariant?.price ?? view?.price ?? view?.priceFrom ?? "0.00";
  const showColors = colorNames.length > 0;
  const showSizes = sizesForColor.length > 0;

  const hasVariants = variants.length > 0;
  const canAdd = hasVariants
    ? Boolean(selectedVariant?.inStock)
    : view?.inStock !== false;

  const maxQuantity = hasVariants ? (selectedVariant?.stock ?? 0) : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!canAdd || !view) return;

    const payload = selectedVariant
      ? { ...view, variantId: selectedVariant.id }
      : view;

    const result = await addToCart(
      payload,
      quantity,
      selectedColor || "Default",
      selectedSize || "One Size",
    );

    if (!result?.ok) {
      toast.error(result?.error ?? "Could not add this to your cart.");
      return;
    }

    showAddedToCartToast({
      product: { ...view, price },
      quantity: result.totalQuantity ?? quantity,
      color: selectedColor || "Default",
      size: selectedSize || "One Size",
    });
    onClose?.();
  };

  const handleToggleWishlist = async () => {
    await toggleWishlist();
  };

  const accordionIcon = (open) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={open ? "M5 12h14" : "M12 4.5v15m7.5-7.5h-15"}
      />
    </svg>
  );

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop overlay */}
      <button
        type="button"
        aria-label="Close quick view overlay"
        onClick={onClose}
        className={`fixed inset-0 bg-neutral-900/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ border: "none", cursor: "default" }}
      />

      {/* Panel container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div
          className={`h-screen w-screen translate-x-0 bg-white text-start align-middle shadow-xl transition-all duration-300 ease-in-out dark:bg-neutral-800 ${
            isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
          style={{
            maxWidth: "72rem",
            fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
          }}
        >
          <div className="relative flex h-full flex-col px-4 md:px-8">
            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-8"
              style={{ overscrollBehavior: "contain" }}
            >
              {isLoading ? (
                <QuickViewSkeleton />
              ) : (
                <div className="lg:flex">
                  {/* ─── Left: Image Gallery ─── */}
                  <div className="w-full lg:w-[50%]">
                    {/* Main image */}
                    <div className="relative">
                      <div className="aspect-square">
                        {galleryImages[0] ? (
                          <img
                            src={galleryImages[0]}
                            alt={view.name}
                            className="h-full w-full rounded-xl object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full rounded-xl bg-neutral-100 dark:bg-neutral-700" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        disabled={wishlistPending}
                        aria-label={
                          isLiked ? "Remove from wishlist" : "Add to wishlist"
                        }
                        aria-pressed={isLiked}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg dark:bg-neutral-900 dark:text-neutral-200 absolute end-3 top-3 z-10 disabled:opacity-60"
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        <svg
                          className={`h-5 w-5 ${isLiked ? "text-red-500" : ""}`}
                          viewBox="0 0 24 24"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Additional images */}
                    {galleryImages.length > 1 && (
                      <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
                        {galleryImages.slice(1, 3).map((url, idx) => (
                          <div key={`${url}-${idx}`} className="aspect-[3/4]">
                            <img
                              src={url}
                              alt={`${view.name} view ${idx + 2}`}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ─── Right: Product Details ─── */}
                  <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">
                    <div className="space-y-8">
                      {/* Product name */}
                      <h2
                        className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100"
                        style={{
                          fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                          margin: 0,
                        }}
                      >
                        {view.name}
                      </h2>

                      {/* Price + Rating + Stock */}
                      <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5 rtl:justify-end">
                        <div
                          className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
                          style={{
                            fontFamily:
                              'Poppins, "Poppins Fallback", sans-serif',
                          }}
                        >
                          <span className="leading-none text-green-500">
                            ${price}
                          </span>
                        </div>

                        <div className="h-6 border-s border-neutral-300 dark:border-neutral-700"></div>

                        <div className="flex items-center">
                          <div className="flex items-center text-sm font-medium">
                            <svg
                              className="h-5 w-5 pb-px text-yellow-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div
                              className="ms-1.5 flex"
                              style={{
                                fontFamily:
                                  'Poppins, "Poppins Fallback", sans-serif',
                              }}
                            >
                              {view.rating ? (
                                <>
                                  <span>{view.rating}</span>
                                  <span className="mx-2 block">·</span>
                                  <span className="text-neutral-600 dark:text-neutral-400">
                                    {view.reviews ?? 0} reviews
                                  </span>
                                </>
                              ) : (
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  No reviews yet
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="mx-2.5 hidden sm:block">·</span>
                          <div
                            className="hidden items-center text-sm sm:flex"
                            style={{
                              fontFamily:
                                'Poppins, "Poppins Fallback", sans-serif',
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                              />
                            </svg>
                            <span className="ms-1 leading-none text-neutral-900 dark:text-neutral-100">
                              {canAdd ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Form wrapping Color, Size, and Add to cart */}
                      <form className="mt-8" onSubmit={handleAddToCart}>
                        <fieldset className="flex flex-col gap-y-10">
                          {/* Color and Size wrapper */}
                          <div className="flex flex-col gap-y-8">
                            {/* Color */}
                            {showColors && (
                              <div>
                                <label
                                  className="block text-sm font-medium rtl:text-right"
                                  style={{
                                    fontFamily:
                                      'Poppins, "Poppins Fallback", sans-serif',
                                  }}
                                >
                                  Color
                                  <span className="ms-2 font-normal text-neutral-500 dark:text-neutral-400">
                                    {formatColorName(selectedColor)}
                                  </span>
                                </label>
                                <div className="mt-2.5 flex gap-x-2.5">
                                  {colorNames.map((name) => (
                                    <button
                                      key={name}
                                      type="button"
                                      onClick={() => {
                                        setSelectedColor(name);
                                        setSelectedSize("");
                                      }}
                                      className={`relative w-9 h-9 rounded-full transition-all ${
                                        selectedColor === name
                                          ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-neutral-200 dark:ring-offset-neutral-900"
                                          : "ring-1 ring-transparent hover:ring-neutral-200 dark:hover:ring-neutral-700"
                                      }`}
                                      style={{
                                        backgroundColor: swatchFor(name),
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                      }}
                                      aria-label={formatColorName(name)}
                                      title={formatColorName(name)}
                                      aria-pressed={selectedColor === name}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Size */}
                            {showSizes && (
                              <div>
                                <div
                                  className="flex justify-between text-sm font-medium"
                                  style={{
                                    fontFamily:
                                      'Poppins, "Poppins Fallback", sans-serif',
                                  }}
                                >
                                  <label>Size</label>
                                  <button
                                    type="button"
                                    onClick={() => setSizeChartOpen(true)}
                                    className="cursor-pointer text-primary-600 hover:text-primary-500 font-medium focus:outline-none"
                                    style={{ color: "#0284c7", margin: 0 }}
                                  >
                                    See sizing chart
                                  </button>
                                </div>
                                <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
                                  {sizesForColor.map((size) => {
                                    const variant = variants.find(
                                      (v) =>
                                        (!selectedColor ||
                                          v.color === selectedColor) &&
                                        v.size === size,
                                    );
                                    const soldOut = hasVariants
                                      ? !variant?.inStock
                                      : false;

                                    return (
                                      <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        disabled={soldOut}
                                        title={
                                          soldOut
                                            ? `${size} — out of stock`
                                            : size
                                        }
                                        className={`relative flex h-10 sm:h-11 w-full items-center justify-center overflow-hidden rounded-lg text-sm font-medium uppercase select-none transition-colors text-neutral-900 dark:text-neutral-200 ${
                                          soldOut
                                            ? "cursor-not-allowed opacity-40 ring-1 ring-neutral-200 dark:ring-neutral-600 line-through"
                                            : "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                        } ${
                                          selectedSize === size && !soldOut
                                            ? "ring-2 ring-neutral-900 dark:ring-neutral-200"
                                            : soldOut
                                              ? ""
                                              : "ring-1 ring-neutral-200 dark:ring-neutral-500"
                                        }`}
                                        style={{
                                          fontFamily:
                                            'Poppins, "Poppins Fallback", sans-serif',
                                        }}
                                      >
                                        {size}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quantity + Add to cart */}
                          <div className="flex gap-x-3.5">
                            {/* Quantity selector */}
                            <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                              <div className="flex items-center justify-between gap-x-5 w-full">
                                <div className="flex w-[104px] items-center justify-between sm:w-28">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQuantity(Math.max(1, quantity - 1))
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 transition-colors"
                                    disabled={quantity <= 1}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 12h14"
                                      />
                                    </svg>
                                  </button>
                                  <span
                                    className="block flex-1 text-center leading-none select-none text-neutral-900 dark:text-neutral-200"
                                    style={{
                                      fontFamily:
                                        'Poppins, "Poppins Fallback", sans-serif',
                                    }}
                                  >
                                    {quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={
                                      !canAdd ||
                                      (maxQuantity !== null &&
                                        quantity >= maxQuantity)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Add to cart button */}
                            <button
                              type="submit"
                              disabled={!canAdd}
                              className="flex flex-1 items-center justify-center gap-x-2 rounded-full bg-gray-900 text-neutral-50 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors sm:text-sm/6 font-normal"
                              style={{
                                fontFamily:
                                  'Poppins, "Poppins Fallback", sans-serif',
                                border: "none",
                                cursor: canAdd ? "pointer" : "not-allowed",
                              }}
                            >
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
                                ></path>
                                <path
                                  d="M11.1118 3H8.88827C6.21723 3 4.88171 3 4.01971 3.82064C3.15772 4.64128 3.08364 5.98324 2.93548 8.66719L2.68427 14.6672C2.44028 17.6379 2.35829 19.1233 3.24033 20.0616C4.12238 21 5.60061 21 8.55706 21H11.443C14.3995 21 15.8777 21 16.7597 20.0616C17.6418 19.1233 17.5598 17.6379 17.3158 14.6672L17.0645 8.66719C16.9164 5.98324 16.8423 4.64127 15.9803 3.82064C15.1183 3 13.7828 3 11.1118 3Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                ></path>
                                <path
                                  d="M12.8883 3H15.1118C17.7828 3 19.1183 3 19.9803 3.82064C20.8423 4.64127 20.9164 5.98324 21.0645 8.66719L21.3958 14.6672C21.5598 17.6379 21.6418 19.1233 20.7597 20.0616C19.8777 21 18.3995 21 15.443 21H12.5571"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                ></path>
                              </svg>
                              <span className="text-base/6 font-normal sm:ml-2.5">
                                {canAdd ? "Add to cart" : "Out of stock"}
                              </span>
                            </button>
                          </div>
                        </fieldset>
                      </form>

                      {/* Divider */}
                      <hr className="w-full border-t border-neutral-950/10 dark:border-white/10 my-8" />

                      {/* Accordions */}
                      <div className="w-full space-y-2.5 rounded-2xl">
                        {/* Description accordion */}
                        <div>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            onClick={() => setDescOpen(!descOpen)}
                            style={{
                              fontFamily:
                                'Poppins, "Poppins Fallback", sans-serif',
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <span>Description</span>
                            {accordionIcon(descOpen)}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              descOpen
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div
                              className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6"
                              style={{
                                fontFamily:
                                  'Poppins, "Poppins Fallback", sans-serif',
                              }}
                            >
                              <p className="m-0">
                                {view.desc ||
                                  view.description ||
                                  "No description has been added for this product yet."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Shipping & Return accordion */}
                        <div>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            onClick={() => setShippingOpen(!shippingOpen)}
                            style={{
                              fontFamily:
                                'Poppins, "Poppins Fallback", sans-serif',
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <span>Shipping & Return</span>
                            {accordionIcon(shippingOpen)}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              shippingOpen
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div
                              className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6"
                              style={{
                                fontFamily:
                                  'Poppins, "Poppins Fallback", sans-serif',
                              }}
                            >
                              <p className="m-0">
                                We offer free shipping on all orders over $50.
                                If you are not satisfied with your purchase, you
                                can return it within 30 days for a full refund.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Care Instructions accordion */}
                        <div>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            onClick={() => setCareOpen(!careOpen)}
                            style={{
                              fontFamily:
                                'Poppins, "Poppins Fallback", sans-serif',
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <span>Care Instructions</span>
                            {accordionIcon(careOpen)}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              careOpen
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div
                              className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6"
                              style={{
                                fontFamily:
                                  'Poppins, "Poppins Fallback", sans-serif',
                              }}
                            >
                              <p className="m-0">
                                Machine wash cold with like colors. Do not
                                bleach. Tumble dry low. Iron low if needed. Do
                                not dry clean.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Go to product page link */}
                      {productUrl && (
                        <div
                          className="mt-6 flex text-sm text-neutral-500 dark:text-neutral-400"
                          style={{
                            fontFamily:
                              'Poppins, "Poppins Fallback", sans-serif',
                          }}
                        >
                          <p className="text-xs m-0">
                            or{" "}
                            <Link
                              to={productUrl}
                              onClick={onClose}
                              className="text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase hover:underline"
                              style={{ textDecoration: "none" }}
                            >
                              Go to product detail page{" "}
                              <span aria-hidden="true">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                  data-slot="icon"
                                  className="ml-0.5 h-4 w-4 inline-block"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                  ></path>
                                </svg>
                              </span>
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizes && (
        <SizeChartModal
          isOpen={sizeChartOpen}
          onClose={() => setSizeChartOpen(false)}
        />
      )}
    </div>
  );
}
