# E-commerce Future Product and Technical Requirements

Project: `C:\Users\ADmin\Desktop\try again\eccommerce`  
Document type: combined Product Requirements Document (PRD) and Software Requirements Specification (SRS)  
Purpose: define the future state of the project so implementation decisions remain focused, testable and interview-ready.  
Status: proposed requirements; validate each phase before implementation.

## 1. Product direction

Build an India-first, mobile-first, single-vendor fashion/lifestyle commerce application where a visitor can discover products, choose a real variant, maintain a guest cart, pay safely through Razorpay, track orders and interact with reviews or Product Q&A. Administrators should be able to manage catalogue structure, inventory, orders, coupons and customer-facing content.

The project has two goals:

1. Work like a credible small production commerce application.
2. Demonstrate the frontend and full-stack engineering patterns expected in React interviews: asynchronous state, accessibility, URL state, TypeScript, forms, recursion, optimistic updates, streaming, testing, security and system design.

### 1.1 Assumptions

- Business model: one store sells its own products; this is not a seller marketplace.
- Primary market: India; prices are INR and Razorpay is the initial payment provider.
- Primary device: mobile, while remaining fully usable on tablet and desktop.
- Existing stack remains: React/Vite, React Router, Redux Toolkit, Axios, Express, Prisma and PostgreSQL.
- The backend remains a modular monolith during the next six months.
- Guest browsing and guest cart are allowed; an account is required to place an order.
- Roles initially remain `CUSTOMER` and `ADMIN`.
- Current cart, address, order-snapshot and payment foundations are reused rather than rewritten.
- The public portfolio deployment uses synthetic users/data and Razorpay Test Mode. Do not process live money or real customer PII until operational, legal and security readiness has been reviewed separately.

### 1.2 Capacity target for design and testing

Do not claim this scale until it is tested. Use it as a future architecture exercise:

- Normal demo seed: 50–500 products with enough variants/categories to exercise filters.
- Synthetic performance dataset: up to 100,000 active products/variants and 1,000,000 historical orders.
- Synthetic load exercise: at least 100 concurrent browsing users plus focused concurrent final-item checkout tests.
- Application instances remain stateless; session identity, jobs and commerce truth cannot depend on one server's memory.

### 1.3 Explicit non-goals for the next six months

- Multi-vendor marketplace and seller payouts.
- Multiple warehouses or complex supply-chain optimization.
- Native Android/iOS applications.
- Cryptocurrency, subscriptions or buy-now-pay-later.
- Microservices, Kafka or Kubernetes solely for portfolio keywords.
- A custom payment-card form; Razorpay remains responsible for sensitive payment entry.
- AI making purchases or changing cart/order data without explicit user confirmation.
- A full recommendation ML platform before sufficient usage data exists.

## 2. Requirement language and priority

- **MUST (P0):** required for a safe, coherent production-style release.
- **SHOULD (P1):** high-value differentiation after the P0 path is reliable.
- **COULD (P2):** portfolio extension that must not delay core release.
- **WON'T NOW:** deliberately outside the current roadmap.

Every requirement is incomplete until its acceptance criteria, error states, authorization and tests pass.

## 3. Success definition

### 3.1 Customer outcome

A new visitor must be able to:

1. Open home, shop, search and product pages without creating an account.
2. Find a product using category navigation, filters or autocomplete.
3. Select an available variant and add it to a guest cart.
4. Register or sign in without losing the guest cart.
5. Complete address, review and payment steps once, without duplicate orders or charges.
6. Recover from payment failure or browser closure.
7. View the resulting order and its current status.

### 3.2 Administrator outcome

An administrator must be able to:

1. Create and update products, variants, images and categories safely.
2. Search, filter and paginate orders.
3. Move an order only through an allowed status transition.
4. See payment/refund state separately from fulfilment state.
5. Manage stock changes with an auditable reason.
6. Create, activate and expire coupons.
7. Moderate reviews and Product Q&A.

### 3.3 Engineering outcome

- No known critical/high security defect in the release path.
- No refresh token stored in browser-readable storage.
- Duplicate checkout/payment requests are idempotent.
- Frontend critical journeys have automated integration and E2E tests.
- All new feature code is TypeScript.
- Public pages are keyboard usable and meet the accessibility requirements in this document.
- CI blocks merge on lint, type, test or build failure.
- A recruiter can understand and run the application from the README.

## 4. Users and permissions

| Role | Main needs | Permissions |
|---|---|---|
| Visitor | Browse, search, compare, create guest cart | Read active catalogue; manage only own guest cart; register/login |
| Customer | Checkout, save items, manage profile, track orders, review purchases | Own account, addresses, wishlist, cart, orders, eligible reviews/Q&A |
| Administrator | Operate catalogue and fulfilment | Admin dashboard, catalogue/category/coupon/order moderation and audit views |
| Support operator (future) | Resolve customer/order issues without full catalogue authority | Add as a separate role only when permission requirements are implemented |

### 4.1 Authorization rules

- Frontend route guards improve UX but never replace backend authorization.
- Every customer resource query MUST be scoped by the authenticated user ID on the server.
- Every admin mutation MUST require authenticated `ADMIN` authorization.
- Customers MUST NOT retrieve another customer's address, cart, wishlist, order, payment or conversation by changing an ID.
- Deactivated users MUST lose access on the next authenticated request or token refresh.

## 5. Information architecture

### 5.1 Public routes

