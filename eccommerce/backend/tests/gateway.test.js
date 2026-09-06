const http = require("http");
const request = require("supertest");

// Point upstream to an isolated test port before requiring gatewayApp
const TEST_UPSTREAM_PORT = 5499;
process.env.UPSTREAM_CORE_URL = `http://127.0.0.1:${TEST_UPSTREAM_PORT}`;
process.env.GATEWAY_PORT = "5000";

const gatewayApp = require("../src/gateway/gateway.app");

describe("API Gateway", () => {
  let mockUpstreamServer;
  let receivedUpstreamHeaders = {};
  let receivedUpstreamBody = null;

  beforeAll((done) => {
    // Start a mock upstream server representing the Core Backend
    mockUpstreamServer = http.createServer((req, res) => {
      receivedUpstreamHeaders = req.headers;

      if (req.url === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "healthy", database: "connected" }));
      }

      if (req.url === "/api/echo") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          receivedUpstreamBody = body ? JSON.parse(body) : null;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ echoed: true, body: receivedUpstreamBody }));
        });
        return;
      }

      if (req.url === "/api/test") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: true, message: "from upstream" }));
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
    });

    mockUpstreamServer.listen(TEST_UPSTREAM_PORT, done);
  });

  afterAll((done) => {
    mockUpstreamServer.close(done);
  });

  describe("Gateway Route Catalog & Health", () => {
    it("GET /gateway/routes returns configured gateway routes", async () => {
      const res = await request(gatewayApp).get("/gateway/routes");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.routes)).toBe(true);
      expect(res.body.upstreamUrl).toContain(String(TEST_UPSTREAM_PORT));
    });

    it("GET /gateway/health returns 200 healthy when upstream is reachable", async () => {
      const res = await request(gatewayApp).get("/gateway/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
      expect(res.body.upstream.reachable).toBe(true);
      expect(res.body.upstream.status).toBe("healthy");
      expect(res.body.info).toHaveProperty("uptimeSeconds");
    });
  });

  describe("Gateway Proxy & Header Propagation", () => {
    it("proxies /api/test to upstream and injects telemetry headers", async () => {
      const res = await request(gatewayApp)
        .get("/api/test")
        .set("X-Request-Id", "client-trace-12345");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, message: "from upstream" });

      // Verify Gateway added telemetry headers to response
      expect(res.headers).toHaveProperty("x-gateway-response-time");
      expect(res.headers["x-request-id"]).toBe("client-trace-12345");

      // Verify Gateway forwarded headers to upstream
      expect(receivedUpstreamHeaders["x-request-id"]).toBe("client-trace-12345");
      expect(receivedUpstreamHeaders).toHaveProperty("x-gateway-timestamp");
    });

    it("proxies POST requests with body payloads intact", async () => {
      const payload = { testItem: "shoes", quantity: 2 };
      const res = await request(gatewayApp)
        .post("/api/echo")
        .send(payload)
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.echoed).toBe(true);
      expect(res.body.body).toEqual(payload);
    });
  });

  describe("Gateway Error Handling", () => {
    it("returns 404 with standard JSON format for unmatched routes", async () => {
      const res = await request(gatewayApp).get("/unregistered-endpoint");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
    });

    it("returns 502 Bad Gateway when upstream service is unreachable", async () => {
      // Temporarily close upstream to simulate downtime
      mockUpstreamServer.closeAllConnections?.();
      await new Promise((resolve) => mockUpstreamServer.close(resolve));

      const res = await request(gatewayApp).get("/api/test");
      expect(res.status).toBe(502);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("BAD_GATEWAY");

      // Restart upstream for clean teardown
      await new Promise((resolve) => mockUpstreamServer.listen(TEST_UPSTREAM_PORT, resolve));
    });
  });
});
