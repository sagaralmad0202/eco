import React, { useState } from "react";
import {
  XMarkIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function DataInspectorDrawer({
  keyDetail,
  isOpen,
  onClose,
  onDeleteKey,
  onRefresh,
  isLoading,
}) {
  const [activeView, setActiveView] = useState("formatted"); // 'formatted' | 'raw'

  if (!isOpen || !keyDetail) return null;

  const copyJson = () => {
    try {
      const text =
        typeof keyDetail.value === "object"
          ? JSON.stringify(keyDetail.value, null, 2)
          : String(keyDetail.value);
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formatTtl = (ttl) => {
    if (ttl === -1) return "Persistent (No Expiry)";
    if (ttl === -2) return "Expired / Missing";
    const m = Math.floor(ttl / 60);
    const s = ttl % 60;
    return `${m > 0 ? `${m}m ` : ""}${s}s remaining (${ttl}s)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between bg-neutral-950/60">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                {keyDetail.type || "STRING"}
              </span>
              <span className="text-xs text-neutral-400">Redis Data Inspector</span>
            </div>
            <h2 className="text-sm font-mono font-bold text-white break-all">{keyDetail.key}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metadata Stats Bar */}
        <div className="grid grid-cols-3 divide-x divide-neutral-800 border-b border-neutral-800 bg-neutral-900/40 text-xs">
          <div className="p-3 text-center">
            <span className="text-[11px] text-neutral-500 block">Remaining TTL</span>
            <span className="font-mono font-semibold text-emerald-400">{formatTtl(keyDetail.ttl)}</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-[11px] text-neutral-500 block">Memory Size</span>
            <span className="font-mono font-semibold text-neutral-200">
              {keyDetail.memoryBytes ? `${(keyDetail.memoryBytes / 1024).toFixed(1)} KB` : "N/A"}
            </span>
          </div>
          <div className="p-3 text-center">
            <span className="text-[11px] text-neutral-500 block">Elements / Fields</span>
            <span className="font-mono font-semibold text-neutral-200">{keyDetail.itemCount ?? 1}</span>
          </div>
        </div>

        {/* Security / Redaction Notice */}
        <div className="px-5 py-2.5 bg-neutral-950/40 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>Sensitive tokens, passwords, and secrets are automatically redacted.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("formatted")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                activeView === "formatted"
                  ? "bg-neutral-800 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Formatted
            </button>
            <button
              onClick={() => setActiveView("raw")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                activeView === "raw"
                  ? "bg-neutral-800 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Raw JSON
            </button>
          </div>
        </div>

        {/* Value Content Area */}
        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-neutral-200 bg-neutral-950/80">
          {keyDetail.found === false ? (
            <div className="p-8 text-center text-neutral-500 font-sans">
              <InformationCircleIcon className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
              This key does not exist or has expired from Redis.
            </div>
          ) : activeView === "raw" ? (
            <pre className="whitespace-pre-wrap break-all text-neutral-300 bg-neutral-900 p-4 rounded-xl border border-neutral-800 selection:bg-emerald-500 selection:text-black">
              {JSON.stringify(keyDetail.value, null, 2)}
            </pre>
          ) : typeof keyDetail.value === "object" && keyDetail.value !== null ? (
            <div className="space-y-2">
              {Array.isArray(keyDetail.value) ? (
                <div className="space-y-1.5">
                  <span className="text-neutral-500 font-sans text-xs">Array [{keyDetail.value.length} items]:</span>
                  {keyDetail.value.map((item, idx) => (
                    <div key={idx} className="bg-neutral-900/90 border border-neutral-800/80 p-3 rounded-xl">
                      <span className="text-neutral-500 mr-2 text-[11px]">[{idx}]</span>
                      <pre className="inline whitespace-pre-wrap text-emerald-400">
                        {typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl divide-y divide-neutral-800/60 overflow-hidden">
                  {Object.entries(keyDetail.value).map(([k, v]) => (
                    <div key={k} className="p-2.5 flex items-start justify-between gap-4 hover:bg-neutral-800/30">
                      <span className="text-sky-300 font-semibold">{k}</span>
                      <span className="text-right text-neutral-300 break-all max-w-sm">
                        {v === "[REDACTED]" ? (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            [REDACTED]
                          </span>
                        ) : typeof v === "object" && v !== null ? (
                          <pre className="text-left text-xs text-neutral-300 bg-neutral-950 p-2 rounded">
                            {JSON.stringify(v, null, 2)}
                          </pre>
                        ) : (
                          String(v)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 break-all">
              {String(keyDetail.value)}
            </div>
          )}

          {/* Lifecycle history attached to key */}
          {keyDetail.lifecycleHistory && keyDetail.lifecycleHistory.length > 0 && (
            <div className="mt-6 pt-5 border-t border-neutral-800 font-sans">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Recorded Key History ({keyDetail.lifecycleHistory.length} events)
              </h3>
              <div className="space-y-2">
                {keyDetail.lifecycleHistory.map((evt) => (
                  <div key={evt.id} className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-semibold text-white">{evt.type}</span>
                    </div>
                    <span className="text-neutral-400 font-mono text-[11px]">{evt.durationMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={copyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition border border-neutral-700"
            >
              <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Copy JSON
            </button>
            <button
              onClick={() => onRefresh?.(keyDetail.key)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition border border-neutral-700"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh Key
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete cache key:\n${keyDetail.key}?`)) {
                onDeleteKey(keyDetail.key);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
          >
            <TrashIcon className="w-3.5 h-3.5" /> Delete from Redis
          </button>
        </div>
      </div>
    </div>
  );
}
