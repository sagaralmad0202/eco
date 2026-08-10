# Connect Your App to Neon — 4 Steps

Your database exists. Your code is written. This connects them.
Total time: about 5 minutes.

Run every command from the `backend` folder:

```
C:\Users\ADmin\Desktop\try again\eccommerce\backend
```

---

## Step 1 — Get your two connection strings

On the Neon dashboard, click the **Connect** button (top right).

A panel opens showing a connection string. Check that:

- **Database** = `neondb`
- **Role** = `neondb_owner`

Now look for a **Connection pooling** checkbox or toggle in that panel.

**Copy the string with pooling ON** — its hostname contains `-pooler`:

```
postgresql://neondb_owner:PASSWORD@ep-dry-wildflower-56352677-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
                                                                 ^^^^^^^
```

**Copy the string with pooling OFF** — same string, no `-pooler`:

```
postgresql://neondb_owner:PASSWORD@ep-dry-wildflower-56352677.us-east-2.aws.neon.tech/neondb?sslmode=require
```

If you can only find one string, take it and make the second yourself by
deleting `-pooler` from the hostname. That is the only difference.

### Why two?

Your **app** opens many short connections, so it uses the **pooled** string.
**Migrations** need one long stable session and fail against a pooler with
confusing errors. This is the single most common setup mistake with Neon.

---

## Step 2 — Paste them into `.env`

Open `.env` in the `backend` folder (it already exists — I created it).

Replace the two placeholder lines:

```env
DATABASE_URL="<paste the POOLED string here>"
DIRECT_URL="<paste the DIRECT string here>"
```

Keep the double quotes. Change nothing else — the JWT secrets and other
settings are already filled in.

Save the file.

---

## Step 3 — Install packages

```bash
npm install
```

Takes a minute or two. It installs Express, Prisma, and the rest.

Ignore any `npm warn deprecated` messages — those are normal and harmless.

---

## Step 4 — Create the tables and load sample data

```bash
npm run db:migrate
```

When it asks for a migration name, type:

```
init
```

and press Enter.

You should see **"Your database is now in sync with your schema"**.
Your 12 tables now exist in Neon.

Then load the sample products:

```bash
npm run db:seed
```

You should see it create an admin user, 2 categories, 2 products and 2 coupons.

---

## Start the server

```bash
npm run dev
```

Expected output:

```
Database connected

Server running:  http://localhost:5000
Health check:    http://localhost:5000/api/health
Products:        http://localhost:5000/api/products
Environment:     development
```

---

## Verify it works

Open these in your browser:

**http://localhost:5000/api/health**

```json
{ "success": true, "status": "healthy", "database": "connected" }
```

**http://localhost:5000/api/products**

Returns the two seeded products with their variants and prices.

**See your data visually:**

```bash
npm run db:studio
```

Opens `http://localhost:5555` — a browser view of every table where you can
add and edit rows by hand.

---

## Test login

Use Postman, Thunder Client, or PowerShell.

**PowerShell:**

```powershell
curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@shop.local\",\"password\":\"Admin@12345\"}'
```

Returns a user object plus `accessToken` and `refreshToken`.

To call a protected route, send the access token:

```
Authorization: Bearer <accessToken>
```

Try it against `GET http://localhost:5000/api/auth/me`.

---

## What you have now

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | no | Server + database status |
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/login` | no | Log in, get tokens |
| POST | `/api/auth/refresh` | no | Get a fresh access token |
| POST | `/api/auth/logout` | no | Revoke one refresh token |
| POST | `/api/auth/logout-all` | yes | Log out everywhere |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/products` | no | List, search, filter, paginate |
| GET | `/api/products/categories` | no | Category tree |
| GET | `/api/products/:slug` | no | Single product + reviews |

Product listing supports:
`?page=1&limit=12&search=shoes&category=mens-footwear&minPrice=1000&maxPrice=5000&sort=price_asc&inStock=true`

---

## If something breaks

**`DATABASE_URL is still the placeholder`**
Step 2 was not saved. Check `.env`, not `.env.example`.

**`Environment variable not found: DATABASE_URL`**
The file must be named exactly `.env`. Windows sometimes saves it as
`.env.txt` — run `dir` in the backend folder to check.

**`Can't reach database server`**
A typo in the string, or `?sslmode=require` is missing from the end.

**Migration hangs, or `prepared statement already exists`**
You used the pooled string for `DIRECT_URL`. It must NOT contain `-pooler`.

**`Too many connections`**
Something is calling `new PrismaClient()` directly. Always import from
`config/prisma.js`.

**First request is slow after a break**
Normal. Neon's free tier sleeps when idle and wakes in a few seconds.

**`Cannot find module '@prisma/client'`**
Run `npm run db:generate`.

---

## Everyday commands

| Command | Does |
|---|---|
| `npm run dev` | Start with auto-reload |
| `npm run db:studio` | Browse data in the browser |
| `npm run db:migrate` | Apply schema changes |
| `npm run db:seed` | Reload sample data |
| `npm run db:reset` | **Wipes everything**, rebuilds, re-seeds |

---

## Security note before you deploy

The JWT secrets currently in `.env` were generated in a chat session, so
treat them as publicly known. Before this goes anywhere real, replace both:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice, paste the two different results into `JWT_ACCESS_SECRET` and
`JWT_REFRESH_SECRET`. Also change the admin password from `Admin@12345`.

`.env` is already in `.gitignore` — never commit it.
