# E-commerce Machine-Coding Implementation Blueprint

Project reviewed: `C:\Users\ADmin\Desktop\try again\eccommerce`  
Purpose: turn the existing personal project into one interview-ready application that demonstrates the major frontend machine-coding patterns expected from a 2-4 year React developer.  
Scope of this document: implementation plan only. No project code was changed.

## 1. What already exists

This is already a meaningful full-stack project, not an empty starter.

### Frontend

- React 19 with Vite, React Router, Redux Toolkit, Tailwind CSS and Axios.
- Authentication pages and protected routes.
- Product listing, search page, filters, sorting UI and pagination UI.
- Product details, gallery, variants, related products and reviews UI.
- Server-backed cart, side cart, wishlist and derived totals.
- Checkout, order history/detail and Razorpay integration.
- Quick-view panel, size-chart modal, filter drawers, toasts and skeleton loading.
- Several useful accessibility attributes already exist.

Important evidence:

- Routes and application shell: `src/App.jsx`
- Redux store: `src/redux/store.js`
- Product server state: `src/redux/slices/productsSlice.js`
- Static/local search implementation: `src/pages/SearchPage.jsx`
- API-driven catalogue: `src/pages/SaleCollection.jsx`
- Server-backed cart: `src/redux/slices/cartSlice.js` and `src/context/CartContext.jsx`
- Checkout/payment flow: `src/pages/Checkout.jsx`
- Existing modal: `src/components/product/SizeChartModal.jsx`

### Backend

- Express, Prisma and PostgreSQL.
- Auth, users, addresses, products, cart, wishlist, orders and payments modules.
- Guest cart through an HTTP-only session cookie.
- Product search/filter/sort/pagination query support.
- Order price/address snapshots and variant-level inventory.
- Razorpay payment verification and uniqueness constraints for payment IDs.
- Jest/Supertest backend tests.

Important evidence:

- Data model: `backend/prisma/schema.prisma`
- API registration: `backend/src/routes/index.js`
- Product query validation: `backend/src/modules/products/product.validators.js`
- Cart routes/services: `backend/src/modules/cart/`
- Order routes/services: `backend/src/modules/orders/`
- Payment routes/services: `backend/src/modules/payments/`

## 2. What is incomplete or missing

| Capability | Current status | Required action |
|---|---|---|
| Product autocomplete | Missing | Build a debounced, cancellable, cached accessible combobox |
| Search/filter page | Partial | Replace static data and disconnected controls with API/URL-driven state |
| Pagination | Partial | Use real backend pagination totals and URL state |
| Infinite scroll | Backend/slice support is partial | Connect `append`, `hasNext` and `IntersectionObserver` to the catalogue |
| Data table | Missing | Build an admin orders table with server pagination/filter/sort |
| Accessible modal system | Partial | Refactor existing overlays into one focus-managed dialog/drawer primitive |
| Toast/notifications | Partial | Add accessible live-region behavior, queue/deduplication and actions |
| Persistent cart | Strong existing implementation | Harden optimistic state, stock errors and guest-to-user merge behavior |
| Multi-step form | Checkout exists as one large page | Split shipping, review and payment into a state-machine-like flow |
| Recursive UI | Missing | Build an admin category-tree manager |
| Nested/threaded UI | Missing | Replace the hard-coded reviews demo with a real Product Q&A thread |
| Kanban/drag-and-drop | Missing | Build an admin order-status board with optimistic rollback |
| Streaming interface | Missing | Build an AI shopping assistant with stream/cancel/regenerate/retry |
| Carousel | Existing | Harden keyboard, touch, loading, focus and reduced-motion behavior |
| Frontend tests | Missing | Add unit/component/integration/E2E coverage |
| TypeScript | Missing | Enable mixed JS/TS and implement all new feature modules in TypeScript |
| CI/CD | Missing | Add automated lint, type-check, tests and build checks |
| Documentation | Default Vite README | Replace with project architecture, setup, tests and trade-offs |

## 3. Architecture decision

Do not create ten unrelated demo pages. Implement the patterns as real e-commerce features.

### Customer-facing modules

- Product autocomplete.
- URL-synchronized search and filters.
- Infinite product catalogue.
- Accessible quick-view/dialog/drawer/toast primitives.
- Persistent cart and multi-step checkout.
- Streaming AI shopping assistant.
- Product Q&A with recursive replies.
- Product gallery/carousel hardening.

