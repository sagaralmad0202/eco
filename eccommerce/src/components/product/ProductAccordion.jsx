import { useState } from "react";

const ACCORDION_ITEMS = [
  {
    title: "Shipping & Delivery",
    defaultOpen: true,
    content: (
      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
        <p>• <strong>Standard Shipping:</strong> 3–5 business days ($4.99, or free on orders over $50).</p>
        <p>• <strong>Express Delivery:</strong> 1–2 business days available at checkout.</p>
        <p>• Orders are dispatched within 24 hours Monday through Friday with full tracking details sent via email.</p>
      </div>
    ),
  },
  {
    title: "Returns & Exchanges",
    defaultOpen: false,
    content: (
      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
        <p>• We accept returns and exchanges within 30 days of delivery.</p>
        <p>• Items must be returned in their original condition, unworn, unwashed, and with all product tags attached.</p>
        <p>• Free prepaid drop-off labels are generated instantly through your account portal.</p>
      </div>
    ),
  },
  {
    title: "Materials & Care Instructions",
    defaultOpen: false,
    content: (
      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
        <p>• Spot clean gently with a soft, damp cloth and mild neutral cleanser.</p>
        <p>• Store in a breathable protective dust bag away from direct sunlight and heat.</p>
        <p>• Do not use harsh solvents, bleach, or abrasive brushes to clean delicate finishes.</p>
      </div>
    ),
  },
  {
    title: "Authenticity & Warranty",
    defaultOpen: false,
    content: (
      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
        <p>• 100% genuine product sourced directly from verified manufacturer workshops.</p>
        <p>• Covered by our 1-year limited craftsmanship guarantee against manufacturing defects.</p>
      </div>
    ),
  },
];

export default function ProductAccordion() {
  const [openItems, setOpenItems] = useState({
    "Shipping & Delivery": true,
  });

  const toggle = (title) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {ACCORDION_ITEMS.map((item) => {
        const isOpen = !!openItems[item.title];
        return (
          <div key={item.title} className="py-4">
            <button
              type="button"
              onClick={() => toggle(item.title)}
              className="flex w-full items-center justify-between text-left text-base font-semibold text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <span>{item.title}</span>
              <span className="ml-6 flex items-center">
                <svg
                  className={`size-5 transform transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>
            {isOpen && <div className="mt-4 pr-12">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