- `/` — home and curated collections.
- `/shop` — complete catalogue with URL-based filters and pagination/infinite mode.
- `/search?q=` — search results with the same filter engine.
- `/products/:slug` — product details, variants, reviews and Product Q&A.
- `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms` — trust/support content.
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`.

### 5.2 Authenticated customer routes

- `/checkout`.
- `/account/profile`.
- `/account/addresses`.
- `/account/wishlist`.
- `/account/orders`.
- `/account/orders/:orderNumber`.
- `/assistant` if conversation persistence is enabled.

### 5.3 Administrator routes

- `/admin` — operational summary.
- `/admin/products` and `/admin/products/:id`.
- `/admin/categories`.
- `/admin/orders` and `/admin/orders/:id`.
- `/admin/order-board`.
- `/admin/coupons`.
- `/admin/reviews` and `/admin/questions`.
- `/admin/audit`.

## 6. Global experience requirements

### UX-001 Responsive layout — MUST

- All critical flows MUST work at 320 CSS pixels through large desktop widths.
- Mobile navigation, filters and drawers MUST expose the same functionality and state as desktop.
- Tables MUST have a deliberate narrow-screen representation; horizontal overflow alone is not sufficient for critical actions.

### UX-002 Complete async states — MUST

Every data-driven surface MUST define:

- Initial loading.
- Background refresh/stale state.
- Empty state.
- Recoverable error with retry.
- Permission/session-expired state.
- Success state.
- Mutation-pending state.
- Offline/network-interrupted state where meaningful.

### UX-003 Feedback — MUST

- Inline validation errors MUST appear beside the responsible field and in a summary when submission is blocked.
- Toasts MAY reinforce success or failure but MUST NOT be the only location of a form error.
- Destructive operations MUST state what will happen and require deliberate confirmation.
- Money MUST display with consistent INR formatting based on server-returned decimal strings.

### UX-004 Shared overlays — MUST

Quick view, side cart, size chart, review form and mobile filters MUST use shared accessible dialog/drawer primitives with focus entry, focus containment, Escape behavior, background isolation, scroll locking and trigger-focus restoration.

### UX-005 Navigation recovery — MUST

- Browser Back/Forward MUST restore URL-controlled search/filter/table state.
- Returning from a product to a long catalogue SHOULD restore scroll position and already loaded pages.
- A refresh during safe checkout steps SHOULD restore non-sensitive draft state.

## 7. Functional requirements

## Epic A — Public storefront and navigation

### STO-001 Public catalogue access — P0

Home, shop, search, product and support pages MUST be accessible without authentication.

Acceptance criteria:

- Opening a public product URL in a private browser session renders the product or a real not-found state, never a login redirect.
- Add-to-cart works for a guest through the existing HTTP-only cart-session cookie.
- Checkout redirects unauthenticated users to login/signup and returns them to checkout afterward.

### STO-002 Home merchandising — P0

- Home MUST load featured, newest and sale collections from APIs, not duplicated static product arrays.
- Each rail MUST define skeleton, empty and failure behavior.
- “Show more” MUST navigate or load real results.
- Admin-curated `isFeatured` products MUST be distinguishable from simply newest products.

### STO-003 Navigation and category tree — P1

- Header and shop filters MUST consume the real parent/children category response.
- The tree MUST support arbitrary depth, expand/collapse, selected ancestry and deep links.
- Keyboard behavior MUST implement tree navigation with Up, Down, Left, Right, Home and End.
- Hidden/inactive categories MUST not appear publicly.

## Epic B — Authentication and account

### AUT-001 Registration and verification — P0

- Registration MUST require name, normalized unique email and a policy-compliant password.
- Passwords MUST be hashed using a current password-hashing configuration.
- Verification tokens MUST be single-use, hashed in storage and expire.
- Repeated verification requests MUST be rate-limited without revealing whether an unrelated email exists.

### AUT-002 Login/session model — P0

- Access tokens SHOULD be short-lived and held in application memory.
- Refresh credentials MUST exist only in `Secure`, `HttpOnly`, appropriately scoped `SameSite` cookies in production.
- The refresh endpoint MUST accept the cookie contract used by the frontend; it MUST NOT require a missing body token.
- Refresh rotation MUST revoke the previous token and detect invalid/reused tokens according to the chosen policy.
- Axios refresh MUST remain single-flight so simultaneous 401 responses cause one refresh attempt.
- Logout MUST revoke the current refresh token and clear the cookie; logout-all MUST revoke every active session.

### AUT-003 Password recovery — P0

- Forgot-password responses MUST be non-enumerating.
- Reset tokens MUST expire, be one-time and be stored hashed.
- A successful password reset SHOULD invalidate existing refresh sessions.

### ACC-001 Profile and addresses — P0

- Customers MUST update profile fields through validated user routes.
- Existing user routes MUST be mounted and integration-tested.
- Address create/update/delete/default-selection MUST be user-scoped.
- Deleting or editing an address MUST never change the address snapshot on an existing order.

## Epic C — Catalogue administration

### CAT-001 Product model — P0

An admin product MUST support:

- Name, unique slug, description, brand, category, active/featured flags.
- One or more variants with unique SKU, title/options, current price, optional compare-at price, stock and active state.
- Ordered images with useful alt text.
- Soft deactivation rather than destructive deletion when historical references exist.

Validation acceptance criteria:

- Price and compare-at price use decimal values, never binary floating point.
- Stock is a non-negative integer.
- Compare-at price, when present, is not lower than current price.
- A product cannot be publicly purchasable without an active variant, a positive price and valid display information.
- Duplicate slug/SKU responses use stable conflict error codes.

### CAT-002 Product CRUD authorization — P0

- The currently public `POST /api/products` MUST be removed or protected before catalogue expansion.
- Create/update/deactivate endpoints MUST require `ADMIN` and Zod validation.
- Every mutation MUST produce an audit entry containing actor, action, entity ID, timestamp and safe before/after fields.

### CAT-003 Category management — P1

- Admin can add root/child category, rename, move and deactivate.
- A category MUST NOT become its own ancestor.
- Move operations MUST be transactional and reject cycles.
- Deactivating a parent MUST have an explicit policy for active descendants and assigned products.

### CAT-004 Inventory movements — P1

- Stock SHOULD be changed through inventory adjustments rather than unexplained direct edits.
- Each movement records variant, delta, reason, actor/order reference and timestamp.
- Payment fulfilment and cancellation/refund restoration MUST be idempotent.
- Stock MUST never become negative under concurrent purchase attempts.

## Epic D — Search, filtering and discovery

### SRC-001 Autocomplete — P0

- One shared ProductAutocomplete component MUST serve Header and SearchHero.
- Search begins after two normalized characters with a 250–300 ms debounce.
- The previous request MUST be aborted and stale responses MUST be ignored.
- Results SHOULD be cached briefly by normalized query.
- Response items contain only the fields needed for a suggestion: ID, name, slug, thumbnail, category and starting/current price.
- Keyboard support: Up/Down changes active option, Enter selects, Escape closes, Tab follows expected focus behavior.
- Markup MUST follow accessible combobox/listbox semantics.
- Loading, no-result, error and recent-search states MUST be present.

### SRC-002 Search results — P0

- Replace `SEARCH_PRODUCTS` static data with the product API.
- Query, category, colors, sizes, price bounds, availability, sort, page and limit MUST serialize into URL parameters.
- Refresh and shared URLs MUST reproduce the same result state.
- Mobile and desktop controls MUST share one state model.
- Changing a filter/sort MUST reset page or accumulated infinite results.
- Obsolete requests MUST not overwrite current results.

### SRC-003 Sorting — P0

- Supported values: relevance, newest, name ascending/descending and price ascending/descending.
- All sorting MUST occur before pagination.
- Current price sorting MUST be corrected so the database sorts by a defined active-variant price rather than sorting only one already-paginated page in memory.
- Every order MUST include a stable secondary key to prevent unstable paging.

### SRC-004 Pagination and infinite mode — P0

- Shop MUST support real server pagination first.
- Infinite mode MUST use `hasNext`, append/deduplicate by product ID and allow manual “Load more”.
- Repeated observer events MUST not issue duplicate page requests.
- Failure loading page N MUST retain pages 1 through N-1 and expose retry.
- Cursor pagination using `(sortValue, id)` SHOULD replace offsets when the catalogue/update rate warrants it.

### SRC-005 Search scalability — P2

- Begin with PostgreSQL search and measured indexes.
- Add trigram/full-text search only after query plans and latency demonstrate a need.
- A separate search service MUST NOT be introduced solely for architecture complexity.

## Epic E — Product detail, gallery, reviews and Q&A

### PDP-001 Product information — P0

- Display product name, brand, description, category, image gallery, variants, current/compare price, stock state, rating summary and fulfilment information.
- The selected variant MUST drive price, availability and the ID added to cart.
- Add-to-cart MUST be disabled until a valid available variant is selected.
- No hard-coded/fallback variant UUID is permitted.
- Deactivated/missing product and unavailable variant states MUST be explicit.

### PDP-002 Gallery/carousel — P1

- Previous/next controls, thumbnails, keyboard arrows and touch/swipe MUST work without blocking page scroll.
- The current image and selected thumbnail MUST be exposed accessibly.
- Image dimensions MUST remain stable to prevent layout shift.
- Non-current images SHOULD lazy-load; next image MAY prefetch.
- Failed images MUST show an accessible placeholder.
- Motion MUST respect reduced-motion preferences.

### REV-001 Verified reviews — P1

- Replace the hard-coded `REVIEWS` array with API data.
- One review per customer per product remains enforced.
- Rating range is 1–5; title/comment lengths are bounded.
- Define eligibility: SHOULD require a delivered purchase of the product.
- Customers can edit/delete their own review; admin can moderate with an audit reason.
- Product rating summary MUST be calculated consistently and updated after mutation.

### QNA-001 Product Q&A — P1

- Root questions MUST be paginated.
- Replies MUST render recursively with a documented maximum display depth.
- Users can ask/reply/edit/delete only under ownership/role rules.
- Optimistic additions use temporary IDs and rollback on failure.
- Large reply branches SHOULD load on demand.
- Duplicate submission and stale-edit races MUST be handled.
- User content MUST be safely rendered and length-limited.

## Epic F — Wishlist and cart

### WIS-001 Wishlist — P1

- Authenticated customers can add/remove a product exactly once.
- Unavailable products remain visible with an unavailable state and removal action.
- A guest selecting wishlist SHOULD be prompted to sign in and return to the same product.

### CRT-001 Guest and customer cart — P0

- The server remains the cart source of truth.
- Guest identity MUST use the opaque HTTP-only cart-session cookie.
- A cart MUST belong to exactly one of `userId` or `sessionId`, enforced at the database/service boundary.
- The same variant MUST occupy one line; adding again increments its quantity.
- Quantity MUST be at least 1 and not exceed current sellable stock or configured line maximum.
- Cart responses MUST include current price, current stock, availability, line totals and server-calculated totals.

### CRT-002 Cart mutation UX — P0

- Each line MUST expose its own pending/error state.
- Optimistic quantity/remove behavior is permitted only with rollback and stale-response protection.
- Conflicting mutations on the same line MUST be serialized, coalesced or version-checked.
- An unavailable/deactivated variant MUST be clearly marked and excluded from checkout.
- Multi-tab changes SHOULD trigger a safe server refetch rather than create a second local source of truth.

### CRT-003 Guest-cart merge — P0

- Login/signup MUST transactionally merge guest items into the user's cart.
- Same-variant quantities follow a documented cap rule based on stock and maximum line quantity.
- The guest cart/session MUST be retired after a successful merge.
- Repeating the merge MUST not duplicate quantities.

### CRT-004 Validation before checkout — P0

- Expose and call the existing `POST /api/cart/validate` endpoint.
- Validation MUST report removed/deactivated variants, stock reductions, price changes and coupon impact.
- The customer MUST acknowledge material price/availability changes before payment.

## Epic G — Checkout, payments and recovery

### CHK-001 Explicit checkout flow — P0

Implement named steps rather than magic numeric tabs:

1. Contact and shipping address.
2. Delivery option and coupon.
3. Order review.
4. Payment initiation.
5. Confirmation or recovery.

Acceptance criteria:

- A named reducer/state machine defines allowed step transitions.
- Only the current step validates during normal navigation; final review validates the complete order.
- Completed steps can be edited without losing safe data.
- Non-sensitive draft fields MAY persist in session storage; payment secrets MUST never persist.
- Browser refresh/back behavior is deterministic.
- A semantic progress indicator announces the current step.

### CHK-002 Order creation integrity — P0

- Add a server quote operation that returns validated lines, price, discount, shipping, tax, currency, total and a short-lived quote/version. The client MUST present this server quote before payment.
- Server MUST re-read cart lines, stock, price, coupon, shipping and tax.
- Client totals are display-only and MUST never be trusted.
- Order and order-item snapshots MUST remain immutable after placement.
- Final order submission MUST accept a user-scoped idempotency key.
- Repeating the same request/key MUST return the original result, not create another pending order or coupon usage.
- Abandoned pending orders and coupon reservations MUST expire through a documented cleanup process.

### CHK-003 Inventory and coupon reservation — P0

- Creating the payment attempt SHOULD atomically reserve the required variant quantities and coupon redemption for a bounded window such as 10–15 minutes.
- Available stock equals on-hand stock minus active, unexpired reservations.
- Successful verified payment converts the reservation into a sale exactly once.
- Failed, cancelled or expired attempts release reservations exactly once through an idempotent job/service.
- The customer MUST be shown a new quote if the reservation/quote expires before payment.
- Concurrent customers attempting the final item MUST not both receive a valid reservation.

### PAY-001 Razorpay initiation and callback — P0

- Provider order amount/currency MUST exactly match the server order.
- Browser callback data MUST be signature-verified on the backend.
- A provider payment ID MUST be claimable once.
- Successful finalization MUST atomically update payment/order/stock and clear purchased cart lines.
- Repeated callback processing MUST be safe.

### PAY-002 Webhook recovery — P0

- Add a Razorpay webhook endpoint using the required raw request body and signature verification.
- Webhook processing MUST be idempotent and reuse the same payment-finalization service as browser verification.
- Browser closure after successful payment MUST eventually produce the correct internal order state.
- Unknown/invalid events MUST be rejected or safely ignored and logged with a correlation ID.
- Each provider webhook/event ID MUST be recorded uniquely before processing so duplicate delivery is acknowledged without repeating business effects.

### PAY-003 Failure, cancellation and refund — P0

- Failed payment MUST leave a recoverable order/payment attempt without marking the order confirmed.
- A new retry creates a new payment attempt against the same eligible order.
- Captured-but-unfulfillable payment MUST enter an explicit refund-required workflow; a response flag alone is insufficient.
- Until refund/restock is implemented, customers MUST only cancel safe unpaid states.
- When paid cancellation/return is introduced, payment refund and stock disposition MUST have explicit, idempotent state transitions.

## Epic H — Orders, fulfilment and returns

### ORD-001 Customer history and detail — P0

- Customers see only their orders, with server pagination.
- History supports status filtering and stable sorting.
- Detail shows order snapshot, items, totals, delivery address, payment summary and status timeline.
- Empty, loading, error and retry states are required.

### ORD-002 Order state machine — P0

Initial fulfilment states remain aligned with the current schema:

```text
PENDING -> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED
    |          |          |
    +----------+----------+----> CANCELLED (only under defined rules)
