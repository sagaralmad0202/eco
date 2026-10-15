import React, { useState } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function AnalyticsTab({
  analyticsData,
  selectedRange,
  onChangeRange,
  onRefresh,
  isLoading,
}) {
  const timeSeries = analyticsData?.timeSeries || [];
  const overview = analyticsData?.overview || {};

  const maxHitsMisses = Math.max(
    10,
    ...timeSeries.map((p) => Math.max(p.hits, p.misses)),
  );

  const maxLatency = Math.max(
    5,
    ...timeSeries.map((p) => p.avgLatencyMs || 0),
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
            Performance & Cache Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Historical time-series telemetry aggregated across rolling 1-minute intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 border border-neutral-800 rounded-xl">
            {["5m", "15m", "1h"].map((range) => (
              <button
                key={range}
                onClick={() => onChangeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedRange === range
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition border border-neutral-700"
            title="Refresh charts"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Chart 1: Hits vs Misses over time */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Cache Throughput (Hits vs Misses)</h3>
            <p className="text-xs text-neutral-400">Total cache requests per minute</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Cache Hits
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Cache Misses
            </span>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="h-64 w-full pt-4">
          {timeSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-sans">
              No historical data recorded in current range yet.
            </div>
          ) : (
            <div className="h-full flex items-end gap-1.5 overflow-x-auto pb-6 border-b border-neutral-800">
              {timeSeries.map((point, idx) => {
                const hitHeight = (point.hits / maxHitsMisses) * 100;
                const missHeight = (point.misses / maxHitsMisses) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[18px] max-w-[40px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap font-mono">
                      <div>{point.time}</div>
                      <div className="text-emerald-400 font-bold">Hits: {point.hits}</div>
                      <div className="text-amber-400 font-bold">Misses: {point.misses}</div>
                      <div>Ratio: {point.hitRatio}%</div>
                    </div>

                    {/* Bars */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-[80%]">
                      <div
                        className="w-1/2 bg-emerald-500 rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(4, hitHeight)}%` }}
                      />
                      <div
                        className="w-1/2 bg-amber-500 rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(4, missHeight)}%` }}
                      />
                    </div>

                    <span className="text-[9px] font-mono text-neutral-500 mt-2 truncate w-full text-center">
                      {idx % Math.ceil(timeSeries.length / 8) === 0 ? point.time : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chart 2 & 3 Grid: Hit Ratio & Latency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hit Ratio % Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Hit Ratio Percentage (%)</h3>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Avg: {(overview?.hitRatioPercentage || 0)}%
            </span>
          </div>

          <div className="h-44 w-full flex items-end gap-1 overflow-x-auto pb-4 border-b border-neutral-800">
            {timeSeries.map((point, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[14px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 z-20 bg-neutral-950 border border-neutral-800 px-2 py-1 rounded text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap font-mono">
                  {point.time}: <strong className="text-emerald-400">{point.hitRatio}%</strong>
                </div>

                <div className="w-full bg-neutral-800/40 h-[80%] rounded-t flex items-end">
                  <div
                    className={`w-full rounded-t transition-all ${
                      point.hitRatio >= 80
                        ? "bg-emerald-500"
                        : point.hitRatio >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ height: `${point.hitRatio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>0%</span>
            <span>Target: &gt; 80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Latency Trend Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Average Latency (ms)</h3>
            <span className="text-xs font-mono font-bold text-sky-400">
              Sub-millisecond RAM
            </span>
          </div>

          <div className="h-44 w-full flex items-end gap-1 overflow-x-auto pb-4 border-b border-neutral-800">
            {timeSeries.map((point, idx) => {
              const h = (point.avgLatencyMs / maxLatency) * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[14px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 z-20 bg-neutral-950 border border-neutral-800 px-2 py-1 rounded text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap font-mono">
                    {point.time}: <strong className="text-sky-400">{point.avgLatencyMs}ms</strong>
                  </div>

                  <div className="w-full bg-neutral-800/40 h-[80%] rounded-t flex items-end">
                    <div
                      className="w-full bg-sky-500 rounded-t transition-all"
                      style={{ height: `${Math.max(5, h)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>0 ms</span>
            <span>Peak: {maxLatency.toFixed(1)} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
