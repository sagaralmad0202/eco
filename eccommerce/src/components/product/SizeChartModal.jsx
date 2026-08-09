import { useEffect } from "react";
import { createPortal } from "react-dom";

const SIZES_DATA = [
  {
    size: "XS",
    description: 'Chest: 32-34", Waist: 24-26"',
    measurements: 'Chest: 32-34", Waist: 24-26"',
  },
  {
    size: "S",
    description: 'Chest: 34-36", Waist: 26-28"',
    measurements: 'Chest: 34-36", Waist: 26-28"',
  },
  {
    size: "M",
    description: 'Chest: 38-40", Waist: 30-32"',
    measurements: 'Chest: 38-40", Waist: 30-32"',
  },
  {
    size: "L",
    description: 'Chest: 42-44", Waist: 34-36"',
    measurements: 'Chest: 42-44", Waist: 34-36"',
  },
  {
    size: "XL",
    description: 'Chest: 46-48", Waist: 38-40"',
    measurements: 'Chest: 46-48", Waist: 38-40"',
  },
];

export default function SizeChartModal({ isOpen, onClose }) {
  // Close on ESC key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with light 25% transparency matching Ciseco */}
      <div
        className="fixed inset-0 bg-zinc-950/25 dark:bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container - centered on screen */}
      <div className="fixed inset-0 z-[10000] w-screen overflow-y-auto pt-6 sm:pt-0">
        <div className="grid min-h-full grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr] p-4 sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
            className="sm:max-w-4xl row-start-2 w-full min-w-0 rounded-t-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-zinc-950/10 sm:mb-auto sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10 transition-all text-left"
            style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title and Description */}
            <div>
              <h2
                id="size-chart-title"
                className="text-lg sm:text-xl font-semibold text-balance text-zinc-950 dark:text-white"
              >
                Size Chart
              </h2>
              <p className="mt-2 text-pretty text-sm text-zinc-500 dark:text-zinc-400">
                Use the chart below to find your size. If you are between sizes, we recommend sizing up.
              </p>
            </div>

            {/* Size Chart Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    <th className="pb-4 font-medium">Size</th>
                    <th className="pb-4 font-medium">Description</th>
                    <th className="pb-4 font-medium">Measurements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                  {SIZES_DATA.map((item) => (
                    <tr key={item.size} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 font-semibold text-neutral-900 dark:text-neutral-100 pr-4">
                        {item.size}
                      </td>
                      <td className="py-4 text-neutral-600 dark:text-neutral-400 pr-4">
                        {item.description}
                      </td>
                      <td className="py-4 text-neutral-600 dark:text-neutral-400">
                        {item.measurements}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with Close Button */}
            <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-neutral-900 px-8 py-2.5 sm:py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
