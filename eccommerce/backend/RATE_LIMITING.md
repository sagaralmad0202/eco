# Redis rate limiting

## Request path and policies

Every API module registers routes through `createRateLimitedRouter`. The factory
wraps the public Express route registration API, capturing the literal mount
pattern plus route pattern and declared method. Express still handles matching,
case insensitivity, optional trailing slashes and parameter decoding. Admission
runs before existing authentication, validation, database work and upload parsing.
Keys never use `req.originalUrl`, decoded resource values or query strings.

`policies.js` owns limits, identity selection, failure behavior and alias mapping.
HEAD shares GET. The two profile mutation methods PUT/PATCH intentionally share
one operation. `/api/account` and `/api/users`, profile/avatar aliases, upload
aliases, the order-history alias and the Google callback bridge share the
appropriate canonical counters.
Unknown routes share one IP bucket per method; arbitrary 404 URLs cannot create
unbounded route-key cardinality. Health and successfully served static/docs routes
are outside API admission. CORS preflight is answered before API handlers.

Default endpoint budgets (all Redis sliding windows):

| Operation                                                   | Limit                        | Identity                            | Redis unavailable             |
| ----------------------------------------------------------- | ---------------------------- | ----------------------------------- | ----------------------------- |
| Ordinary reads                                              | 100 / 60 seconds             | Verified user or IP                 | Configurable; open by default |
| Ordinary writes                                             | 30 / 60 seconds              | Verified user or IP                 | Configurable; open by default |
| Login, register, forgot/reset password, verify/resend email | 5 / 60 seconds               | Public auth: IP; resend: user or IP | Closed                        |
| Change password                                             | 5 / 60 seconds               | Verified user or IP                 | Closed                        |
| POST /api/orders                                            | 5 / 60 seconds               | Verified user or IP                 | Closed                        |
| Payment create-order and verify (separate budgets)          | 5 / 60 seconds each          | Verified user or IP                 | Closed                        |
| File and avatar uploads                                     | 5 / 60 seconds per operation | Verified user or IP                 | Closed                        |
| Other auth and account-security operations                  | General/write tier           | Appropriate user or IP              | Closed                        |

The original longer IP budgets also apply: login 10/15 minutes, register 20/hour,
forgot-password 5/hour, reset-password 10/15 minutes, resend-verification 5/hour,
OAuth start + callback 30/15 minutes shared across providers, and OAuth exchange
20/15 minutes. These previously used per-process fixed windows; now they are
shared sliding windows, retaining the budgets and preventing boundary bursts.
An earlier layer may consume a slot even if a later layer rejects; this is
conservative admission accounting, not a transaction spanning every policy.

Public authentication always uses IP even when a bearer token is supplied.
Other routes use the cryptographically verified token subject (or existing
`req.user`) and fall back to IP. Database authentication still checks activity
and roles afterward. No ADMIN exemption exists. IPv4-mapped IPv6 is normalized
to IPv4; IPv6 addresses are grouped by /64 to limit privacy-address rotation.
This can group legitimate users in a shared subnet, just as IPv4 NAT can.

## Algorithm and keys

The request limiter is a real sliding log in a Redis sorted set. One Lua script
reads Redis TIME, removes admissions at or before now-window, checks cardinality,
and adds one cryptographically random member if capacity remains. PEXPIRE is
updated only for accepted admissions and covers the window. Rejections do not
extend key lifetime. Sorted sets contain at most the configured limit entries.
Application clock skew cannot change admission decisions.

Keys have the form:

```
<namespace>:rl:v1:<policy>:<HMAC-SHA256(identity-type, identity)>
ecommerce:rl:v1:expensive:POST:/api/orders:<digest>
ecommerce:rl:v1:login-ip:<digest>
ecommerce:rl:v1:login-account:<digest>
```

A structured HMAC input separates IP, user and email identities. No raw email,
IP, token, password or user ID is stored in keys. Use the same namespace and HMAC
secret on every instance of one environment, and a different namespace for each
environment. `RATE_LIMIT_KEY_SECRET` defaults to `JWT_ACCESS_SECRET`; rotating
that fallback changes counters, so use a dedicated stable secret if JWT keys
rotate frequently. Version/namespace changes intentionally start new counters.

## Account login throttle

