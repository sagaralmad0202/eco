import { useState } from "react";

const ACCORDION_ITEMS = [
  {
    title: "Description",
    defaultOpen: true,
    content: (
      <div>
        Fashion is a form of self-expression and autonomy at a particular period
        and place and in a specific context, of clothing, footwear, lifestyle,
        accessories, makeup, hairstyle, and body posture.
      </div>
    ),
  },
  {
    title: "Fabric + Care",
    defaultOpen: true,
    content: (
      <div>
        <ul className="list-disc list-inside leading-7">
          <li>Made from a sheer Belgian power micromesh.</li>
          <li>74% Polyamide (Nylon) 26% Elastane (Spandex)</li>
          <li>Adjustable hook &amp; eye closure and straps</li>
          <li>Hand wash in cold water, dry flat</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How it Fits",
    defaultOpen: false,
    content: (
      <div>
        <p>
          Use this as a guide. Preference is a personal thing, so if you're not
          sure which size you'd prefer, check out the reviews below for more
          insights.
        </p>
        <ul className="list-disc list-inside leading-7 mt-2">
          <li>True to size. Take your normal size.</li>
          <li>Designed for a slim, tailored fit.</li>
          <li>Mid-weight fabric with natural stretch.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "FAQ",
    defaultOpen: false,
    content: (
      <div>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              How long does delivery take?
            </p>
            <p className="mt-1">
              Delivery takes 3-5 business days for domestic orders and 7-14 days
              for international orders.
            </p>
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              What is your return policy?
            </p>
            <p className="mt-1">
              We accept returns within 60 days of purchase. Items must be in
              original condition with tags attached.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

function AccordionItem({ title, defaultOpen, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div data-headlessui-state={isOpen ? "open" : ""}>
      <button
        className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-neutral-500/75 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? (
          /* Minus icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14"
            />
          </svg>
        ) : (
          /* Plus icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductAccordion() {
  return (
    <div className="w-full space-y-2.5 rounded-2xl">
      {ACCORDION_ITEMS.map((item) => (
        <AccordionItem
          key={item.title}
          title={item.title}
          defaultOpen={item.defaultOpen}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
