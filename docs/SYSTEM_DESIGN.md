# E-commerce System Design — A Beginner-Friendly Guide

Project: `eccommerce` (the "eco" project)  
Document type: system design guide and roadmap  
Audience: **you**, assuming you are new to system design. Every concept is explained from zero before it is used, and every design is tied to code that actually exists in this repository.  
Status: living document. Update it when a decision changes.

---

## 0. How to read this document

- Read parts 1–3 first. They give you the mental model everything else hangs on.
- Parts 4–9 are the "hard core" of e-commerce design. These are also the most common interview questions. Each part follows the same shape:
  1. **The problem** in plain words.
  2. **The concept** explained from zero (with an everyday analogy).
  3. **How this project solves it** (with real file references).
  4. **Alternatives considered** and the trade-off — this is what interviewers actually probe.
- Parts 10–16 cover supporting systems: caching, search, jobs, security, media, observability and scaling.
- Part 17 is a checklist of artifacts to produce. Part 18 is an interview cheat sheet. Part 19 is a glossary you can search when a term confuses you.

> **A note on honesty.** Your PRD (section 1.2) says: do not claim a scale you have not tested. This guide follows the same rule. Every design here is described at the scale it was actually built for, plus a *designed* growth path (part 16). "I built a modular monolith and I can tell you exactly what would force me to split it" is a stronger answer than a microservices diagram nobody tested.

---

## 1. System design in one page

### 1.1 What is system design?

Writing code that *works* is programming. System design is the set of decisions that decide whether your code *keeps working* when:

- two things happen at the same time (concurrency),
- something fails halfway through (failures),
- the same thing happens twice by accident (duplicates),
- there are 10 users, then 10,000 (scale),
- someone tries to break in (security),
- and nobody is watching at 3 a.m. (operations).

System design is mostly about answering one question over and over:
**"What happens if this fails, repeats, or gets slow?"**

### 1.2 The two kinds of requirements

| Type | Question it answers | Eco examples |
|---|---|---|
| **Functional** | What does it do? | "A user can add a variant to a cart and pay with Razorpay." |
| **Non-functional (NFR)** | How well must it do it? | "Checkout must never sell the same last item twice." / "Catalogue API p95 ≤ 700 ms." / "No refresh token in localStorage." |

Beginners focus on functional requirements. System design is 90% about the non-functional ones. Your PRD already lists them (section 13.1 performance budgets) — that document is effectively your NFR contract.

### 1.3 The ten words you will meet everywhere

| Term | Plain meaning | Analogy |
|---|---|---|
| **Latency** | How long *one* request takes | Time for one customer to get their coffee |
| **Throughput** | How many requests per second you handle | Coffees made per minute |
| **p95 / p99** | The slowest 5% / 1% of requests | "Almost everyone is fast, but 1 in 20 waits 2 s" |
| **Vertical scaling** | Bigger machine | Get a bigger coffee machine |
| **Horizontal scaling** | More machines | Get more coffee machines |
| **Stateless** | Server keeps no memory between requests; any machine can serve any request | Any barista can take your order because it's written on the cup |
| **Cache** | Fast temporary copy of slow-to-compute data | Notes on your desk instead of walking to the library |
| **Queue** | Do expensive work later, in order | Printer queue |
| **Idempotency** | Doing it twice has the same effect as once | Elevator buttons — pressing five times still calls one elevator |
| **Availability** | Fraction of time the service works | "Open 99.9% of the month" = ~43 minutes of downtime allowed |

### 1.4 The restaurant mental model (keep this)

Map the eco system to a restaurant and every future concept has a home:

```
Customer at table        = browser / mobile app (React + Expo)
Waiter taking the order  = API gateway (ports 5000 -> 5001)
Kitchen stations         = backend modules (auth, cart, orders, payments...)
Head chef's recipe book  = PostgreSQL (the source of truth)
Fridge note "2 naan left"= Redis (fast, not the source of truth)
Delivery partner         = Razorpay (external payment provider)
Receipts archive         = order snapshots (immutable copies)
The bell the kitchen rings when food is ready = webhook
```

If a sentence about the system confuses you, translate it into the restaurant and it usually becomes obvious.

---

## 2. The big picture — what the eco system looks like today

### 2.1 Level 1: the context (who talks to whom)

```
                          +---------------------+
                          |   Shoppers          |
                          |   (browser, phone)  |
                          +----------+----------+
                                     |  HTTPS
                     +---------------+----------------+
                     |                                |
              React storefront                Expo mobile app
              (Vite, :3000)                   (eco-mobile)
                     |                                |
                     +----------------+---------------+
                                      |
                                      v  HTTPS :5000
                       +------------------------------+
                       |        API GATEWAY           |
                       |  security headers, tracing   |
                       |  (X-Request-Id, latency)     |
                       +--------------+---------------+
                                      |  :5001
                       +------------------------------+
                       |     CORE BACKEND (Express)   |
                       |  modular monolith:           |
                       |  auth cart orders payments   |
                       |  products reviews wishlist   |
                       |  users addresses upload ...  |
                       +---+-------------+---------+--+
                           |             |         |
              +------------+   +---------+  +------+----------+
              v                v            v                 v
        +-----------+   +------------+  +-----------+   +-----------+
        |PostgreSQL |   |   Redis    |  |Cloudflare |   | Razorpay  |
        | (Neon)    |   | rate limit |  |  R2       |   | payments  |
        | TRUTH     |   | + cache    |  | images    |   | + SMTP    |
        +-----------+   +------------+  +-----------+   +-----------+
```

Why a gateway at all? For the same reason a restaurant has a host at the door: one place that greets everyone, applies the same rules (security headers, request IDs, health aggregation) before passing you to a table. In code: `backend/src/gateway/` (see `backend/API_GATEWAY.md`).

### 2.2 Level 2: one request's journey (the 12 steps)

When a shopper opens `/products/blue-kurta`, this happens:

