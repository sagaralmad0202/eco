# E-Commerce Backend — Tech Stack Proposal

**Prepared for:** Leadership review
**Date:** August 2026
**Infrastructure cost:** ₹0 / month
**Capital required to launch:** ₹0

---

## Executive Summary

This document proposes the backend platform for our e-commerce product. Every component is
either open source or has a permanent free tier that explicitly permits commercial use. The
platform can be built, deployed, and operated for real customers at **zero rupees of
infrastructure spend**.

This is not a compromised or "student project" stack. The core — Node.js, PostgreSQL, Docker,
Linux — is the same foundation used by companies operating at very large scale. What differs is
that we run it on free capacity until traffic forces an upgrade, rather than provisioning
expensive managed services in advance.

Three principles govern every choice below:

1. **Zero cost to start.** No credit card charges, no monthly bills, no trial periods that expire.
2. **No rewrite later.** Every free option upgrades in place or migrates by configuration change.
3. **Commercial use permitted.** Every free tier listed allows revenue-generating use. This
   disqualifies several popular "free" platforms and is checked explicitly below.

---

## The Stack

| Layer | Choice | Cost | Commercial use |
|---|---|---|---|
| Runtime | Node.js 20 LTS | Free (open source) | Yes |
| API framework | Express.js | Free (open source) | Yes |
| Language | JavaScript, TypeScript optional later | Free | Yes |
| Server / hosting | Oracle Cloud Always Free VM | ₹0 forever | Yes |
| Backup hosting | Render free web service | ₹0 | Yes |
| Database | PostgreSQL (self-hosted on the same VM) | ₹0 | Yes |
| Managed DB alternative | Neon free tier | ₹0 | Yes |
| Authentication | JWT + bcryptjs | Free (open source) | Yes |
| Image / file storage | Cloudflare R2 | ₹0 up to 10 GB | Yes |
| Email | Brevo free tier | ₹0, 300/day | Yes |
| Search | PostgreSQL full-text search | Free | Yes |
| Background jobs | pg-boss (runs inside PostgreSQL) | Free | Yes |
| Error tracking | Sentry free tier | ₹0, 5k events/mo | Yes |
| Uptime alerts | UptimeRobot free tier | ₹0, 50 monitors | Yes |
| CI/CD | GitHub Actions | ₹0, 2,000 min/mo | Yes |
| Containers | Docker | Free (open source) | Yes |
| Web server / TLS | Nginx + Let's Encrypt | Free | Yes |
| Payments | Razorpay | No monthly fee | Yes |

---

## What We Already Have

The project already runs Node.js with Express, using `jsonwebtoken` for authentication,
`bcryptjs` for password hashing, and `cors` configured. That is a sound foundation. This
proposal builds on it rather than replacing it, so no completed work is discarded and no
migration cost is incurred.

---

## Hosting: The Decision That Determines Everything

Hosting is where most "free" plans quietly fail a real business, so it deserves the most
scrutiny.

**Recommended: Oracle Cloud Always Free.** Oracle permanently offers an ARM virtual machine
with up to 4 CPU cores and 24 GB of RAM, plus 200 GB of storage and 10 TB of monthly outbound
bandwidth, at no cost. This is not a trial. It permits commercial use. It is, by a wide margin,
the most capable free compute available anywhere, and it is more powerful than the entry-level
paid tiers of most competitors.

Running our own VM means we install PostgreSQL, Node.js, and Nginx directly on it. This removes
the database bill, the hosting bill, and the cold-start problem in a single decision. It is also
the most transferable setup we could choose: a standard Linux server can be moved to any provider
on earth without code changes.

The honest trade-offs: Oracle requires a card for identity verification even though the Always
Free resources are never charged, and free ARM capacity is sometimes unavailable in popular
regions, occasionally requiring several attempts or a different region. We also become
responsible for our own server maintenance and security updates, which a managed platform would
handle. That is real work, but it is work rather than money, which matches our constraint.

**Backup option: Render free web service.** If the Oracle VM is not obtainable, Render offers a
free tier that deploys directly from GitHub and permits commercial use. Its limitation is that
free services sleep after roughly 15 minutes of inactivity, so the first request afterward can
take 30–50 seconds. That is tolerable for development and demos but poor for paying customers —
which is precisely why the Oracle VM is the primary recommendation.

**Deliberately excluded.** Railway no longer offers a free tier; it provides only a one-time
trial credit, so it cannot anchor a zero-cost plan. Vercel's free Hobby plan explicitly
prohibits commercial use, which disqualifies it for a revenue-generating product regardless of
its technical merits. Fly.io ended its free allowance and now bills from the first instance.
These are worth naming because all three are commonly recommended as "free" and would create an
unbudgeted bill.

---

## Database

**PostgreSQL, self-hosted on the Oracle VM.** Orders and payments require transactions: at
checkout, the payment record, the order record, and the inventory decrement must all succeed or
all fail together. PostgreSQL guarantees this. Getting it wrong means overselling stock or
charging customers for orders that do not exist — the most expensive category of bug in
e-commerce, and one that costs real money in refunds and reputation.

Self-hosting on the VM we already have means the database costs nothing and is limited only by
the VM's 200 GB of storage, which is far beyond what we will need for a long time.

**Alternative: Neon free tier** (roughly 0.5 GB), if we prefer a managed database we do not have
to maintain. That capacity still accommodates tens of thousands of products and orders. It is
the safer choice operationally and the more limited one on headroom.

---

## Design Choices That Remove Recurring Costs

**PostgreSQL full-text search instead of Elasticsearch.** Elasticsearch is the conventional
answer for product search and is also a server we would pay for every month. PostgreSQL's
built-in full-text search handles ranking, filtering, and partial matching well up to roughly
100,000 products. We revisit this only when search quality becomes a measurable conversion
problem — not in advance.