### Admin modules

- Orders data table.
- Order-status Kanban board.
- Recursive category-tree manager.

Recommended new routes:

- `/assistant`
- `/admin/orders`
- `/admin/order-board`
- `/admin/categories`

Create an `AdminRoute` that requires an authenticated `ADMIN` user. The backend must independently enforce the same rule; frontend route protection is not security.

## 4. Foundation work before adding features

### 4.1 Add TypeScript incrementally

Do not migrate the whole application in one large rewrite.

1. Add TypeScript configuration with `allowJs: true` and `checkJs` initially disabled.
2. Implement every new feature in `.ts`/`.tsx`.
3. Define shared types for `Product`, `ProductVariant`, `Pagination`, `Order`, `Cart`, `ApiError` and async UI states.
4. Convert API services and Redux selectors after the new modules are stable.
5. Gradually enable stricter checking for converted folders.

### 4.2 Create clear feature boundaries

Suggested frontend layout:

```text
src/
  features/
    search/
    catalogue/
    cart/
    checkout/
    assistant/
    admin-orders/
    admin-categories/
  shared/
    api/
    components/
    hooks/
    types/
    utils/
  pages/
  redux/
```

Suggested shared primitives:

```text
shared/components/Dialog.tsx
shared/components/Drawer.tsx
shared/components/ToastRegion.tsx
shared/components/AsyncState.tsx
shared/components/Pagination.tsx
shared/hooks/useDebouncedValue.ts
shared/hooks/useAbortableRequest.ts
shared/hooks/useIntersectionObserver.ts
shared/hooks/useFocusTrap.ts
shared/hooks/useUrlState.ts
shared/types/api.ts
```

### 4.3 Choose one server-state strategy

Redux Toolkit is already installed. Prefer RTK Query for new product/order server state, or continue the existing thunk pattern consistently. Do not add RTK Query and TanStack Query simultaneously just to collect keywords.

Recommended boundary:

- Server/API state: RTK Query or existing async thunks.
- Cross-page client state: Redux slices.
- URL-shareable state: route query parameters.
- Form-local state: component/reducer state.
- Derived values: selectors, never duplicated state.

### 4.4 Remove blockers before showcasing the project

- Fix the undefined `setIsCartOpen(false)` call in `src/components/Header.jsx`; the account action can currently throw a runtime error.
- Make catalogue browsing public. At present, home, shop, product and search routes are protected, so a recruiter cannot inspect the project without creating an account. Keep checkout, account, orders and sensitive mutations protected.
- Connect the mobile search filters and sort to the same real query state as desktop; the current callbacks are no-ops and the selected mobile sort is not applied.
- Connect the `/shop` pagination and “Show me more” controls to the catalogue request; they currently do not fetch another page.
- Secure `POST /api/products`; it is currently exposed without authentication or role enforcement in `backend/src/modules/products/product.routes.js`.
- Add request validation and an `ADMIN` role check to every new admin mutation.
- Remove hard-coded fallback variant UUIDs from `src/context/CartContext.jsx`; require a valid variant from API data or a deliberate default variant.
- Plan to move refresh credentials out of `localStorage`. Prefer a secure, HTTP-only, SameSite cookie and keep short-lived access state in memory.
- Remove duplicate quick-view ownership in `HomePage`; it currently writes both Redux state and local state.
- Replace the default Vite README before publishing.

## 5. Machine-coding task specifications

## Task 1 - Product autocomplete/typeahead

### Where it belongs

Replace or extend the current search overlay in `src/components/Header.jsx`. Reuse the existing backend product list endpoint:

```http
GET /api/products?search={query}&limit=8
```

Create one shared `ProductAutocomplete` component and reuse it in both the Header overlay and `SearchHero`; do not maintain two search implementations.

### Requirements

- Start searching after two characters.
- Debounce input by approximately 250-300 ms.
- Cancel the previous request with `AbortController` when the query changes.
- Ignore stale responses even if cancellation races with completion.
- Cache recent query results with a small time/size limit.
- Display loading, results, no-results and error states.
- Support Arrow Up/Down, Enter, Escape and Tab.
- Use accessible combobox/listbox/option semantics and maintain the active option.
- Highlight matching text without unsafe HTML injection.
- Selecting a result navigates to `/products/:slug`.
- Add recent searches and a clear-history action as an optional extension.

