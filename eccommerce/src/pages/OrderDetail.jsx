import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import p2Asset from "../assets/p2.webp";
import p4Asset from "../assets/p4.webp";

const tabs = ["Settings", "Wishlists", "Orders history", "Change password", "Billing"];

const tabRoutes = {
  Settings: "/account",
  Wishlists: "/account-wishlists",
  "Orders history": "/orders",
  "Change password": "/account-password",
  Billing: "/account-billing",
};

/* ──────────────────────────────────────────────
   Visa Icon SVG
   ────────────────────────────────────────────── */
function VisaIcon() {
  return (
    <svg
      width="36"
      height="24"
      viewBox="0 0 36 24"
      aria-hidden="true"
      className="h-6 w-auto flex-shrink-0"
    >
      <rect rx="4" fill="#224DBA" width="36" height="24" />
      <path
        d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
        fill="#fff"
      />
    </svg>
  );
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const displayOrderId = orderId || "4657";

  return (
    <div
      className="relative bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200 min-h-screen flex flex-col"
      style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      <main className="container mx-auto px-4 sm:px-8 flex-grow">
        {/* Account Header Section */}
        <div className="pt-10 sm:pt-14">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
              Account
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Enrico Cole
              </span>
              , ciseco@gmail.com · Los Angeles, CA
            </p>

            {/* Navigation Tabs */}
            <div className="mt-8 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-x-6 sm:gap-x-8 overflow-x-auto hidden-scrollbar">
                {tabs.map((tab) => (
                  <a
                    key={tab}
                    href={tabRoutes[tab]}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(tabRoutes[tab]);
                    }}
                    className={`block shrink-0 border-b-2 py-4 text-sm sm:text-base transition-colors ${
                      tab === "Orders history"
                        ? "border-[#0ea5e9] font-medium text-neutral-950 dark:text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
                    }`}
                  >
                    {tab}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="max-w-4xl mx-auto py-10 sm:py-14 space-y-10">
          {/* Order Title + View Invoice Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Order placed <span className="font-medium text-neutral-900 dark:text-neutral-200">March 22, 2025</span>
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                Order #{displayOrderId}
              </h2>
            </div>
            <div>
              <Link
                to={`/orders/${displayOrderId}/invoice`}
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
              >
                View invoice <span className="ml-2">→</span>
              </Link>
            </div>
          </div>

          {/* Product Card 1 */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            {/* Top Product Info */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Product Image & Details */}
              <div className="md:col-span-6 flex gap-4 sm:gap-6">
                <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  <img
                    src={p2Asset}
                    alt="Nomad Tumbler"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      <Link to="/products/nomad-tumbler" className="hover:underline">
                        Nomad Tumbler
                      </Link>
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Qty 1
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1 text-sm font-semibold text-green-500">
                      $35.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-3 text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Delivery address
                </p>
                <div className="mt-2 text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <p>Floyd Miles</p>
                  <p>7363 Cynthia Pass</p>
                  <p>Toronto, ON N3Y 4H8</p>
                </div>
              </div>

              {/* Shipping Updates */}
              <div className="md:col-span-3 text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Shipping updates
                </p>
                <div className="mt-2 text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <p>f•••@example.com</p>
                  <p>1•••••••••40</p>
                </div>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Edit →
                </button>
              </div>
            </div>

            {/* Progress Bar & Timeline */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-800/20">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Preparing to ship on March 24, 2021
              </p>

              {/* Bar */}
              <div className="relative h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-neutral-900 dark:bg-white"
                  style={{ width: "35%" }}
                />
              </div>

              {/* Labels */}
              <div className="mt-3 grid grid-cols-4 text-xs font-medium">
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  Order placed
                </span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold text-center sm:text-left">
                  Processing
                </span>
                <span className="text-neutral-400 text-center sm:text-left">
                  Shipped
                </span>
                <span className="text-neutral-400 text-right">
                  Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Product Card 2 */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            {/* Top Product Info */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Product Image & Details */}
              <div className="md:col-span-6 flex gap-4 sm:gap-6">
                <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  <img
                    src={p4Asset}
                    alt="Minimalist Wristwatch"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      <Link to="/products/minimalist-wristwatch" className="hover:underline">
                        Minimalist Wristwatch
                      </Link>
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Qty 1
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1 text-sm font-semibold text-green-500">
                      $149.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-3 text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Delivery address
                </p>
                <div className="mt-2 text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <p>Floyd Miles</p>
                  <p>7363 Cynthia Pass</p>
                  <p>Toronto, ON N3Y 4H8</p>
                </div>
              </div>

              {/* Shipping Updates */}
              <div className="md:col-span-3 text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Shipping updates
                </p>
                <div className="mt-2 text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <p>f•••@example.com</p>
                  <p>1•••••••••40</p>
                </div>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Edit →
                </button>
              </div>
            </div>

            {/* Progress Bar & Timeline */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-800/20">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Shipped on March 23, 2021
              </p>

              {/* Bar */}
              <div className="relative h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-neutral-900 dark:bg-white"
                  style={{ width: "66%" }}
                />
              </div>

              {/* Labels */}
              <div className="mt-3 grid grid-cols-4 text-xs font-medium">
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  Order placed
                </span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold text-center sm:text-left">
                  Processing
                </span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold text-center sm:text-left">
                  Shipped
                </span>
                <span className="text-neutral-400 text-right">
                  Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Billing & Summary Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Billing Address */}
              <div className="text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Billing address
                </p>
                <div className="mt-2 text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <p>Floyd Miles</p>
                  <p>7363 Cynthia Pass</p>
                  <p>Toronto, ON N3Y 4H8</p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Payment information
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <VisaIcon />
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      Ending with 4242
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Expires 02 / 24
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="text-sm space-y-3">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">$72</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Shipping</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">$5</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Tax</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">$6.16</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                  <span>Order total</span>
                  <span>$83.16</span>
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