After email validation, a single Redis hash atomically reserves capacity before
bcrypt. Failed credentials plus live reservations cannot exceed
`LOGIN_MAX_ATTEMPTS`. On completion, 401/403 adds a failure; infrastructure errors
release the reservation without a strike; success clears failures while retaining
other live reservations, so concurrent valid logins can complete. Generation IDs
prevent old completions from changing newer state. Unanswered leases become
conservative failures at their original expiration timestamps. Keys outlive the
lease through the relevant failure/cooldown horizon, so a slow or crashed process
cannot erase an attempted password check. Expired completions return 503.
Completion is awaited before cookies or a success response are sent.

The failure count uses a window beginning at the first failed attempt; reaching
the threshold starts the configured cooldown. It is separate from the request
sliding-log algorithm. Redis owns its clock and expiration. Denied requests do
not extend cooldown. A temporary account-targeted denial is still possible; the
bounded cooldown avoids permanent lockout, not every form of targeted abuse.
Leases must exceed normal login duration. A slow or crashed legitimate login
can conservatively consume a failure slot; this trades availability for bounded
password guessing under uncertain outcomes. Default lease: 30 seconds.

## Failure handling and lifecycle

One ioredis client is reused. Startup waits at most the configured connect
budget. Redis can reconnect in the background; sensitive routes return 503 while
unavailable. `commandTimeout` bounds individual commands and an overall deadline
bounds script reload/dispatch. Offline queuing and automatic replay of uncertain
admission writes are disabled. Cached Lua reloads automatically after NOSCRIPT.
Stalled sockets are dropped for recovery. Shutdown bounds QUIT then disconnects.

429 means the quota was exceeded. 503 means required enforcement was unavailable.
Both use the existing JSON envelope with `success`, `message`, `retryAfter` and
`requestId`, plus Retry-After. X-RateLimit headers describe successful enforcement;
Reset is the epoch time the oldest admission leaves the window (next reclaimed
slot), consistently on accepted/rejected requests. No quota headers are invented
for fail-open traffic. General fail-open is controlled by RATE_LIMIT_FAIL_OPEN;
sensitive policies always fail closed. RATE_LIMIT_ENABLED=false explicitly
turns all enforcement off and should not be used for a public production API.

Per-policy aggregate rejection/fallback logs are rate-limited to one per minute
per event, with cumulative counts. Connection events are likewise bounded.
These local observability counters never influence enforcement. `/api/health`
includes rateLimiter=ready/unavailable/disabled and reports status=degraded when
Redis enforcement is unavailable while the database is reachable; it remains a
200 liveness response in that case. Monitor the degraded field for readiness.

## Configuration and deployment

Set REDIS_URL explicitly. It has no implicit localhost default in source.
Production refuses startup without it when enforcement is enabled. Development
without it can serve ordinary reads but sensitive requests return 503.

Use `rediss://` with Redis credentials for an external TLS endpoint. Keep Redis
private and restrict ACLs to the required script/connection commands. Do not use
an eviction-prone shared cache for security counters: prefer `maxmemory-policy
noeviction`, size memory for expected active identities, and alert on errors.

All instances must share Redis. Application restarts retain counters. Redis
restarts retain them only if persistence does: enable AOF and a persistent volume
(as in the local Compose example). AOF everysec can lose roughly the most recent
second on an abrupt crash; stronger durability has a performance cost. Loss,
eviction or restoration of old Redis data can reset quotas; application code
cannot reconstruct missing counters. Recovery from a temporarily disconnected
Redis retains counters that have not naturally expired.

TRUST_PROXY defaults to false. Set it to the actual trusted proxy IPs/CIDRs or
appropriate Express subnet names. Never set true or guess a hop count. Ensure the
edge strips/replaces untrusted forwarding headers and clients cannot reach a
trusted proxy path directly. The repository has no deployed proxy configuration,
so the production addresses must be supplied by the deployment operator.

## Local verification (PowerShell)

Run in the backend directory. Docker is optional; an existing real Redis endpoint
can be supplied instead. The Compose Redis listens only on loopback port 6380.

```powershell
npm.cmd ci
docker compose -f compose.redis.yml up -d
docker compose -f compose.redis.yml exec redis redis-cli ping
$env:REDIS_URL = 'redis://127.0.0.1:6380'
$env:TEST_REDIS_URL = 'redis://127.0.0.1:6380'
npm.cmd test
npm.cmd run test:redis
npm.cmd run lint
npm.cmd run dev
```