```
 1. Browser loads the React app (static files — CDN-friendly, no server cost)
 2. React Router matches /products/:slug, renders the page component
 3. Component dispatches a Redux async thunk
 4. Axios sends GET /api/products/blue-kurta to the gateway (:5000)
 5. Gateway injects X-Request-Id (a name tag for this request)
 6. Gateway proxies to the core backend (:5001)
 7. Rate limiter checks Redis: is this identity inside its budget?
 8. Route -> controller -> service (business rules) -> Prisma (query builder)
 9. Prisma runs one SQL query against PostgreSQL
10. Service returns data; controller maps it to JSON with stable error codes
11. Response travels back through the gateway (which adds timing headers)
12. Redux slice stores it; the UI renders loading -> success state
```

Memorize this pipeline. Almost every problem in this document is a problem at one of these 12 steps, and debugging = asking "which step broke?".

### 2.3 Level 3: the module pattern inside the backend

Every module in `backend/src/modules/<name>/` follows the same four files:

```
<name>.routes.js        WHAT URLs exist            (the menu)
<name>.controllers.js   HTTP <-> plain objects     (the waiter)
<name>.service.js       business rules + DB        (the chef)
<name>.validators.js    Zod input checking         (the doorman)
```

Rule: controllers never touch the database, services never know HTTP exists. This is what your PRD §11.1 means by "modular monolith" — one deployable app with clean internal walls, so a future split (if ever needed) is a move, not a rewrite.

---

## 3. Decision 1: modular monolith vs microservices

This is the first system design decision every project makes, and the one interviewers ask first. Understand both deeply.

### 3.1 The two options, honestly

| | Modular monolith (your choice) | Microservices |
|---|---|---|
| Deploy | One app, one command | N apps, coordinated deploys |
| Data | One database, one transaction | Each service owns data; cross-service consistency is YOUR problem |
| Failure | One bug can take all down | One service can die independently |
| Team | Works for 1–10 devs | Designed for many teams, each owning a service |
| Cost of a bug fix | Minutes | Can require cross-service API changes + deploys |
| Local dev | `npm run dev:all` | Need to run/stub 5–15 services |

### 3.2 Why monolith is correct *for this project*

1. One developer (you). A distributed system you cannot debug alone at 2 a.m. is not architecture, it is self-harm.
2. Your hardest problems — checkout, inventory, payments — are **transactional**. In a monolith, "decrement stock, create order, mark coupon used" is one database transaction. Split orders and inventory into separate services and you must invent distributed transactions (sagas, two-phase commit) — a large, subtle, failure-prone machine — to get back what the monolith gave you free.
3. Your PRD §1.3 explicitly lists "microservices for portfolio keywords" as a non-goal.

### 3.3 The answer that wins interviews

> "It's a modular monolith: one deployable, but with enforced module boundaries (routes/controller/service/validator, Zod contracts, shared error codes). The boundaries are the seam. If a module ever needs independent scaling — say search — I extract it along that seam, give it its own database slice, and the rest of the system doesn't change. What would actually force that split: a measured hot-spot (p95 budget breach that caching can't fix), or a second team owning a domain."

That sentence proves you understand *why* microservices exist, which is worth more than having them.

---

## 4. Database design — the decisions that outlive your code

Schemas live for years; code is rewritten many times. These are the decisions in `backend/prisma/schema.prisma` and why each is right.

### 4.1 Why variants carry price and stock, not products

A "kurta" (Product) has no price. "Kurta, Blue, XL" (ProductVariant) does. Stock and price are properties of *the thing you physically ship*, so they live on the variant. Every hard problem in part 5 happens at the variant level, and this model makes that explicit:

```
Product (name, slug, description)          1
   └── ProductVariant (sku, price, stock)  *   <- money and inventory live here
```

### 4.2 Snapshots — copying data that must never change

The `Order` model **copies** the shipping address into plain columns (`shippingLine1`, `shippingCity`, ...) instead of linking to the `Address` table. `OrderItem` likewise copies `unitPrice` at purchase time.

Why: an invoice is a legal record of *what was true at purchase time*. If a customer edits their saved address next week, last month's invoice must still show where it actually shipped. Linked data changes; copied data can't.

```
            customer edits address
                    |
  Address row:  changes                 <- fine, that's its job
  Order copy :  unchanged               <- correct, that's also its job
```

**Beginner rule:** link data that should *stay in sync* (cart -> variant), copy data that should *stay frozen* (order -> address, price).

### 4.3 Deleting a user must never delete money records

In `Order`, the user relation is `onDelete: SetNull`, not `Cascade`:

- **Cascade** would mean: delete user -> silently delete all their orders. Financial records vanish. Illegal in most jurisdictions.
- **SetNull** means: delete user -> orders survive, `userId` becomes null. The records remain for accounting; they are just de-identified.

This one line in a schema file is a complete answer to "how do you handle GDPR-style deletion requests?" — deactivate the account, null the link, keep the financial record.

### 4.4 Indexes — the book-index trick

Without an index, `WHERE status = 'PENDING' AND expiresAt < now()` reads **every row** in `orders` (a *sequential scan* — flipping every page of the book). An index is the alphabetized index at the back: the database jumps straight to matching rows.

The schema's composite index `@@index([status, expiresAt])` exists for exactly one query: the expiry sweeper (part 7.4). That is the design habit to learn: **indexes are chosen for your known hot queries, not guessed.**

Which indexes exist and the queries they serve:

| Index | Serves |
|---|---|
| `orders([status, expiresAt])` | The pending-order expiry sweep |
| `orders([userId])` | "My orders" page |
| `productVariants(productId)` | Product page loading its variants |
| `idempotency_keys([userId, key])` (unique) | Idempotency lookup (part 6) |

Cost of an index: every write must also update it. Indexing everything slows inserts for no gain. Choose deliberately.

### 4.5 Pagination — offset vs keyset (cursor)

"Show products 51–100" has two implementations:

**Offset** (`LIMIT 50 OFFSET 50`): simple, but the database must still walk and throw away the first 50 rows — and if a new product is inserted while the user is on page 2, rows shift and an item appears twice or disappears.

**Keyset** (`WHERE (price, id) < (lastSeenPrice, lastId) LIMIT 50`): the database jumps straight after the last item the user saw. Stable, fast at any depth. Cost: the client must remember a cursor, and it forces a consistent sort order.

Design rule used across this project's API: **keyset for infinite scroll, offset only for small admin tables** where nobody notices a shifted row.

