import React, { useState, useEffect } from "react";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function TtlTimelineTab({ keys = [], onSelectKey, onRefresh, isLoading }) {
  // Live ticker for countdown rendering
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const categorizedKeys = {
    imminent: keys.filter((k) => k.ttl > 0 && k.ttl <= 60),
    moderate: keys.filter((k) => k.ttl > 60 && k.ttl <= 300),
    long: keys.filter((k) => k.ttl > 300),
    persistent: keys.filter((k) => k.ttl === -1),
    expired: keys.filter((k) => k.ttl === -2),
  };

  const getProgressPercent = (ttl, maxTtl = 600) => {
    if (ttl <= 0) return 0;
    return Math.min(100, Math.max(5, (ttl / maxTtl) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-emerald-400" />
            Cache Expiration & TTL Monitor
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time countdown of cached keys in Redis RAM, sorted by remaining lifetime.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition border border-neutral-700"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh TTLs
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-xl">
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
            Expiring Soon (&lt; 60s)
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {categorizedKeys.imminent.length}
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">
            Short TTL (1-5m)
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {categorizedKeys.moderate.length}
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">
            Standard TTL (&gt; 5m)
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {categorizedKeys.long.length}
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">
            Persistent (No TTL)
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {categorizedKeys.persistent.length}
          </span>
        </div>
      </div>

      {/* Imminent Expiration Warning Table */}
      {categorizedKeys.imminent.length > 0 && (
        <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Keys Close to Expiration</h3>
          </div>
          <div className="space-y-2">
            {categorizedKeys.imminent.map((k) => (
              <div
                key={k.key}
                onClick={() => onSelectKey?.(k.key)}
                className="p-3 bg-neutral-950/80 border border-amber-500/20 hover:border-amber-500/50 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition"
              >
                <div className="font-mono text-xs text-white truncate max-w-md">{k.key}</div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-amber-400">{k.ttl}s remaining</span>
                  <div className="w-24 bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-1000"
                      style={{ width: `${(k.ttl / 60) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Keys TTL Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Visible Keyspace TTL Timers</h3>

        {keys.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs font-sans">
            No keys loaded. Head to the Key Explorer tab to scan keys into the monitor view.
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.key}
                onClick={() => onSelectKey?.(k.key)}
                className="p-3.5 bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-wrap items-center justify-between gap-4 cursor-pointer transition group"
              >
                <div className="space-y-1 min-w-[200px]">
                  <div className="font-mono text-xs font-medium text-white group-hover:text-emerald-400 transition truncate max-w-sm">
                    {k.key}
                  </div>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 font-mono">
                    {k.type}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-neutral-200 block">
                      {k.ttl === -1 ? "Persistent" : k.ttl <= 0 ? "Expired" : `${k.ttl}s`}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {k.ttl > 60 ? `${Math.floor(k.ttl / 60)}m ${k.ttl % 60}s` : ""}
                    </span>
                  </div>

                  <div className="w-32 bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        k.ttl <= 60
                          ? "bg-amber-400"
                          : k.ttl <= 300
                          ? "bg-sky-400"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${k.ttl > 0 ? getProgressPercent(k.ttl) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redis Expiration Mechanisms Technical Note */}
      <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex items-start gap-3 text-xs text-neutral-400">
        <InformationCircleIcon className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-neutral-200">How Redis Expiration Operates:</strong>
          <p className="leading-relaxed">
            Redis uses two algorithms to expire keys: a <em>passive way</em> (a key is tested and deleted when accessed by a command), and an <em>active way</em> (Redis tests 20 random keys with TTLs every 100ms; if more than 25% are expired, it repeats immediately). Keyspace notifications (<code className="text-neutral-300">KEA</code>) can notify clients upon deletion, but impose network overhead in production.
          </p>
        </div>
      </div>
    </div>
  );
}
