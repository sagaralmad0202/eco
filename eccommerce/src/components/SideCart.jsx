import { useEffect, useRef } from "react";

import p1 from "../assets/p4.webp";
import p2 from "../assets/p5.webp";
import p3 from "../assets/p6.webp";

const cartItems = [
  {
    id: 1,
    name: "Basic Tee",
    color: "Sienna",
    size: "L",
    price: 199.0,
    quantity: 4,
    image: p1,
  },
  {
    id: 2,
    name: "Basic Coahuila",
    color: "Black",
    size: "XL",
    price: 99.0,
    quantity: 2,
    image: p2,
  },
  {
    id: 3,
    name: "Nomad Tumbler",
    color: "White",
    size: "M",
    price: 119.0,
    quantity: 1,
    image: p3,
  },
];

export default function SideCart({ isOpen, onClose }) {
  const scrollRef = useRef(null);

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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
        <div className="flex h-full flex-col overflow-hidden" style={{ padding: "0 16px" }}>
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white">
            <h2
              className="font-medium text-neutral-900"
              style={{ margin: 0, fontSize: "24px", fontFamily: "Poppins, 'Poppins Fallback'" }}
            >
              Shopping Cart
            </h2>
            <button
              type="button"
              aria-label="Close cart"
              onClick={onClose}
              className="group -m-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
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
          <div ref={scrollRef} className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {cartItems.map((item, idx) => (
                <li
                  key={item.id}
                  className={`${
                    idx < cartItems.length - 1
                      ? "border-b border-neutral-100"
                      : ""
                  }`}
                  style={{
                    padding: idx === 0
                      ? "0 0 20px 0"
                      : idx < cartItems.length - 1
                        ? "20px 0"
                        : "20px 0 0 0"
                  }}
                >
                  <div className="flex gap-4">
                    {/* Product image */}
                    <div
                      className="flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100"
                      style={{ width: "80px", height: "96px" }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        style={{ display: "block" }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between" style={{ height: "48px" }}>
                        <div>
                          <a
                            href="#"
                            className="font-medium text-neutral-900"
                            style={{ margin: 0, lineHeight: 1.4, fontSize: "16px", fontFamily: "Poppins, 'Poppins Fallback'", textDecoration: "none", display: "inline" }}
                          >
                            {item.name}
                          </a>
                          <div
                            className="text-neutral-500"
                            style={{ margin: "4px 0 0", fontSize: "14px", lineHeight: "20px", fontFamily: "Poppins, 'Poppins Fallback'", fontWeight: 400, letterSpacing: "normal", display: "flex", alignItems: "center" }}
                          >
                            <span>{item.color}</span>
                            <span
                              style={{
                                width: "1px",
                                height: "12px",
                                background: "#d1d5db",
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
                            width: "72.31px",
                          }}
                        >
                          <span style={{ fontSize: "14px", lineHeight: 1, color: "#22c55e", fontFamily: "Poppins, 'Poppins Fallback'", width: "53.11px", display: "inline-block" }}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between" style={{ height: "48px" }}>
                        {/* Quantity selector */}
                        <div
                          className="relative inline-grid"
                          style={{ width: "64px", height: "28px" }}
                        >
                          <select
                            defaultValue={item.quantity}
                            className="appearance-none cursor-pointer text-neutral-700 focus:outline-none"
                            style={{
                              border: "1px solid #d1d5db",
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
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <svg
                            className="pointer-events-none absolute text-neutral-400"
                            style={{ right: "8px", top: "50%", transform: "translateY(-50%)" }}
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

                        {/* Remove */}
                        <button
                          type="button"
                          className="cursor-pointer font-medium"
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#0284c7",
                            padding: 0,
                            fontSize: "14px",
                            fontFamily: "Poppins, 'Poppins Fallback'",
                            fontWeight: 500,
                            width: "57.68px",
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
          </div>

          {/* Footer */}
          <section className="mt-auto grid shrink-0 gap-4 border-t border-neutral-200 bg-white pt-5 pb-6 dark:border-neutral-700">
            {/* Subtotal */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900" style={{ fontSize: "16px", lineHeight: "24px", fontFamily: "Poppins, 'Poppins Fallback'" }}>
                  Subtotal
                </span>
                <span className="font-semibold text-neutral-900" style={{ fontSize: "16px", lineHeight: "24px", fontFamily: "Poppins, 'Poppins Fallback'" }}>
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-neutral-500 text-left">
                Shipping and taxes calculated at checkout.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 rounded-full border border-neutral-300 bg-white py-3 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
                style={{ fontFamily: "Poppins, 'Poppins Fallback'" }}
              >
                View cart
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-slate-900 py-3 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                style={{ fontFamily: "Poppins, 'Poppins Fallback'" }}
              >
                Check out
              </button>
            </div>

            {/* Continue shopping */}
            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium tracking-wider text-neutral-500 uppercase transition-colors hover:text-neutral-700 bg-transparent border-none cursor-pointer"
                style={{ letterSpacing: "0.05em" }}
              >
                or CONTINUE SHOPPING →
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