### 4.6 ACID transactions — the all-or-nothing box

A transaction wraps several SQL statements so they either **all** succeed or **all** roll back. ACID = Atomic (all or nothing), Consistent (rules never broken), Isolated (concurrent transactions can't see each other's half-done work), Durable (committed = survives a crash).

This project wraps *complete business actions* in `prisma.$transaction(...)` (PRD §11.1) — "create order + decrement stock + mark coupon used" is one box, never one query per box. When you read the checkout code in part 5, the transaction boundary *is* the design.

### 4.7 Money is `Decimal`, never `Float`

`Decimal(10,2)` in the schema. Binary floats cannot represent 0.10 exactly (the classic `0.1 + 0.2 = 0.30000000000000004`); decimals can. Storing money in floats creates cents that appear and disappear. This is a one-way door — migrating a live money column later is terrifying — so it is set correctly on day one.

---

## 5. The hardest problem: selling the last item twice

This is *the* e-commerce system design problem, and your PRD calls it out explicitly (§1.2 "focused concurrent final-item checkout tests"). Go through it slowly — it teaches the general lesson about concurrency.

### 5.1 The race condition, step by step

Two shoppers, Aisha and Ben. One Blue Kurta, XL, in stock. Both check out at the same millisecond. The naive code is:

```js
// READ the stock, decide, then WRITE
const variant = await getVariant(id);      // both read stock = 1
if (variant.stock < qty) throw SoldOut();  // both pass: 1 >= 1
await setStock(variant.stock - qty);       // both write stock = 0
```

Timeline of the disaster:

```
Time  Aisha's request            Ben's request          DB stock
 t1   read stock ---------->                            1
 t2                               read stock ---->      1
 t3   check 1 >= 1 : OK                                  1
 t4                               check 1 >= 1 : OK     1
 t5   write stock = 0 --------->                        0
 t6                               write stock = 0 -->   0
 t7   order created (paid!)                             -1 sold!
 t8                               order created (paid!)  -2 sold, 1 shipped
```

Both paid, one kurta exists. This bug is invisible in development (one user, one click at a time) and 100% guaranteed in production during a sale. The gap between t1–t4 (read) and t5–t6 (write) is called **time-of-check to time-of-use (TOCTOU)** — every concurrency bug is some version of it.

### 5.2 The three real solutions

**Option A — Pessimistic locking** ("lock the row, then think"):
`SELECT ... FOR UPDATE` on the variant row. Aisha's transaction locks it; Ben *waits* until she commits, then re-reads stock = 0 and fails.

- Pro: simple to reason about; the DB enforces queueing.
- Con: under a flash sale, hundreds of buyers queue on *one row* — a physical line at a single counter. Wait times stack; connections are held open while waiting (see part 16 on connection pools).

**Option B — Atomic conditional decrement** ("decide and write in one indivisible step") — **this is what the project does**:

```js
// order.service.js (simplified from the real code)
const result = await tx.productVariant.updateMany({
  where: { id: variant.id, stock: { gte: qty } },   // condition + action
  data:  { stock: { decrement: qty } },             // in ONE SQL UPDATE
});
if (result.count !== 1) throw InsufficientStock();  // someone else won
```

The database executes `UPDATE ... WHERE id = ? AND stock >= ?` as a single statement. Two concurrent UPDATEs on the same row are serialized by PostgreSQL's row lock *for the microsecond the update takes* — there is no read-decide-write gap to race through. Exactly one of Aisha/Ben matches `stock >= 1`; the other updates zero rows, sees `count === 0`, and the whole transaction rolls back.

- Pro: no held locks, no waiting line, survives any burst; one line of code.
- Con: the "loser" only learns afterwards, so the error message must be handled gracefully (the code first does a friendly read-check to give "Only 1 of Blue Kurta remain" before the atomic step enforces truth).

**Option C — Reservations with TTL** ("hold the item, confirm later"):
at checkout start, reserve stock (decrement + set `expiresAt`), then wait for payment. If payment never arrives before expiry, a background job releases the stock back. This project implements this as the **order expiry sweeper** (part 7.4): pending orders carry `expiresAt`, indexed for exactly that sweep.

Real stores combine B and C: atomically reserve (B) with a deadline (C).

### 5.3 Why the friendly pre-check does not break correctness

The code *does* read stock first (`variant.stock < item.quantity` throws a nice message). Isn't that the broken read-decide-write? No — the pre-check is only **UX**, and the atomic decrement is the **truth**. The pre-check answers "should I even bother the payment gateway?"; the `updateMany` is the bouncer that cannot be fooled. Correctness never depends on a value read earlier.

```
read-check (UX only)  ->  atomic decrement (correctness)  ->  payment
      may lie                   never lies                    after truth
```

### 5.4 What to document for this design (your artifact)

1. The sequence diagram above, redrawn with three actors (client, order service, DB) and the transaction box marked.
2. The concurrency test: fire N simultaneous checkouts at 1 remaining unit, assert exactly one succeeds and stock ends at 0 — an automated test, not a claim.
3. The trade-off paragraph: "we chose atomic conditional decrement over `SELECT FOR UPDATE` because it holds no locks during payment-provider latency, and over reservations-only because a reservation without a TTL leaks stock when users abandon checkout."

---

## 6. Idempotency — doing the same thing twice, safely

### 6.1 Why duplicates are *inevitable*, not user error

The internet retries. A user double-clicks "Pay". A mobile network drops the response but the request arrived. A gateway timeout makes your frontend retry. In all cases your backend receives **two identical requests** and must treat them as one. Any endpoint that creates something (orders, payments) or moves money needs idempotency; a duplicate order is a customer-service incident and a duplicate *charge* is a legal one.

Analogy: elevator buttons. Press five times, one elevator comes. The button is idempotent — pressing again doesn't order more elevators.

### 6.2 The design (and the table that implements it)

The client generates a random key (a UUID) *before* the first attempt and sends the same key on every retry. The server remembers the key and replays the stored answer instead of redoing the work. `IdempotencyKey` in the schema:

