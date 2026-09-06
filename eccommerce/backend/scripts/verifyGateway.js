const http = require("http");
const request = require("supertest");
const assert = require("assert");

const TEST_PORT = 5491;
process.env.UPSTREAM_CORE_URL = `http://127.0.0.1:${TEST_PORT}`;
process.env.GATEWAY_PORT = "5000";

const gatewayApp = require("../src/gateway/gateway.app");

async function runVerification() {
  console.log("Starting verification...");

  // Mock upstream server
  let receivedHeaders = {};
  let receivedBody = null;
  const mockServer = http.createServer((req, res) => {
    receivedHeaders = req.headers;
    if (req.url === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "healthy" }));
    }
    if (req.url === "/api/echo") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        receivedBody = JSON.parse(body);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ echoed: true, body: receivedBody }));
      });
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, fromUpstream: true }));
  });

  await new Promise((resolve) => mockServer.listen(TEST_PORT, resolve));
  console.log("1. Mock Upstream listening on port", TEST_PORT);

  // Test 1: Routes endpoint
  const resRoutes = await request(gatewayApp).get("/gateway/routes");
  assert.strictEqual(resRoutes.status, 200, "Routes endpoint should return 200");
  assert.strictEqual(resRoutes.body.success, true);
  console.log("✓ Test 1 Passed: GET /gateway/routes returned route catalog");

  // Test 2: Health probe
  const resHealth = await request(gatewayApp).get("/gateway/health");
  assert.strictEqual(resHealth.status, 200, "Health check should return 200");
  assert.strictEqual(resHealth.body.status, "healthy");
  assert.strictEqual(resHealth.body.upstream.reachable, true);
  console.log("✓ Test 2 Passed: GET /gateway/health confirmed gateway + upstream healthy");

  // Test 3: Proxy GET request & Header propagation
  const resProxy = await request(gatewayApp)
    .get("/api/products")
    .set("X-Request-Id", "custom-req-id-777");
  assert.strictEqual(resProxy.status, 200);
  assert.strictEqual(resProxy.body.fromUpstream, true);
  assert(resProxy.headers["x-gateway-response-time"], "Must have X-Gateway-Response-Time");
  assert.strictEqual(receivedHeaders["x-request-id"], "custom-req-id-777", "Must propagate X-Request-Id");
  assert(receivedHeaders["x-gateway-timestamp"], "Must add X-Gateway-Timestamp");
  console.log("✓ Test 3 Passed: Forwarded GET request and propagated request headers");

  // Test 4: Proxy POST request with body
  const postData = { product: "bag", quantity: 3 };
  const resPost = await request(gatewayApp)
    .post("/api/echo")
    .send(postData)
    .set("Content-Type", "application/json");
  assert.strictEqual(resPost.status, 200);
  assert.deepStrictEqual(resPost.body.body, postData);
  console.log("✓ Test 4 Passed: Forwarded POST request body intact");

  // Test 5: Unmatched route
  const res404 = await request(gatewayApp).get("/non-existent-route");
  assert.strictEqual(res404.status, 404);
  assert.strictEqual(res404.body.error.code, "ROUTE_NOT_FOUND");
  console.log("✓ Test 5 Passed: Gateway returned 404 for unregistered path");

  // Test 6: 502 Bad Gateway handling when upstream goes down
  mockServer.closeAllConnections?.();
  await new Promise((resolve) => mockServer.close(resolve));
  const res502 = await request(gatewayApp).get("/api/products");
  assert.strictEqual(res502.status, 502);
  assert.strictEqual(res502.body.error.code, "BAD_GATEWAY");
  console.log("✓ Test 6 Passed: Gateway returned clean 502 BAD_GATEWAY on upstream outage");

  console.log("\nALL 6 GATEWAY VERIFICATION TESTS PASSED SUCCESSFULLY!");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