DELIVERED -> RETURNED (only after an approved return flow)
```

- Allowed transitions MUST be defined in one backend policy.
- A client cannot force an arbitrary status.
- Every transition records actor, previous status, next status, reason and time.
- Payment status MUST remain separate from fulfilment status.

### ORD-003 Admin orders table — P1

- Columns: order number, customer, placed date, item count, total, payment state, fulfilment state and actions.
- Server search/filter/sort/page values MUST be URL-synchronized.
- Sort fields MUST use a backend allowlist and stable tie-breaker.
- Bulk actions MUST be limited to transitions valid for every selected order.
- A mobile card representation MUST preserve all essential actions.

### ORD-004 Kanban fulfilment board — P1

- Board columns map to supported operational statuses.
- Drag/drop MAY optimistically move a card but MUST rollback after server rejection.
- Keyboard/non-drag controls MUST provide equivalent behavior.
- Delayed status responses MUST not overwrite a more recent accepted status.
- Invalid transitions display a useful conflict error and latest server state.

### RET-001 Returns — P2

- Customer can request return only for eligible delivered items inside the configured window.
- Return reason, quantity, evidence and requested resolution are stored.
- Admin approves/rejects; approved returns define whether stock is sellable, damaged or discarded.
- Refund state is tracked independently until provider confirmation.

## Epic I — Coupons, tax and delivery

### CPN-001 Coupon validation — P0

- Code matching is normalized and unique.
- Rules include active flag, time window, usage limit, minimum order and maximum discount.
- Percentage/fixed calculations occur only on the server with decimal arithmetic.
- Coupon usage MUST not be permanently consumed by repeated or abandoned checkout requests.
- Admin create/update/deactivate operations are authorized, validated and audited.

### SHP-001 Shipping and tax — P1

- Initial rules MAY be deterministic configuration, but MUST be calculated by the server.
- The selected delivery option and fee MUST be snapshotted on the order.
- Unsupported postal codes MUST block payment with a clear explanation.
- Future provider integration MUST live behind a service interface rather than inside controllers.

## Epic J — Admin operations

### ADM-001 Dashboard — P1

- Show order counts by status, payment failures/refunds requiring attention, low-stock variants and recent orders.
- Metrics MUST identify their time window and timezone.
- Dashboard values MUST link to filtered operational views.
- This is an operational dashboard, not an analytics vanity screen.

### ADM-002 Product table — P1

- Search, category/status/stock filters, stable sorting and server pagination.
- Create/edit forms validate product plus variant details.
- Row actions include view, edit, activate/deactivate and inventory adjustment.
- Bulk deactivation requires confirmation and a result summary.

### ADM-003 Audit log — P1

- Record sensitive admin actions, order transitions, inventory changes, coupon changes and moderation.
- Audit records MUST be append-only to normal application roles.
- Store actor, action, entity type/ID, safe metadata, timestamp and request/correlation ID.
- Secrets, passwords, tokens and full payment payloads MUST not be copied into audit metadata.

## Epic K — Streaming shopping assistant

### AIA-001 Scope — P1

The assistant helps users discover products and understand store policies. It MUST NOT claim unavailable prices/stock or perform a purchase without normal UI confirmation.

### AIA-002 Streaming interaction — P1

- `POST /api/assistant/stream` returns SSE or NDJSON/streamed fetch from the backend.
- Message states: queued, streaming, completed, cancelled and failed.
- User can cancel, retry and regenerate.
- Abort MUST stop client consumption and, where possible, upstream work.
- An old/cancelled stream MUST never append to a newer response.
- Auto-scroll occurs only while the user remains near the bottom.
- Screen readers announce status changes, not every streamed token.

### AIA-003 Grounded product actions — P1

- Product recommendations MUST be based on live catalogue retrieval.
- Cards use database product IDs/slugs, current prices and availability returned by tools/server logic.
- Assistant text is untrusted display content and MUST be rendered safely.
- Add-to-cart still requires a valid explicit variant selection and normal cart API call.

### AIA-004 Safety, cost and privacy — P1

- Provider key stays on the server.
- Apply authentication as appropriate, rate limits, message/history bounds and timeouts.
- Do not log conversation content by default; document retention if persistence is enabled.
- Provide deterministic fake-stream mode for development, automated tests and zero-cost demos.

## Epic L — Notifications and support

### NTF-001 In-app notifications — P2

- Notify customers of significant order-state changes.
- Notification records require read/unread state and a link to the relevant order.
- Email integration MAY follow, but event creation MUST be separated from provider delivery.

### SUP-001 Contact/support — P1

- Contact form validates category, email, order reference when relevant, subject and bounded message.
- Apply rate limiting and anti-spam controls.
- A submitted request returns a reference ID; do not imply delivery if no backend record/provider call exists.

## 8. Required API conventions

### 8.1 Response shape

Successful list example:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrevious": false
  },
  "requestId": "..."
}
```

