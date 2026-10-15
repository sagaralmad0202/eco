import React from "react";
import {
  CircleStackIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CpuChipIcon,
  BoltIcon,
  ServerIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function OverviewTab({ overview, isLiveConnected, onRefresh, isLoading }) {
  if (!overview) {
    return (
      <div className="flex items-center justify-center p-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400">
        <ArrowPathIcon className="w-6 h-6 animate-spin mr-3 text-emerald-500" />
        Loading Redis overview telemetry...
      </div>
    );
  }

  const { connection, cache, server, memory, commands, totalKeysInDb } = overview;
  const isReady = connection?.isReady;
  const hitRatio = cache?.hitRatioPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Top Health & Connection Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isReady ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
            <CircleStackIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Redis Cache Node</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isReady
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isReady ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                {isReady ? "Connected & Healthy" : "Disconnected / Degraded"}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isLiveConnected
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}>
                {isLiveConnected ? "SSE Live Stream: Active" : "SSE: Reconnecting..."}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Host: <span className="text-neutral-200">{connection?.redisHost || "127.0.0.1:6379"}</span> • Engine: <span className="text-neutral-200">Redis v{server?.version || "7.x"}</span> • Uptime: <span className="text-neutral-200">{Math.floor((server?.uptimeSeconds || 0) / 3600)}h {Math.floor(((server?.uptimeSeconds || 0) % 3600) / 60)}m</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-sm font-medium transition border border-neutral-700 shadow-sm"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            Refresh Snapshot
          </button>
        </div>
      </div>

      {/* Primary Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hit Ratio Card */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Hit Ratio</span>
            <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{hitRatio}%</span>
            <span className="text-xs text-neutral-400">efficiency</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hitRatio >= 80 ? "bg-emerald-500" : hitRatio >= 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(2, hitRatio))}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {cache?.hits || 0} hits out of {(cache?.totalQueries || 0)} total requests
          </p>
        </div>

        {/* Cache Misses Card */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Cache Misses</span>
            <XCircleIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{cache?.misses || 0}</span>
            <span className="text-xs text-amber-400">DB fallbacks</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-3 flex items-center justify-between">
            <span>Cache Errors:</span>
            <span className="font-semibold text-rose-400">{cache?.errors || 0}</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Queries passed through to PostgreSQL</p>
        </div>

        {/* Cache Writes / Sets */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Writes (SETEX)</span>
            <BoltIcon className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{cache?.sets || 0}</span>
            <span className="text-xs text-neutral-400">keys populated</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-3 flex items-center justify-between">
            <span>Invalidations:</span>
            <span className="font-semibold text-purple-400">{cache?.deletes || 0} keys</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Written with dynamic jittered TTLs</p>
        </div>

        {/* Memory Footprint */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Memory Used</span>
            <CpuChipIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {memory?.usedMemoryHuman || "0 B"}
            </span>
            <span className="text-xs text-neutral-400">/ {memory?.totalSystemMemoryHuman || "256MB"}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-3 flex items-center justify-between">
            <span>Peak Memory:</span>
            <span className="font-semibold text-neutral-200">{memory?.usedMemoryPeakHuman || "N/A"}</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Eviction Policy: {memory?.maxMemoryPolicy || "volatile-lru"}</p>
        </div>
      </div>

      {/* Secondary Operational Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Key Metrics */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
            <CircleStackIcon className="w-4 h-4 text-emerald-400" />
            Key Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400">Total Keys in DB:</span>
              <span className="font-mono font-semibold text-white">{totalKeysInDb || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400">Expired Keys Cleaned:</span>
              <span className="font-mono text-neutral-200">{commands?.expiredKeys || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-neutral-400">Evicted Keys (OOM):</span>
              <span className="font-mono text-neutral-200">{commands?.evictedKeys || 0}</span>
            </div>
          </div>
        </div>

        {/* Throughput & Commands */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
            <BoltIcon className="w-4 h-4 text-sky-400" />
            Throughput & Performance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400">Ops / Second:</span>
              <span className="font-mono font-semibold text-white">{commands?.instantaneousOpsPerSec || 0} ops/s</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400">Total Commands Processed:</span>
              <span className="font-mono text-neutral-200">{(commands?.totalCommandsProcessed || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-neutral-400">Memory Fragmentation:</span>
              <span className="font-mono text-neutral-200">{memory?.fragmentationRatio?.toFixed(2) || "1.00"}</span>
            </div>
          </div>
        </div>

        {/* System & Architecture */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
            <ServerIcon className="w-4 h-4 text-purple-400" />
            Node Architecture
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400">Operating System:</span>
              <span className="font-mono text-neutral-200">{server?.os || "Windows NT / Linux"}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-800 text-xs">
              <span className="text-neutral-400">Architecture Mode:</span>
              <span className="font-mono text-neutral-200">{server?.mode || "Standalone"}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-neutral-400">Active Client Connections:</span>
              <span className="font-mono font-semibold text-emerald-400">{overview?.clients?.connectedClients || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
