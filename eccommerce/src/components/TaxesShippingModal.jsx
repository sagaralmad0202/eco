import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function TaxesShippingModal({
  isOpen,
  onClose,
  initialTab = "shipping", // 'shipping' | 'taxes'
  shippingEstimate = 5,
  taxEstimate = 0,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  // Sync tab when modal opens or initialTab changes
  if (isOpen !== prevIsOpen || initialTab !== prevInitialTab) {
    setPrevIsOpen(isOpen);
    setPrevInitialTab(initialTab);
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }

  // Handle ESC key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="taxes-shipping-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10 text-left transition-all z-10"
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <h2
            id="taxes-shipping-modal-title"
            className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white"
          >
            Shipping & Taxes
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800 my-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
              activeTab === "shipping"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Shipping
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("taxes")}
            className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
              activeTab === "taxes"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Taxes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "shipping" ? (
          <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                  Standard Delivery
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">3 – 5 business days</p>
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                ${Number(shippingEstimate || 5).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                  Express Delivery
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">1 – 2 business days</p>
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                $15.00
              </span>
            </div>

            <ul className="space-y-2 pt-1 text-neutral-500 dark:text-neutral-400 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span><strong>Free shipping</strong> on orders over $100.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Tracking link sent via SMS and email after dispatch.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0"></span>
                <span>Easy 7-day returns with doorstep pickup.</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                  Tax Estimate (10%)
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Estimated on items in cart</p>
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                ${Number(taxEstimate).toFixed(2)}
              </span>
            </div>

            <ul className="space-y-2 pt-1 text-neutral-500 dark:text-neutral-400 text-xs">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>Exact taxes are calculated when you enter your shipping address.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>Itemized invoice with tax breakdown is emailed upon order confirmation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>Taxes paid on returned items are 100% refunded.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Footer Button */}
        <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
