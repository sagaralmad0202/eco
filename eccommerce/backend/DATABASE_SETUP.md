# Database Setup — Step by Step

**Database:** PostgreSQL on Neon (free tier)
**ORM:** Prisma
**Cost:** ₹0
**Time needed:** about 20 minutes

Follow these in order. Do not skip step 3 — the two connection strings are
where almost everyone gets stuck the first time.

---

## Step 1 — Create the Neon account

1. Go to **https://neon.com** and sign up with GitHub or email.
2. No card is required.
3. Create a project:
   - **Project name:** `ecommerce`
   - **Postgres version:** leave the default
   - **Region:** pick the one nearest you (e.g. Singapore or Mumbai for India)
4. Click **Create**.

Neon creates a database called `neondb` automatically. That is fine — use it
rather than making a new one.

---

## Step 2 — Copy BOTH connection strings

On your project dashboard, find the **Connection string** panel.

There is a toggle labelled **Connection pooling** (or **Pooled connection**).
You need the string in _both_ positions:

**Pooled** — the host contains `-pooler`:

```
postgresql://user:pass@ep-cool-name-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
                                          ^^^^^^^
```

**Direct** — same string, but no `-pooler`:

```
postgresql://user:pass@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Copy both somewhere temporarily. The password is only shown once — if you lose
it, use **Reset password** on the dashboard.

### Why two strings?

Your **app** opens and closes many short connections, so it uses the **pooled**
one. **Migrations** need one long, stable session and will fail against a pooler
with confusing errors. Prisma handles this via `directUrl` in the schema, but
only if you supply both.

---

## Step 3 — Create your `.env` file

In the `backend` folder, copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Open `.env` and paste your strings:

```env
DATABASE_URL="<the POOLED string, with -pooler>"
DIRECT_URL="<the DIRECT string, no -pooler>"
```

Then set real JWT secrets. Generate each one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice and paste the two different results into `JWT_ACCESS_SECRET` and
`JWT_REFRESH_SECRET`.

> `.env` is already in `.gitignore`. Never commit it. If you ever paste a real
> connection string into a chat, a ticket, or a screenshot, reset the password
> on Neon immediately.

---

## Step 4 — Install the packages

From the `backend` folder:

```bash
npm install
```

This installs Prisma alongside the express, jsonwebtoken, bcryptjs and cors
packages already listed in `package.json`.

---

## Step 5 — Create the tables

```bash
npm run db:migrate
```

When prompted for a migration name, type:

```
init
```

Prisma will read `prisma/schema.prisma`, generate SQL, apply it to Neon, and
generate the typed client. You should see `Your database is now in sync with
your schema`.

Your tables now exist: `users`, `products`, `product_variants`, `orders`,
`order_items`, `payments`, and the rest.

---

## Step 6 — Add the rating rule (one manual step)

Prisma cannot yet express a CHECK constraint in the schema file, so the
`rating` column would accept `999`. Add the rule directly.

On the Neon dashboard, open the **SQL Editor** and run:

```sql
ALTER TABLE reviews
  ADD CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5);
```

Now the database itself rejects an invalid rating, even if a bug in the API
tries to insert one. Defence at the data layer, not just in code.

---

## Step 7 — Load the sample data

```bash
npm run db:seed
```

This creates an admin user, two categories, two products (one with three size
variants, including a deliberately out-of-stock one), and two coupons.

Admin login for testing:

```
email:    admin@shop.local
password: Admin@12345
```

Change that password before anything goes near production.

---

## Step 8 — Look at your data

```bash
npm run db:studio
```

Prisma Studio opens at `http://localhost:5555` — a browser view of every table
where you can add and edit rows by hand. This is the fastest way to confirm the
setup worked.

---

## Everyday commands

| Command               | What it does                                         |
| --------------------- | ---------------------------------------------------- |
| `npm run db:migrate`  | Apply schema changes during development              |
| `npm run db:studio`   | Browse and edit data in the browser                  |
| `npm run db:seed`     | Re-load the sample data                              |
| `npm run db:generate` | Rebuild the Prisma client after editing the schema   |
| `npm run db:reset`    | **Deletes everything**, rebuilds, re-seeds           |
| `npm run db:deploy`   | Apply migrations in production (never `migrate dev`) |

---

## Changing the schema later

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:migrate` and give the change a descriptive name,
   e.g. `add_wishlist_table`.
3. Commit the generated folder in `prisma/migrations/` to Git.

Those migration files are the history of your database. They let any teammate
rebuild the exact same structure from scratch, and they let you deploy changes
to production safely. Always commit them.

---

## Using it in your code

Never write `new PrismaClient()` in your route files. Import the shared client:

```js
const prisma = require("../config/prisma");

// find active products with their variants and images
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: {
    variants: { where: { isActive: true } },
    images: { orderBy: { position: "asc" } },
  },
});
```

### The one pattern that matters most

Checkout must be a **transaction**. The stock decrement and the order creation
have to succeed together or fail together — otherwise you sell items you do not
have:

```js
const order = await prisma.$transaction(async (tx) => {
  // Conditional update: only decrements if stock is still sufficient.
  const updated = await tx.productVariant.updateMany({
    where: { id: variantId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });

  // count === 0 means someone else bought the last one first.
  if (updated.count === 0) {
    throw new Error("Out of stock");
  }

  return tx.order.create({ data: orderData });
});
```

If anything inside throws, PostgreSQL rolls back every change in the block.
Putting the `stock: { gte: quantity }` check inside the `where` clause is what
prevents two simultaneous buyers from both succeeding on the last unit.

---

## Troubleshooting

**`Can't reach database server`**
Check for typos in `DATABASE_URL` and make sure `?sslmode=require` is present.

**`prepared statement already exists` or migration hangs**
You used the pooled string for migrations. Confirm `DIRECT_URL` has no
`-pooler` in the host.

**`Environment variable not found: DATABASE_URL`**
The file must be named exactly `.env`, in the `backend` folder. Windows
sometimes saves it as `.env.txt` — check with `dir` in that folder.

**`Too many connections`**
Something is calling `new PrismaClient()` repeatedly. Import from
`config/prisma.js` everywhere instead.

**Free tier auto-suspend**
Neon pauses an idle database and the first query afterwards takes a few extra
seconds. Normal, and it wakes automatically.

---

## Free tier limits

Neon's free tier gives roughly 0.5 GB of storage and 190 compute-hours per
month, with commercial use permitted. In practice that supports tens of
thousands of products and orders. When you outgrow it, the paid plan is about
$19/month — or you can move to a self-hosted PostgreSQL on the Oracle Cloud VM
described in `TECH_STACK.md` at no cost, since both are ordinary PostgreSQL and
the same migrations apply unchanged.
