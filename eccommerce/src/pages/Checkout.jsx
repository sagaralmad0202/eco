import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import p1 from "../assets/p1.webp";
import p2 from "../assets/p3.webp";

const checkoutItems = [
  { id: 1, name: "Basic Tee", slug: "basic-tee", color: "Sienna", size: "L", price: 199.0, quantity: 1, image: p1 },
  { id: 2, name: "Basic Coahuila", slug: "basic-coahuila", color: "Black", size: "XL", price: 99.0, quantity: 1, image: p1 },
  { id: 3, name: "Nomad Tumbler", slug: "nomad-tumbler", color: "White", size: "M", price: 119.0, quantity: 1, image: p2 },
];

export default function Checkout() {
  const [activeTab, setActiveTab] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingEstimate = 5.0;
  const taxEstimate = 24.9;
  const orderTotal = subtotal + shippingEstimate + taxEstimate;

  return (
    <div className="nc-CheckoutPage">
      <div className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <Header />
      </div>

      <main className="container mx-auto px-4 sm:px-8 py-16 lg:pt-20 lg:pb-28">
        {/* Heading + Breadcrumb */}
        <div className="mb-12 sm:mb-16 text-left">
          <h1 className="mb-5 block text-3xl font-semibold lg:text-4xl" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', color: "#111827" }}>Checkout</h1>
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-neutral-900 sm:text-sm/6 dark:text-neutral-300">
            <ol role="list" className="flex flex-wrap items-center gap-3.5">
              <li>
                <div className="flex items-center gap-3.5">
                  <Link to="/" className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600">Home</Link>
                  <svg viewBox="0 0 6 20" aria-hidden="true" className="h-5 w-auto text-neutral-400 dark:text-neutral-500"><path d="M4.878 4.34L1.122 16.536" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3.5">
                  <Link to="/cart" className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600">Cart</Link>
                  <svg viewBox="0 0 6 20" aria-hidden="true" className="h-5 w-auto text-neutral-400 dark:text-neutral-500"><path d="M4.878 4.34L1.122 16.536" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </li>
              <li><span aria-current="page" className="text-neutral-500 dark:text-neutral-400">Checkout</span></li>
            </ol>
          </nav>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row">
          {/* Left: Form */}
          <div className="flex-1">
            <div className="space-y-8">

              {/* ── CONTACT INFORMATION ── */}
              <div id="ContactInfo" className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="flex w-full items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">CONTACT INFORMATION</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Enrico Smith / +855-666-7744</p>
                    </div>
                    <button className="text-sm font-medium text-neutral-700 underline dark:text-neutral-300 hover:text-neutral-900" style={{ textUnderlineOffset: "3px" }}>Change</button>
                  </div>
                </div>
                {/* Hidden form (collapsed) */}
                <div className="border-t border-neutral-200 px-6 py-7 dark:border-neutral-700 hidden">
                  <h3 className="text-lg font-semibold text-left">Contact infomation</h3>
                  <p className="mt-1 text-sm text-neutral-500 text-left">Do not have an account? <Link to="/login" className="text-sky-600 underline">Log in</Link></p>
                </div>
              </div>

              {/* ── SHIPPING ADDRESS ── */}
              <div id="ShippingAddress" className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625A1.875 1.875 0 0 1 3.75 19.875v-6.198a.756.756 0 0 0 .091-.086L12 5.432Z" />
                    </svg>
                  </span>
                  <div className="flex w-full items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">SHIPPING ADDRESS</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Enrico Smith / +855-666-7744</p>
                    </div>
                    <button className="text-sm font-medium text-neutral-700 underline dark:text-neutral-300 hover:text-neutral-900" style={{ textUnderlineOffset: "3px" }}>Change</button>
                  </div>
                </div>
              </div>

              {/* ── PAYMENT METHOD ── */}
              <div id="PaymentMethod" className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                      <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                      <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                    </svg>
                  </span>
                  <div className="flex w-full items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">PAYMENT METHOD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment options */}
                <div className="border-t border-neutral-200 px-6 py-7 dark:border-neutral-700">
                  <div className="space-y-4">
                    {/* Debit / Credit Card */}
                    <label className={`flex items-center cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === "credit" ? "border-neutral-900 dark:border-neutral-100 shadow-sm" : "border-neutral-200 dark:border-neutral-700"}`}>
                      <input type="radio" name="payment" value="credit" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} className="sr-only" />
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === "credit" ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-400 dark:border-neutral-500"}`}>
                        {paymentMethod === "credit" && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />}
                      </span>
                      <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">Debit / Credit Card</span>
                    </label>

                    {/* Internet banking */}
                    <label className={`flex items-center cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === "banking" ? "border-neutral-900 dark:border-neutral-100 shadow-sm" : "border-neutral-200 dark:border-neutral-700"}`}>
                      <input type="radio" name="payment" value="banking" checked={paymentMethod === "banking"} onChange={() => setPaymentMethod("banking")} className="sr-only" />
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === "banking" ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-400 dark:border-neutral-500"}`}>
                        {paymentMethod === "banking" && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />}
                      </span>
                      <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">Internet banking</span>
                    </label>

                    {/* Wallet */}
                    <label className={`flex items-center cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === "wallet" ? "border-neutral-900 dark:border-neutral-100 shadow-sm" : "border-neutral-200 dark:border-neutral-700"}`}>
                      <input type="radio" name="payment" value="wallet" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} className="sr-only" />
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === "wallet" ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-400 dark:border-neutral-500"}`}>
                        {paymentMethod === "wallet" && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />}
                      </span>
                      <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">Google / Apple Wallet</span>
                    </label>
                  </div>

                  {/* Card payment details */}
                  {paymentMethod === "credit" && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-base font-semibold text-left text-neutral-900 dark:text-neutral-100">Your order will be delivered to you after you transfer to</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-left">Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque dolore quod quas fugit perspiciatis architecto, temporibus quos ducimus libero explicabo?</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:mx-16 2xl:mx-20 dark:border-neutral-700"></div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[36%]">
            <div className="sticky top-28">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "18px", color: "#111827", margin: 0 }}>Order summary</h3>

              {/* Product list */}
              <div className="mt-7 divide-y divide-neutral-200/70 dark:divide-neutral-700/80">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex py-5 last:pb-0 first:pt-0">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain object-center p-2" />
                      <Link to={`/products/${item.slug}`} className="absolute inset-0"></Link>
                    </div>
                    <div className="ml-4 flex flex-1 flex-col text-left">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-semibold">
                            <Link to={`/products/${item.slug}`}>{item.name}</Link>
                          </h3>
                          <div className="mt-1 flex text-sm text-neutral-600 dark:text-neutral-300">
                            <div className="flex items-center gap-x-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.89805 2M10.9184 4.02587L19 12.1294" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              {item.color}
                            </div>
                            <div className="mx-3 border-l border-neutral-200 dark:border-neutral-700 h-4"></div>
                            <div className="flex items-center gap-x-1.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.00781 4.99913C4.59743 4.39256 6.16671 2.80849 7.00666 2.80849C7.84661 2.80849 9.41589 4.39256 10.0055 4.99913M7.00666 2.84907V21.9995" /><path d="M19.0023 13.995C19.6088 14.5846 22.0011 16.1538 22.0011 16.9937C22.0011 17.8336 19.6088 19.4028 19.0023 19.9923M21.1906 16.9939H1.99805" /></svg>
                              {item.size}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 text-sm font-medium text-green-500 h-fit">
                          <span className="leading-none">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-7 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <div className="divide-y divide-neutral-200/70 dark:divide-neutral-700/80">
                  <div className="flex justify-between py-3">
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", color: "#6b7280" }}>Subtotal</span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", fontWeight: 600, color: "#111827" }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", color: "#6b7280" }}>Shipping estimate</span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", fontWeight: 600, color: "#111827" }}>${shippingEstimate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", color: "#6b7280" }}>Tax estimate</span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", fontWeight: 600, color: "#111827" }}>${taxEstimate.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-1">
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "16px", fontWeight: 600, color: "#111827" }}>Order total</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: "16px", fontWeight: 600, color: "#111827" }}>${orderTotal.toFixed(2)}</span>
                </div>

                <button type="button" className="mt-8 w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-full py-4 hover:bg-neutral-800 dark:hover:bg-white transition-colors" style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", fontWeight: 600 }}>
                  Confirm order
                </button>

                <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p className="relative block pl-5" style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute top-0.5 -left-1" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    Learn more{" "}
                    <a href="#" className="font-medium text-neutral-900 underline dark:text-neutral-200" style={{ textUnderlineOffset: "2px" }}>Taxes</a>{" "}
                    and{" "}
                    <a href="#" className="font-medium text-neutral-900 underline dark:text-neutral-200" style={{ textUnderlineOffset: "2px" }}>Shipping</a>{" "}
                    infomation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
