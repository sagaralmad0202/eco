import React, { useState, useMemo } from "react";
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function LiveActivityTab({
  events,
  isPaused,
  onTogglePause,
  onClearEvents,
  onSelectKey,
  onInspectEvent,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [autoScroll, setAutoScroll] = useState(true);

  const eventTypes = [
    { label: "All Events", value: "ALL" },
    { label: "Hits", value: "CACHE_HIT" },
    { label: "Misses", value: "CACHE_MISS" },
    { label: "Writes (SET)", value: "CACHE_SET" },
    { label: "Deletes", value: "CACHE_DELETE" },
    { label: "Invalidations", value: "CACHE_INVALIDATE" },
    { label: "Errors", value: "CACHE_ERROR" },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesType = selectedType === "ALL" || e.type === selectedType;
      const matchesSearch =
        !searchTerm ||
        e.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.caller && e.caller.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.correlationId && e.correlationId.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [events, selectedType, searchTerm]);

  const getBadgeStyle = (type) => {
    switch (type) {
      case "CACHE_HIT":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "CACHE_MISS":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "CACHE_SET":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "CACHE_DELETE":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "CACHE_INVALIDATE":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "CACHE_ERROR":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume button */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isPaused
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                : "bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            {isPaused ? (
              <>
                <PlayIcon className="w-4 h-4 text-emerald-400" /> Resume Stream
              </>
            ) : (
              <>
                <PauseIcon className="w-4 h-4 text-amber-400" /> Pause Stream
              </>
            )}
          </button>

          {/* Clear button */}
          <button
            onClick={onClearEvents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition border border-neutral-700"
            title="Clear current log view"
          >
            <TrashIcon className="w-3.5 h-3.5 text-neutral-400" /> Clear
          </button>

          {/* Event count */}
          <span className="text-xs text-neutral-400 px-2 font-mono">
            Buffered: <strong className="text-white">{events.length}</strong> events
            {isPaused && <span className="ml-2 text-amber-400 font-semibold">[PAUSED]</span>}
          </span>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search key or route..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 border border-neutral-800 rounded-xl overflow-x-auto max-w-full">
            {eventTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                  selectedType === t.value
                    ? "bg-emerald-500 text-white font-semibold shadow"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Stream Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-950/80 sticky top-0 z-10 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Cache Key</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Caller / Context</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-sans">
                    No cache events matching current filters.
                    <div className="text-xs text-neutral-600 mt-1">
                      Interact with your e-commerce storefront to watch live Redis operations stream in real time.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.slice().reverse().map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                    onClick={() => onInspectEvent?.(e)}
                  >
                    <td className="py-2.5 px-4 text-neutral-400 whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleTimeString([], {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                      <span className="text-[10px] text-neutral-600 ml-1">
                        .{String(new Date(e.timestamp).getMilliseconds()).padStart(3, "0")}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${getBadgeStyle(e.type)}`}>
                        {e.type.replace("CACHE_", "")}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-white font-medium max-w-xs truncate" title={e.key}>
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          if (!e.key.includes("*")) onSelectKey?.(e.key);
                        }}
                        className="hover:text-emerald-400 hover:underline text-left"
                      >
                        {e.key}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                        e.source === "cache"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {e.source === "cache" ? "⚡ Redis Memory" : "🗄️ PostgreSQL DB"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`text-[11px] ${
                        e.durationMs <= 1 ? "text-emerald-400" : e.durationMs <= 10 ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {e.durationMs}ms
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-400 max-w-[200px] truncate" title={e.caller || "default"}>
                      {e.caller || "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap font-sans">
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          onInspectEvent?.(e);
                        }}
                        className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
