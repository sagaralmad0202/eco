import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import addressApi from "../services/addressApi";
import orderApi from "../services/orderApi";
import paymentApi from "../services/paymentApi";
import { loadRazorpayCheckout } from "../services/razorpayCheckout";
import { PRODUCT_ASSETS_MAP } from "../utils/productAdapter";

const PENDING_ORDER_KEY = "razorpay_pending_order";

const fieldElementIds = {
  firstName: "first-name",
  phone: "phone-number",
  address: "address",
  city: "city",
  stateProvince: "state",
  postalCode: "postal-code",
};

const addressApiFieldMap = {
  fullName: "firstName",
  phone: "phone",
  line1: "address",
  city: "city",
  state: "stateProvince",
  postalCode: "postalCode",
};

function validateShippingForm(form) {
  const errors = [];
  const fullName = `${form.firstName} ${form.lastName}`.trim();
  const phone = form.phone.replace(/\D/g, "").slice(-10);

  if (fullName.length < 2) {
    errors.push({ field: "firstName", message: "Enter the recipient's name." });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.push({
      field: "phone",
      message: "Enter a valid 10-digit Indian mobile number.",
    });
  }
  if (form.address.trim().length < 5) {
    errors.push({ field: "address", message: "Enter the street address." });
  }
  if (form.city.trim().length < 2) {
    errors.push({ field: "city", message: "Enter the city." });
  }
  if (form.stateProvince.trim().length < 2) {
    errors.push({ field: "stateProvince", message: "Enter the state." });
  }
  if (!/^[1-9]\d{5}$/.test(form.postalCode.trim())) {
    errors.push({
      field: "postalCode",
      message: "Enter a valid 6-digit Indian PIN code.",
    });
  }

  return errors;
}

const paymentLabels = {
  idle: "Pay with Razorpay",
  creating_order: "Creating order…",
  creating_payment: "Starting secure payment…",
  opening: "Opening Razorpay…",
  verifying: "Verifying payment…",
  processing: "Awaiting payment capture…",
  failed: "Retry payment",
};

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));