### Tests

- Debounce makes one request for rapid typing.
- Old request cannot overwrite a newer result.
- Keyboard selection works.
- Escape closes and focus returns to the search trigger.
- Loading, error and empty states are announced correctly.

## Task 2 - URL-synchronized search, filters, sorting and pagination

### Current gap

`src/pages/SearchPage.jsx` uses `SEARCH_PRODUCTS`, performs local filtering and contains disconnected mobile filter handlers. The mobile sort value changes visually but is not applied to the products.

### Required implementation

- Replace static search data with the real `/api/products` endpoint.
- Store `search`, `categories`, `colors`, `sizes`, `minPrice`, `maxPrice`, `sort`, `page` and `limit` in URL parameters.
- Initialize controls from the URL on direct navigation/refresh.
- Back/forward navigation must restore the previous result state.
- Reset `page` to 1 when a filter or sort changes.
- Use real `pagination.total`, `totalPages`, `hasNext` and `hasPrevious` values.
- Correct backend price sorting before relying on it: the current service paginates first and then sorts only the returned page in memory, so `price_asc`/`price_desc` are not globally correct. Sort by a database-computable minimum active variant price before pagination and add a stable secondary key.
- Cancel in-flight requests when query parameters change.
- Provide loading skeleton, stale-data refresh, empty, retry and error states.
- Make desktop and mobile filters share the same state instead of separate mock handlers.

### Interview value

This demonstrates URL state, server state, race handling, reusable filters, API contracts and accessible pagination.

## Task 3 - Infinite catalogue with pagination-mode toggle

### Existing support

`src/redux/slices/productsSlice.js` already contains `append`, `hasNext`, `page` and `loadingMore`. `src/pages/SaleCollection.jsx` currently always requests page 1 and renders a static pagination count.

### Required implementation

- Add `pagination` and `infinite` display modes.
- In infinite mode, place an `IntersectionObserver` sentinel after the grid.
- Request the next page only when `hasNext` is true and no request is active.
- Deduplicate appended products by product ID.
- Reset accumulated items whenever filters or sorting change.
- Show an inline loading skeleton rather than replacing existing results.
- Add retry and a manual “Load more” fallback.
- Preserve scroll position and loaded-page state when returning from a product detail.
- Disconnect the observer during cleanup.
- As a production extension, move from page offsets to a stable `(createdAt, id)` cursor to avoid duplicates/skips when products are inserted during scrolling.

### Tests

- One observer event triggers one page load.
- Duplicate observer events do not create duplicate requests/items.
- Filter changes reset the list.
- End-of-list and failed-page states render correctly.

## Task 4 - Orders data table, then admin extension

### First integration

Build the first version inside the existing order-history area. `orderApi.history({page, limit})` already supplies paginated user data, making this a focused frontend machine-coding exercise without inventing an admin backend first.

Suggested columns: order number, date, item count, total, payment status, order status and actions. Use a responsive card view on small screens.

### Admin extension

`/admin/orders`

### Frontend requirements

- Semantic table with columns: order number, customer, date, item count, total, payment status, order status and actions.
- Server-side search, status filters, date range, sorting, page and page-size controls.
- URL-synchronized table state.
- Column visibility and density controls as optional extensions.
- Row selection and safe bulk actions.
- Loading skeleton, empty state, retry, error and stale-data refresh.
- Responsive alternative for narrow screens.
- Keyboard-accessible sort buttons and selection controls.
- Optional virtualization only after measuring a real rendering problem.

### Backend requirements

Create admin-only endpoints, separate from the current user-scoped order routes:

```http
GET   /api/admin/orders
GET   /api/admin/orders/:id
PATCH /api/admin/orders/:id/status
```

Validate allowed sort fields, page limits, filters and status transitions.

## Task 5 - Shared accessible dialog, drawer and toast system

### Existing components to refactor

- `src/components/QuickViewPanel.jsx`
- `src/components/product/SizeChartModal.jsx`
- Review modal in `src/components/product/ReviewsSection.jsx`
- `src/components/search/MobileFilterDrawer.jsx`
- `src/components/SideCart.jsx`
- Existing `react-hot-toast` usages