Use a dedicated test Redis. Integration tests create and delete only their own
randomly namespaced keys; they never flush the database, clear the shared script
cache, or stop Redis. Server restart verification is a separate manual check on
the dedicated instance. Real Redis tests are skipped by the general suite when
TEST_REDIS_URL is absent; `test:redis` requires an explicit test URL.

To see admission without creating orders, send unauthenticated requests to the
real checkout route: the first five return 401 and the sixth 429. Variants share
the quota. Wait a minute if other checks have already consumed it.

```powershell
1..6 | ForEach-Object { curl.exe -i -X POST 'http://localhost:5000/API/ORDERS/?probe=1' }
curl.exe -i 'http://localhost:5000/api/health'
```

Stop the test Redis to check outages: checkout returns 503 promptly, ordinary
reads continue (provided their database is available). Start it again and check
that enforcement recovers. Do not stop a production Redis for these checks.

```powershell
docker compose -f compose.redis.yml stop redis
docker compose -f compose.redis.yml start redis
```

Unit tests use mocks to isolate routes and inject precise clocks. Real Redis
integration tests are the authority for server TIME, TTL, shared-process state,
script caching and network failures. Neither suite invokes payment providers or
production database writes.

## Files in this change

- Redis configuration/lifecycle: `.env.example`, `src/config/env.js`,
  `src/lib/redis.js`, `src/server.js`.
- Central policies and admission: `src/lib/rateLimiter/policies.js`, `router.js`,
  `keys.js`, `response.js`, `limiter.js`, `slidingWindow.lua`, and
  `src/middleware/rateLimiter.js`.
- Distributed login state: `src/lib/rateLimiter/loginAttempts.lua`,
  `src/middleware/loginThrottle.js`, `src/modules/auth/auth.controller.js`,
  `src/middleware/errorHandler.js`.
- Application mounting, logs and health: `src/app.js`, `src/routes/index.js`.
- Route registration: `src/modules/addresses/address.routes.js`,
  `auth/auth.routes.js`, `cart/cart.routes.js`, `contact/contact.routes.js`,
  `orders/order.routes.js`, `payments/payment.routes.js`,
  `products/product.routes.js`, `reviews/review.routes.js`,
  `upload/upload.routes.js`, `users/user.routes.js`,
  `wishlist/wishlist.routes.js` (all beneath `src/modules/`).
- Tests: `tests/slidingWindowRateLimiter.test.js`, `loginThrottle.test.js`,
  `loginThrottleController.test.js`, `redisClient.test.js`,
  `redis.integration.test.js`, `setup.js` (all beneath `tests/`).
- Tooling and documentation: `package.json`, `package-lock.json`,
  `scripts/testRedis.js`, `compose.redis.yml`, `RATE_LIMITING.md`.

The actual `.env` and unrelated application functionality were not edited.

## Verification results (2026-09-06)

- Before implementation: 24 suites / 260 tests passed.
- Final full backend run with `TEST_REDIS_URL` supplied: 27 suites / 316 tests
  passed, including 11 real Redis integration tests.
- The real service used for validation was isolated Redis 7.0.15 under WSL.
  Docker was unavailable on this machine; the provided Redis 7.4 Compose setup
  was not executed here.
- Real checks covered concurrent admissions, two application processes sharing
  quotas, application-process recreation, Redis server time, TTLs, account
  reservations/cooldown, NOSCRIPT recovery and a network proxy that stalls Redis
  responses before reconnecting. The last check also asserts no admission replay.
- A separate graceful restart of that isolated Redis process retained an
  exhausted request quota and account cooldown through AOF persistence. Abrupt
  crash durability is limited by the configured Redis fsync policy.
- Changed JavaScript files pass ESLint. Repository-wide lint still reports five
  existing unused-variable errors in `scripts/syncCisecoProducts.js`,
  `src/middleware/avatarUpload.js`, and `src/middleware/fileUpload.js`.
- The final attacker-oriented review identified an ioredis reconnect race,
  expired login reservations losing their failures, and the order-history alias
  obtaining a fresh bucket. All three were fixed and covered by regressions.

These checks validate rate-limiter behavior; production Redis credentials, TLS,
proxy addresses, capacity, alerts and persistence remain deployment decisions.

Design references: [Redis Lua atomic execution and script-cache behavior](https://redis.io/docs/latest/develop/programmability/eval-intro/), [ioredis connection/command options](https://redis.github.io/ioredis/interfaces/CommonRedisOptions.html), and [Express trusted proxies](https://expressjs.com/en/guide/behind-proxies/).