function readPendingOrder() {
  try {
    const saved = sessionStorage.getItem(PENDING_ORDER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function createCartFingerprint(items) {
  return items
    .map((item) => `${item.variantId}:${item.quantity}`)
    .sort()
    .join("|");
}

export default function Checkout() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [activeTab, setActiveTab] = useState(0);
  const {
    items,
    updateQuantity: ctxUpdateQuantity,
    removeFromCart,
    subtotal,
    shippingFeeString,
    taxString,
    totalString,
    issues,
    refreshCart,
  } = useCart();
  const [addressId, setAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentPhase, setPaymentPhase] = useState("idle");
  const [paymentError, setPaymentError] = useState(null);
  const [shippingErrors, setShippingErrors] = useState({});
  const [pendingOrder, setPendingOrder] = useState(readPendingOrder);
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    aptSuite: "",
    city: "",
    country: "IN",
    stateProvince: "",
    postalCode: "",
    addressType: "Home",
    phone: "",
    email: user?.email ?? "",
  });

  const isPaymentBusy = [
    "creating_order",
    "creating_payment",
    "opening",
    "verifying",
  ].includes(paymentPhase);
  const cartFingerprint = createCartFingerprint(items);
  const activePendingOrder =
    pendingOrder?.cartFingerprint === cartFingerprint &&
    pendingOrder?.userId === user?.id
      ? pendingOrder
      : null;

  useEffect(() => {
    let active = true;

    addressApi
      .list()
      .then((response) => {
        if (!active) return;
        const address = response.data?.[0];
        if (!address) {
          const [firstName = "", ...lastName] = String(
            user?.fullName ?? "",
          ).split(" ");
          setShippingForm((current) => ({
            ...current,
            firstName,
            lastName: lastName.join(" "),
            phone: user?.phone ?? current.phone,
            email: user?.email ?? current.email,
          }));
          return;
        }

        const [firstName = "", ...lastName] = address.fullName.split(" ");
        setAddressId(address.id);
        setShippingForm({
          firstName,
          lastName: lastName.join(" "),
          address: address.line1,
          aptSuite: address.line2 ?? "",
          city: address.city,
          country: address.country,
          stateProvince: address.state,
          postalCode: address.postalCode,
          addressType: "Home",
          phone: address.phone,
          email: user?.email ?? "",
        });
      })
      .catch((error) => {
        if (active) setPaymentError(error.message);
      });

    return () => {
      active = false;
    };
  }, [user?.email, user?.fullName, user?.phone]);

  const updateShippingField = (field, value) => {
    if (field !== "email" && field !== "addressType") setAddressId(null);
    setShippingForm((current) => ({ ...current, [field]: value }));
    setShippingErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (!activePendingOrder && paymentPhase === "failed") {
      setPaymentPhase("idle");
    }
  };

  const revealShippingError = (errors) => {
    const nextErrors = Object.fromEntries(
      errors.map(({ field, message }) => [field, message]),
    );
    const firstError = errors[0];

    setShippingErrors(nextErrors);
    setPaymentPhase("idle");
    setPaymentError(firstError.message);
    setActiveTab(firstError.field === "phone" ? 2 : 0);
    window.requestAnimationFrame(() => {
      document.getElementById(fieldElementIds[firstError.field])?.focus();
    });
  };

  const validateAndRevealShipping = () => {
    const errors = validateShippingForm(shippingForm);
    if (errors.length === 0) {
      setShippingErrors({});
      return true;
    }

    revealShippingError(errors);
    return false;
  };

  const ensureAddress = async () => {
    if (addressId) return addressId;

    const fullName =
      `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
    const phone = shippingForm.phone.replace(/\D/g, "").slice(-10);
    const response = await addressApi.create({
      type: "SHIPPING",
      fullName,
      phone,
      line1: shippingForm.address,
      ...(shippingForm.aptSuite ? { line2: shippingForm.aptSuite } : {}),
      city: shippingForm.city,
      state: shippingForm.stateProvince,
      postalCode: shippingForm.postalCode,
      country: "IN",
      isDefault: true,
    });
    const createdId = response.data.id;
    setAddressId(createdId);
    return createdId;
  };

  const finishVerifiedPayment = async (verification, internalOrderId) => {
    if (!verification.confirmed) {
      setPaymentPhase("processing");
      setPaymentError(
        "Payment is authorized and awaiting capture. You can retry verification shortly.",
      );
      return;
    }

    sessionStorage.removeItem(PENDING_ORDER_KEY);
    setPendingOrder(null);
    await refreshCart();
    navigate(`/order-successful?orderId=${internalOrderId}`, {
      replace: true,
      state: { order: verification.order },
    });
  };

  const discardStalePendingOrder = async () => {
    if (!pendingOrder) return;

    try {
      const response = await orderApi.get(pendingOrder.id);
      const storedOrder = response.data;

      // A paid/confirmed order must never be cancelled during stale-session
      // cleanup. Only abandon a genuinely unpaid order that Razorpay can no
      // longer safely resume for the cart currently on screen.
      if (
        storedOrder.status === "PENDING" &&
        storedOrder.paymentStatus !== "PAID"
      ) {
        await orderApi.cancel(pendingOrder.id);
      }
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    sessionStorage.removeItem(PENDING_ORDER_KEY);
    setPendingOrder(null);
  };

  const handlePayment = async () => {
    if (isPaymentBusy) return;
    if (items.length === 0 && !activePendingOrder) {
      setPaymentError("Your cart is empty.");
      return;
    }
    if (issues.length > 0 && !activePendingOrder) {
      setPaymentError(
        "Resolve unavailable or over-stock cart items before paying.",
      );
      return;
    }
    if (!activePendingOrder && !validateAndRevealShipping()) return;

    setPaymentError(null);
    const checkoutScript = loadRazorpayCheckout();
    let internalOrder = activePendingOrder;

    try {
      if (pendingOrder && !activePendingOrder) {
        await discardStalePendingOrder();
      }

      if (!internalOrder) {
        setPaymentPhase("creating_order");
        const resolvedAddressId = await ensureAddress();
        const response = await orderApi.create({
          addressId: resolvedAddressId,
          couponCode: couponCode.trim().toUpperCase() || undefined,
        });
        internalOrder = response.data;
        const resumable = {
          id: internalOrder.id,
          orderNumber: internalOrder.orderNumber,
          total: internalOrder.total,
          userId: user?.id,
          cartFingerprint,
        };
        sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(resumable));
        setPendingOrder(resumable);
      }

      setPaymentPhase("creating_payment");
      const [RazorpayCheckout, paymentResponse] = await Promise.all([
        checkoutScript,
        paymentApi.createRazorpayOrder(internalOrder.id),
      ]);
      const checkout = paymentResponse.data;

      if (checkout.reconciled) {
        await finishVerifiedPayment(checkout, internalOrder.id);
        return;
      }

      setPaymentPhase("opening");
      const contact = shippingForm.phone.replace(/\D/g, "").slice(-10);
      const razorpay = new RazorpayCheckout({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "Ciseco",
        description: `Payment for ${checkout.orderNumber}`,
        order_id: checkout.razorpayOrderId,
        prefill: {
          name: `${shippingForm.firstName} ${shippingForm.lastName}`.trim(),
          email: shippingForm.email || user?.email || "",
          contact: contact ? `+91${contact}` : "",
        },
        notes: { internalOrderId: internalOrder.id },
        theme: { color: "#1a3f7a" },
        handler: async (result) => {
          setPaymentPhase("verifying");
          try {
            const response = await paymentApi.verifyRazorpayPayment({
              orderId: internalOrder.id,
              razorpayPaymentId: result.razorpay_payment_id,
              razorpayOrderId: result.razorpay_order_id,
              razorpaySignature: result.razorpay_signature,
            });
            await finishVerifiedPayment(response.data, internalOrder.id);
          } catch (error) {
            setPaymentPhase("failed");
            setPaymentError(error.message);
            toast.error(error.message);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentPhase("failed");
            setPaymentError(
              "Payment window closed. Your order is saved and can be retried.",
            );
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        const message =
          response.error?.description ??
          "Payment failed. You can retry this order.";
        setPaymentPhase("failed");
        setPaymentError(message);
        toast.error(message);
      });
      razorpay.open();
    } catch (error) {
      const addressErrors = (error.fieldErrors ?? [])
        .map(({ field, message }) => ({
          field: addressApiFieldMap[field],
          message,
        }))
        .filter(({ field }) => field);
      if (addressErrors.length > 0) {
        revealShippingError(addressErrors);
        toast.error(addressErrors[0].message);
        return;
      }

      setPaymentPhase("failed");
      setPaymentError(
        error.message ?? "Could not start payment. Please retry.",
      );
      toast.error(error.message ?? "Could not start payment. Please retry.");
    }
  };

  const updateQuantity = (id, delta) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      ctxUpdateQuantity(id, Math.max(1, item.quantity + delta));
    }
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const shippingEstimate = Number(shippingFeeString);
  const taxEstimate = Number(taxString);
  const orderTotal = Number(totalString);
  const recipientName =
    `${shippingForm.firstName} ${shippingForm.lastName}`.trim() ||
    user?.fullName ||
    "Recipient name required";
  const shippingSummary = [
    shippingForm.address,
    shippingForm.city,
    shippingForm.stateProvince,
    shippingForm.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="nc-CheckoutPage">
      <div className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <Header height="79.2px" />
      </div>

      <main className="container px-4 sm:px-8 py-8 sm:py-16 lg:pt-20 lg:pb-28">
        {/* Heading + Breadcrumb */}
        <div className="mb-6 sm:mb-16">
          <h1 className="mb-3.5 sm:mb-5 block text-3xl font-semibold lg:text-4xl">
            Checkout
          </h1>
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-medium text-neutral-900 sm:text-sm/6 dark:text-neutral-300"
          >
            <ol
              role="list"
              className="flex flex-wrap items-center gap-1 sm:gap-3.5"
            >
              <li>
                <div className="flex items-center gap-1 sm:gap-3.5">
                  <Link
                    to="/"
                    className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600"
                  >
                    Home
                  </Link>
                  <span className="sm:hidden text-neutral-400 dark:text-neutral-500 select-none mx-2">
                    /
                  </span>
                  <svg
                    viewBox="0 0 6 20"
                    aria-hidden="true"
                    className="hidden sm:block h-5 w-auto text-neutral-400 dark:text-neutral-500"
                  >
                    <path
                      d="M4.878 4.34L1.122 16.536"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-1 sm:gap-3.5">
                  <Link
                    to="/cart"
                    className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600"
                  >
                    Cart
                  </Link>
                  <span className="sm:hidden text-neutral-400 dark:text-neutral-500 select-none mx-2">
                    /
                  </span>
                  <svg
                    viewBox="0 0 6 20"
                    aria-hidden="true"
                    className="hidden sm:block h-5 w-auto text-neutral-400 dark:text-neutral-500"
                  >
                    <path
                      d="M4.878 4.34L1.122 16.536"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </li>
              <li>
                <span
                  aria-current="page"
                  className="text-neutral-500 dark:text-neutral-400 ml-1 sm:ml-0"
                >
                  Checkout
                </span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row">
          {/* Left: Form */}
          <div className="flex-1">
            <div className="space-y-8">
              {/* ── CONTACT INFORMATION ── */}
              <div
                id="ContactInfo"
                className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    color="currentColor"
                    className="sm:mt-1.5"
                  >
                    <path
                      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M14.75 9.5C14.75 11.0188 13.5188 12.25 12 12.25C10.4812 12.25 9.25 11.0188 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M5.49994 19.0001L6.06034 18.0194C6.95055 16.4616 8.60727 15.5001 10.4016 15.5001H13.5983C15.3926 15.5001 17.0493 16.4616 17.9395 18.0194L18.4999 19.0001"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    ></path>
                  </svg>
                  <div className="sm:pl-3">
                    <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
                      <span className="tracking-tight uppercase">
                        Contact information
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        color="currentColor"
                        className="mb-1 text-sky-500"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </h3>
                    <div className="mt-1 text-sm font-semibold">
                      {recipientName} / {shippingForm.phone || "Phone required"}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab(2)}
                    className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    type="button"
                  >
                    Change
                  </button>
                </div>

                {/* Expanded Form */}
                <div
                  className={`border-t border-neutral-200 px-4 py-7 sm:px-6 dark:border-neutral-700 ${activeTab !== 2 ? "hidden" : ""}`}
                >
                  <div className="space-y-6">
                    {/* Header with inline login */}
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg font-semibold text-left">
                        Contact information
                      </h3>
                      <p className="text-sm text-neutral-900 dark:text-neutral-100 text-left">
                        Do not have an account?{" "}
                        <Link to="/login" className="font-medium underline">
                          Log in
                        </Link>
                      </p>
                    </div>

                    {/* Fields */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setActiveTab(0);
                      }}
                      className="space-y-6"
                    >
                      {/* Phone number */}
                      <div className="max-w-lg text-left">
                        <label
                          htmlFor="phone-number"
                          className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                        >
                          Your phone number
                        </label>
                        <div className="mt-1.5">
                          <input
                            type="text"
                            name="phone"
                            id="phone-number"
                            placeholder="10-digit mobile number"
                            value={shippingForm.phone}
                            onChange={(e) =>
                              updateShippingField("phone", e.target.value)
                            }
                            inputMode="tel"
                            autoComplete="tel"
                            required
                            aria-invalid={Boolean(shippingErrors.phone)}
                            aria-describedby={
                              shippingErrors.phone ? "phone-error" : undefined
                            }
                            className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          />
                          {shippingErrors.phone ? (
                            <p
                              id="phone-error"
                              className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                            >
                              {shippingErrors.phone}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Email address */}
                      <div className="max-w-lg text-left">
                        <label
                          htmlFor="email-address"
                          className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                        >
                          Email address
                        </label>
                        <div className="mt-1.5">
                          <input
                            type="email"
                            name="email"
                            id="email-address"
                            value={shippingForm.email}
                            onChange={(e) =>
                              updateShippingField("email", e.target.value)
                            }
                            className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="flex items-center gap-x-3 text-left">
                        <input
                          id="email-offers"
                          type="checkbox"
                          className="h-5 w-5 rounded border border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-900 accent-neutral-900 cursor-pointer dark:border-neutral-700 dark:bg-neutral-900"
                          defaultChecked
                        />
                        <label
                          htmlFor="email-offers"
                          className="text-sm font-medium text-neutral-900 dark:text-neutral-200 cursor-pointer select-none"
                        >
                          Email me news and offers
                        </label>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-4 pt-6 text-left items-start sm:flex-row sm:gap-2.5 sm:items-center border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="submit"
                          className="relative inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors w-auto min-w-56 sm:min-w-0"
                        >
                          Next to shipping address
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab(0)}
                          className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-[15px] py-[9px] sm:px-6 sm:py-3 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-neutral-600 sm:hover:bg-neutral-100 sm:dark:hover:bg-neutral-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* ── SHIPPING ADDRESS ── */}
              <div
                id="ShippingAddress"
                className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    color="currentColor"
                    className="sm:mt-1.5"
                  >
                    <path
                      d="M18.7185 10.7151C18.5258 10.8979 18.2682 11 18.0001 11C17.732 11 17.4744 10.8979 17.2817 10.7151C15.5167 9.03169 13.1515 7.15111 14.305 4.42805C14.9206 2.94462 16.4257 2 18.0001 2C19.5745 2 21.0796 2.94462 21.6952 4.42805C22.8487 7.14767 20.4878 9.03749 18.7185 10.7151"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M18 6H18.009"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                    <circle
                      cx="5"
                      cy="19"
                      r="3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    ></circle>
                    <path
                      d="M11 7H9.5C7 7 6 8.34315 6 10C6 11.6569 7.567 13 9.5 13H12.5C14.433 13 16 14.3431 16 16C16 17.6569 14.6569 19 12.5 19H11"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    ></path>
                  </svg>
                  <div className="sm:pl-3">
                    <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
                      <span className="tracking-tight uppercase">
                        Shipping address
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        color="currentColor"
                        className={`mb-1 text-sky-500 ${activeTab === 0 ? "block sm:hidden" : "block"}`}
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </h3>
                    <div
                      className={`mt-1 text-sm font-semibold ${activeTab === 0 ? "block sm:hidden" : "block"}`}
                    >
                      {shippingSummary || "Shipping address required"}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab(0)}
                    className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    type="button"
                  >
                    Change
                  </button>
                </div>

                <div
                  className={`border-t border-neutral-200 px-4 py-7 sm:px-6 dark:border-neutral-700 ${activeTab !== 0 ? "hidden" : ""}`}
                >
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-4">
                    {/* First name */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        First name
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="firstName"
                          id="first-name"
                          value={shippingForm.firstName}
                          onChange={(e) =>
                            updateShippingField("firstName", e.target.value)
                          }
                          autoComplete="given-name"
                          required
                          aria-invalid={Boolean(shippingErrors.firstName)}
                          aria-describedby={
                            shippingErrors.firstName
                              ? "first-name-error"
                              : undefined
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        {shippingErrors.firstName ? (
                          <p
                            id="first-name-error"
                            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                          >
                            {shippingErrors.firstName}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Last name */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        Last name
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="lastName"
                          id="last-name"
                          value={shippingForm.lastName}
                          onChange={(e) =>
                            updateShippingField("lastName", e.target.value)
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-8">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        Address
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={shippingForm.address}
                          onChange={(e) =>
                            updateShippingField("address", e.target.value)
                          }
                          autoComplete="street-address"
                          required
                          aria-invalid={Boolean(shippingErrors.address)}
                          aria-describedby={
                            shippingErrors.address ? "address-error" : undefined
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        {shippingErrors.address ? (
                          <p
                            id="address-error"
                            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                          >
                            {shippingErrors.address}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Apt, Suite (optional) */}
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="apt-suite"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        Apt, Suite (optional)
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="aptSuite"
                          id="apt-suite"
                          value={shippingForm.aptSuite}
                          onChange={(e) =>
                            updateShippingField("aptSuite", e.target.value)
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        City
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={shippingForm.city}
                          onChange={(e) =>
                            updateShippingField("city", e.target.value)
                          }
                          autoComplete="address-level2"
                          required
                          aria-invalid={Boolean(shippingErrors.city)}
                          aria-describedby={
                            shippingErrors.city ? "city-error" : undefined
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        {shippingErrors.city ? (
                          <p
                            id="city-error"
                            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                          >
                            {shippingErrors.city}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Country */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        Country
                      </label>
                      <div className="mt-1.5 relative">
                        <select
                          id="country"
                          name="country"
                          value={shippingForm.country}
                          onChange={(e) =>
                            updateShippingField("country", e.target.value)
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 appearance-none pr-10"
                        >
                          <option value="IN">India</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="sm:hidden h-5 w-5 text-neutral-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                            />
                          </svg>
                          <svg
                            className="hidden sm:block h-5 w-5 text-neutral-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* State/Province */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        State/Province
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="stateProvince"
                          id="state"
                          value={shippingForm.stateProvince}
                          onChange={(e) =>
                            updateShippingField("stateProvince", e.target.value)
                          }
                          autoComplete="address-level1"
                          required
                          aria-invalid={Boolean(shippingErrors.stateProvince)}
                          aria-describedby={
                            shippingErrors.stateProvince
                              ? "state-error"
                              : undefined
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        {shippingErrors.stateProvince ? (
                          <p
                            id="state-error"
                            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                          >
                            {shippingErrors.stateProvince}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Postal code */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="postal-code"
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left"
                      >
                        Postal code
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="postalCode"
                          id="postal-code"
                          value={shippingForm.postalCode}
                          onChange={(e) =>
                            updateShippingField("postalCode", e.target.value)
                          }
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={6}
                          required
                          aria-invalid={Boolean(shippingErrors.postalCode)}
                          aria-describedby={
                            shippingErrors.postalCode
                              ? "postal-code-error"
                              : undefined
                          }
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        {shippingErrors.postalCode ? (
                          <p
                            id="postal-code-error"
                            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                          >
                            {shippingErrors.postalCode}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Address type & Buttons Wrapper */}
                    <div className="sm:col-span-12 text-left">
                      {/* Address type */}
                      <div className="max-w-lg mb-8 text-left">
                        <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                          Address type
                        </label>
                        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:gap-8">
                          <label className="flex items-center cursor-pointer select-none">
                            <input
                              type="radio"
                              name="addressType"
                              value="Home"
                              checked={shippingForm.addressType === "Home"}
                              onChange={() =>
                                updateShippingField("addressType", "Home")
                              }
                              className="sr-only"
                            />
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-neutral-950 transition-all ${shippingForm.addressType === "Home" ? "border-[6px] border-neutral-900 dark:border-neutral-100" : "border-2 border-neutral-300 dark:border-neutral-600"}`}
                            />
                            <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Home{" "}
                              <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                                (All Day Delivery)
                              </span>
                            </span>
                          </label>

                          <label className="flex items-center cursor-pointer select-none">
                            <input
                              type="radio"
                              name="addressType"
                              value="Office"
                              checked={shippingForm.addressType === "Office"}
                              onChange={() =>
                                updateShippingField("addressType", "Office")
                              }
                              className="sr-only"
                            />
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-neutral-950 transition-all ${shippingForm.addressType === "Office" ? "border-[6px] border-neutral-900 dark:border-neutral-100" : "border-2 border-neutral-300 dark:border-neutral-600"}`}
                            />
                            <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Office{" "}
                              <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                                (Delivery 9 AM - 5 PM)
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-4 pt-6 text-left items-start sm:flex-row sm:gap-2.5 sm:items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (validateAndRevealShipping()) setActiveTab(1);
                          }}
                          className="relative inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors w-auto min-w-56 sm:min-w-0"
                        >
                          Next to payment method
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab(1)}
                          className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-[15px] py-[9px] sm:px-6 sm:py-3 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-neutral-600 sm:hover:bg-neutral-100 sm:dark:hover:bg-neutral-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PAYMENT METHOD (RAZORPAY) ── */}
              <div
                id="PaymentMethod"
                className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    color="currentColor"
                    className="sm:mt-1.5"
                  >
                    <path
                      d="M3.3457 16.1976L16.1747 3.36866M18.6316 11.0556L14.5549 15.1099L13.5762 16.0886"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M3.17467 16.1411C1.60844 14.5749 1.60844 12.0355 3.17467 10.4693L10.4693 3.17467C12.0355 1.60844 14.5749 1.60844 16.1411 3.17467L20.8253 7.85891C22.3916 9.42514 22.3916 11.9645 20.8253 13.5307L13.5307 20.8253C11.9645 22.3916 9.42514 22.3916 7.85891 20.8253L3.17467 16.1411Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M4 22H20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    ></path>
                  </svg>
                  <div className="sm:pl-3">
                    <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
                      <span className="tracking-tight uppercase">
                        Payment method
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        color="currentColor"
                        className="mb-1 text-sky-500"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </h3>
                    <div className="mt-1 text-sm font-semibold">
                      Razorpay Secure Checkout
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab(1)}
                    className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    type="button"
                  >
                    Change
                  </button>
                </div>

                {/* Razorpay Payment Section */}
                <div
                  className={`border-t border-neutral-200 px-4 py-7 sm:px-6 dark:border-neutral-700 ${activeTab !== 1 ? "hidden" : ""}`}
                >
                  <div className="space-y-6">
                    {/* Razorpay Logo & Branding */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 56 56"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="56" height="56" rx="12" fill="#072654" />
                          <path
                            d="M33.37 16L23.5 40H27.12L30.04 32.59L36.98 16H33.37Z"
                            fill="#3395FF"
                          />
                          <path
                            d="M19.02 40H22.64L28.89 23.41L25.83 22L19.02 40Z"
                            fill="white"
                          />
                        </svg>
                        <div>
                          <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            Razorpay
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Secure Payment Gateway
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="rounded-xl bg-gradient-to-br from-[#072654]/[0.04] to-[#3395FF]/[0.06] dark:from-[#072654]/30 dark:to-[#3395FF]/10 border border-[#3395FF]/10 dark:border-[#3395FF]/20 p-5">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 text-left leading-relaxed">
                        You will be securely redirected to Razorpay's payment
                        page to complete your purchase. All payment information
                        is handled by Razorpay — we never store your card or
                        bank details.
                      </p>
                    </div>

                    {/* Supported Payment Methods */}
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                        Accepted payment methods
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* UPI */}
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3.5 bg-white dark:bg-neutral-800/50 transition-colors hover:border-[#3395FF]/30">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-green-600 dark:text-green-400"
                            >
                              <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 12L11 15L16 9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              UPI
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              GPay, PhonePe
                            </p>
                          </div>
                        </div>

                        {/* Cards */}
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3.5 bg-white dark:bg-neutral-800/50 transition-colors hover:border-[#3395FF]/30">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-blue-600 dark:text-blue-400"
                            >
                              <rect
                                x="2"
                                y="5"
                                width="20"
                                height="14"
                                rx="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 10H22"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6 15H10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Cards
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              Visa, Mastercard
                            </p>
                          </div>
                        </div>

                        {/* Net Banking */}
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3.5 bg-white dark:bg-neutral-800/50 transition-colors hover:border-[#3395FF]/30">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-purple-600 dark:text-purple-400"
                            >
                              <path
                                d="M3 21H21"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M3 10H21"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5 6L12 3L19 6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4 10V21"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M20 10V21"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 14V17"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 14V17"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M16 14V17"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Net Banking
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              All major banks
                            </p>
                          </div>
                        </div>

                        {/* Wallets */}
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3.5 bg-white dark:bg-neutral-800/50 transition-colors hover:border-[#3395FF]/30">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-amber-600 dark:text-amber-400"
                            >
                              <path
                                d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M21 11H17C15.8954 11 15 11.8954 15 13C15 14.1046 15.8954 15 17 15H21"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M17 7V5C17 3.89543 16.1046 3 15 3H7C5.89543 3 5 3.89543 5 5V7"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Wallets
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              Paytm, Amazon
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-2.5 text-left">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-green-600 dark:text-green-400 shrink-0"
                      >
                        <path
                          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 12L11 14L15 10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Protected by Razorpay's{" "}
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          256-bit SSL encryption
                        </span>{" "}
                        &amp; PCI DSS Level 1 compliance
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for Payment Method */}
                  <div className="flex flex-col gap-4 pt-6 text-left items-start sm:flex-row sm:gap-2.5 sm:items-center sm:border-t border-neutral-200 dark:border-neutral-700 mt-8">
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={isPaymentBusy}
                      className="relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium text-white transition-all w-auto min-w-56 sm:min-w-0 hover:opacity-90 active:scale-[0.98]"
                      style={{
                        background:
                          "linear-gradient(135deg, #072654 0%, #1a3f7a 50%, #3395FF 100%)",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0"
                      >
                        <path
                          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {paymentLabels[paymentPhase] ?? paymentLabels.idle}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab(0)}
                      className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-[15px] py-[9px] sm:px-6 sm:py-3 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-neutral-600 sm:hover:bg-neutral-100 sm:dark:hover:bg-neutral-800 transition-colors"
                    >
                      Back to shipping address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:mx-16 dark:border-neutral-700"></div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[36%]">
            <div className="sticky top-28">
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                  fontSize: "18px",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Order summary
              </h3>

              {/* Product list */}
              <div className="mt-7 sm:divide-y divide-neutral-200/70 dark:divide-neutral-700/80">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex py-6 sm:py-10 xl:py-12 first:pt-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:w-32">
                      <img
                        src={PRODUCT_ASSETS_MAP[item.slug]?.image || item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                      <Link
                        to={`/products/${item.slug}`}
                        className="absolute inset-0"
                      ></Link>
                    </div>

                    {/* Product Details & Actions */}
                    <div className="ml-3 flex flex-1 flex-col sm:ml-6 text-left">
                      {/* Top section: Info + Price */}
                      <div>
                        <div className="flex justify-between">
                          <div className="flex-[1.5]">
                            <h3 className="text-base font-semibold">
                              <Link to={`/products/${item.slug}`}>
                                {item.name}
                              </Link>
                            </h3>
                            <div className="mt-1.5 flex text-sm text-neutral-600 dark:text-neutral-300 sm:mt-2.5 flex-row sm:items-center gap-x-4 sm:gap-x-0">
                              {/* Color */}
                              <div className="flex items-center gap-x-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-neutral-500 dark:text-neutral-400"
                                >
                                  <path d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.89805 2M10.9184 4.02587L19 12.1294" />
                                  <path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z" />
                                </svg>
                                <span>{item.color}</span>
                              </div>
                              {/* Separator */}
                              <span className="hidden sm:block mx-4 h-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                              {/* Size */}
                              <div className="flex items-center gap-x-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-neutral-500 dark:text-neutral-400"
                                >
                                  <path d="M4.00781 4.99913C4.59743 4.39256 6.16671 2.80849 7.00666 2.80849C7.84661 2.80849 9.41589 4.39256 10.0055 4.99913M7.00666 2.84907V21.9995" />
                                  <path d="M19.0023 13.995C19.6088 14.5846 22.0011 16.1538 22.0011 16.9937C22.0011 17.8336 19.6088 19.4028 19.0023 19.9923M21.1906 16.9939H1.99805" />
                                </svg>
                                <span>{item.size}</span>
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
                                  updateQuantity(
                                    item.id,
                                    newQty - item.quantity,
                                  );
                                }}
                                className="form-select rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center rounded-lg border border-green-500 sm:border-2 py-1 px-2 text-sm font-medium text-green-500">
                                <span className="leading-none">
                                  {formatInr(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Price Badge */}
                          <div className="hidden flex-1 justify-end sm:flex">
                            <div className="mt-0.5">
                              <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 text-sm font-medium text-green-500 h-fit">
                                <span className="leading-none">
                                  {formatInr(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom section: Quantity + Remove */}
                      <div className="mt-auto flex items-end justify-between pt-2 sm:pt-4 text-sm">
                        {/* Quantity Controls - Desktop */}
                        <div className="hidden text-center sm:block">
                          <div className="flex items-center justify-between gap-x-5 w-full">
                            <div className="flex items-center justify-between sm:w-28">
                              <button
                                className="flex size-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <span className="block flex-1 text-center leading-none select-none">
                                {item.quantity}
                              </span>
                              <button
                                className="flex size-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove link */}
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
                ))}
              </div>

              {items.length > 0 ? (
                <>
                  {/* Discount code */}
                  <div className="mt-8">
                    <label className="text-sm font-medium text-neutral-900 dark:text-neutral-300 text-left block">
                      Discount code
                    </label>
                    <div className="mt-1.5 flex gap-3">
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        disabled={Boolean(activePendingOrder)}
                        className="relative block w-full appearance-none rounded-full px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 placeholder:text-zinc-500 sm:text-sm/6 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(
                            "Coupon will be validated securely when you pay.",
                          )
                        }
                        disabled={Boolean(activePendingOrder)}
                        className="flex w-24 items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-50 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="mt-4">
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Subtotal
                      </span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatInr(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Shipping estimate
                      </span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatInr(shippingEstimate)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Tax estimate
                      </span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatInr(taxEstimate)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2.5">
                      <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        Order total
                      </span>
                      <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatInr(activePendingOrder?.total ?? orderTotal)}
                      </span>
                    </div>

                    {paymentError ? (
                      <p
                        role="alert"
                        className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
                      >
                        {paymentError}
                      </p>
                    ) : null}

                    {activePendingOrder ? (
                      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
                        Retrying payment for {activePendingOrder.orderNumber}.
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={isPaymentBusy}
                      className="mt-8 w-full rounded-full py-4 text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #072654 0%, #1a3f7a 50%, #3395FF 100%)",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0"
                      >
                        <path
                          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {paymentLabels[paymentPhase] ?? paymentLabels.idle}
                    </button>

                    <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                      <p
                        className="relative block pl-5"
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                        }}
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                          />
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
                        infomation
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty cart state */
                <div className="mt-10 flex flex-col items-center justify-center text-center py-12">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-neutral-400 dark:text-neutral-500"
                    >
                      <path
                        d="M7.5 7.67001V6.70001C7.5 4.45001 9.31 2.24001 11.56 2.03001C14.24 1.77001 16.5 3.88001 16.5 6.51001V7.89001"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H8C3.73 8 3.03 9.99 3.3 12.43L4.05 18.43C4.26 20.39 4.98 22 9 22Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.4955 12H15.5045"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M8.49451 12H8.50349"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                    Your cart is empty
                  </h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                    Add items to your cart to checkout
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Continue Shopping
                  </Link>
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