```
key            <- the client's UUID for this logical operation
userId         <- scope: your key, not someone else's  (unique [userId, key])
requestPath    <- which endpoint
requestHash    <- fingerprint of the body (same key + different body = error)
status         <- PROCESSING | COMPLETED | FAILED
responseStatus + responseBody  <- the recorded answer to replay
expiresAt      <- how long we promise to remember (a bounded promise)
```

Flow of the **first** request:

```
client -> POST /api/orders  (Idempotency-Key: abc123)
server:   INSERT INTO idempotency_keys (key=abc123, status=PROCESSING)
             unique([userId,key]) makes a concurrent twin FAIL here
server:   run the checkout transaction
server:   UPDATE row -> COMPLETED, store the response, return it
```

Flow of the **retry** (network died before the client saw the answer):

```
client -> POST /api/orders  (Idempotency-Key: abc123)   <- same key
server:   row found, COMPLETED -> return stored responseBody (no re-run)
client:   sees the original order. No duplicate. No double charge.
```

Flow of a **concurrent duplicate** (double-click, two in-flight requests):

```
request 1: INSERT wins  -> PROCESSING -> does the work
request 2: INSERT fails (unique violation)
           -> wait/poll for request 1's outcome, then return the same answer
```

Three details that separate a real design from a toy:

1. **The unique constraint is the lock.** Two racing inserts cannot both win; the database enforces it. No application lock needed.
2. **`requestHash` catches misuse**: same key with a *different* body is a client bug — return 422, never silently replay an answer to a different question.
3. **`expiresAt` bounds the promise.** Remembering keys forever is unbounded storage; 24 hours covers any realistic retry storm, then the row can be swept.

### 6.3 Where idempotency must exist in eco (checklist)

| Operation | Why it must be idempotent | Mechanism |
|---|---|---|
| Create order | double-click, retry after timeout | Idempotency-Key (above) |
| Verify payment | callback + webhook may both arrive | unique constraint on payment + row serialization (part 7.3) |
| Webhook processing | providers redeliver webhooks repeatedly | same row guard |
| Guest cart merge | login retried / two tabs | guest cart deleted in the same transaction that merges it — the second merge finds nothing to do |
| Coupon use | retry of a merged checkout | `usedCount` decremented exactly once inside the same transaction as cancellation |

Notice the pattern: **every idempotency mechanism reduces to either a unique constraint or a conditional update** — the same two primitives as part 5.

---

## 7. Payments — money, trust, and recovery

### 7.1 Why the card form is never yours

PCI-DSS (the card-industry security standard) makes storing or even *touching* raw card data a massive compliance burden. So the design is: your server creates a Razorpay *order* (amount, currency, receipt id), Razorpay's hosted form collects the card/UPI, and Razorpay tells you the result. Your system never sees a card number. Your PRD hard-codes this decision (§1.3 non-goal: "no custom payment-card form").

### 7.2 The three endings of a payment

This is the part beginners miss: the payment has **two independent channels** that can deliver the result, plus failure:

```
                      Razorpay checkout
                            |
        +-------------------+---------------------+
        |                   |                     |
  1. Success handler   2. Webhook (server-to-  3. Neither
     (browser JS          server, signed)        (browser closed,
     calls your verify)      |                    network died)
        |                   |                     |
        v                   v                     v
   verify + mark paid   verify + mark paid    order stays PENDING
```

- **Channel 1** (callback): the shopper's browser calls your verify endpoint. Instant feedback — but browsers are unreliable (closes, loses network).
- **Channel 2** (webhook): Razorpay's servers POST a signed event to *your* server. Reliable — but asynchronous and can arrive before, after, or *simultaneously* with channel 1.
- **Channel 3**: both fail to tell you. The order must not sit reserved forever — that's the sweeper (7.4).

**The design conclusion: never trust the browser as the only messenger.** The webhook is the source of truth; the callback is a UX optimization. And both channels deliver the *same event*, so payment handling must be idempotent.

### 7.3 Signatures and the callback/webhook race

**Signature (HMAC), in plain words.** Alongside the payment result, Razorpay sends a signature: `HMAC_SHA256(order_id|payment_id, secret_key)`. Only you and Razorpay know the secret. You recompute the digest; if it matches, the message is authentic and untampered — a wax seal that only the real sender can press. `verifyCheckoutSignature()` in `payment.service.js` does exactly this. Without it, anyone who guesses your URL could POST "payment succeeded".

**The race.** Channel 1 and channel 2 can hit you simultaneously for the same payment. Both would do "mark payment captured, mark order paid". Done naively — two reads, both see PENDING, both write — you could double-apply consequences. The service handles this by making the payment row the serialization point: the code notes that a callback and a webhook racing each other "serialize on this row; only one can change" it. Same lesson as part 5, different shape: **when two processes must not both win, make one durable thing (a row) the arbiter and let the unique/conditional update pick the winner.**

### 7.4 The order expiry sweeper (reservation release)

Pending orders hold reserved stock. If payment never arrives, the reservation must expire automatically — otherwise abandoned checkouts slowly drain your inventory (stock leaks; every sale ends with "out of stock" for items sitting in dead carts).

Design, as implemented:

```
Order.expiresAt = now + 15 min at creation        (the promise)
@@index([status, expiresAt])                      (the sweep query is indexed)
sweep job (runs every N minutes):
    within ONE transaction per order:
      1. find PENDING orders with expiresAt < now      <- uses the index
      2. re-check status inside the transaction        <- only one sweeper wins
      3. for each item: stock { increment: qty }       <- give stock back
      4. coupon usedCount { decrement: 1 }             <- give the coupon back
      5. mark order EXPIRED / CANCELLED
```

Two subtleties worth writing in your design doc:

1. The status re-check inside the transaction means that if a payment succeeded a millisecond before the sweep, the sweeper sees PAID and skips — the sweeper can never cancel a paid order.
2. The loop continues past individual failures ("Continue sweeping other orders even if one transaction errors") — one poisoned order must not block the release of every other order's stock. That is the bulkhead pattern in four words.

### 7.5 The full payment sequence diagram (your artifact)