Error example:

```json
{
  "error": {
    "code": "CART_STOCK_CHANGED",
    "message": "One item no longer has the requested quantity.",
    "fieldErrors": {},
    "details": {}
  },
  "requestId": "..."
}
```

Requirements:

- Error codes MUST be stable and machine-readable; human messages MAY improve over time.
- Validation errors MUST map to fields without exposing stack traces.
- Every response SHOULD include or return a request ID header.
- Page/limit and query lengths MUST be bounded.
- Sort columns MUST be allowlisted.
- Timestamps MUST be ISO 8601 UTC; the UI formats them for locale.
- Decimal money crosses JSON as strings or another explicitly lossless representation.

### 8.2 Endpoint inventory

Existing routes SHOULD be retained where contracts are sound. Required additions/repairs include:

```text
GET    /api/products                 search/filter/sort/page
GET    /api/products/suggestions     optional optimized typeahead
GET    /api/products/categories      public active tree
GET    /api/products/:slug           product/variant detail

POST   /api/cart/validate

GET    /api/orders                   customer history
GET    /api/orders/:orderNumber      customer detail
POST   /api/orders                   idempotent order creation
POST   /api/orders/:id/cancel        safe-state cancellation

POST   /api/payments/razorpay/order
POST   /api/payments/razorpay/verify
POST   /api/payments/razorpay/webhook

GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id
POST   /api/admin/products/:id/inventory-adjustments
GET    /api/admin/orders
PATCH  /api/admin/orders/:id/status
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
POST   /api/admin/categories/:id/move
GET    /api/admin/coupons
POST   /api/admin/coupons
PATCH  /api/admin/coupons/:id
GET    /api/admin/audit

GET    /api/products/:id/questions
POST   /api/products/:id/questions
POST   /api/questions/:id/replies
PATCH  /api/questions/:id
DELETE /api/questions/:id

POST   /api/assistant/stream
```

