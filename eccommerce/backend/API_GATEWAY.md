# API Gateway Architecture & Guide

## Overview
The API Gateway serves as the centralized public reverse-proxy entrypoint for the e-commerce platform. It routes incoming client traffic (storefront web app, mobile app, external consumers) to internal backend services while centrally handling cross-cutting edge concerns.

```
       +-------------------------------------------------------------+
       |   Clients (React Storefront :3000 / Mobile / Third-Party)   |
       +-------------------------------------------------------------+
                                      |
                                      v [Port 5000]
       +-------------------------------------------------------------+
       |                        API GATEWAY                          |
       |  - Edge Security Headers (Helmet CSP, HSTS, CORS)           |
       |  - Request Tracing (X-Request-Id & X-Gateway-Timestamp)     |
       |  - Gateway Latency Telemetry (X-Gateway-Response-Time)      |
       |  - Edge Health & Status Aggregator (/gateway/health)        |
       |  - Graceful Failover & Error Handling (502 / 504)           |
       +-------------------------------------------------------------+
                                      |
             +------------------------+------------------------+
             |                                                 |
             v [Port 5001]                                     v [Future Service]
+--------------------------+                      +--------------------------+
|       Core Backend       |                      |  Microservice / Cluster  |
| - /api/auth, /api/users  |                      |  - Auth Service          |
| - /api/products, /cart   |                      |  - Search Service        |
| - /api/orders, /payments |                      |  - Notification Service  |
| - /media/* (Assets)      |                      +--------------------------+
| - /docs (OpenAPI/Swagger)|
+--------------------------+
```

---

## Route Dispatching Table

| Gateway Path | Upstream Target | Purpose |
| :--- | :--- | :--- |
| `/api/*` | `http://127.0.0.1:5001/api/*` | Core REST APIs (auth, catalog, cart, orders, reviews, etc.) |
| `/media/*` | `http://127.0.0.1:5001/media/*` | Static product media & file assets |
| `/docs` | `http://127.0.0.1:5001/docs` | Swagger OpenAPI Interactive Documentation |
| `/auth/google/callback` | `http://127.0.0.1:5001/auth/google/callback` | OAuth redirect bridge |
| `/gateway/health` | Gateway Local | Gateway status & Upstream health aggregator |
| `/gateway/routes` | Gateway Local | Live catalog of active proxy routes |

---

## Gateway Telemetry Headers

The API Gateway automatically inspects and injects standard tracing headers on all proxied requests:

1. **`X-Request-Id`**:
   - If provided by client, it is preserved.
   - If omitted, a cryptographically secure UUID is generated.
   - Forwarded downstream so all application logs and database queries share the same correlation ID.
2. **`X-Gateway-Timestamp`**:
   - ISO-8601 timestamp added to upstream requests indicating when the Gateway received the request.
3. **`X-Gateway-Response-Time`**:
   - Injected in HTTP response back to the client indicating total latency introduced across the gateway and upstream (e.g. `14ms`).

---

## Running the Gateway

### 1. Run Everything Together (Recommended for Local Development)
Runs the Core Backend on internal port `5001` and the API Gateway on public port `5000`:
```bash
npm run dev:all
# or in production:
npm run start:all
```

### 2. Run Gateway Standalone
```bash
npm run dev:gateway
# or in production:
npm run start:gateway
```

### 3. Run Core Backend Standalone (Direct Mode)
If you wish to run the backend directly without the gateway:
```bash
npm run dev
```

---

## Health & Monitoring Endpoints

* **Gateway Health**:
  ```bash
  curl http://localhost:5000/gateway/health
  ```
  Returns `200 OK` when both the Gateway and the Upstream Core service are healthy, or `503 Service Unavailable` with `status: "degraded"` if upstream is down.

* **Gateway Route Catalog**:
  ```bash
  curl http://localhost:5000/gateway/routes
  ```
  Returns active routes, gateway port, and upstream targets.

---

## Error Handling Standards

When an upstream service is down, restarting, or timing out, the Gateway catches the connection failure and returns a structured JSON error response:

* **502 Bad Gateway**:
  ```json
  {
    "success": false,
    "error": {
      "code": "BAD_GATEWAY",
      "message": "Upstream service is currently unreachable or restarting",
      "path": "/api/products",
      "requestId": "424ac3df-1cc4-438b-8260-08e2f4420d0b"
    }
  }
  ```
* **504 Gateway Timeout**:
  ```json
  {
    "success": false,
    "error": {
      "code": "GATEWAY_TIMEOUT",
      "message": "Upstream service timed out processing request",
      "path": "/api/checkout",
      "requestId": "..."
    }
  }
  ```