```
 User        Frontend      Gateway   Order/Payment svc    DB        Razorpay
  |             |             |             |             |             |
  |--checkout-->|             |             |             |             |
  |             |--POST /orders (Idem-Key)->|             |             |
  |             |             |----tx: reserve stock, create PENDING order,
  |             |             |         coupon++, idempotency row       |
  |             |<--- order + razorpay order id ----------------------- |
  |<--Razorpay checkout opens------------------------------------------------|
  |--pays (card/UPI)-------------------------------------------------------->|
  |             |             |             |             |             |
  |             |<--success handler: POST /payments/verify (sig)          |
  |             |             |---verify HMAC, serialize on payment row-->|
  |             |             |             |---order PAID (if sig ok)-->|
  |             |<--200 order status------ |                             |
  |             |             |             |             |             |
  |             |             |<====== webhook payment.captured (signed) =|
  |             |             |---verify HMAC; row already captured:      |
  |             |             |   idempotent no-op, 200 to Razorpay       |
  |             |             |             |             |             |
  | (browser died? webhook still marks PAID; sweeper never touches PAID)   |
  | (never paid? sweeper releases stock + coupon, order EXPIRED)           |
```

---

## 8. The order state machine — one source of truth for "what happens next"

### 8.1 Why two separate states

Beginner designs use one status field and end up with impossible values like `REFUNDED_AND_SHIPPED`. Money and parcels are different concerns with different timelines: a COD-style flow can be delivered-then-paid; a prepaid flow is paid-then-delivered; a refund can happen at any point after payment. Your schema correctly has two enums:

```
OrderStatus   (fulfilment): PENDING -> CONFIRMED -> SHIPPED -> DELIVERED
                            \-> CANCELLED / EXPIRED / RETURNED
PaymentStatus (money):      PENDING -> PAID -> PARTIALLY_REFUNDED -> REFUNDED
                            \-> FAILED
```

They move independently but with *rules* linking them (you cannot SHIP an order whose payment FAILED; a REFUND requires PAID).

### 8.2 The transition table (the actual design artifact)

A state machine is just this table plus one line of enforcement: every status change is a conditional update (`WHERE status = <expected old status>`), so an illegal or racing transition updates zero rows and fails. Never `update(orderId, {status: X})` blindly — always `updateMany(where: {id, status: expected})` and check `count === 1`. (Same primitive again!)

| From | To | Allowed when | Side effects |
|---|---|---|---|
| PENDING | CONFIRMED | payment PAID | — |
| PENDING | EXPIRED | sweeper, `expiresAt` passed, still unpaid | restock, coupon release |
| PENDING | CANCELLED | user cancels unpaid order | restock, coupon release |
| CONFIRMED | SHIPPED | admin provides tracking | — |
| SHIPPED | DELIVERED | admin/courier confirms | — |
| PAID | REFUNDED | refund workflow | Razorpay refund, restock if returned |

The admin UI (Kanban board, PRD ORD-004) renders this table as columns and drag targets; the *server* re-validates every move — the frontend showing a button is UX, never permission.

---

## 9. Carts — guests, users, and the merge

### 9.1 Guest cart identity without an account

Requirement: browse and fill a cart with no account (PRD CRT-001), then log in without losing it (CRT-003). Design: the server issues the visitor a random **cart session id** in an `HttpOnly` cookie. The cart row hangs off that session id, not a user id. HttpOnly means JavaScript (including injected scripts) cannot read it — the browser attaches it automatically on each request.

### 9.2 The merge — where beginners lose baskets

The moment a guest logs in, two carts exist: the guest cart (cookie) and possibly an old user cart (from a previous session). Rules, as implemented in `mergeGuestCart`:

```
1. For each guest item, upsert into the user cart:
     same variant already there  -> quantities add up
     not there                   -> item moves over
2. Delete the guest cart row — in the SAME transaction as the upserts.
   A merge that half-applied would leave the same items able to merge twice.
   Deleting inside the transaction makes the merge itself idempotent:
   login retried? second merge finds an empty guest cart and does nothing.
3. All writes are known up front, so no long locks are needed.
```

Note the shape of the solution: **idempotency by construction** (delete the source of the work inside the same atomic box) rather than by detection. When you can make an operation naturally idempotent, that beats detecting duplicates later.

---

## 10. Caching — the fastest query is the one you never make

### 10.1 The idea and the one iron rule

A cache is a fast copy of data that is expensive to compute. In the restaurant: the specials board instead of every waiter walking to the kitchen to ask. Postgres query ~5–50 ms; Redis lookup ~0.2–1 ms; a CDN edge hit ~0 ms plus network.

The iron rule: **the database is the truth, the cache is a convenience.** Anything you can afford to recompute can live in a cache; anything whose loss or staleness would break money or law must not *only* exist in a cache. That is why the stack's Redis holds rate-limit counters (safe to lose for a minute) and never holds orders or payments.

### 10.2 Cache-aside — the pattern to use for catalogue reads

```
request -> check Redis
             hit  (key present, not expired) -> return (fast path)
             miss -> query Postgres -> store in Redis with TTL -> return

admin updates a product -> DELETE the cache key (invalidation)
next read: miss -> fresh from DB -> re-populated
```

Key choices, each a trade-off sentence for interviews:

- **What to cache:** product pages, category trees, homepage collections — read-heavy, shared by all users, tolerates seconds of staleness (PRD §13.1: "cache safe catalogue/category reads with explicit invalidation or bounded TTL"). Never cache per-user cart/checkout responses in a shared cache — per-user data defeats sharing and creates leak risks.
- **TTL (time to live):** a bounded promise — even if you miss an invalidation (a bug, a crashed deploy between write and delete), the data self-heals within the TTL. Short TTL = fresher, more DB load; long TTL = the opposite. 30–300 s for catalogue is a sane band.
- **Keys:** namespaced and parameterized, e.g. `catalog:product:blue-kurta:v3`, `catalog:list:category=kurtas:page=2:sort=new`. Bump the `v3` namespace to invalidate a whole family at once.
- **Cache stampede:** a popular key expires and 500 concurrent requests all miss and all hit Postgres with the same heavy query. Protections: a short lock so one request rebuilds while others wait (single-flight), or jittered TTLs so keys don't expire together. Name this failure mode — showing you anticipate it is the point.

### 10.3 Where caching already exists in this stack

