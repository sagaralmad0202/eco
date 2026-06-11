import { useState, useEffect, useRef } from "react";

/* ─── Product Gallery Images Mapping ─── */
import cashmereSweater from "../assets/Cashmere Sweater.webp";
import cashmereSweater1 from "../assets/Cashmere Sweater1.webp";
import cashmereSweater2 from "../assets/Cashmere Sweater2.webp";
import cashmereSweater3 from "../assets/Cashmere Sweater3.webp";

import denimJacket from "../assets/Denim jacket.webp";
import denimJacket1 from "../assets/Denim jacket1.webp";
import denimJacket2 from "../assets/Denim jacket2.webp";
import denimJacket3 from "../assets/Denim jacket3.webp";

import linenBlazer from "../assets/Linen Blazer.webp";
import linenBlazer1 from "../assets/Linen Blazer1.webp";
import linenBlazer2 from "../assets/Linen Blazer2.webp";
import linenBlazer3 from "../assets/Linen Blazer3.webp";

import velvetSkirt from "../assets/Velvet Skirt.webp";
import velvetSkirt1 from "../assets/Velvet Skirt1.webp";
import velvetSkirt2 from "../assets/Velvet Skirt2.webp";
import velvetSkirt3 from "../assets/Velvet Skirt3.webp";

const GALLERY_MAP = {
  "Cashmere Sweater": [cashmereSweater, cashmereSweater1, cashmereSweater2, cashmereSweater3],
  "Denim Jacket": [denimJacket, denimJacket1, denimJacket2, denimJacket3],
  "Linen Blazer": [linenBlazer, linenBlazer1, linenBlazer2, linenBlazer3],
  "Velvet Skirt": [velvetSkirt, velvetSkirt1, velvetSkirt2, velvetSkirt3],
};

const SIZE_OPTIONS = ["XS", "S", "M", "L"];

