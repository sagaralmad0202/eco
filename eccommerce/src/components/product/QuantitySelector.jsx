import { useState } from "react";

export default function QuantitySelector({ onChange }) {
  const [quantity, setQuantity] = useState(1);

  const decrement = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onChange?.(newQty);
    }
  };

  const increment = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onChange?.(newQty);
  };

  return (
    <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
      <div className="flex items-center justify-between gap-x-5 w-full">
        <div className="flex w-26 items-center justify-between sm:w-28">
          <button
            className="flex size-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-hidden disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
            type="button"
            disabled={quantity <= 1}
            onClick={decrement}
            aria-label="Decrease quantity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <input type="hidden" name="quantity" value={quantity} />
          <span className="block flex-1 text-center leading-none select-none">
            {quantity}
          </span>
          <button
            className="flex size-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-hidden disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
            type="button"
            onClick={increment}
            aria-label="Increase quantity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-4"
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
  );
}