### 8.3 Concurrency and idempotency

- Checkout/order creation and payment finalization MUST be idempotent.
- Admin status changes SHOULD use expected current status or a version to detect conflicts.
- Cart mutation responses MUST identify the resulting server version/state.
- Inventory decrement MUST occur inside a transaction using an atomic conditional update or equivalent protection.
- External webhooks MUST be stored/claimed by unique provider event or payment identifiers before processing.

## 9. Data requirements

### 9.1 Preserve existing strengths

- Money remains `Decimal(10,2)`.
- Price/stock remain variant-level.
- Order items and shipping address remain immutable snapshots.
- Financial records are never cascade-deleted with a user.
- Product/category deactivation is preferred over deleting historical references.
- Refresh/reset/verification tokens remain hashed in the database.

### 9.2 Required additions

| Entity | Important fields/purpose |
|---|---|
| `IdempotencyKey` | user, operation, key hash/value, request fingerprint, resource/result, expiry |
| `OrderStatusEvent` | order, from/to status, actor, reason, timestamp |
| `Refund` | payment/order, provider refund ID, amount, reason, state, timestamps |
| `InventoryMovement` | variant, delta, reason, order/admin reference, actor, timestamp |
| `InventoryReservation` | variant, order/checkout attempt, quantity, expiry, state; prevents captured-but-unfulfillable payment |
| `CouponRedemption` | coupon, user/order, `RESERVED`/`CONSUMED`/`RELEASED`, expiry |
| `PaymentWebhookEvent` | unique provider event ID, type, processing state, timestamps and retry metadata |
| `AuditLog` | actor, action, entity, safe metadata, request ID, timestamp |
| `Question`/`Answer` or `ProductThread` | product, user, parent/root, content, moderation state, timestamps |
| `AssistantConversation`/`Message` | optional persisted chat, role, content, status, provider request ID, retention fields |
| `CheckoutDraft` | optional server draft; never store payment secrets |
| `Notification` | user, type, entity link, read state, timestamp |

### 9.3 Constraints and indexes

- Add a database constraint requiring exactly one cart owner: user XOR session.
- Review rating remains constrained to 1–5.
- Quantity and stock remain non-negative through database/service validation.
- Add indexes based on real query shapes: order `(userId, placedAt)`, admin order `(status, placedAt)`, product active/category/featured and search indexes after measurement.
- Unique constraints MUST enforce SKU, product slug, coupon code, provider payment/event IDs and user/product review uniqueness.
- Raw gateway payload storage MUST be minimized and sanitized; if retained for dispute/reconciliation, define encryption, access and deletion/retention policy rather than storing unrestricted payloads indefinitely.
- Data migrations MUST be reversible where practical and tested against a production-like snapshot.

## 10. Frontend architecture requirements

### 10.1 TypeScript migration — P0

- Add strict-capable TypeScript configuration with `allowJs` for incremental migration.
- Every new feature, API contract, hook, reducer and shared component MUST be `.ts`/`.tsx`.
- Define types for Product, Variant, Cart, Order, Payment, Pagination, ApiError and discriminated async/message states.
- `any` requires a documented boundary reason; use `unknown` plus validation for untrusted data.

### 10.2 Feature organization — P0

```text
src/
  features/
    auth/ catalogue/ search/ cart/ checkout/
    orders/ reviews/ assistant/ admin/
  shared/
    api/ components/ hooks/ types/ utils/
  pages/
  redux/
```

