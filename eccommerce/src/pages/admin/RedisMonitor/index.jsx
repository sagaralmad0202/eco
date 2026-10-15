import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CircleStackIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import redisMonitorApi from "../../../services/redisMonitorApi";
import OverviewTab from "./OverviewTab";
import LiveActivityTab from "./LiveActivityTab";
import KeyExplorerTab from "./KeyExplorerTab";
import DataInspectorDrawer from "./DataInspectorDrawer";
import LifecycleTab from "./LifecycleTab";
import TtlTimelineTab from "./TtlTimelineTab";
import AnalyticsTab from "./AnalyticsTab";
import CacheManagementTab from "./CacheManagementTab";

export default function RedisMonitor() {
  const [activeTab, setActiveTab] = useState("overview");

  // Overview metrics state
  const [overview, setOverview] = useState(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  // Real-time live events state
  const [liveEvents, setLiveEvents] = useState([]);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [streamStatus, setStreamStatus] = useState("connecting"); // 'connecting' | 'open' | 'closed' | 'error'

  // Keys discovery state
  const [keysData, setKeysData] = useState({ keys: [], hasMore: false, nextCursor: "0" });
  const [isKeysLoading, setIsKeysLoading] = useState(false);

  // Inspector Drawer state
  const [inspectedKeyData, setInspectedKeyData] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isKeyLoading, setIsKeyLoading] = useState(false);

  // Lifecycle trace state
  const [tracedKey, setTracedKey] = useState("");
  const [lifecycleTraceData, setLifecycleTraceData] = useState(null);
  const [isTraceLoading, setIsTraceLoading] = useState(false);

  // Historical Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedRange, setSelectedRange] = useState("1h");
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Fetch Overview Data
  const loadOverview = useCallback(async () => {
    try {
      setIsOverviewLoading(true);
      const data = await redisMonitorApi.getOverview();
      setOverview(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch Redis overview");
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  // Fetch Keys with SCAN
  const loadKeys = useCallback(async (params = { pattern: "cache:*", cursor: "0" }, isBackground = false) => {
    try {
      if (!isBackground) setIsKeysLoading(true);
      const data = await redisMonitorApi.getKeys(params);
      setKeysData(data);
    } catch (err) {
      if (!isBackground) {
        toast.error(err?.response?.data?.message || "Failed to scan Redis keys");
      }
    } finally {
      if (!isBackground) setIsKeysLoading(false);
    }
  }, []);

  // Fetch Analytics
  const loadAnalytics = useCallback(async (range = "1h") => {
    try {
      setIsAnalyticsLoading(true);
      const data = await redisMonitorApi.getAnalytics(range);
      setAnalyticsData(data);
    } catch (err) {
      toast.error("Failed to load historical analytics");
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  // Inspect Single Key
  const handleInspectKey = useCallback(async (key) => {
    try {
      setIsKeyLoading(true);
      setIsInspectorOpen(true);
      const data = await redisMonitorApi.inspectKey(key);
      setInspectedKeyData(data);
    } catch (err) {
      toast.error(`Could not inspect key: ${key}`);
    } finally {
      setIsKeyLoading(false);
    }
  }, []);

  // Trace Key Lifecycle
  const handleTraceLifecycle = useCallback(async (key) => {
    try {
      setIsTraceLoading(true);
      setTracedKey(key);
      const data = await redisMonitorApi.getKeyLifecycle(key);
      setLifecycleTraceData(data);
      setActiveTab("lifecycle");
    } catch (err) {
      toast.error(`Could not trace lifecycle for: ${key}`);
    } finally {
      setIsTraceLoading(false);
    }
  }, []);

  // Delete Individual Key
  const handleDeleteKey = useCallback(async (key) => {
    try {
      setKeysData((prev) => ({
        ...prev,
        keys: (prev?.keys || []).filter((k) => k.key !== key),
      }));
      const res = await redisMonitorApi.deleteKey(key);
      toast.success(`Key deleted (${res.deletedCount ?? 1} removed)`);
      loadOverview();
      loadKeys({ pattern: "cache:*", cursor: "0" }, true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
      loadKeys({ pattern: "cache:*", cursor: "0" });
    }
  }, [loadOverview, loadKeys]);

  // Invalidate Pattern
  const handleInvalidatePattern = useCallback(async (pattern) => {
    try {
      const res = await redisMonitorApi.invalidatePattern(pattern);
      toast.success(`Invalidated ${res.totalDeleted || 0} keys matching ${pattern}`);
      loadOverview();
      loadKeys();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalidation failed");
    }
  }, [loadOverview, loadKeys]);

  // Initial load
  useEffect(() => {
    loadOverview();
    loadKeys();
    loadAnalytics("1h");
  }, [loadOverview, loadKeys, loadAnalytics]);

  // Subscribe to real-time SSE live activity stream
  useEffect(() => {
    const unsubscribe = redisMonitorApi.subscribeToLiveEvents(
      (event) => {
        if (event && !isStreamPaused) {
          setLiveEvents((prev) => {
            // Keep at most 300 in frontend state for high-performance rendering
            const next = [event, ...prev];
            return next.slice(0, 300);
          });
        }
      },
      (status) => {
        setStreamStatus(status);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [isStreamPaused]);

  // Extract recent unique keys observed in live events
  const recentObservedKeys = useMemo(() => {
    const set = new Set();
    for (const e of liveEvents) {
      if (e.key && !e.key.includes("*")) {
        set.add(e.key);
      }
    }
    return Array.from(set);
  }, [liveEvents]);

  const tabs = [
    { id: "overview", label: "Overview", icon: CircleStackIcon },
    {
      id: "live",
      label: "Live Activity",
      icon: BoltIcon,
      badge: liveEvents.length > 0 ? liveEvents.length : null,
    },
    { id: "keys", label: "Key Explorer", icon: MagnifyingGlassIcon },
    { id: "lifecycle", label: "Cache Lifecycle", icon: ArrowPathIcon },
    { id: "ttl", label: "Expiration & TTL", icon: ClockIcon },
    { id: "analytics", label: "Performance", icon: ChartBarIcon },
    { id: "management", label: "Cache Management", icon: ShieldCheckIcon },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-16 selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition border border-neutral-800"
              title="Return to Storefront"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-black font-extrabold text-sm shadow-md">
                R
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  Redis Observability Hub
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live Telemetry
                  </span>
                </h1>
                <p className="text-[11px] text-neutral-400">
                  Real-time monitoring of application caching, TTLs, hits, and invalidations
                </p>
              </div>
            </div>
          </div>

          {/* SSE Connection Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  streamStatus === "open"
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : streamStatus === "connecting"
                    ? "bg-amber-400 animate-ping"
                    : "bg-rose-400"
                }`}
              />
              <span className="text-neutral-300 font-medium font-mono text-[11px]">
                {streamStatus === "open"
                  ? "SSE Connected"
                  : streamStatus === "connecting"
                  ? "SSE Connecting..."
                  : "SSE Disconnected"}
              </span>
            </div>

            <button
              onClick={() => {
                loadOverview();
                loadKeys();
                loadAnalytics(selectedRange);
                toast.success("Telemetry refreshed");
              }}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl transition border border-neutral-800"
              title="Refresh all metrics"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-neutral-900/60 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-neutral-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 mt-6">
        {activeTab === "overview" && (
          <OverviewTab
            overview={overview}
            isLiveConnected={streamStatus === "open"}
            onRefresh={loadOverview}
            isLoading={isOverviewLoading}
          />
        )}

        {activeTab === "live" && (
          <LiveActivityTab
            events={liveEvents}
            isPaused={isStreamPaused}
            onTogglePause={() => setIsStreamPaused(!isStreamPaused)}
            onClearEvents={() => setLiveEvents([])}
            onSelectKey={(key) => handleInspectKey(key)}
            onInspectEvent={(evt) => {
              if (evt.key) handleInspectKey(evt.key);
            }}
          />
        )}

        {activeTab === "keys" && (
          <KeyExplorerTab
            keysData={keysData}
            onSearch={(params, isBackground) => loadKeys(params, isBackground)}
            onSelectKey={(key) => handleInspectKey(key)}
            onDeleteKey={(key) => handleDeleteKey(key)}
            isLoading={isKeysLoading}
            liveEvents={liveEvents}
          />
        )}

        {activeTab === "lifecycle" && (
          <LifecycleTab
            selectedKey={tracedKey}
            lifecycleData={lifecycleTraceData}
            onLookupKey={(key) => handleTraceLifecycle(key)}
            recentKeys={recentObservedKeys}
            isLoading={isTraceLoading}
          />
        )}

        {activeTab === "ttl" && (
          <TtlTimelineTab
            keys={keysData?.keys || []}
            onSelectKey={(key) => handleInspectKey(key)}
            onRefresh={() => loadKeys()}
            isLoading={isKeysLoading}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            analyticsData={analyticsData}
            selectedRange={selectedRange}
            onChangeRange={(r) => {
              setSelectedRange(r);
              loadAnalytics(r);
            }}
            onRefresh={() => loadAnalytics(selectedRange)}
            isLoading={isAnalyticsLoading}
          />
        )}

        {activeTab === "management" && (
          <CacheManagementTab
            onDeleteKey={(key) => handleDeleteKey(key)}
            onInvalidatePattern={(pat) => handleInvalidatePattern(pat)}
          />
        )}
      </main>

      {/* Slide-over Deep Key Inspector */}
      <DataInspectorDrawer
        keyDetail={inspectedKeyData}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onDeleteKey={(key) => handleDeleteKey(key)}
        onRefresh={(key) => handleInspectKey(key)}
        isLoading={isKeyLoading}
      />
    </div>
  );
}