### Dialog/drawer requirements

- Move focus into the overlay when it opens.
- Trap focus inside while open.
- Escape closes the topmost dismissible overlay.
- Closing restores focus to the element that opened it.
- Background content cannot be reached by keyboard or assistive technology.
- Backdrop click behavior must be deliberate and consistent.
- Use `role="dialog"`, `aria-modal`, accessible name and description.
- Lock body scroll without losing the previous scroll position.
- Support nested overlays without double-closing.
- Respect `prefers-reduced-motion`.

### Toast requirements

- Use an `aria-live` region with appropriate polite/assertive priority.
- Deduplicate repeated messages.
- Support action and dismiss buttons.
- Pause timeout while hovered or focused.
- Do not use a toast as the only representation of a form error.

## Task 6 - Multi-step checkout form

### Existing foundation

`src/pages/Checkout.jsx` already integrates addresses, orders, pending checkout state and Razorpay, but it is a very large single-page component.

This task is a refactor and production-hardening exercise, not a ground-up checkout rebuild. The current page already has Contact, Shipping and Payment sections, validation and pending-order recovery.

### Proposed steps

1. Contact and shipping address.
2. Delivery and order review.
3. Payment initiation.
4. Confirmation/recovery.

### Requirements

- Model the flow explicitly with a reducer/state machine rather than scattered booleans.
- Validate only the current step and summarize all blocking errors before payment.
- Preserve safe form progress in session storage; never persist payment secrets.
- Prevent double submission.
- Restore a resumable pending order safely.
- Handle stock/price changes before payment.
- Preserve immutable order snapshots.
- Make browser Back and step Back behavior predictable.
- Announce step and validation changes accessibly.
- Keep Razorpay signature verification on the backend.
- Add an idempotency key for final order creation/payment initiation.
- Add a signed Razorpay webhook so a successful payment can be finalized even if the browser closes before callback verification.
- Define refund and stock-restoration behavior before allowing cancellation of a paid/confirmed order.

### Tests

- Cannot continue with invalid required fields.
- Refresh restores safe progress.
- Duplicate clicks produce one order/payment attempt.
- Failed payment can retry without duplicating a successful charge.

## Task 7 - Persistent cart with optimistic updates

### What is already strong

The cart is server-backed. Guest identity uses an HTTP-only `cart_session` cookie. The Redux slice keeps the server response as the source of truth, and money remains exact on the server.

Do not replace this with a localStorage-only tutorial cart. Present the existing design as a case study, add tests, and harden its edge cases.

### Improvements

- Add intentional optimistic quantity updates with rollback when the API fails, or clearly explain why pessimistic updates were chosen.
- Disable or serialize conflicting mutations for the same line item.
- Show per-line pending/error state rather than one global spinner.
- Merge the guest cart into the user cart during login with a defined conflict rule.
- Revalidate stock and current price before order creation.
- Expose the backend's existing `POST /api/cart/validate` through `src/services/cartApi.js` and call it before checkout.
- Handle an item deleted/deactivated after it was added.
- Synchronize multiple browser tabs using a safe refresh signal, not a duplicate cart source of truth.
- Remove hard-coded fallback variant IDs.
- Add guest-cart expiry/cleanup and enforce that a cart belongs to exactly one of `userId` or `sessionId`.

## Task 8 - Recursive category-tree manager

### New route

`/admin/categories`

### Why it fits this project

The Prisma `Category` model already supports a self-referencing parent/children tree. This is the e-commerce version of a file-explorer/nested-comments machine-coding problem.

Start with a read-only accessible `CategoryTree` in the shop filter or header using the existing category parent/children response. Then extend the same recursive component into the protected admin manager below.

### Requirements

- Render any tree depth recursively.
- Expand/collapse nodes and preserve expansion state.
- Search and reveal matching nodes with their ancestors.
- Add child, rename, move and deactivate category actions.
- Inline edit with validation and cancel/save behavior.
- Optimistic update with rollback.
- Prevent a category from becoming its own ancestor.
- Full keyboard support using tree/treeitem semantics.

### Backend requirements

Add admin-protected category CRUD/move endpoints with cycle detection and transactions.

