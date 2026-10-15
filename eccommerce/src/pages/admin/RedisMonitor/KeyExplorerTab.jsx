import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function KeyExplorerTab({
  keysData,
  onSearch,
  onSelectKey,
  onDeleteKey,
  isLoading,
  liveEvents = [],
}) {
  const [patternInput, setPatternInput] = useState("cache:*");
  const [typeFilter, setTypeFilter] = useState("");
  const [cursorHistory, setCursorHistory] = useState(["0"]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);

  // Continuous auto-scan states
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [scanIntervalSec, setScanIntervalSec] = useState(2);
  const [lastScanTime, setLastScanTime] = useState(new Date());
  const [scanCycles, setScanCycles] = useState(0);
  const [isBackgroundScanning, setIsBackgroundScanning] = useState(false);

  // Local keys for real-time second-by-second countdown and new key highlighting
  const [localKeys, setLocalKeys] = useState(keysData?.keys || []);
  const [newlyAddedKeys, setNewlyAddedKeys] = useState(new Set());
  const prevKeysRef = useRef(new Set());

  // Update local keys when keysData changes from scan
  useEffect(() => {
    const incomingKeys = keysData?.keys || [];
    const currentKeysSet = new Set(incomingKeys.map((k) => k.key));
    const newlySeen = new Set();

    if (prevKeysRef.current.size > 0) {
      currentKeysSet.forEach((k) => {
        if (!prevKeysRef.current.has(k)) {
          newlySeen.add(k);
        }
      });
    }

    if (newlySeen.size > 0) {
      setNewlyAddedKeys(newlySeen);
      setTimeout(() => {
        setNewlyAddedKeys(new Set());
      }, 3500);
    }

    prevKeysRef.current = currentKeysSet;
    setLocalKeys(incomingKeys);
  }, [keysData]);

  const handleDeleteKeyClick = (e, key) => {
    e.stopPropagation();
    // Immediate optimistic removal from view
    setLocalKeys((prev) => prev.filter((item) => item.key !== key));
    onDeleteKey(key);
  };

  // Real-time second-by-second countdown for remaining TTL
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setLocalKeys((prev) =>
        prev.map((item) => {
          if (item.ttl > 0) {
            const nextTtl = item.ttl - 1;
            return {
              ...item,
              ttl: nextTtl,
              isExpiringSoon: nextTtl > 0 && nextTtl <= 60,
            };
          }
          return item;
        }),
      );
    }, 1000);

    return () => clearInterval(tickTimer);
  }, []);

  // Safe scanner invocation
  const triggerScan = useCallback(
    async (isBackground = false) => {
      if (isBackground) setIsBackgroundScanning(true);
      try {
        const cursor = cursorHistory[currentCursorIndex] || "0";
        await onSearch({ pattern: patternInput, cursor, type: typeFilter }, isBackground);
        setLastScanTime(new Date());
        setScanCycles((c) => c + 1);
      } finally {
        if (isBackground) setIsBackgroundScanning(false);
      }
    },
    [onSearch, patternInput, cursorHistory, currentCursorIndex, typeFilter],
  );

  // Continuous background auto-scan loop
  useEffect(() => {
    if (!isAutoScanning) return;

    const intervalTimer = setInterval(() => {
      triggerScan(true);
    }, scanIntervalSec * 1000);

    return () => clearInterval(intervalTimer);
  }, [isAutoScanning, scanIntervalSec, triggerScan]);

  // Smart Event-Driven Scan: When SSE live event arrives, immediately refresh keys in background
  const latestEvent = liveEvents?.[0];
  const lastEventHandledRef = useRef(null);
  useEffect(() => {
    if (!isAutoScanning || !latestEvent) return;
    if (latestEvent.id === lastEventHandledRef.current) return;
    lastEventHandledRef.current = latestEvent.id;

    if (["set", "del", "delPattern", "expired"].includes(latestEvent.action)) {
      triggerScan(true);
    }
  }, [latestEvent, isAutoScanning, triggerScan]);

  const presets = [
    { label: "All Cache Keys", pattern: "cache:*" },
    { label: "Product Details", pattern: "cache:product:*" },
    { label: "Product Listings", pattern: "cache:products:list:*" },
    { label: "Category Tree", pattern: "cache:categories:*" },
    { label: "Reviews", pattern: "cache:review:summary:*" },
    { label: "User Profiles", pattern: "cache:user:profile:*" },
  ];

  const handleApplyPreset = (pat) => {
    setPatternInput(pat);
    setCursorHistory(["0"]);
    setCurrentCursorIndex(0);
    onSearch({ pattern: pat, cursor: "0", type: typeFilter }, false);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setCursorHistory(["0"]);
    setCurrentCursorIndex(0);
    triggerScan(false);
  };

  const handleNextPage = () => {
    if (!keysData?.nextCursor || keysData.nextCursor === "0") return;
    const nextCursor = keysData.nextCursor;
    setCursorHistory((prev) => [...prev, nextCursor]);
    setCurrentCursorIndex((prev) => prev + 1);
    onSearch({ pattern: patternInput, cursor: nextCursor, type: typeFilter }, false);
  };

  const handlePrevPage = () => {
    if (currentCursorIndex <= 0) return;
    const prevIndex = currentCursorIndex - 1;
    const prevCursor = cursorHistory[prevIndex] || "0";
    setCurrentCursorIndex(prevIndex);
    onSearch({ pattern: patternInput, cursor: prevCursor, type: typeFilter }, false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Key copied to clipboard");
  };

  const formatBytes = (bytes) => {
    if (bytes === null || bytes === undefined) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTtl = (ttl) => {
    if (ttl === -1)
      return <span className="text-neutral-400 font-sans">Persistent (no TTL)</span>;
    if (ttl === -2 || ttl <= 0)
      return (
        <span className="inline-flex items-center gap-1 font-mono text-rose-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          Expired / Evicting
        </span>
      );

    const mins = Math.floor(ttl / 60);
    const secs = ttl % 60;
    const isUrgent = ttl <= 60;
    const isCritical = ttl <= 15;

    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium ${
          isCritical
            ? "text-rose-400 font-bold animate-pulse"
            : isUrgent
              ? "text-amber-400 font-bold"
              : "text-neutral-200"
        }`}
      >
        <ClockIcon className="w-3.5 h-3.5" />
        {mins > 0 ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Pattern filter & Preset Chips */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <MagnifyingGlassIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={patternInput}
              onChange={(e) => setPatternInput(e.target.value)}
              placeholder="SCAN MATCH pattern (e.g. cache:product:*)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              onSearch({ pattern: patternInput, cursor: "0", type: e.target.value }, false);
            }}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Data Types</option>
            <option value="STRING">STRING</option>
            <option value="HASH">HASH</option>
            <option value="LIST">LIST</option>
            <option value="SET">SET</option>
            <option value="ZSET">ZSET</option>
          </select>

          {/* Continuous Auto-Scan Toggle Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => setIsAutoScanning(!isAutoScanning)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isAutoScanning
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
              }`}
              title={isAutoScanning ? "Click to Pause Continuous Scanning" : "Click to Start Continuous Scanning"}
            >
              {isAutoScanning ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Continuous ON</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-3.5 h-3.5" />
                  <span>Auto-Scan PAUSED</span>
                </>
              )}
            </button>

            {/* Scan Frequency Selectors */}
            <div className="flex items-center gap-1 pl-1 border-l border-neutral-800 text-[11px]">
              {[1, 2, 3, 5].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setScanIntervalSec(sec);
                    if (!isAutoScanning) setIsAutoScanning(true);
                  }}
                  className={`px-2 py-1 rounded-md font-mono transition ${
                    scanIntervalSec === sec && isAutoScanning
                      ? "bg-neutral-800 text-emerald-400 font-bold border border-emerald-500/30"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title={`Scan every ${sec} second${sec > 1 ? "s" : ""}`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Manual Scan Now Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition border border-neutral-700"
            title="Scan Redis keyspace now"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoading || isBackgroundScanning ? "animate-spin text-emerald-400" : ""}`} />
            Scan Now
          </button>
        </form>

        {/* Preset chips & Live continuous status banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-neutral-500 mr-1">Namespaces:</span>
            {presets.map((p) => (
              <button
                key={p.pattern}
                type="button"
                onClick={() => handleApplyPreset(p.pattern)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  patternInput === p.pattern
                    ? "bg-neutral-800 text-emerald-400 border border-emerald-500/40"
                    : "bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
            {isAutoScanning ? (
              <span className="flex items-center gap-1.5 text-emerald-400/90">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isBackgroundScanning ? "animate-ping" : ""}`} />
                Scanning every {scanIntervalSec}s (cycle #{scanCycles})
              </span>
            ) : (
              <span className="text-neutral-500">Auto-scan paused</span>
            )}
            <span>•</span>
            <span>Last scan: {lastScanTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Key Name</th>
                <th className="py-3 px-4">Redis Type</th>
                <th className="py-3 px-4">Remaining TTL</th>
                <th className="py-3 px-4">Memory</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {!localKeys || localKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-sans">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 animate-spin text-emerald-500" />
                        Scanning Redis keyspace...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>No keys discovered matching pattern in current scan page.</p>
                        <p className="text-xs text-neutral-600">
                          Continuous scanner is actively watching for newly cached keys.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                localKeys.map((k) => {
                  const isNew = newlyAddedKeys.has(k.key);
                  return (
                    <tr
                      key={k.key}
                      className={`hover:bg-neutral-800/40 transition-all duration-300 group cursor-pointer ${
                        isNew ? "bg-emerald-500/10 border-l-2 border-emerald-400" : ""
                      }`}
                      onClick={() => onSelectKey(k.key)}
                    >
                      <td className="py-3 px-4 font-medium text-white max-w-md truncate">
                        <div className="flex items-center gap-2">
                          {isNew && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black uppercase tracking-wider shadow-sm animate-pulse">
                              <SparklesIcon className="w-3 h-3" /> NEW
                            </span>
                          )}
                          <span className="truncate hover:text-emerald-400 transition" title={k.key}>
                            {k.key}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(k.key);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white transition"
                            title="Copy key"
                          >
                            <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-sky-400 border border-neutral-700">
                          {k.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatTtl(k.ttl)}
                      </td>
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                        {formatBytes(k.memoryBytes)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-sans">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectKey(k.key)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs transition"
                          >
                            <EyeIcon className="w-3.5 h-3.5 text-neutral-400" /> Inspect
                          </button>
                          <button
                            onClick={(e) => handleDeleteKeyClick(e, k.key)}
                            className="p-1 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 rounded-lg transition"
                            title="Delete Key"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-t border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <div>
              Showing <strong className="text-white">{localKeys?.length || 0}</strong> keys • Cursor:{" "}
              <span className="font-mono text-neutral-300">{cursorHistory[currentCursorIndex]}</span>
            </div>
            {isBackgroundScanning && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <ArrowPathIcon className="w-3 h-3 animate-spin" /> Scanning...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentCursorIndex <= 0 || isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 rounded-lg transition"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!keysData?.hasMore || isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 rounded-lg transition"
            >
              Next <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
