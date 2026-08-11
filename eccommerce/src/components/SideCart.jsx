import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { PRODUCT_ASSETS_MAP } from "../utils/productAdapter";

export default function SideCart({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const scrollRef = useRef(null);

  // Remove item handler
  const handleRemove = (id) => {
    removeFromCart(id);
  };

  // Quantity change handler
  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, newQuantity);
  };

  // Prevent ALL page scroll while cart is open, but allow scroll inside the items list
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
      // If the event didn't originate from the scrollable area, block it
      if (!scrollRef.current || !scrollRef.current.contains(e.target)) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      // If content doesn't overflow, block completely
      if (scrollRef.current.scrollHeight <= scrollRef.current.clientHeight) {
        if (e.cancelable) e.preventDefault();
        return;
      }
    };

    document.addEventListener("wheel", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      html.style.overflow = originalHtmlOverflow;
      html.style.overscrollBehavior = originalHtmlOverscroll;
      body.style.overflow = originalBodyOverflow;
      body.style.overscrollBehavior = originalBodyOverscroll;

      document.removeEventListener("wheel", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
    };
  }, [isOpen]);


  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end overflow-hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close cart overlay"
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ border: "none", cursor: "default" }}
      />

      {/* Drawer */}
      <aside
        className={`relative z-10 flex h-full w-full flex-col bg-white overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ fontFamily: "Poppins, 'Poppins Fallback'", maxWidth: "512px" }}
      >
        <div
          className="flex h-full flex-col overflow-hidden bg-white dark:bg-neutral-900"
          style={{ padding: "0 16px" }}
        >
          {/* Header */}
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <h2
              className="font-medium text-neutral-900 dark:text-neutral-100"
              style={{
                margin: 0,
                fontSize: "24px",
                fontFamily: "Poppins, 'Poppins Fallback'",
              }}
            >
              Shopping Cart
            </h2>
            <button
              type="button"
              aria-label="Close cart"
              onClick={onClose}
              className="group -m-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
              style={{ border: "none", background: "transparent" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-200 group-hover:rotate-90"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          {/* Items — scrollable */}
          <div
            ref={scrollRef}
            className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6"
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 text-neutral-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </div>
                <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                  Your cart is empty
                </p>
                <p className="mt-1 text-sm text-neutral-500 max-w-xs">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                  style={{ textDecoration: "none" }}
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item, idx) => (
                  <li
                    key={item.id}
                    className={`transition-all duration-300 ${
                      idx < items.length - 1
                        ? "border-b border-neutral-100 dark:border-neutral-800"
                        : ""
                    }`}
                    style={{
                      padding:
                        idx === 0
                          ? "0 0 20px 0"
                          : idx < items.length - 1
                          ? "20px 0"
                          : "20px 0 0 0",
                    }}
                  >
                    <div className="flex gap-4">
                      {/* Product image */}
                      <Link
                        to={`/products/${item.slug || item.productId || ""}`}
                        onClick={onClose}
                        className="flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 block cursor-pointer"
                        style={{ width: "80px", height: "96px" }}
                      >
                        <img
                          src={PRODUCT_ASSETS_MAP[item.slug]?.image || item.image}
                          alt={item.name}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
                          style={{ display: "block" }}
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div
                          className="flex items-start justify-between gap-2"
                          style={{ minHeight: "48px" }}
                        >
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/products/${item.slug || item.productId || ""}`}
                              onClick={onClose}
                              className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                              style={{
                                margin: 0,
                                lineHeight: 1.4,
                                fontSize: "16px",
                                fontFamily: "Poppins, 'Poppins Fallback'",
                                textDecoration: "none",
                                display: "block",
                              }}
                            >
                              {item.name}
                            </Link>
                            <div
                              className="text-neutral-500 dark:text-neutral-400"
                              style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                lineHeight: "20px",
                                fontFamily: "Poppins, 'Poppins Fallback'",
                                fontWeight: 400,
                                letterSpacing: "normal",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span>{item.color}</span>
                              <span
                                style={{
                                  width: "1px",
                                  height: "12px",
                                  background: "var(--border-main, #e5e7eb)",
                                  margin: "0 6px",
                                }}
                              ></span>
                              <span>{item.size}</span>
                            </div>
                          </div>

                          {/* Price badge */}
                          <div
                            className="flex items-center flex-shrink-0 rounded-lg font-medium"
                            style={{
                              border: "2px solid #22c55e",
                              padding: "4px 8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "14px",
                                lineHeight: 1,
                                color: "#22c55e",
                                fontFamily: "Poppins, 'Poppins Fallback'",
                                display: "inline-block",
                              }}
                            >
                              ${Number(item.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom row */}
                        <div
                          className="flex items-center justify-between"
                          style={{ height: "48px" }}
                        >
                          {/* Quantity selector */}
                          <div
                            className="relative inline-grid"
                            style={{ width: "64px", height: "28px" }}
                          >
                            <select
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              className="appearance-none cursor-pointer text-neutral-700 dark:text-neutral-300 focus:outline-none"
                              style={{
                                border: "1px solid var(--border-main, #e5e7eb)",
                                borderRadius: "6px",
                                padding: "2px 32px 2px 12px",
                                fontSize: "12px",
                                lineHeight: "24px",
                                width: "64px",
                                height: "28px",
                                background: "transparent",
                              }}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n} className="dark:bg-neutral-900">
                                  {n}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute text-neutral-400"
                              style={{
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                d="M6 9l6 6 6-6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="cursor-pointer font-medium hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#0284c7",
                              padding: 0,
                              fontSize: "14px",
                              fontFamily: "Poppins, 'Poppins Fallback'",
                              fontWeight: 500,
                              lineHeight: "20px",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <section className="mt-auto grid shrink-0 gap-4 border-t border-neutral-200 bg-white pt-5 pb-6 dark:border-neutral-800 dark:bg-neutral-900">
              {/* Subtotal */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span
                    className="font-semibold text-neutral-900 dark:text-neutral-100"
                    style={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontFamily: "Poppins, 'Poppins Fallback'",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    className="font-semibold text-neutral-900 dark:text-neutral-100"
                    style={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontFamily: "Poppins, 'Poppins Fallback'",
                    }}
                  >
                    ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 text-left">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex-1 text-center rounded-full border border-neutral-300 bg-white py-3 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  style={{ fontFamily: "Poppins, 'Poppins Fallback'", textDecoration: "none" }}
                >
                  View cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="flex-1 text-center rounded-full bg-slate-900 py-3 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  style={{ fontFamily: "Poppins, 'Poppins Fallback'", textDecoration: "none" }}
                >
                  Check out
                </Link>
              </div>

              {/* Continue shopping */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium tracking-wider text-neutral-500 uppercase transition-colors hover:text-neutral-700 dark:hover:text-neutral-300 bg-transparent border-none cursor-pointer"
                  style={{ letterSpacing: "0.05em" }}
                >
                  or CONTINUE SHOPPING →
                </button>
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
