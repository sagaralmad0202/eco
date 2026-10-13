import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import orderApi from "../services/orderApi";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";

import p2Asset from "../assets/p2.webp";

const tabs = ["Settings", "Wishlists", "Orders history", "Change password", "Billing"];

const tabRoutes = {
  Settings: "/account",
  Wishlists: "/account-wishlists",
  "Orders history": "/orders",
  "Change password": "/account-password",
  Billing: "/account-billing",
};

const formatPhone = (phone) => {
  if (!phone) return "";
  const cleaned = String(phone).trim();
  if (cleaned.startsWith("+")) return cleaned;
  return `+91 ${cleaned}`;
};

const formatPrice = (val) => {
  const num = Number(val ?? 0);
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getStatusInfo = (status) => {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
      return {
        message: "Delivered to your address",
        percent: 100,
        step: 4,
        color: "bg-emerald-500",
      };
    case "SHIPPED":
      return {
        message: "Shipped and on the way",
        percent: 75,
        step: 3,
        color: "bg-[#0ea5e9]",
      };
    case "PROCESSING":
      return {
        message: "Order processing · Preparing for dispatch",
        percent: 50,
        step: 2,
        color: "bg-[#0ea5e9]",
      };
    case "CONFIRMED":
    case "PAID":
      return {
        message: "Order confirmed · Being prepared",
        percent: 35,
        step: 2,
        color: "bg-[#0ea5e9]",
      };
    case "CANCELLED":
      return {
        message: "Order has been cancelled",
        percent: 100,
        step: 0,
        color: "bg-red-500",
      };
    case "PENDING":
    default:
      return {
        message: "Order placed · Awaiting payment confirmation",
        percent: 20,
        step: 1,
        color: "bg-amber-500",
      };
  }
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const user = useAppSelector(selectUser);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        setError("Invalid order ID");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.get(orderId);
        if (isMounted) {
          setOrder(res.data || res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Could not load order details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const displayOrderId = order?.orderNumber || order?.id || orderId;
  const statusInfo = getStatusInfo(order?.status);

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
                {order?.user?.fullName || user?.fullName || order?.shippingName || "Customer"}
              </span>
              {(order?.user?.email || user?.email) && ` · ${order?.user?.email || user?.email}`}
              {order?.shippingCity && ` · ${order.shippingCity}, ${order.shippingState || "India"}`}
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
                    className={`block shrink-0 border-b-2 py-4 text-sm sm:text-base transition-colors ${tab === "Orders history"
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

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-900 border-r-transparent dark:border-white dark:border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading order details...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-4xl mx-auto py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Order Not Found</h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/shop"
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Go to Shop
              </Link>
            </div>
          </div>
        )}

        {/* Order Details Body */}
        {!loading && !error && order && (
          <div className="space-y-8">
            {/* Back link */}
            <div>
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                <span>←</span> Back to orders
              </Link>
            </div>

            {/* Order Title + View Invoice Bar */ }
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Order placed{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-200">
          {formatDate(order.placedAt)}
        </span>
      </p>
      <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
        Order #{displayOrderId}
      </h2>
    </div>
    <div>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm cursor-pointer"
      >
        Print invoice <span className="ml-2">→</span>
      </button>
    </div>
  </div>

  {/* Product Cards for each item in the order */ }
  {
    order.items && order.items.length > 0 ? (
      order.items.map((item, index) => (
        <div
          key={item.id || index}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs"
        >
          {/* Top Product Info */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Product Image & Details */}
            <div className="md:col-span-6 flex gap-4 sm:gap-6">
              <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                <img
                  src={item.imageUrl || p2Asset}
                  alt={item.productName || "Product image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = p2Asset;
                  }}
                />
              </div>
              <div className="flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.productSlug ? (
                      <Link to={`/products/${item.productSlug}`} className="hover:underline">
                        {item.productName}
                      </Link>
                    ) : (
                      item.productName
                    )}
                  </h3>
                  {item.variantTitle && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Qty {item.quantity}
                  </p>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center justify-center rounded-lg border-2 border-emerald-500 px-2.5 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(item.lineTotal || item.unitPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="md:col-span-3 text-sm">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                Delivery address
              </p>
              <div className="mt-2 text-neutral-600 dark:text-neutral-400 space-y-0.5">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {order.shippingName}
                </p>
                <p className="leading-snug">{order.shippingLine1}</p>
                {order.shippingLine2 && <p className="leading-snug">{order.shippingLine2}</p>}
                <p className="leading-snug">
                  {[order.shippingCity, order.shippingState, order.shippingPostalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{order.shippingCountry === "IN" ? "India" : order.shippingCountry || "India"}</p>
              </div>
            </div>

            {/* Shipping Updates */}
            <div className="md:col-span-3 text-sm">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                Shipping updates
              </p>
              <div className="mt-2 text-neutral-600 dark:text-neutral-400 space-y-0.5">
                <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                  {order.user?.email || user?.email || "Email notification active"}
                </p>
                {(order.shippingPhone || order.user?.phone || user?.phone) && (
                  <p>{formatPhone(order.shippingPhone || order.user?.phone || user?.phone)}</p>
                )}
                <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-1">
                  Notifications sent on status updates
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar & Timeline */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-800/20">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {statusInfo.message}
            </p>

            {/* Bar */}
            <div className="relative h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${statusInfo.color}`}
                style={{ width: `${statusInfo.percent}%` }}
              />
            </div>

            {/* Labels */}
            <div className="mt-3 grid grid-cols-4 text-xs font-medium">
              <span className={`font-semibold ${statusInfo.step >= 1 ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}`}>
                Order placed
              </span>
              <span className={`font-semibold text-center sm:text-left ${statusInfo.step >= 2 ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}`}>
                Processing
              </span>
              <span className={`text-center sm:text-left ${statusInfo.step >= 3 ? "text-neutral-900 dark:text-neutral-100 font-semibold" : "text-neutral-400"}`}>
                Shipped
              </span>
              <span className={`text-right ${statusInfo.step >= 4 ? "text-neutral-900 dark:text-neutral-100 font-semibold" : "text-neutral-400"}`}>
                Delivered
              </span>
            </div>
          </div>
        </div>
      ))
    ) : null
  }

  {/* Billing & Summary Card */ }
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-6 sm:p-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Billing Address */}
      <div className="text-sm">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
          Billing address
        </p>
        <div className="mt-2 text-neutral-600 dark:text-neutral-400 space-y-0.5">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {order.shippingName}
          </p>
          <p>{order.shippingLine1}</p>
          {order.shippingLine2 && <p>{order.shippingLine2}</p>}
          <p>
            {[order.shippingCity, order.shippingState, order.shippingPostalCode]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>{order.shippingCountry === "IN" ? "India" : order.shippingCountry || "India"}</p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="text-sm">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
          Payment information
        </p>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Razorpay Secure
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${order.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
            >
              {order.paymentStatus || "PAID"}
            </span>
          </div>
          {order.payments?.[0]?.providerPaymentId && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Transaction: {order.payments[0].providerPaymentId}
            </p>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="text-sm space-y-3">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Subtotal</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatPrice(order.subtotal)}
          </span>
        </div>
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Shipping</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatPrice(order.shippingFee)}
          </span>
        </div>
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Tax</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatPrice(order.tax)}
          </span>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-semibold text-neutral-900 dark:text-neutral-100 text-base">
          <span>Order total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  </div>
          </div >
        )
}
      </main >

  <Footer />
    </div >
  );
}