| Layer | What | Invalidated by |
|---|---|---|
| Browser/CDN | static JS/CSS/images with hashed filenames | new deploy = new hash |
| Cloudflare CDN (images) | R2 objects at edge | R2 overwrite/purge |
| Redis (planned for catalogue) | product/category reads | delete-on-write + TTL |
| Redux (client) | server-state snapshots | refetch on mutation (RTK Query would formalize this) |

A **layered cache**: each layer answers before the slower one below is bothered. Requests that die at the edge never touch your server at all.

---

## 11. Search — good enough search, deliberately

### 11.1 What "search" must do here

Match by word (`kurta`), by partial word (`kurt` — autocomplete), tolerate typos (`kurtha`), filter (category, price), and sort — over a catalogue of hundreds of products now, 100k in the synthetic exercise.

### 11.2 The chosen design: PostgreSQL does it all

Postgres full-text search (`tsvector`/`tsquery`) handles word matching with linguistic simplification (plurals); `pg_trgm` (trigram) similarity handles typos by comparing letter triplets — `kurtha` vs `kurta` share most trigrams, so it still matches. Both are indexes inside the database you already run: zero new infrastructure, one transaction with your catalogue writes.

The beginner mistake this project explicitly avoids (PRD SRC-005): reaching for Elasticsearch/OpenSearch/Meilisearch on day one. Those are excellent — and each is a second stateful system to deploy, secure, monitor, sync and keep consistent with the primary DB (usually via a change-data-capture or double-write pipeline — a classic source of drift bugs).

### 11.3 The trigger to upgrade (write this down — it is the design)

> "Search moves to a dedicated engine (Meilisearch first: single binary, typo-tolerance built in) when a *measured* need appears: search p95 exceeds the PRD budget on realistic data volume, ranking needs signals Postgres can't compute cheaply, or search traffic dominates catalogue reads. Until then Postgres FTS + trigram is one less system that can fail."

Sync design when it happens: product saved -> enqueue a reindex job (part 12) -> worker writes to the search engine. The queue absorbs failures; the engine is eventually consistent with the DB, which is acceptable for search (a missing product for 2 s is not a money bug).

---

## 12. Background jobs — doing expensive work later

### 12.1 Why "later" exists

Sending an email inside the request means: your response time = your response time + SMTP's mood. SMTP takes 2–30 s or hangs. So the request *records the intent* ("send verification email") as a durable job and returns immediately. A worker picks it up and does the slow thing. Restaurant: the waiter writes the order on a ticket and pins it; the kitchen cooks when it can; the waiter serves other tables meanwhile.

Benefits, in order of importance: (1) user latency stops depending on slow third parties, (2) failures become *retries* instead of lost work, (3) spikes get absorbed by a queue instead of stampeding a provider, (4) work survives a crash because it is written to durable storage first.

### 12.2 The choice: pg-boss (jobs *in* Postgres)

`pg-boss` is a job queue implemented as Postgres tables with `SELECT ... FOR UPDATE SKIP LOCKED` under the hood — many workers can pull jobs without stepping on each other, using the database you already have and the transactions you already trust. vs Redis-based queues (BullMQ): faster, but the queue contents live in Redis — which the iron rule (10.1) says is a convenience store, not a vault; a Redis flush loses pending jobs unless you add persistence. vs Kafka: Kafka is a distributed *log* for huge event throughput and multiple consumers — wrong tool for "send this email", and your PRD lists it as a non-goal anyway.

### 12.3 The job taxonomy for eco (what to document)

Already running: `send-email` via `emailWorker.js` (3 attempts, exponential backoff, dead-letter archive after final failure).

| Job | Trigger | Idempotent because |
|---|---|---|
| send-email | registration, reset, order events | emails are informational; retries at worst double-send one mail |
| expire-orders (the sweeper) | cron every N min | conditional status update inside tx (7.4) |
| webhook-retry | Razorpay non-2xx | webhook handling is idempotent by design (7.3) |
| refund-retry | refund API failure | Razorpay refund id is unique; re-check state first |
| reindex-search | product write | reindexing the same doc twice converges to the same doc |

Three terms to know: **backoff** (wait 1s, 2s, 4s... between retries — don't hammer a struggling service), **dead-letter queue** (after N failures, park the job for a human instead of silently dropping it), **at-least-once delivery** (a queue may redeliver a job whose success wasn't recorded — which is *why* every job above must be idempotent. The loop closes).

---

## 13. Security design — the parts that are architecture, not code

### 13.1 Sessions: short access token + rotating refresh token

Design as implemented in `auth.service.js`:

- **Access token** (JWT, ~15 min): sent with every request; stateless — any instance can verify it; short life limits damage if stolen. It is the *day pass*.
- **Refresh token** (random, long, stored **hashed** in DB): presented only to the refresh endpoint to mint new access tokens; delivered in an `HttpOnly Secure SameSite` cookie so JavaScript — and therefore any XSS payload — cannot read it. It is the *keys to the season pass*.
- **Rotation with reuse detection**: every refresh *revokes the old token and issues a new one*. If an already-revoked token is ever presented again, that is evidence of theft (an attacker replaying a stolen copy) — the correct response, implemented, is to revoke **every session for that user**. Stolen-token blast radius: minutes, not weeks.
- **Logout-everywhere** is then one query: `UPDATE refresh_tokens SET revokedAt = now() WHERE userId = ? AND revokedAt IS NULL` — the session state lives in Postgres (truth), not in one server's RAM (which is why the PRD insists instances stay stateless).

### 13.2 Authorization vs authentication (say these correctly)

- **Authentication** = who are you (verified by the tokens above).
- **Authorization** = what may you touch — and it is enforced *inside every service query*: every customer query is scoped `where: { userId: req.user.id }` so changing an ID in a URL cannot read another person's order. Frontend route guards are decoration; the backend check is the lock (PRD §4.1).

### 13.3 Rate limiting — the bouncer with a stopwatch