## Task 9 - Order-status Kanban board

### New route

`/admin/order-board`

### Requirements

- Columns for allowed order statuses.
- Drag or keyboard-move an order between columns.
- Optimistically update, then rollback on API rejection.
- Enforce allowed status transitions on the backend.
- Provide accessible non-drag controls as an alternative.
- Filter/search orders and preserve filters in the URL.
- Show pending, failed and conflict states per card.
- Prevent a delayed response from overwriting a newer status.

Reuse the admin order endpoint introduced for the data table.

## Task 10 - Streaming AI shopping assistant

### New route

`/assistant`

### Frontend requirements

- Submit a natural-language shopping request.
- Stream partial assistant output using a streamed `fetch` response or SSE.
- Cancel with `AbortController`.
- Regenerate the last response.
- Retry after network/stream failure.
- Prevent a cancelled/old stream from writing into the current message.
- Model message status explicitly: queued, streaming, completed, cancelled, failed.
- Display linked product cards from the real product catalogue.
- Maintain keyboard focus and announce streamed status without reading every token aloud.
- Include empty state, starter prompts and rate-limit state.

### Backend requirements

```http
POST /api/assistant/stream
```

- Keep provider/API credentials only on the backend.
- Validate message length and conversation shape.
- Rate-limit the endpoint.
- Abort provider work when the client disconnects where supported.
- Never allow the model to invent price or stock; retrieve current product data from the database and treat it as authoritative.
- Log request IDs and failure categories without logging sensitive message content by default.
- Provide a deterministic fake-stream mode for tests and demos.

## Task 11 - Product Q&A with recursive replies

### Why this belongs in the project

`ReviewsSection.jsx` currently renders hard-coded flat review data and the write-review modal does not persist a review. Implementing Product Q&A provides the nested-comments machine-coding pattern without adding an unrelated social-media screen.

### Requirements

- Add Question and Answer data models, or a self-referencing thread model with `parentId`.
- Render replies recursively with a clearly defined maximum nesting depth.
- Expand/collapse branches and preserve expanded state.
- Create, reply, edit and delete with ownership/role checks on the backend.
- Use optimistic create/edit with temporary IDs and rollback on failure.
- Paginate root questions; load replies on demand for large threads.
- Prevent duplicate submissions and delayed responses from overwriting a newer edit.
- Sanitize or safely render user content.
- Add keyboard-accessible actions, correct heading structure and live status messages.
- Test empty, loading, error, deep nesting, optimistic rollback and authorization states.

Also connect the existing product reviews UI to the real backend review data; do not leave the hard-coded `REVIEWS` array in the portfolio build.

## Task 12 - Product gallery/carousel hardening

Enhance the existing gallery/carousels rather than creating another one.

- Previous/next buttons and arrow-key navigation.
- Correct focus order and visible focus styles.
- Touch/swipe behavior without breaking page scroll.
- Selected-thumbnail state exposed accessibly.
- Lazy-load non-current images and prefetch the next image.
- Stable image dimensions to avoid layout shift.
- Graceful failed-image placeholder.
- Reduced-motion behavior.
- Tests for first/last slide, keyboard input and responsive behavior.

## Task 13 - Optional file-upload manager

Use the account avatar or product-admin image upload as the domain feature.

- Drag/drop and file picker.
- Type/size validation.
- Multiple-file queue with progress.
- Cancel, retry, remove and reorder.
- Image preview cleanup with `URL.revokeObjectURL`.
- Server-generated file names and safe MIME validation.
- Never trust the browser-provided MIME type alone.

This is optional after the higher-priority interview features above.

## 6. Backend/API work summary

| Feature | Existing API support | New backend work |
|---|---|---|
| Autocomplete | Product `search` + `limit` already exist | Optional suggestion ranking/indexing only |
| URL filters/pagination | Product filters, sort, page, limit exist | Confirm response metadata and add DB indexes after measurement |
| Infinite scroll | Product pagination exists | None beyond stable cursor/page contract |
| Persistent cart | Cart, guest cookie, validation and guest-to-user merge already exist | Ownership constraint, guest cleanup, concurrency/idempotency hardening |
| Multi-step checkout | Addresses, orders, payments exist | Idempotency/recovery validation and tests |
| Admin table/Kanban | User-scoped orders only | Admin list/detail/status endpoints |
| Category tree | Public category listing exists | Admin CRUD/move/deactivate endpoints |
| Product Q&A | Flat review model exists | Threaded question/reply model, CRUD and authorization |
| AI assistant | Missing | Streaming backend proxy and product retrieval |
| File uploads | Profile field exists, upload flow incomplete | Secure upload/storage endpoint if implemented |

