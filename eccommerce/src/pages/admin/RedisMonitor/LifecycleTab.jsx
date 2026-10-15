import React, { useState } from "react";
import {
  ArrowRightIcon,
  CircleStackIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function LifecycleTab({
  selectedKey,
  lifecycleData,
  onLookupKey,
  recentKeys = [],
  isLoading,
}) {
  const [inputKey, setInputKey] = useState(selectedKey || "");

  const handleLookup = (e) => {
    e?.preventDefault();
    if (inputKey.trim()) {
      onLookupKey(inputKey.trim());
    }
  };

  const lifecycleSteps = [
    {
      step: 1,
      title: "Client Request Ingress",
      description: "Frontend initiates API request (e.g., GET /api/products/leather-tote-bag).",
      icon: "🌐",
      badge: "HTTP GET",
      type: "network",
    },
    {
      step: 2,
      title: "Cache-Aside Key Lookup",
      description: "Backend computes canonical key 'cache:product:slug:leather-tote-bag' and queries Redis in-memory store.",
      icon: "🔍",
      badge: "ioredis GET",
      type: "redis",
    },
    {
      step: 3,
      title: "Cache Hit / Miss Decision",
      description: "If data exists in RAM, return immediately (sub-millisecond latency). If missing (nil), branch to database.",
      icon: "⚡",
      badge: "RAM Check",
      type: "decision",
    },
    {
      step: 4,
      title: "Authoritative DB Fallback",
      description: "On cache miss, Prisma queries PostgreSQL Neon with indexes and joins variants/images/reviews.",
      icon: "🗄️",
      badge: "PostgreSQL Prisma",
      type: "database",
    },
    {
      step: 5,
      title: "Cache Population (SETEX)",
      description: "JSON serialized and written to Redis with jittered TTL (+/- 10%) to prevent simultaneous stampedes.",
      icon: "💾",
      badge: "SETEX + Jitter",
      type: "redis",
    },
    {
      step: 6,
      title: "Fast-Path Subsequent Hits",
      description: "Subsequent customer requests are served purely from Redis memory with 0 database queries.",
      icon: "🚀",
      badge: "Sub-1ms Latency",
      type: "hit",
    },
    {
      step: 7,
      title: "Mutation & Invalidation",
      description: "When product/inventory is updated or review created, backend executes SCAN-based UNLINK on affected keys.",
      icon: "♻️",
      badge: "SCAN UNLINK",
      type: "invalidation",
    },
    {
      step: 8,
      title: "Natural TTL Expiration",
      description: "If untouched, key expires according to TTL policy (e.g. 10m for details, 3m for listings).",
      icon: "⏳",
      badge: "Volatile-LRU",
      type: "expiration",
    },
  ];

  const history = lifecycleData?.history || [];

  return (
    <div className="space-y-6">
      {/* Key Inspector Lookup Bar */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Trace Key Cache Lifecycle
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select a key to inspect its recorded telemetry events and correlate requests across Redis and the database.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <MagnifyingGlassIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter exact cache key (e.g. cache:categories:tree)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputKey.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Trace Lifecycle
          </button>
        </form>

        {/* Recent observed keys chips */}
        {recentKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-500 mr-1">Recently active keys:</span>
            {recentKeys.slice(0, 5).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setInputKey(k);
                  onLookupKey(k);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition truncate max-w-xs"
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Key Status Header */}
      {lifecycleData && (
        <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Observed Key Trace
            </span>
            <div className="font-mono text-sm font-bold text-emerald-400 break-all">
              {lifecycleData.key}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold ${
              lifecycleData.isCurrentlyCached
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
            }`}>
              {lifecycleData.isCurrentlyCached ? "● Currently in Redis RAM" : "○ Evicted / Expired"}
            </span>
            {lifecycleData.currentTtl > 0 && (
              <span className="font-mono text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                TTL: {lifecycleData.currentTtl}s
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recorded Events vs Inferred Stages */}
      {history.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Observed Instrumentation Sequence ({history.length} events)</span>
            <span className="text-[11px] text-neutral-400 font-normal">Directly captured from application traffic</span>
          </h3>

          <div className="relative border-l-2 border-neutral-800 ml-4 space-y-6 py-2">
            {history.map((evt, idx) => (
              <div key={evt.id || idx} className="relative pl-6 group">
                {/* Node icon */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-neutral-900 ${
                  evt.type === "CACHE_HIT"
                    ? "bg-emerald-400"
                    : evt.type === "CACHE_MISS"
                    ? "bg-amber-400"
                    : evt.type === "CACHE_SET"
                    ? "bg-sky-400"
                    : "bg-rose-400"
                }`} />

                <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl space-y-1.5 hover:border-neutral-700 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{evt.type}</span>
                      <span className="text-[11px] text-neutral-400">
                        {evt.source === "cache" ? "⚡ Served from Redis" : "🗄️ Database Fallback"}
                      </span>
                    </div>
                    <span className="font-mono text-neutral-500 text-[11px]">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 flex flex-wrap gap-4 pt-1">
                    <span>Latency: <strong className="text-neutral-200">{evt.durationMs}ms</strong></span>
                    {evt.ttl && <span>TTL Set: <strong className="text-neutral-200">{evt.ttl}s</strong></span>}
                    {evt.caller && <span>Caller: <strong className="text-neutral-200">{evt.caller}</strong></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Step-by-Step Architecture Flow Diagram */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white">
            Architecture Lifecycle Flow
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            How cache-aside, single-flight stampede coalescing, and invalidation operate within this application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifecycleSteps.map((step) => (
            <div
              key={step.step}
              className="bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 p-4 rounded-xl flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/60">
                    {step.badge}
                  </span>
                </div>
                <div className="text-xl mb-2">{step.icon}</div>
                <h4 className="text-xs font-bold text-white mb-1.5">{step.title}</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>Phase {step.step}/8</span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
