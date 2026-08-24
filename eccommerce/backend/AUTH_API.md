# Authentication API

Base URL: `http://localhost:5000/api/auth`

Every response is JSON and has a `success` boolean. Errors look like:

```json
{ "success": false, "message": "Invalid email or password" }
```

Validation failures add a `errors` array naming the offending fields.

---

## Setup before first run

Three commands, in this order, from `eccommerce/backend`:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name add_auth_and_password_reset
```

`npm install` is not optional — `node_modules` currently only has a partial
dependency tree, and zod, dotenv, helmet, nodemailer, express-rate-limit and
`@prisma/client` are all missing. Nothing will boot until it finishes.

Before that, open `.env` and replace the two `PASTE HERE` placeholders with
your Neon connection strings. `DATABASE_URL` is the pooled string (it contains
`-pooler`), `DIRECT_URL` is the unpooled one. The app checks for the
placeholder at startup and exits with a clear message rather than letting
Prisma fail cryptically later.

Then `npm run dev`.

---

## Endpoints

| Method | Path               | Auth         | Rate limit  |
| ------ | ------------------ | ------------ | ----------- |
| POST   | `/register`        | —            | 20 / hour   |
| POST   | `/login`           | —            | 10 / 15 min |
| POST   | `/refresh`         | —            | global only |
| POST   | `/logout`          | —            | global only |
| POST   | `/logout-all`      | access token | global only |
| GET    | `/me`              | access token | global only |
| POST   | `/forgot-password` | —            | 5 / hour    |
| POST   | `/reset-password`  | —            | 10 / 15 min |
| POST   | `/change-password` | access token | global only |

Authenticated endpoints expect `Authorization: Bearer <accessToken>`.

---

### POST /register

```json
{
  "email": "riya@example.com",
  "password": "hunter2hunter2",
  "fullName": "Riya Sharma",
  "phone": "9876543210"
}
```

`phone` is optional. When present it must be a 10-digit Indian mobile number
starting 6–9. Password is 8–128 characters and must contain at least one
letter and one digit. Email is lowercased on the way in, so `Riya@Example.com`
cannot become a second account alongside `riya@example.com`.

Returns `201` with `{ user, accessToken, refreshToken }`.

---

### POST /login

```json
{ "email": "riya@example.com", "password": "hunter2hunter2" }
```

Returns `{ user, accessToken, refreshToken }`.

A wrong password and an unregistered email give the same message and take
roughly the same time — the service hashes against a dummy hash when no user
is found, so response timing cannot be used to enumerate which emails have
accounts.

---

### POST /refresh

```json
{ "refreshToken": "<token>" }
```

Returns a **new pair**. The old refresh token is deleted in the same
transaction, so each one works exactly once. If a token that has already been
used arrives, it is rejected — that is the signal a token was stolen.

Store the new pair on every refresh or the next call will fail.

---

### POST /logout

```json
{ "refreshToken": "<token>" }
```

Deletes that one token. Other devices stay signed in.

### POST /logout-all

No body. Deletes every refresh token for the user.

---

### GET /me

Returns the current user profile: `id`, `email`, `fullName`, `phone`,
`dateOfBirth`, `gender`, `aboutYou`, `avatarUrl`, `role`, `emailVerifiedAt`,
`createdAt`. Never `passwordHash`.

---

### POST /forgot-password

```json
{ "email": "riya@example.com" }
```

Always returns the same success message, whether or not the address is
registered. This is deliberate: a different response for unknown emails turns
the endpoint into a free "does this person shop here?" lookup.

What happens internally:

1. Any earlier unused reset tokens for that user are marked used, so only the
   newest link works.
2. A fresh 32-byte random token is generated.
3. Only its SHA-256 hash is stored, alongside an expiry (default 30 minutes).
4. The plaintext token goes out by email, never to the API response.

Storing the hash means a leaked database still does not let anyone reset
passwords — the same reason the password column is a bcrypt hash.

**With no SMTP configured**, the email is printed to your terminal instead,
link included. That is enough to test the whole flow locally. In production
the app refuses to start without SMTP, so this fallback cannot silently reach
real users.

---

### POST /reset-password

```json
{
  "token": "<from the emailed link>",
  "password": "newpassword123"
}
```

The token is hashed and looked up; it is rejected if unknown, expired, or
already used. An email address is **not** accepted here — possession of the
emailed token is the only proof of ownership, since anyone can type anyone's
address. On success, in one transaction: the password is rehashed, the token is
marked used, and **every** refresh token for that user is revoked.

Signing out all devices matters here. If someone reset the password because
their account was compromised, leaving the attacker's session alive defeats
the point.

---

### POST /change-password

Requires a valid access token.

```json
{
  "currentPassword": "hunter2hunter2",
  "newPassword": "somethingelse99"
}
```

The new password must differ from the current one. Verifies the current
password first, then revokes all sessions — and returns a
**fresh token pair** so the device making the request stays signed in. Replace
your stored tokens with these; the old ones are already dead.

---

## Email configuration

Optional in development, required in production. In `.env`:

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="you@gmail.com"
SMTP_PASS="your-16-char-app-password"
MAIL_FROM="Ciseco Support <no-reply@ciseco.local>"
PASSWORD_RESET_EXPIRES_IN="30m"
```

For Gmail this must be an **App Password** (Google Account → Security →
2-Step Verification → App passwords), not your normal password.

Port 587 uses STARTTLS; port 465 uses implicit TLS. The transport picks the
right mode from the port automatically — mixing these up is the usual cause of
a hanging connection.

`CLIENT_ORIGIN` builds the link in the email, so it must point at your
frontend: `http://localhost:5173/reset-password?token=...`

If `CLIENT_ORIGIN` holds several comma-separated origins for CORS, the first
one is used as the canonical site for the link.

---

## Testing the reset flow without email

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"riya@example.com\"}"
```

The link appears in the terminal running `npm run dev`. Copy the `token` query
parameter out of it and post it to `/reset-password`.