- Shared code MUST emerge from at least two real consumers; avoid premature generic frameworks.
- Consolidate duplicate quick-view state ownership.
- Treat CartContext only as a compatibility boundary if Redux owns cart state; do not maintain two cart stores.

### 10.3 State ownership — P0

| State type | Owner |
|---|---|
| Products/orders/cart returned by server | One consistent RTK async approach: RTK Query or existing thunks |
| Authenticated user/global UI preferences | Redux |
| Search/filter/sort/page/table filters | URL |
| Form draft/step state | Local reducer or form layer |
| Derived totals/counts | Selectors/functions, never duplicated writable state |
| Secure payment truth | Backend/provider verification only |

Do not add both RTK Query and TanStack Query merely for keywords.

### 10.4 Routing and resilience — P0

- Lazy-load route-level pages with `React.lazy`/Suspense.
- Add application and route-level error boundaries.
- Unknown routes render a real 404.
- Authentication expiry preserves a safe intended destination.
- Requests support cancellation/stale guards where search, filters or streaming can race.

### 10.5 Design system — P1

Create reusable, tested primitives for Button, Input, Select, Checkbox, Radio, Price, Badge, Skeleton, EmptyState, ErrorState, Pagination, Dialog, Drawer, ToastRegion, Tabs and Progress/Stepper. Variants MUST preserve focus visibility, disabled/pending semantics and accessible names.

## 11. Backend architecture requirements

### 11.1 Modular monolith — P0

- Preserve Express modules with route/controller/service/validator boundaries.
- Controllers translate HTTP; business rules live in services; Prisma access remains behind service/domain operations.
- Transaction boundaries MUST live around complete business actions, not individual queries.
- Shared error middleware maps domain errors to stable API codes.
- Do not split services until operational scale or team ownership creates a measured need.

### 11.2 Validation — P0

- Zod validates every body, query and path input before service execution.
- Unknown fields SHOULD be stripped/rejected according to endpoint policy.
- Input length, pagination limit, file size and enum values MUST be bounded.
- Backend MUST validate independently of frontend controls.

### 11.3 Background work — P1

Email, webhook retry, abandoned-checkout cleanup and refund retry SHOULD use an explicit job abstraction. A database-backed job table is acceptable initially; a queue service is justified only when reliability/throughput requires it.

### 11.4 API documentation and compatibility — P1

- Publish OpenAPI documentation for public/customer/admin routes and stable error codes.
- Prefer deriving documentation/contracts from the same Zod schemas or test them against those schemas to prevent drift.
- Preserve current `/api` routes during incremental work; introduce `/api/v1` only when a real breaking-version policy is needed.
- Contract checks MUST fail CI when a required response field or error behavior changes unexpectedly.

## 12. Security requirements

### SEC-001 Immediate blockers — P0

Before a public demo with real data:

1. Protect and validate product creation.
2. Repair refresh cookie/body contract.
3. Remove refresh tokens from localStorage and response bodies intended for browser use.
4. Mount and authorize intended profile routes.
5. Remove fixed production-usable seed-admin credentials.
6. Add signed payment webhooks and a real refund-required workflow.
7. Restrict cancellation until refund/restock logic is safe.

### SEC-002 Browser/API protections — P0

- Production uses HTTPS only.
- Cookies use `Secure`, `HttpOnly`, appropriate `SameSite`, narrow path/domain and expiry.
- CORS uses an explicit production-origin allowlist with credentials only where needed.
- If cookie-authenticated unsafe requests are introduced, implement suitable CSRF protection.
- Send security headers including a practical CSP, frame restrictions and content-type protections.
- Render user/AI content as text or through a sanitizer with an explicit allowlist.
- Never expose Prisma errors, stacks, secret configuration or gateway signatures to clients.

### SEC-003 Abuse and secrets — P0

- Rate-limit login, registration, password recovery, autocomplete/search, contact, review/Q&A and AI endpoints by suitable identity dimensions.
- Store secrets only in environment/secret management; `.env.example` contains names, not values.
- Redact authorization, cookies, reset tokens, payment signatures and sensitive personal data from logs.
- File uploads, if added, MUST verify bytes/MIME, enforce size/count, generate names and store outside executable paths.

### SEC-004 Audit and privacy — P1

- Document what personal data is collected and why.
- Support account deactivation/deletion while retaining legally/operationally necessary financial records in a de-identified or properly linked manner.
- Define retention for logs, raw gateway payloads, assistant messages and support requests.
- Sensitive admin reads/actions SHOULD be auditable.

## 13. Non-functional requirements

### 13.1 Performance budgets

Measure on a deployed production build using a representative mid-range mobile profile.

| Metric | Target |
|---|---|
| LCP | <= 2.5 s at the 75th percentile for key public pages |
| INP | <= 200 ms at the 75th percentile |
| CLS | <= 0.10 at the 75th percentile |
| Initial route JS | Target <= 250 KB compressed; document justified exceptions |
| Autocomplete API | p95 <= 400 ms excluding a cold free-tier wake-up |
| Catalogue API | p95 <= 700 ms for supported filtered queries |
| Normal mutation API | p95 <= 800 ms excluding payment/email providers |

Requirements:

- Set image dimensions, generate appropriate sizes and lazy-load below-fold images.
- Remove unused large template assets and HTML.
- Route-split public/admin features.
- Cache safe catalogue/category reads with explicit invalidation or bounded TTL.
- Add virtualization only after measuring a rendering bottleneck.

### 13.2 Reliability

- Target 99.5% monthly availability for a hosted portfolio release, excluding announced maintenance/free-tier sleeping.
- Critical payment/order mutations MUST tolerate retries without duplication.
- Timeouts and retry policies MUST distinguish safe reads from unsafe mutations.
- External provider failure MUST not corrupt internal state.
- Database backup and restore procedure MUST be documented and tested before using real customer data.

### 13.3 Accessibility

- Target WCAG 2.2 AA for customer and admin critical flows.
- Complete every critical path using only keyboard.
- Visible focus MUST never be removed.
- Native semantics are preferred; ARIA supplements rather than replaces them.
- Dialogs trap/restore focus; menus, comboboxes, tabs and trees implement expected keyboard patterns.
- Forms have labels, descriptions and programmatically associated errors.
- Dynamic status uses live regions without announcing every streamed token.
- Color is not the only state indicator.
- Content remains usable at 200% zoom and at 320 px width.
- Motion honors `prefers-reduced-motion`.

