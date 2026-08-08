import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import p2Asset from "../assets/p2.webp";
import p4Asset from "../assets/p4.webp";

/* ──────────────────────────────────────────────
   Static order data (mirrors the Ciseco reference)
   ────────────────────────────────────────────── */
const ORDER_PRODUCTS = [
  {
    id: 1,
    name: "Nomad Tumbler",
    href: "/products/nomad-tumbler",
    color: "Black Brown",
    size: "XS",
    qty: 1,
    price: "35.00",
    image: p2Asset,
    alt: "Insulated bottle with white base and black snap lid.",
  },
  {
    id: 2,
    name: "Minimalist Wristwatch",
    href: "/products/minimalist-wristwatch",
    color: "White",
    size: "XL",
    qty: 1,
    price: "149.00",
    image: p4Asset,
    alt: "Insulated bottle with white base and black snap lid.",
  },
];

/* ──────────────────────────────────────────────
   Visa SVG (exact copy from Ciseco reference)
   ────────────────────────────────────────────── */
function VisaIcon() {
  return (
    <svg
      width="36"
      height="24"
      viewBox="0 0 36 24"
      aria-hidden="true"
      className="h-6 w-auto"
    >
      <rect rx="4" fill="#224DBA" width="36" height="24" />
      <path
        d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
        fill="#fff"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Product Row
   ────────────────────────────────────────────── */
function OrderProductItem({ product }) {
  return (
    <li className="flex gap-x-2.5 py-6 sm:gap-x-6">
      {/* Image */}
      <div
        className="relative w-24 flex-none overflow-hidden rounded-md bg-neutral-100"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          alt={product.alt}
          loading="lazy"
          decoding="async"
          src={product.image}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex flex-auto flex-col gap-y-1.5">
        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          <Link to={product.href}>{product.name}</Link>
        </h3>
        <div className="flex items-center gap-x-2 text-neutral-500 dark:text-neutral-300">
          <p className="text-sm text-neutral-500 dark:text-neutral-300">
            {product.color}
          </p>
          <p className="text-sm text-neutral-300">/</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">
            {product.size}
          </p>
        </div>

        {/* Price badge — mobile only */}
        <div className="flex justify-start sm:hidden">
          <div className="flex items-center rounded-lg border-2 border-green-500 px-2 py-1 text-sm font-medium md:px-2.5 md:py-1.5">
            <span className="text-green-500" style={{ lineHeight: 1 }}>
              ${product.price}
            </span>
          </div>
        </div>

        <p className="mt-auto text-sm text-neutral-500 dark:text-neutral-300">
          Qty {product.qty}
        </p>
      </div>

      {/* Price badge — desktop */}
      <div className="hidden sm:block">
        <div className="flex items-center rounded-lg border-2 border-green-500 px-2 py-1 text-sm font-medium md:px-2.5 md:py-1.5">
          <span className="text-green-500" style={{ lineHeight: 1 }}>
            ${product.price}
          </span>
        </div>
      </div>
    </li>
  );
}

/* ──────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────── */
export default function OrderSuccessful() {
  return (
    <div
      className="relative bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200"
      style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-3xl">
          <div>
            {/* ─── Success Header ─── */}
            <p className="text-xs font-medium uppercase">
              Thanks for ordering
            </p>

            <div className="relative mt-4 flex flex-col justify-between sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Payment successful!
                </h2>
              </div>
            </div>

            <p className="mt-2.5 max-w-2xl text-neutral-500">
              We appreciate your order, we&rsquo;re currently processing it. So
              hang tight and we&rsquo;ll send you confirmation very soon!
            </p>

            {/* ─── Tracking Number ─── */}
            <dl className="mt-16 text-sm">
              <dt className="text-neutral-500">Tracking number</dt>
              <dd>
                <Link to="/orders" className="mt-2 text-lg font-medium">
                  #4657
                  <span aria-hidden="true"> →</span>
                </Link>
              </dd>
            </dl>

            {/* ─── Product List ─── */}
            <ul
              role="list"
              className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200 text-sm text-neutral-500 dark:divide-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              {ORDER_PRODUCTS.map((product) => (
                <OrderProductItem key={product.id} product={product} />
              ))}
            </ul>

            {/* ─── Order Summary ─── */}
            <dl className="space-y-6 border-t border-neutral-200 pt-6 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <div className="flex justify-between">
                <dt className="uppercase">Subtotal</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  $199.00
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="uppercase">Shipping</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  $0.00
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="uppercase">Taxes</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  $0.00
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                <dt className="text-base uppercase">Total</dt>
                <dd className="text-base">$199.00</dd>
              </div>
            </dl>

            {/* ─── Customer Info Grid ─── */}
            <dl className="mt-12 grid grid-cols-2 gap-x-4 text-sm text-neutral-600 sm:mt-16 dark:text-neutral-300">
              {/* Shipping Address */}
              <div>
                <dt className="font-medium uppercase text-neutral-900">
                  Shipping Address
                </dt>
                <dd className="mt-2">
                  <address className="not-italic uppercase">
                    <span className="block">Kristin Watson</span>
                    <span className="block">7363 Cynthia Pass</span>
                    <span className="block">Toronto, ON N3Y 4H8</span>
                  </address>
                </dd>
              </div>

              {/* Payment Information */}
              <div>
                <dt className="font-medium uppercase">
                  Payment Information
                </dt>
                <dd className="mt-2 space-y-2 sm:flex sm:gap-x-4 sm:space-y-0">
                  <div className="flex-none">
                    <VisaIcon />
                    <p className="sr-only">Visa</p>
                  </div>
                  <div className="flex-auto uppercase">
                    <p>Ending with 4242</p>
                    <p>Expires 12 / 21</p>
                  </div>
                </dd>
              </div>
            </dl>

            {/* ─── Continue Shopping CTA ─── */}
            <div className="mt-16 border-t border-neutral-200 py-6 text-right dark:border-neutral-700">
              <Link to="/shop" className="text-sm font-medium uppercase">
                Continue Shopping
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr
          role="presentation"
          className="w-full border-t border-neutral-950/10 dark:border-white/10"
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
