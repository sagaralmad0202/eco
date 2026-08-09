import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items: cartItems, updateQuantity: ctxUpdateQuantity, removeFromCart, subtotal } = useCart();

  const updateQuantity = (id, delta) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      ctxUpdateQuantity(id, Math.max(1, item.quantity + delta));
    }
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const shippingEstimate = cartItems.length > 0 ? 5.0 : 0;
  const taxEstimate = cartItems.length > 0 ? 24.9 : 0;
  const orderTotal = subtotal + shippingEstimate + taxEstimate;

  return (
    <div className="nc-CartPage">
      <div className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <Header height="79.2px" />
      </div>

      <main className="container px-4 sm:px-8 py-16 lg:pt-20 lg:pb-28">
        {/* Page heading + breadcrumb */}
        <div className="mb-12 sm:mb-16 text-left">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl" style={{ color: "#111111", fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>Shopping Cart</h2>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-medium text-neutral-900 sm:text-sm/6 dark:text-neutral-300 mt-5"
          >
            <ol role="list" className="flex flex-wrap items-center gap-3.5">
              <li>
                <div className="flex items-center gap-3.5">
                  <Link to="/" className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600">
                    Home
                  </Link>
                  <svg viewBox="0 0 6 20" aria-hidden="true" className="h-5 w-auto text-neutral-400 dark:text-neutral-500">
                    <path d="M4.878 4.34L1.122 16.536" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </li>
              <li>
                <span aria-current="page" className="text-neutral-500 dark:text-neutral-400">
                  Shopping Cart
                </span>
              </li>
            </ol>
          </nav>
        </div>

        <hr className="my-10 border-neutral-200 xl:my-12 dark:border-neutral-700" />

        {/* Main 2-column layout */}
        <div className="flex flex-col lg:flex-row">
          {/* ─── Left: Cart Items ─── */}
          <div className="w-full divide-y divide-neutral-200 lg:w-[60%] xl:w-[55%] dark:divide-neutral-700">
            {cartItems.length === 0 ? (
              <div className="cart-empty py-16 text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Your cart is empty</h3>
                <p className="mt-1 text-sm text-neutral-500">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12"
                >
                  {/* Product Image */}
                  <div className="relative shrink-0 overflow-hidden rounded-xl bg-neutral-100" style={{ width: '128px', height: '144px' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain object-center"
                    />
                    <Link to={`/products/${item.slug || "leather-tote-bag"}`} className="absolute inset-0"></Link>
                  </div>

                  {/* Product Details */}
                  <div className="ml-3 flex flex-1 flex-col sm:ml-6 text-left">
                    {/* Top section */}
                    <div>
                      <div className="flex justify-between">
                        <div className="flex-[1.5]">
                          <h3 className="text-base font-semibold">
                            <Link to={`/products/${item.slug || "leather-tote-bag"}`}>
                              {item.name}
                            </Link>
                          </h3>

                          {/* Meta: Color | Size */}
                          <div className="mt-3 flex text-sm text-neutral-600 dark:text-neutral-300">
                            <div className="flex items-center gap-x-2">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                aria-hidden="true"
                              >
                                <path
                                  d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.89805 2M10.9184 4.02587L19 12.1294"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {item.color}
                            </div>
                            <div className="mx-4 border-l border-neutral-200 dark:border-neutral-700 h-4"></div>
                            <div className="flex items-center gap-x-2">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M4.00781 4.99913C4.59743 4.39256 6.16671 2.80849 7.00666 2.80849C7.84661 2.80849 9.41589 4.39256 10.0055 4.99913M7.00666 2.84907V21.9995" />
                                <path d="M19.0023 13.995C19.6088 14.5846 22.0011 16.1538 22.0011 16.9937C22.0011 17.8336 19.6088 19.4028 19.0023 19.9923M21.1906 16.9939H1.99805" />
                              </svg>
                              {item.size}
                            </div>
                          </div>

                          {/* Mobile: Quantity dropdown + Price badge */}
                          <div className="mt-3 flex w-full items-center justify-between sm:hidden">
                            <select
                              name="qty"
                              id="qty"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value, 10);
                                updateQuantity(item.id, newQty - item.quantity);
                              }}
                              className="form-select rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 text-sm font-medium text-green-500">
                              <span className="leading-none">${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity controls - desktop */}
                        <div className="hidden text-center sm:block">
                          <div className="flex items-center justify-between gap-x-5 w-full">
                            <div className="flex w-[104px] items-center justify-between sm:w-28">
                              <button
                                className="flex w-8 h-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="block flex-1 text-center leading-none select-none">{item.quantity}</span>
                              <button
                                className="flex w-8 h-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price badge - desktop */}
                        <div className="hidden flex-1 justify-end sm:flex">
                          <div className="mt-0.5">
                            <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium text-green-500">
                              <span className="leading-none">${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: In Stock + Remove */}
                    <div className="mt-auto flex items-end justify-between pt-4 text-sm">
                      <div className="flex items-center justify-center rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="ml-1 leading-none">In Stock</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="relative z-10 mt-3 flex items-center text-sm font-medium text-sky-600 hover:text-sky-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:mx-16 2xl:mx-20 dark:border-neutral-700"></div>

          {/* ─── Right: Order Summary ─── */}
          <div className="flex-1 text-left">
            <div className="sticky top-28 cart-summary-box">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "18px", color: "#111827", margin: 0 }}
              >
                Order Summary
              </h3>

              {cartItems.length > 0 ? (
                <>
                  <div className="mt-7 divide-y divide-neutral-200/70 dark:divide-neutral-700/80">
                    <div className="flex justify-between pb-4">
                      <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px", color: "#6b7280" }}>Subtotal</span>
                      <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px", fontWeight: 600, color: "#111827" }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4">
                      <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px", color: "#6b7280" }}>Shipping estimate</span>
                      <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px", fontWeight: 600, color: "#111827" }}>${shippingEstimate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4">
                      <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px", color: "#6b7280" }}>Tax estimate</span>
                      <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px", fontWeight: 600, color: "#111827" }}>${taxEstimate.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "16px", fontWeight: 600, color: "#111827" }}>Order total</span>
                    <span style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "16px", fontWeight: 600, color: "#111827" }}>${orderTotal.toFixed(2)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="mt-8 w-full relative inline-flex items-center justify-center rounded-full text-base font-medium py-3 px-6 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Checkout
                  </Link>

                  <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                    <p
                      className="relative block pl-5"
                      style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "14px" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="absolute top-0.5 -left-1"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                      Learn more{" "}
                      <a
                        href="#"
                        className="font-medium text-neutral-900 underline dark:text-neutral-200"
                        style={{ textUnderlineOffset: "2px" }}
                      >
                        Taxes
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-medium text-neutral-900 underline dark:text-neutral-200"
                        style={{ textUnderlineOffset: "2px" }}
                      >
                        Shipping
                      </a>{" "}
                      information
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-6 text-sm text-neutral-500">
                  No items in cart to summarize.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