### 13.4 Compatibility

- Support current and previous major versions of Chrome, Edge, Firefox and Safari.
- Critical shopping flow MUST be tested in at least Chrome and one WebKit/Safari-equivalent browser through Playwright/manual QA.
- Touch targets and hover-only interactions MUST have touch/keyboard equivalents.

## 14. Observability requirements

### OBS-001 Structured logs — P0

- Log timestamp, level, environment, service, request ID, route, safe user/entity identifiers, latency, result code and error category.
- Do not log secrets or unnecessarily log full request bodies.
- Webhook, payment and refund logs MUST allow one transaction to be traced without storing sensitive authentication material.

### OBS-002 Error tracking — P1

- Capture frontend uncaught errors and backend exceptions with environment/release metadata.
- Source maps MUST be handled safely for production debugging.
- Group expected domain rejections separately from defects.

### OBS-003 Metrics and health — P1

- Health/readiness endpoints distinguish process health from database dependency health.
- Track request count, latency/error rate, login failures, search zero-result rate, checkout attempts, payment failures, webhook failures, low stock and refund backlog.
- Alerts SHOULD focus on actionable failures: elevated 5xx, payment/webhook backlog, database unavailability and repeated job failure.

## 15. Analytics and product metrics

Use privacy-conscious first-party events where possible. Event names and fields MUST be documented and versioned.

### Funnel events

```text
view_home
view_list
search_submitted
filter_applied
view_product
select_variant
add_to_cart
begin_checkout
checkout_step_completed
payment_started
payment_succeeded
payment_failed
order_confirmed
```

### Product metrics

- Search-to-product-view rate.
- Zero-result search rate.
- Product-view-to-cart rate.
- Cart-to-checkout and checkout-to-confirmed-order conversion.
- Payment failure/recovery rate.
- Guest-cart merge success rate.
- API and frontend error-free session rate.
- Accessibility and performance regression counts per release.

For a portfolio with synthetic traffic, label demo metrics as synthetic. Never invent business conversion improvements.

## 16. Testing requirements

### 16.1 Tooling

- Vitest for frontend unit tests.
- React Testing Library and user-event for behavior-level components.
- MSW or equivalent for deterministic API scenarios.
- Playwright for critical journeys and browser coverage.
- axe integration plus manual keyboard/screen-reader-oriented checks.
- Existing Jest/Supertest remains for backend integration.

### 16.2 Required frontend coverage

- Autocomplete debounce, cancellation, stale response, cache, keyboard selection and states.
- URL parser/serializer for search/filter/table state.
- Infinite-scroll single-flight, append, deduplication, reset, retry and end state.
- Dialog/drawer focus trap, Escape, backdrop and focus restoration.
- Cart optimistic/pessimistic mutation, rollback, stock change and merge UI.
- Checkout step transitions, validation, draft restoration and duplicate-click prevention.
- Orders table filters/sort/page, narrow layout and status-conflict display.
- Category tree recursive rendering and keyboard navigation.
- Product Q&A optimistic CRUD, nesting and permissions.
- Stream parser, cancel, retry, regenerate and stale-stream protection.

### 16.3 Required E2E journeys

1. Guest browses public catalogue and opens a product.
2. Guest searches by keyboard autocomplete, selects a variant and adds to cart.
3. Guest registers/logs in and cart merges exactly once.
4. Customer refreshes, edits cart and completes checkout with a mocked payment success.
5. Payment failure retries without duplicate order/charge.
6. Browser callback is absent; signed webhook finalizes the payment in a backend integration test.
7. Customer sees only own order; cross-user ID access returns denial/not found.
8. Admin filters orders and performs one allowed transition; invalid transition is rejected.
9. Admin moves/renames a category; a cycle attempt is rejected.
10. User asks/replies in Product Q&A and cannot edit another user's content.
11. AI fake stream cancels/regenerates without stale tokens.

### 16.4 Backend invariants

Automated tests MUST prove:

- Cart owner XOR constraint/service invariant.
- Concurrent stock decrement cannot oversell.
- Duplicate idempotency key produces one order.
- Duplicate provider callback/webhook produces one finalization.
- Order snapshots do not change after product/address updates.
- Coupon bounds/expiry/usage behavior is correct.
- Unauthorized customer/admin access is rejected.
- Allowed order transitions are enforced.
- Paid cancellation/refund/restock policy cannot be bypassed.

## 17. Environments, CI/CD and operations

### 17.1 Environments

| Environment | Purpose | Data policy |
|---|---|---|
| Local | Development with deterministic seed and fake providers | Synthetic only |
| Test | Automated isolated database/providers | Resettable synthetic fixtures |
| Staging | Production-like deployment and manual QA | Synthetic/anonymized only |
| Production/demo | Recruiter/user-facing stable build | Minimal required data; protected secrets |

### 17.2 CI quality gate — P0

Every pull request MUST run:

1. Locked dependency installation.
2. Frontend lint and formatting check.
3. TypeScript type-check.
4. Frontend unit/component tests.
5. Frontend production build.
6. Backend lint/format checks.
7. Backend Jest/Supertest tests against an isolated database.
8. Prisma schema/migration validation.
9. Playwright smoke tests for critical routes.
10. Dependency vulnerability and secret scanning.
11. API contract/OpenAPI drift validation.

Main branch deployment MUST be blocked when required checks fail.

### 17.3 Deployment — P0

- Build artifacts are reproducible from lockfiles.
- Migrations run as a controlled release step, not implicitly from every app instance.
- Deployments expose release/version metadata.
- Health checks prevent routing traffic to an unready backend.
- Rollback instructions cover application version and safe database migration strategy.
- `.env.example`, setup, seed and fake-payment/AI modes are documented.

## 18. Delivery roadmap

This sequence assumes work alongside a full-time job. Scope each week to one complete, tested vertical slice.

### Phase 0 — Credibility and security foundation (Weeks 1–2)

- Fix Header runtime error, no-op mobile filters and disconnected shop pagination.
- Make catalogue routes public and preserve checkout redirect intent.
- Protect product creation and repair auth refresh flow.
- Remove refresh token from localStorage/browser response.
- Mount intended user routes.
- Establish TypeScript, Vitest/RTL/MSW, Playwright smoke test and CI.
- Replace default README basics and document local setup.