Already built and worth understanding deeply (see `backend/RATE_LIMITING.md`): each identity (user id if logged in, else IP) gets a **sliding window** budget per operation — 5/min for login, 100/min for reads. Sliding vs fixed window: a fixed 60-s window can be gamed by bursting at the boundary (10 requests at t=59, 10 more at t=61); a sliding window tracks the *last* 60 seconds continuously, so bursts can't straddle boundaries. It runs as **Lua scripts inside Redis** because check-and-increment must be one atomic step — the same "no gap between check and act" lesson as part 5, now in a database called Redis. And the fail-open vs fail-closed choice per policy (login is **closed** when Redis is down; ordinary reads **open**) is a genuine availability-vs-abuse trade-off, documented per endpoint.

### 13.4 The edge

Gateway applies Helmet headers (CSP, HSTS, frame-deny), CORS is an explicit origin allowlist, all secrets live in environment variables (`.env.example` names only), and user/AI content renders as text (never `dangerouslySetInnerHTML`) so stored-XSS has no stage. Webhooks authenticate by HMAC signature (7.3) — an endpoint without authentication is an open door with a welcome mat.

---

## 14. Media pipeline — images at scale

Images are the heaviest bytes in commerce, and the pipeline is a real design:

```
admin uploads
   -> validate bytes + real MIME (never trust the filename/extension)
   -> enforce size/count limits
   -> generate a server-side name (never keep user filenames: path tricks,
      collisions, and unicode surprises)
   -> store original in Cloudflare R2 (object storage; 10 GB free tier)
   -> derive sizes (thumb, card, hero, zoom) at write time
   -> serve via Cloudflare CDN with far-future cache headers
```

Why derive sizes at write time (and not resize per request): per-request resizing turns every image view into server CPU — at traffic scale that is a self-inflicted DDoS. Write-time derivation pays the cost once; every read afterwards is a cached static byte stream at the CDN edge. The browser's role (the PRD's performance budget): known dimensions (no layout shift), lazy-load below the fold, prefetch the next gallery image. `scripts/migrateImagesToStorage.js` exists because the pipeline also has a *migration* story: old local-file rows must move to R2 without breaking old URLs.

---

## 15. Observability — designed for 3 a.m.

When production breaks, your only defense is what you recorded while it worked. Three layers:

1. **Structured logs** (pino): JSON lines — machine-greppable — carrying `X-Request-Id`. The gateway mints the id, every log line for that request carries it, so one id traces a request across gateway -> API -> worker. That is **distributed tracing** in its most affordable form.
2. **Health endpoints** (`/gateway/health`): the gateway aggregates upstream health — deploy platforms use this to restart dead instances and to stop routing traffic to a sick upstream.
3. **Alerting**: Sentry (errors, free tier) + UptimeRobot (is it up, from outside). An error nobody is paged about does not exist.

The design obligations that make logs *safe*: redact tokens, cookies, signatures and personal data from every log line (PRD SEC-003), and define retention — logs are data, and old logs are a liability, not history (PRD SEC-004).

---

## 16. Scaling — the designed growth path

This part is deliberately an *exercise with numbers*, per PRD §1.2, not a claim. The skill: back-of-envelope math that finds the bottleneck before traffic does.

### 16.1 The envelope math for the stated target

Target: 100 concurrent browsing users; 100k products; 1M historical orders.

```
100 concurrent users, ~1 request each / 10 s while browsing
  -> ~10 requests/s peak. Trivial for Express (thousands/s on one core).
Catalogue query with indexes: ~5–20 ms
  -> at 10 rps, DB CPU is nearly idle.
1M orders * ~1 KB avg row = ~1 GB. Postgres on a laptop handles this.
```

Conclusion: **at the stated scale, nothing needs scaling.** The honest and correct answer. The design value is the *ladder* — knowing what breaks, in what order, and what move each rung requires.

### 16.2 The ladder (what breaks, in order)

```
Stage 0 (now)         1 VM, 1 app instance, 1 Postgres.
   First real problem is NOT CPU — it is DB CONNECTIONS:
   every app instance holds a Prisma pool (~10–20 conns).
Stage 1 (~10x)        Add PgBouncer (connection pooler in front of Postgres).
   Thousands of app connections multiplex onto ~20 real DB connections.
   Postgres max_connections is ~100; pools multiply faster than CPUs.
Stage 2 (~50x)        Cache catalogue reads in Redis (part 10); move images
   fully to CDN. Most read traffic now never reaches the app.
Stage 3 (~100x)       Run 2+ stateless app instances behind the gateway /
   load balancer (safe: no session state in process memory — by design).
   Add a Postgres read replica; route catalogue reads to it.
   Writes stay on primary (single-writer, simple, correct).
Stage 4 (measured)    Extract search (part 11 trigger). Extract heavy jobs
   to dedicated workers (pg-boss already allows separate worker processes).
Stage 5 (real traffic,
   multiple teams)    NOW the microservices conversation starts — driven by
   org charts and measured hot spots, not vibes.
```

Two non-obvious rungs worth internalizing:

- **The pool problem before the CPU problem**: each stateless instance multiplied means each brings its own DB pool. PgBouncer is the fix that costs nothing architecturally.
- **Read replicas: eventually consistent.** Replication lag (ms–s) means a just-placed order may not appear on "my orders" if that page reads a replica. Design rule: *your own writes read from the primary* (or read-your-writes window); replicas for anonymous catalogue browsing.

### 16.3 Load testing — evidence, not vibes

Design the exercise, run it, record the numbers in the repo:

1. Seed synthetic data: 100k variants, 1M orders (scripts against Prisma).
2. Tool: k6 (or autocannon for a quick pass) — scenarios: browse (95%), search (4%), checkout (1%).
3. The focused test from the PRD: 50 concurrent checkouts on **one variant with stock = 1**. Assert: exactly 1 success, 49 clean failures, stock = 0, no negative stock, no orphaned payments.
4. Record p50/p95/p99 per endpoint, error rate, DB connections, event-loop lag. Compare against the PRD §13.1 budgets. Paste the k6 summary into the design doc — that table is the artifact that makes every claim above real.

---

## 17. The artifacts you should produce (checklist)

System design that isn't written down is a rumor. Produce these, in `docs/`:

| # | Artifact | Contains | Effort |
|---|---|---|---|
| 1 | `HLD.md` + diagrams | Part 2 diagrams: context, request lifecycle, module map | small |
| 2 | `ERD.md` | Prisma models with the part-4 decisions annotated | small |
| 3 | `DESIGN-checkout.md` | Part 5: race, atomic decrement, concurrency test output | medium |
| 4 | `DESIGN-payments.md` | Part 7: three endings, signature, sweeper, sequence diagram | medium |
| 5 | `DESIGN-idempotency.md` | Part 6 + the table of operations | small |
| 6 | `DESIGN-orders.md` | Part 8 state transition table + enforcement note | small |
| 7 | `ADR/0001-modular-monolith.md` ... | One page per decision: context, options, decision, consequences. Candidates: monolith (3), Postgres FTS (11), pg-boss (12), Decimal money (4.7), SetNull on user (4.3), sliding-window limits (13.3), R2+CDN (14) | small each |
| 8 | `LOAD-TEST-REPORT.md` | Part 16.3 numbers vs PRD budgets | medium |
| 9 | `docs/diagrams/*.excalidraw` (or `*.mermaid`) | The sequence/state diagrams as actual diagrams | small |

ADR template (keep it to one page):

```
# ADR 0007: Use pg-boss for background jobs
Date / Status: accepted
Context: emails + webhooks must not run inside request; one Postgres already deployed.
Options: inline (rejected: latency), BullMQ+Redis (rejected: queue state in a
  cache-grade store), Kafka (rejected: wrong shape, ops cost), pg-boss (Postgres-
  backed, SKIP LOCKED, retries + dead-letter built in).
Decision: pg-boss, 3 attempts, exponential backoff, dead-letter archive.
Consequences: jobs share DB capacity (watch at Stage 4); at-least-once delivery
  means every job must be idempotent (they are — table in DESIGN-jobs).
```

---

## 18. Interview cheat sheet — the questions this project answers

| Question | Your answer, in one breath (doc part) |
|---|---|
| How do you prevent overselling? | Atomic conditional decrement inside the order transaction; reservation TTL + sweeper releases abandoned stock. (5) |
| User's payment succeeded but the browser closed — now what? | Webhook is source of truth; sweeper only expires *unpaid* orders, re-checked inside the transaction. (7) |
| Double-click on "Place order"? | Idempotency key: unique(userId,key), stored response replay, request-hash mismatch = 422. (6) |
| Callback and webhook arrive together? | Both verify HMAC; they serialize on the payment row; exactly one state transition wins. (7.3) |
| Monolith or microservices? | Modular monolith with module seams; split triggers are measured, and I can name them. (3) |
| Where does the cache go and what can it lose? | Cache-aside catalogue reads, bounded TTL + write invalidation; Redis never the only home of money/truth. (10) |
| Why Postgres search, not Elasticsearch? | Right-sized: FTS + trigram in the transactional store; named trigger + sync design for when to upgrade. (11) |
| How do sessions stay safe? | 15-min access JWT + rotating hashed refresh in HttpOnly cookie; reuse detection revokes all sessions. (13.1) |
| How do you scale to 100k users? | Connection pooler -> cache -> stateless replicas + read replica -> extract hot spots. Bottleneck order: connections, then reads, then writes. (16) |
| Why Decimal for money? | Floats can't represent 0.10; cents drift; one-way door. (4.7) |
| What breaks if Redis dies? | Rate limits fail open for reads, closed for auth — per policy; catalogue still served from DB. (13.3) |
| Why copy the address into the order? | Invoices are frozen truth; linked data changes. Snapshot vs link by volatility. (4.2) |

---

## 19. Glossary

| Term | Meaning |
|---|---|
| **ACID** | Atomic, Consistent, Isolated, Durable — guarantees of a transaction box |
| **ADR** | Architecture Decision Record — a one-page, dated record of a choice and its trade-off |
| **At-least-once delivery** | A queue may redeliver; therefore handlers must be idempotent |
| **Backpressure** | Signalling upstream to slow down when you can't keep up |
| **Backoff (exponential)** | Retry with growing waits (1s, 2s, 4s...) so a sick dependency can breathe |
| **Bulkhead** | One failing unit (order, request, region) must not sink the others |
| **Cache-aside** | App checks cache, on miss reads DB and fills cache; DB remains truth |
| **CDN** | Content delivery network — edge servers that serve static bytes near the user |
| **CSP** | Content-Security-Policy — HTTP header restricting what the page may load/execute |
| **Dead-letter queue** | Parking lot for jobs that exhausted retries; for humans to inspect |
| **Eventual consistency** | Replicas/indexes converge after a short delay instead of instantly |
| **HMAC** | Hash-based message authentication code — a signature proving the sender knows a shared secret |
| **Idempotent** | Repeating the operation has the same effect as doing it once |
| **Index (DB)** | Sorted structure enabling direct jumps to matching rows instead of full scans |
| **Keyset pagination** | Page by "after the last seen key" — stable and fast at depth |
| **Modular monolith** | Single deployable with enforced internal module boundaries |
| **p95 / p99** | 95th/99th percentile latency — the tail, not the average |
| **Race condition** | Correctness depends on unguaranteed interleaving of concurrent operations |
| **Read replica** | Continuously copied read-only database; absorbs read traffic |
| **Reservation (inventory)** | Stock held for a checkout with a deadline, released if unpaid |
| **Saga** | Multi-service workflow replacing a distributed transaction (compensating steps) |
| **Sequential scan** | Reading every row to answer a query (what indexes prevent) |
| **SKIP LOCKED** | Postgres trick letting workers claim queue rows without blocking each other |
| **Sliding window** | Rate-limit window measured over the trailing N seconds continuously |
| **Snapshot** | Copied data frozen at event time (order address, purchased price) |
| **Stampede (cache)** | Mass simultaneous miss overloading the DB; fixed by single-flight/jitter |
| **Stateless** | No per-user state in process memory; any instance can serve any request |
| **TOCTOU** | Time-of-check to time-of-use — the gap a race condition exploits |
| **Webhook** | Provider-initiated signed HTTP callback to your server |
| **X-Request-Id** | Correlation id attached to a request and echoed in every log line |

---

## 20. Final rule

Same rule as the PRD's final section, applied to design: the strongest system design story is not the biggest diagram — it is the one where every claim ("never oversells", "no duplicate charge", "survives a closed browser") can be shown with a test, a number, or a line of code in this repository.