## 7. Security and data-integrity requirements

These must be addressed before calling the project production-ready:

1. Protect product creation and all admin mutations with authentication plus `ADMIN` authorization.
2. Validate every query/body/route parameter with bounded limits.
3. Repair the refresh-token contract: the frontend posts an empty body and the controller can read the cookie, but the current route validator requires a body `refreshToken` before the controller runs.
4. Stop returning/storing refresh tokens in browser `localStorage`; keep refresh credentials only in a secure HTTP-only SameSite cookie.
5. Mount the existing user/profile routes, which are imported but currently not registered in `backend/src/routes/index.js`.
6. Never trust cart totals, stock, discounts or payment success from the browser.
7. Keep Razorpay and AI-provider secrets on the backend.
8. Add a signed Razorpay webhook and reuse idempotent payment-finalization logic.
9. Do not let cancellation of a confirmed/paid order merely flip status; implement refund/restock or restrict cancellation to safe states.
10. Add automatic or queued refund handling for captured payments that cannot be fulfilled.
11. Add user-scoped idempotency for order submission and expire abandoned pending orders/coupon reservations.
12. Keep money as Decimal/string through the financial boundary.
13. Use unique/idempotency constraints for repeated payment/order operations.
14. Sanitize or safely render all user-generated review/Q&A/assistant content.
15. Rate-limit auth, search abuse, admin mutations and AI streaming appropriately.
16. Do not log passwords, tokens, raw payment secrets or sensitive AI conversations.
17. Do not ship a fixed seed-admin password; require an environment-provided value and prevent production seeding.

## 8. Testing plan

### Frontend tooling

Add:

- Vitest.
- React Testing Library.
- `@testing-library/user-event`.
- MSW or an equivalent API mock layer.
- Playwright.
- An accessibility test helper such as axe.

### Test pyramid for every machine-coding module

#### Unit

- Debounce/cache/reducer/selectors/formatters.
- URL-state parsing and serialization.
- Pagination and state-transition rules.
- Stream parser and stale-request guards.

#### Component/integration

- User-visible success, loading, empty, error and retry states.
- Keyboard interaction and focus restoration.
- API response ordering and cancellation.
- Optimistic update/rollback.
- Form validation and step transitions.

#### E2E

At minimum automate:

1. Public catalogue browsing, then sign up/login and protected-route access.
2. Search/autocomplete to product detail.
3. Filter/infinite catalogue behavior.
4. Add/update/remove cart and refresh persistence.
5. Checkout failure/retry with a mocked payment provider.
6. Admin order filter/status update.
7. Product Q&A create/reply/edit authorization and rollback.
8. AI stream cancel/regenerate using the fake stream.

### Backend

Extend existing Jest/Supertest coverage for:

- Product query boundaries.
- Admin authorization.
- Category cycle prevention.
- Valid/invalid order status transitions.
- Idempotent payment/order retry.
- Assistant validation, rate limiting, streaming cleanup and disconnect behavior.

## 9. Accessibility definition of done

Every feature must pass these manual checks:

- Complete the flow using only the keyboard.
- Focus is always visible and never lost.
- Dialog focus is trapped and restored.
- Forms have programmatic labels and useful error associations.
- Dynamic status is announced without excessive interruption.
- Controls use native elements wherever possible.
- Color is not the only state indicator.
- Content remains usable at 200% zoom and narrow widths.
- Motion respects the reduced-motion preference.
- Empty/error/loading states are understandable without icons alone.

## 10. Performance work

- Establish a Lighthouse/DevTools baseline before optimization.
- Lazy-load route-level pages with `React.lazy`/Suspense.
- Keep image dimensions stable; lazy-load and properly size images.
- Measure render frequency with React Profiler before adding memoization.
- Avoid filtering/sorting large datasets on every render when the server already supports it.
- Use pagination/virtualization based on measured data size.
- Prevent duplicate network requests and cancel obsolete ones.
- Analyze the production bundle and remove unused static template assets/files.
- Record before/after evidence for at least one meaningful improvement.