**pg-boss instead of Redis for background jobs.** Order confirmation emails, invoice generation,
and abandoned-cart reminders should run in the background so checkout stays fast. The standard
approach pairs Redis with a queue library, adding another service to pay for and operate.
`pg-boss` runs the job queue inside the PostgreSQL database we already have. Zero cost, one
fewer system to keep alive.

**Our own JWT authentication instead of a paid identity vendor.** Auth0 and its competitors
start free and price steeply once user counts grow. We already have `jsonwebtoken` and
`bcryptjs` in the project — the standard, well-understood approach — so we keep full control of
customer data and pay nothing, at any scale.

**Cloudflare R2 for product images.** Images dominate storage and bandwidth in e-commerce. Most
object storage bills for egress, meaning we pay every time a customer loads a product page. R2
charges **zero egress fees** and includes 10 GB of free storage, which removes bandwidth from
the cost model entirely rather than merely reducing it.

---

## Security

Security is the wrong place to economise, and fortunately the essentials cost nothing.

Passwords are hashed with bcrypt and never stored or logged in plain text. Authentication uses
short-lived access tokens paired with longer-lived refresh tokens. All incoming data is validated
with `zod` before reaching business logic, which closes off injection and malformed-input bugs at
the boundary. `helmet` sets protective HTTP headers, `express-rate-limit` caps login and checkout
attempts to blunt brute-force and card-testing attacks, and CORS is restricted to our own domains.
TLS certificates come free from Let's Encrypt and renew automatically.

On payments, we never store card numbers. Card details pass directly from the customer's browser
to Razorpay; our servers only ever handle a token. This is the single most consequential security
decision in the stack — it keeps us out of the heaviest PCI compliance obligations, and it means
a breach of our servers cannot expose customer card data.

Secrets live in server environment variables, never in the Git repository.

---

## The One Cost We Cannot Remove

Payment processing has no free option, but it also has **no monthly fee and no setup fee**. We
pay only when a customer successfully pays us.

Razorpay charges approximately 2% per successful transaction. Account creation and test mode are
free, so the entire product can be built and demonstrated end to end without processing a single
rupee. The fee is deducted from revenue we have already received — it is never an invoice we must
fund from capital, and it does not exist on a month with no sales.

This distinction matters for the budget conversation: our fixed monthly cost is ₹0. Our variable
cost is a share of money customers have already paid us.

---

## Cost Projection

| Stage | Monthly sales | Infrastructure | Payment fees | Out of pocket |
|---|---|---|---|---|
| Development | ₹0 | ₹0 | ₹0 | **₹0** |
| Launch | ₹4,00,000 | ₹0 | ~₹8,000 (from revenue) | **₹0** |
| Growing | ₹20,00,000 | ₹0 | ~₹40,000 (from revenue) | **₹0** |
| Scaling | ₹80,00,000 | ~₹2,000 | ~₹1,60,000 (from revenue) | **~₹2,000** |

Infrastructure remains free well past the point where the business is generating substantial
revenue. The Oracle VM's capacity — 4 cores, 24 GB RAM, 10 TB bandwidth — comfortably serves
tens of thousands of monthly orders. By the time we outgrow it, the upgrade is funded many times
over by sales.

The only optional expense worth mentioning is a custom domain, roughly ₹700–1,000 per year, and
even that can be deferred: the platform runs on a free provided subdomain until we choose to
brand it.

---

## Implementation Plan

**Weeks 1–2, Foundation.** Provision the Oracle VM, install PostgreSQL and Node.js, define the
schema for products, users, and orders, implement JWT authentication and product CRUD endpoints.

**Weeks 3–4, Commerce core.** Cart and checkout flow, Razorpay integration with webhook handling,
order lifecycle management, and transactional inventory updates.

**Weeks 5–6, Customer experience.** Order confirmation and shipping emails, image upload and
delivery through R2, product search and filtering, and background jobs via pg-boss.

**Weeks 7–8, Production readiness.** Rate limiting and security hardening, Sentry error tracking,
uptime monitoring, automated tests covering the critical paths of checkout, payment, and
authentication, Dockerisation, and deployment automation through GitHub Actions.

---

## Risks, Stated Plainly

**Free tiers can change their terms.** Real and outside our control. The mitigation is
structural rather than contractual: because we run standard Linux, Node.js, and PostgreSQL, moving
to another provider is a configuration exercise, not a rewrite. We are not locked to any vendor,
which is exactly why the stack avoids proprietary platform services.

**We operate our own server.** Self-hosting removes the hosting bill and transfers that
responsibility to us — OS updates, backups, and security patching become our work. Automated
backups to R2 and unattended security updates reduce this to a modest ongoing task.

**Oracle free capacity can be hard to obtain.** ARM instances are sometimes unavailable in
popular regions. Render is the documented fallback, accepting cold starts until the VM is secured.

**Search will need revisiting eventually.** PostgreSQL search suffices to roughly 100,000
products. Beyond that, or if search-driven conversion becomes a bottleneck, we add a dedicated
search service. Deferring that decision costs nothing today.

**We own our authentication security.** This saves meaningful recurring cost but makes the login
flow our responsibility. Mitigated by using standard, widely audited libraries rather than
writing custom cryptography.

---

## Recommendation

Proceed with this stack. It requires no capital approval, no procurement process, and no vendor
contracts to begin work immediately. It uses technologies that are industry standard and
straightforward to hire for, and it defers every cost until revenue exists to cover it.

The architecture is materially the same one a well-funded team would select. The difference is
that we run it on genuinely free capacity and pay only when customers pay us first.

**Approval required: none. Budget required: ₹0.**

---

*Free-tier terms change over time. Each provider's current limits and commercial-use policy
should be verified before launch.*
