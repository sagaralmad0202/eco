import { useEffect } from "react";

import p1 from "../assets/p1.webp";
import p2 from "../assets/p2.webp";
import p3 from "../assets/p3.webp";

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
  // Lock body scroll when cart is open
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
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
        className={`relative z-10 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ fontFamily: "Poppins, 'Poppins Fallback'", maxWidth: "512px" }}
      >
        <div className="flex h-full flex-col" style={{ padding: "0 16px" }}>
          {/* Header — 448 x 80 */}
          <header
            className="flex flex-shrink-0 items-center justify-between border-b border-neutral-200"
            style={{ height: "60px" }}
          >
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
          <div className="hidden-scrollbar overflow-x-hidden overflow-y-auto py-6" style={{ height: "471.21px" }}>
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
          <div className="border-t border-neutral-200" style={{ padding: "24px 0", height: "202.39px" }}>
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900" style={{ fontSize: "16px", lineHeight: "24px", fontFamily: "Poppins, 'Poppins Fallback'", width: "68.09px", display: "inline-block" }}>
                Subtotal
              </span>
              <span className="font-semibold text-neutral-900" style={{ fontSize: "16px", lineHeight: "24px", fontFamily: "Poppins, 'Poppins Fallback'", width: "36.33px", display: "inline-block", textAlign: "right" }}>
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <p
              className="text-neutral-500"
              style={{ margin: "4px 0 0", textAlign: "left", fontSize: "14px", lineHeight: "20px" }}
            >
              Shipping and taxes calculated at checkout.
            </p>

            {/* Buttons */}
            <div className="flex" style={{ marginTop: "20px", gap: "12px" }}>
              <button
                type="button"
                className="cursor-pointer rounded-full border border-neutral-300 bg-white text-neutral-900 transition-colors hover:bg-neutral-50"
                style={{
                  padding: "11px 23px",
                  fontSize: "14px",
                  fontFamily: "Poppins, 'Poppins Fallback'",
                  fontWeight: 500,
                  lineHeight: "24px",
                  width: "234.4px",
                  height: "46px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                View cart
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800"
                style={{
                  padding: "11px 23px",
                  fontSize: "14px",
                  fontFamily: "Poppins, 'Poppins Fallback'",
                  fontWeight: 500,
                  lineHeight: "24px",
                  border: "none",
                  width: "234.4px",
                  height: "46px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Check out
              </button>
            </div>

            {/* Continue shopping */}
            <div className="text-center" style={{ marginTop: "16px" }}>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-neutral-500 uppercase hover:text-neutral-700 transition-colors"
                style={{ border: "none", background: "transparent", fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", lineHeight: "16px" }}
              >
                or CONTINUE SHOPPING →
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
