import api, { getAccessToken } from "./api";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const redisMonitorApi = {
  /**
   * Fetch overview metrics (hits, misses, hit ratio, memory, server info)
   */
  async getOverview() {
    const response = await api.get("/admin/redis/overview");
    return response.data?.data || response.data;
  },

  /**
   * Fetch bounded recent event history
   */
  async getRecentEvents(options = {}) {
    const response = await api.get("/admin/redis/events/recent", { params: options });
    return response.data?.data || [];
  },

  /**
   * SCAN-based paginated key discovery
   */
  async getKeys(params = {}) {
    const response = await api.get("/admin/redis/keys", { params });
    return response.data;
  },

  /**
   * Deep key inspection
   */
  async inspectKey(key) {
    const encodedKey = encodeURIComponent(key);
    const response = await api.get(`/admin/redis/keys/${encodedKey}`);
    return response.data?.data || response.data;
  },

  /**
   * Get recorded lifecycle history for a key
   */
  async getKeyLifecycle(key) {
    const encodedKey = encodeURIComponent(key);
    const response = await api.get(`/admin/redis/lifecycle/${encodedKey}`);
    return response.data?.data || response.data;
  },

  /**
   * Get time-series historical performance metrics
   */
  async getAnalytics(range = "1h") {
    const response = await api.get("/admin/redis/analytics", { params: { range } });
    return response.data?.data || response.data;
  },

  /**
   * Delete an individual cache key
   */
  async deleteKey(key) {
    const response = await api.post("/admin/redis/keys/delete", { key });
    return response.data;
  },

  /**
   * Safely invalidate keys matching an approved pattern
   */
  async invalidatePattern(pattern) {
    const response = await api.post("/admin/redis/keys/invalidate", { pattern });
    return response.data;
  },

  /**
   * Open a Server-Sent Events (SSE) live activity stream
   *
   * @param {Function} onEvent - Called for every cache operation event
   * @param {Function} onStatusChange - Called with connection status ('connecting' | 'open' | 'closed' | 'error')
   * @returns {Function} cleanup - Function to disconnect the stream
   */
  subscribeToLiveEvents(onEvent, onStatusChange) {
    let eventSource = null;
    let reconnectTimeout = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      onStatusChange?.("connecting");

      const token = getAccessToken();
      const sseUrl = `${BASE_URL}/admin/redis/events${token ? `?token=${encodeURIComponent(token)}` : ""}`;

      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.onopen = () => {
        if (isDisposed) {
          eventSource.close();
          return;
        }
        onStatusChange?.("open");
      };

      eventSource.onmessage = (e) => {
        if (!e.data || isDisposed) return;
        try {
          const parsed = JSON.parse(e.data);
          onEvent(parsed);
        } catch {
          // ignore heartbeats or raw ping comments
        }
      };

      eventSource.onerror = (err) => {
        if (isDisposed) return;
        onStatusChange?.("error");
        eventSource.close();

        // Safe exponential or bounded backoff reconnect (retry in 3s)
        reconnectTimeout = setTimeout(() => {
          if (!isDisposed) {
            connect();
          }
        }, 3000);
      };
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      onStatusChange?.("closed");
    };
  },
};

export default redisMonitorApi;
