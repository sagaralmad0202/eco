import React, { useState } from "react";
import {
  TrashIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function CacheManagementTab({
  onDeleteKey,
  onInvalidatePattern,
  auditLog = [],
  isLoading,
}) {
  const [selectedPattern, setSelectedPattern] = useState("cache:products:list:*");
  const [singleKeyInput, setSingleKeyInput] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    actionType: null, // 'single' | 'pattern'
    target: "",
  });

  const supportedPatterns = [
    {
      pattern: "cache:products:list:*",
      title: "All Product Listings",
      description: "Invalidates all paginated, sorted, and filtered catalogue queries.",
      impact: "Triggers fresh DB queries on subsequent category/shop page loads.",
    },
    {
      pattern: "cache:categories:*",
      title: "Category Navigation Tree",
      description: "Invalidates the category hierarchy and product count aggregates.",
      impact: "Home page and mega-menu refresh their category counts on next visit.",
    },
    {
      pattern: "cache:product:*",
      title: "All Product Details & Slugs",
      description: "Invalidates all individual product detail pages and variant snapshots.",
      impact: "Product pages fall back to PostgreSQL and re-warm the cache.",
    },
    {
      pattern: "cache:review:summary:*",
      title: "All Product Review Summaries",
      description: "Invalidates rating distributions and star counts for all products.",
      impact: "Review widgets re-calculate ratings from authoritative DB rows.",
    },
    {
      pattern: "cache:user:profile:*",
      title: "User Profile Caches",
      description: "Invalidates cached customer profile objects.",
      impact: "Account pages fetch fresh user rows from PostgreSQL.",
    },
  ];

  const handleOpenPatternConfirm = () => {
    if (!selectedPattern) return;
    setConfirmationModal({
      isOpen: true,
      actionType: "pattern",
      target: selectedPattern,
    });
  };

  const handleOpenSingleConfirm = (e) => {
    e.preventDefault();
    if (!singleKeyInput.trim()) return;
    setConfirmationModal({
      isOpen: true,
      actionType: "single",
      target: singleKeyInput.trim(),
    });
  };

  const handleConfirmAction = async () => {
    const { actionType, target } = confirmationModal;
    setConfirmationModal({ isOpen: false, actionType: null, target: "" });

    if (actionType === "single") {
      await onDeleteKey(target);
      setSingleKeyInput("");
    } else if (actionType === "pattern") {
      await onInvalidatePattern(target);
    }
  };

  return (
    <div className="space-y-6">
      {/* Safety Notice Banner */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
          <ShieldExclamationIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white tracking-tight">
            Safe Administrative Cache Controls
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All destructive actions operate incrementally using non-blocking Redis <code className="text-neutral-200">SCAN</code> + <code className="text-neutral-200">UNLINK</code> to prevent CPU stalls in production. Unrestricted commands like <code className="text-rose-400">FLUSHALL</code> or <code className="text-rose-400">FLUSHDB</code> are strictly disallowed by system policy.
          </p>
        </div>
      </div>

      {/* Pattern Invalidation Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="border-b border-neutral-800 pb-4">
          <h3 className="text-sm font-bold text-white">Targeted Pattern Invalidation</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select an approved cache namespace to purge affected keys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportedPatterns.map((p) => (
            <div
              key={p.pattern}
              onClick={() => setSelectedPattern(p.pattern)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                selectedPattern === p.pattern
                  ? "bg-neutral-950 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                  : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{p.title}</span>
                  <input
                    type="radio"
                    checked={selectedPattern === p.pattern}
                    onChange={() => setSelectedPattern(p.pattern)}
                    className="accent-emerald-500"
                  />
                </div>
                <code className="text-[11px] font-mono text-emerald-400 block mb-2">{p.pattern}</code>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{p.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500">
                {p.impact}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Selected pattern: <code className="font-mono text-white">{selectedPattern}</code>
          </span>
          <button
            onClick={handleOpenPatternConfirm}
            disabled={isLoading || !selectedPattern}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <TrashIcon className="w-4 h-4" /> Invalidate Matching Keys
          </button>
        </div>
      </div>

      {/* Individual Key Invalidation */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800 pb-4">
          <h3 className="text-sm font-bold text-white">Purge Individual Cache Key</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Explicitly delete one specific key from Redis.
          </p>
        </div>

        <form onSubmit={handleOpenSingleConfirm} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={singleKeyInput}
            onChange={(e) => setSingleKeyInput(e.target.value)}
            placeholder="e.g. cache:product:slug:leather-tote-bag"
            className="flex-1 min-w-[280px] bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !singleKeyInput.trim()}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 hover:text-white rounded-xl text-xs font-semibold transition border border-neutral-700"
          >
            Delete Key
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ExclamationTriangleIcon className="w-7 h-7" />
              <h3 className="text-base font-bold text-white">Confirm Cache Invalidation</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to execute cache invalidation on:
            </p>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-rose-300 break-all">
              {confirmationModal.target}
            </div>

            <p className="text-[11px] text-neutral-500">
              This action will unlink the keys from Redis. Subsequent customer requests will query PostgreSQL to re-populate the cache.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmationModal({ isOpen: false, actionType: null, target: "" })}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Yes, Execute Invalidation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
