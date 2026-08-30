# Social Login (OAuth) Setup

Google, Facebook and Twitter/X sign-in for the Ciseco backend. The flow is a
standard **OAuth 2.0 Authorization Code** flow handled entirely by the backend
(client secrets never reach the browser):

```
Login page "Continue with Google"
  → GET /api/auth/oauth/google            (backend stores state + PKCE, redirects)
  → Google consent screen
  → GET /api/auth/oauth/google/callback   (backend validates state, exchanges code,
                                           finds/creates/links the user, issues
                                           the same JWT pair as password login)
  → 303 redirect to ${CLIENT_ORIGIN}/oauth/callback?code=<one-time code>
  → SPA POST /api/auth/oauth/exchange     (swaps the code for the session)
  → authenticated
```

No tokens appear in any URL. The refresh token is set as the same HttpOnly
cookie password login uses; the access token travels only in the exchange
response body.

---

## 1. Google

1. Go to <https://console.cloud.google.com/apis/credentials> (sign in with any
   Google account).
2. Create a project (top bar) if you don't have one.
3. **APIs & Services → OAuth consent screen**: choose *External*, fill in the
   app name and support email. For local development "Testing" mode is fine —
   only test users can log in, so add your own Google account under *Test
   users*.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   application type **Web application**.
5. Under **Authorized redirect URIs** add:
   `http://localhost:5000/api/auth/oauth/google/callback`
   (and your production equivalent, e.g.
   `https://api.your-domain.com/api/auth/oauth/google/callback`).
6. Copy the **Client ID** and **Client secret** into `.env`:

```
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

## 2. Facebook

1. Go to <https://developers.facebook.com/apps> and **Create App** (type:
   *Business* or *Consumer* — anything works; add the **Facebook Login**
   product when prompted).
2. **Facebook Login → Settings → Valid OAuth Redirect URIs**, add:
   `http://localhost:5000/api/auth/oauth/facebook/callback`
   (plus your production equivalent).
3. Copy **App ID** and **App Secret** from **App settings → Basic** into
   `.env`:

```
FACEBOOK_CLIENT_ID="1234567890"
FACEBOOK_CLIENT_SECRET="..."
```

Note: Facebook requires HTTPS for the redirect URI except for
`localhost`, and developer-mode apps can only log in test users listed under
**Roles → Testers**.

## 3. Twitter / X

1. Go to <https://developer.twitter.com/en/portal/dashboard> and create a
   Project + App.
2. In the app's **User authentication settings**, click **Set up**:
   - App permissions: **Read and write** (minimum needed is Read).
   - App type: **Web App, Automated App or Bot**.
   - Callback URI / Redirect URL:
     `http://localhost:5000/api/auth/oauth/twitter/callback`
     (plus production).
   - Website URL: your frontend, e.g. `http://localhost:5173`.
3. The flow uses **OAuth 2.0 with PKCE** (mandatory at X). Under **Keys and
   tokens → OAuth 2.0 Client ID and Client Secret**, copy both into `.env`:

```
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
```

Important: X only returns the user's email address for apps that have been
**approved for the `email` scope / elevated access**. Until approved, X users
have no verified email — per the account-linking rules the backend refuses to
create or link such accounts, so X login will show "did not share an email"
until approval. That is deliberate (see "Account linking" below).

---

## Environment variables (backend `.env`)

| Variable | Required | Default |
|---|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google login | — |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | for Facebook login | — |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | for Twitter/X login | — |
| `GOOGLE_REDIRECT_URI` etc. | no | `${PUBLIC_API_ORIGIN}/api/auth/oauth/<provider>/callback` |
| `OAUTH_STATE_EXPIRES_IN` | no | `10m` |
| `OAUTH_CODE_EXPIRES_IN` | no | `2m` |

`CLIENT_ORIGIN` (comma-separated) must include the frontend origin, since the
callback redirects to `${CLIENT_ORIGIN}/oauth/callback`.

## Account linking rules

1. `(provider, provider user id)` already linked → sign that user in.
2. Provider returns a **verified** email matching an existing account →
   link the identity to that account (no duplicate users).
3. Provider returns an **unverified** email, or no email → refuse with a clear
   message; sign in with the password once and the verified-provider link
   happens on the next social login.

## Database

Migration `20260829000000_add_oauth_accounts_states_exchange_codes` adds
`oauth_accounts`, `oauth_states` and `oauth_exchange_codes`. Apply with
`npm run db:deploy`. Provider access tokens are intentionally **not**
stored — the app never calls provider APIs after login.