export default function QuickViewPanel({ isOpen, onClose, product }) {
  const [selectedSize, setSelectedSize] = useState("XS");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [descOpen, setDescOpen] = useState(true);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const scrollRef = useRef(null);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize("XS");
      setSelectedColor(0);
      setQuantity(1);
      setActiveImage(0);
      setDescOpen(true);
      setFeaturesOpen(true);
      setShippingOpen(false);
      setCareOpen(false);
      setIsLiked(product.liked || false);
    }
  }, [product]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return undefined;

    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalHtmlOverscroll = html.style.overscrollBehavior;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    const blockScroll = (e) => {
      if (!scrollRef.current || !scrollRef.current.contains(e.target)) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (scrollRef.current.scrollHeight <= scrollRef.current.clientHeight) {
        if (e.cancelable) e.preventDefault();
        return;
      }
    };

    document.addEventListener("wheel", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });

    // Close on Escape key
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      html.style.overflow = originalHtmlOverflow;
      html.style.overscrollBehavior = originalHtmlOverscroll;
      body.style.overflow = originalBodyOverflow;
      body.style.overscrollBehavior = originalBodyOverscroll;

      document.removeEventListener("wheel", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const galleryImages = GALLERY_MAP[product.name] || [product.image, product.image, product.image, product.image];

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
            >
              <div className="lg:flex">
                {/* ─── Left: Image Gallery ─── */}
                <div className="w-full lg:w-[50%]">
                  {/* Main image */}
                  <div className="relative">
                    <div className="aspect-square">
                      <img
                        src={galleryImages[0]}
                        alt={product.name}
                        className="h-full w-full rounded-xl object-cover object-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLiked(!isLiked)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg dark:bg-neutral-900 dark:text-neutral-200 absolute end-3 top-3 z-10"
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

                  {/* Additional images row */}
                  <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
                    <div className="aspect-[3/4]">
                      <img
                        src={galleryImages[1] || galleryImages[0]}
                        alt={product.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="aspect-[3/4]">
                      <img
                        src={galleryImages[2] || galleryImages[0]}
                        alt={product.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── Right: Product Details ─── */}
                <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">
                  <div className="space-y-8">
                  {/* Product name */}
                  <h2
                    className="text-3xl font-semibold text-neutral-900"
                    style={{
                      fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                      margin: 0,
                    }}
                  >
                    {product.name}
                  </h2>

                  {/* Price + Rating + Stock */}
                  <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5 rtl:justify-end">
                    <div
                      className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
                      style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                    >
                      <span className="leading-none text-green-500">${product.price}</span>
                    </div>

                    <div className="h-6 border-s border-neutral-300 dark:border-neutral-700"></div>

                    <div className="flex items-center">
                      <a href="#" className="flex items-center text-sm font-medium" style={{ textDecoration: 'none' }}>
                        <svg className="h-5 w-5 pb-px text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                        </svg>
                        <div className="ms-1.5 flex" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                          <span>{product.rating}</span>
                          <span className="mx-2 block">·</span>
                          <span className="text-neutral-600 underline dark:text-neutral-400" style={{ textUnderlineOffset: "2px" }}>
                            {product.reviews} reviews
                          </span>
                        </div>
                      </a>
                      <span className="mx-2.5 hidden sm:block">·</span>
                      <div className="hidden items-center text-sm sm:flex" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                        <span className="ms-1 leading-none text-neutral-900 dark:text-neutral-100">In Stock</span>
                      </div>
                    </div>
                  </div>

                  {/* Form wrapping Color, Size, and Add to cart */}
                  <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
                    <fieldset className="flex flex-col gap-y-10">
                      
                      {/* Color and Size wrapper */}
                      <div className="flex flex-col gap-y-8">
                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium rtl:text-right" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                            Color
                          </label>
                          <div className="mt-2.5 flex gap-x-2.5">
                            {(product.colors || ["#3b474e", "#fc9faf", "#811428"]).map((color, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedColor(idx)}
                                className={`relative w-9 h-9 rounded-full transition-all ${
                                  selectedColor === idx
                                    ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-neutral-200 dark:ring-offset-neutral-900"
                                    : "ring-1 ring-transparent hover:ring-neutral-200 dark:hover:ring-neutral-700"
                                }`}
                                style={{
                                  backgroundColor: color,
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                                aria-label={`Color ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <div className="flex justify-between text-sm font-medium" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                            <label>
                              Size
                            </label>
                            <p
                              className="cursor-pointer text-primary-600 hover:text-primary-500"
                              style={{
                                color: "#0284c7",
                                margin: 0,
                              }}
                            >
                              See sizing chart
                            </p>
                          </div>
                          <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
                            {SIZE_OPTIONS.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`relative flex h-10 sm:h-11 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg text-sm font-medium uppercase select-none transition-colors hover:bg-neutral-50 text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 ${
                                  selectedSize === size
                                    ? "ring-2 ring-neutral-900 dark:ring-neutral-200"
                                    : "ring-1 ring-neutral-200 dark:ring-neutral-500"
                                }`}
                                style={{
                                  fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                                }}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quantity + Add to cart */}
                      <div className="flex gap-x-3.5">
                        {/* Quantity selector */}
                        <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                          <div className="flex items-center justify-between gap-x-5 w-full">
                            <div className="flex w-[104px] items-center justify-between sm:w-28">
                              <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 transition-colors"
                                disabled={quantity <= 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                </svg>
                              </button>
                              <span
                                className="block flex-1 text-center leading-none select-none text-neutral-900 dark:text-neutral-200"
                                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                              >
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Add to cart button */}
                        <button
                          type="submit"
                          className="flex flex-1 items-center justify-center gap-x-2 rounded-full bg-gray-900 text-neutral-50 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors sm:text-sm/6 font-normal"
                          style={{
                            fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" color="currentColor" className="hidden sm:block" strokeWidth="1.5" stroke="currentColor">
                            <path d="M7.00003 6C7.00003 7.65685 8.34318 9 10 9C11.6569 9 13 7.65685 13 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                            <path d="M11.1118 3H8.88827C6.21723 3 4.88171 3 4.01971 3.82064C3.15772 4.64128 3.08364 5.98324 2.93548 8.66719L2.68427 14.6672C2.44028 17.6379 2.35829 19.1233 3.24033 20.0616C4.12238 21 5.60061 21 8.55706 21H11.443C14.3995 21 15.8777 21 16.7597 20.0616C17.6418 19.1233 17.5598 17.6379 17.3158 14.6672L17.0645 8.66719C16.9164 5.98324 16.8423 4.64127 15.9803 3.82064C15.1183 3 13.7828 3 11.1118 3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                            <path d="M12.8883 3H15.1118C17.7828 3 19.1183 3 19.9803 3.82064C20.8423 4.64127 20.9164 5.98324 21.0645 8.66719L21.3958 14.6672C21.5598 17.6379 21.6418 19.1233 20.7597 20.0616C19.8777 21 18.3995 21 15.443 21H12.5571" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                          </svg>
                          <span className="text-base/6 font-normal sm:ml-2.5">Add to cart</span>
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
                        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', border: "none", cursor: "pointer" }}
                      >
                        <span>Description</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={descOpen ? "M5 12h14" : "M12 4.5v15m7.5-7.5h-15"} />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          descOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                          <p className="m-0">
                            Fashion is a form of self-expression and autonomy at a particular
                            period and place and in a specific context, of clothing, footwear,
                            lifestyle, accessories, makeup, hairstyle, and body posture.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features accordion */}
                    <div>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        onClick={() => setFeaturesOpen(!featuresOpen)}
                        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', border: "none", cursor: "pointer" }}
                      >
                        <span>Features</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={featuresOpen ? "M5 12h14" : "M12 4.5v15m7.5-7.5h-15"} />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          featuresOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                          <ul className="list-disc list-inside space-y-1.5 m-0 pl-1">
                            <li>Material: 43% Sorona Yarn + 57% Stretch Polyester</li>
                            <li>Casual pants waist with elastic elastic inside</li>
                            <li>The pants are a bit tight so you always feel comfortable</li>
                            <li>Excool technology application 4-way stretch</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Shipping & Return accordion */}
                    <div>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        onClick={() => setShippingOpen(!shippingOpen)}
                        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', border: "none", cursor: "pointer" }}
                      >
                        <span>Shipping & Return</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={shippingOpen ? "M5 12h14" : "M12 4.5v15m7.5-7.5h-15"} />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          shippingOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                          <p className="m-0">
                            We offer free shipping on all orders over $50. If you are not satisfied
                            with your purchase, you can return it within 30 days for a full refund.
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
                        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', border: "none", cursor: "pointer" }}
                      >
                        <span>Care Instructions</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={careOpen ? "M5 12h14" : "M12 4.5v15m7.5-7.5h-15"} />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          careOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                          <p className="m-0">
                            Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron low if needed. Do not dry clean.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Go to product page link */}
                  <div className="mt-6 flex text-sm text-neutral-500 dark:text-neutral-400" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
                    <p className="text-xs m-0">
                      or{" "}
                      <a href="#" className="text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase hover:underline" style={{ textDecoration: 'none' }}>
                        Go to product detail page{" "}
                        <span aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="ml-0.5 h-4 w-4 inline-block">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"></path>
                          </svg>
                        </span>
                      </a>
                    </p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