Do not claim a performance percentage unless measured under the same conditions.

## 11. CI and delivery

Create a CI workflow that runs on every pull request:

1. Install frontend/backend dependencies with lockfiles.
2. Frontend lint.
3. TypeScript type-check.
4. Frontend unit/integration tests.
5. Frontend production build.
6. Backend lint/format check.
7. Backend tests.
8. Playwright smoke tests against a test environment or local composed stack.

Keep environment variables documented in `.env.example`. Never commit real secrets.

## 12. Recommended implementation order (10-12 weeks)

| Phase | Deliverable | Interview pattern proved |
|---|---|---|
| Foundation (2-4 days) | Correctness/security blockers, TypeScript/test baseline, architecture folders | Engineering hygiene |
| 1 | Autocomplete/typeahead | Debounce, cache, async races, accessibility |
| 2 | API/URL-driven search, filters, sort, pagination | URL state, server state, reusable controls |
| 3 | Infinite catalogue | Observer, append/deduplication, cleanup |
| 4 | Shared dialog/drawer/toast system | Focus management, events, portals |
| 5 | Checkout refactor and cart case-study tests | Forms, reducer/state machine, persistence |
| 6 | Order-history data table, followed by admin permissions/endpoints | Tables, server pagination, filtering, sorting |
| 7 | Accessible category tree and admin category manager | Recursion, tree keyboard model, optimistic updates |
| 8 | Product Q&A with recursive replies | Recursive rendering, ownership, optimistic CRUD |
| 9 | Order Kanban | Drag/keyboard interaction, transition rules, rollback |
| 10 | Streaming AI shopping assistant | Streams, cancellation, retry, stale response control |
| 11 | Carousel hardening, E2E tests, accessibility and performance | Production quality |
| 12 | README, architecture diagram, deployment and demo recording | Communication and ownership |

If this runs alongside full-time work, begin applying after Week 6; do not wait for every optional extension. Autocomplete, real search, infinite scroll, accessible overlays, checkout/cart depth and the orders table provide the highest early interview return. Category tree, Product Q&A, Kanban and AI then deepen the portfolio while applications are active. The file uploader is optional.

## 13. Definition of done for each task

A feature is not complete when it only looks correct.

- Core behavior works from a clean load.
- Loading, empty, success, error, retry and cancellation states exist where relevant.
- Keyboard and screen-reader semantics are implemented.
- Mobile and desktop layouts work.
- Requests are bounded, cancellable or deduplicated as appropriate.
- State has a clear owner and derived values are not duplicated.
- At least one unit and one user-level component/integration test exist.
- Critical feature path has E2E coverage.
- Backend validates and authorizes every sensitive operation.
- Trade-offs and known limitations are documented.
- The feature can be explained and rebuilt in a 60-90 minute simplified form.

## 14. Portfolio-ready README

Replace the current Vite README with:

1. Problem and target users.
2. Screenshots/live demo.
3. Feature matrix.
4. Frontend/backend architecture diagram.
5. State ownership diagram.
6. Database and API overview.
7. Security decisions.
8. Testing strategy and commands.
9. Accessibility checks.
10. Performance measurements.
11. Setup and environment variables.
12. Trade-offs, known limitations and next steps.

Add a short “Interview demonstrations” section linking directly to autocomplete, admin table, infinite catalogue, checkout and AI assistant routes.

## 15. Questions you should be able to answer after implementation

- Why did you choose URL state, Redux state or local state for each value?
- How do you prevent stale autocomplete/stream responses?
- Why is server-side pagination preferable for the admin table?
- How does infinite scroll avoid duplicate requests and items?
- How does the modal trap and restore focus?
- How does cart persistence work without duplicating server state in `localStorage`?
- How do order/payment retries remain safe?
- How does optimistic order movement rollback after failure?
- How do you prevent cycles in the category tree?
- Why did you choose SSE, streamed `fetch` or WebSocket for the assistant?
- What did you measure before optimizing?
- Which failure did your tests catch?
- What would need to change for 100,000 products or orders?

This project should become evidence that you understand production frontend engineering, not just a collection of UI screenshots.
