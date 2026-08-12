import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import orderApi from "../services/orderApi";

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));

function OrderItemImage({ imageUrl, productName }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
      {showImage ? (
        <img
          src={imageUrl}
          alt={productName}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-label={`${productName} image unavailable`}
          className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-neutral-500"
        >
          Image unavailable
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessful() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const stateOrder = location.state?.order;
  const [order, setOrder] = useState(
    stateOrder?.id === orderId ? stateOrder : null,
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order || !orderId) return;
    let active = true;

    orderApi
      .get(orderId)
      .then((response) => {
        if (active) setOrder(response.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [order, orderId]);

  if (!order && !error) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <main className="container px-4 py-24 text-center text-neutral-600 dark:text-neutral-300">
          Loading your confirmed order…
        </main>
      </div>
    );
  }

  if (error || !orderId) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <main className="container px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Order could not be loaded</h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            {error ?? "The order id is missing."}
          </p>
          <Link
            to="/orders"
            className="mt-8 inline-block font-medium text-sky-600"
          >
            View your orders
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-10 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
            ✓
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Payment verified by the server
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Thank you for your order
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Order <span className="font-semibold">#{order.orderNumber}</span> is
            confirmed.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="text-xl font-semibold">Ordered products</h2>
            <div className="mt-5 divide-y divide-neutral-200 dark:divide-neutral-800">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <OrderItemImage
                      imageUrl={item.imageUrl}
                      productName={item.productName}
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{item.productName}</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {item.variantTitle} · Qty {item.quantity} · {item.sku}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold">
                    {formatInr(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="font-semibold">Payment</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Method</dt>
                  <dd>Razorpay · Test Mode</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Payment status</dt>
                  <dd className="font-semibold text-emerald-600">
                    {order.paymentStatus}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Order status</dt>
                  <dd className="font-semibold">{order.status}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3 text-base dark:border-neutral-800">
                  <dt className="font-semibold">Amount paid</dt>
                  <dd className="font-semibold">{formatInr(order.total)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="font-semibold">Delivery address</h2>
              <address className="mt-3 not-italic text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {order.shippingName}
                <br />
                {order.shippingLine1}
                {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                <br />
                {order.shippingCity}, {order.shippingState}{" "}
                {order.shippingPostalCode}
                <br />
                {order.shippingCountry} · {order.shippingPhone}
              </address>
            </section>
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to={`/orders/${order.id}`}
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            View order details
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium dark:border-neutral-700"
          >
            Continue shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
