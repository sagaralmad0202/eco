const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let checkoutPromise;

// Loaded only after a customer clicks Pay, keeping a third-party script out of
// the initial bundle and avoiding all window access during non-browser renders.
export function loadRazorpayCheckout() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout requires a browser"));
  }

  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (checkoutPromise) return checkoutPromise;

  checkoutPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");

    const loaded = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay Checkout did not initialize"));
    };
    const failed = () => {
      checkoutPromise = undefined;
      reject(new Error("Could not load Razorpay Checkout"));
    };

    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", failed, { once: true });

    if (!existing) {
      script.src = CHECKOUT_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return checkoutPromise;
}