Exit gate: public browsing works; auth/cart smoke tests pass; no known critical security blocker listed above remains unfixed.

### Phase 1 — Product discovery quality (Weeks 3–6)

- Shared accessible autocomplete.
- API/URL-driven search, filters, sort and real pagination.
- Correct global price sorting.
- Infinite catalogue with manual fallback and restoration.
- Shared accessible dialog/drawer/toast primitives.
- Route splitting, image cleanup and baseline performance measurements.

Exit gate: a keyboard-only guest can discover a product and add a valid variant; feature tests and performance baseline are recorded.

### Phase 2 — Commerce integrity and operations (Weeks 7–10)

- Formal checkout reducer/state machine and review step.
- Cart validation wrapper and stock/price acknowledgement.
- Order idempotency, pending-order cleanup and payment webhook.
- Safe cancellation/refund/restock policy.
- Customer order-history data table, then admin endpoints/table.
- Order transition audit and Kanban alternative controls.

Exit gate: duplicate checkout/payment tests pass; webhook recovery works; admin can process an order only through valid transitions.

### Phase 3 — Recursive and differentiated features (Weeks 11–14)

- Accessible category tree and admin category manager.
- Real reviews and Product Q&A recursion.
- Streaming shopping assistant with deterministic fake mode.
- Carousel hardening.
- Optional product-image upload manager only if core gates are already green.

Exit gate: each feature has error/empty/loading states, accessibility checks, integration tests and a short architecture note.

### Phase 4 — Portfolio release (Weeks 15–16)

- Full E2E pass, accessibility review and performance regression check.
- Staging/demo deployment with synthetic data.
- Architecture/state/data-flow diagrams.
- README feature matrix, trade-offs, security model and test commands.
- Record a 3–5 minute demo and prepare project interview stories.

Exit gate: a reviewer can open the public demo, understand setup/design, see passing CI and reproduce critical flows.

## 19. Definition of Ready

A feature is ready to start only when:

- User and business outcome are clear.
- P0 acceptance criteria and non-goals are written.
- Screen/API/data impacts are identified.
- Authorization and sensitive-data behavior are identified.
- Loading, empty, error, retry and edge cases are listed.
- Test approach is identified.
- Dependencies or migrations are understood.
- The slice can be completed without bundling unrelated refactors.

## 20. Definition of Done

A feature is complete only when:

- Acceptance criteria work on a clean environment.
- Backend validates and authorizes the operation.
- Loading, empty, success, error, retry and cancellation states exist where relevant.
- Keyboard, focus, responsive and reduced-motion behavior is verified.
- Unit/component/integration tests pass; a critical journey has E2E coverage where appropriate.
- No new lint/type/build failure exists.
- Logs/metrics make meaningful failures diagnosable.
- Documentation, API contract and environment variables are updated.
- Migration/rollback and backward compatibility are considered.
- A short note explains the design choice, alternative and trade-off.
- The feature can be demonstrated with deterministic test/demo data.

## 21. Release gates

### P0 customer release gate

- Public catalogue and PDP work without login.
- Valid variant can be added to guest cart and survives refresh.
- Cart merge is idempotent.
- Checkout revalidates server truth and cannot double-create an order.
- Razorpay callback and signed webhook converge on one final state.
- Customer can retrieve only own order.
- Critical E2E, authorization and payment-integrity tests pass.

### P1 portfolio-quality gate

- Autocomplete, infinite scroll, data table, accessible overlays, multi-step checkout, category tree, Q&A and streaming are demonstrable.
- Each includes real edge states and tests, not only the happy-path UI.
- Accessibility checklist and performance budgets pass or documented exceptions exist.
- CI is visibly passing and README explains architecture/trade-offs.

## 22. Risks and scope controls

| Risk | Control |
|---|---|
| Building many half-finished demos | Finish vertical P0 slices and tests before starting the next feature |
| Rewriting working cart/checkout | Preserve existing foundations; refactor behind contract tests |
| Payment inconsistency | Idempotency, webhook verification, transaction boundaries and explicit refund states |
| Frontend state duplication | One owner per state; URL for shareable state; selectors for derived values |
| Overengineering | Modular monolith/PostgreSQL first; introduce infrastructure only after measurement |
| AI cost/secret leak | Backend-only provider, limits and deterministic fake mode |
| Admin security | Server RBAC, validation, audit log and no fixed production seed password |
| Portfolio cannot be reviewed | Public catalogue, stable demo data, README, screenshots and short demo video |
| Claims without evidence | Record tests, metrics and trade-offs; never invent user or performance numbers |

## 23. Portfolio evidence required

For each major feature, preserve:

- One short screen recording or GIF.
- Architecture/component diagram where relationships are non-trivial.
- API contract and representative error response.
- At least one meaningful automated test.
- One failure/edge case demonstrated.
- One measured performance/accessibility observation.
- A paragraph: problem, your decision, alternative considered and trade-off.

The README SHOULD prominently demonstrate:

1. Autocomplete race cancellation.
2. URL-synchronized catalogue and infinite loading.
3. Server-backed guest cart and merge.
4. Idempotent checkout/payment webhook recovery.
5. Accessible overlay/focus behavior.
6. Orders table and valid state transitions.
7. Recursive category/Q&A components.
8. AI stream cancel/regenerate in fake mode.

## 24. Future backlog after the core project

Consider these only after release gates pass:

- Return/refund portal and support dashboard.
- Email/SMS order notifications through an event/job abstraction.
- Product comparison and recently viewed products.
- PWA installability and deliberate offline read behavior.
- Image transformation/CDN pipeline.
- Search typo tolerance and ranking analytics.
- Rule-based recommendations, followed by measured personalization only when real data exists.
- Expanded admin roles/permissions.
- Multi-currency, international tax/shipping or multi-warehouse only if product scope changes.
- SSR/Next.js migration only when SEO or rendering requirements justify the cost.

## 25. Final product rule

Do not judge the project by the number of screens. The strongest version is the one where discovery, variant selection, cart, checkout, payment and order state are correct under failure and retry; admin operations are authorized and auditable; the interface is accessible; and every major engineering claim can be shown with code, tests and measured evidence.
