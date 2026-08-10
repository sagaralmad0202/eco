# Cart, Wishlist & Home Page API

Base URL: `http://localhost:5000/api`

Same response envelope as the auth API: every response is JSON with a
`success` boolean, and errors carry a `message`. Validation failures add an
`errors` array naming the offending fields.

---

## Run this first

The schema changed, so nothing here works until the migration is applied.
From `eccommerce/backend`:

```bash
npx prisma migrate dev
npx prisma generate
```

`prisma generate` is not optional — `prisma.wishlist` does not exist on the
client until it runs, and every wishlist endpoint will throw
`Cannot read properties of undefined` without it.

What the migration does:

- adds `products.isFeatured` (boolean, default `false`)
- creates the `wishlists` table
- adds `users.phone` back to the Prisma model

That last one needs explaining. The original migration created a
`users.phone` column, but the `User` model in `schema.prisma` had no `phone`
field — so Prisma's view of the database and the database itself disagreed.
Left alone, `prisma migrate dev` would have noticed the difference and offered
to **drop the column**. The field has been declared in the model instead, which
is the non-destructive direction. Nothing reads it yet. If you deliberately
removed `phone` and want the column gone, delete the field from the `User`
model and let Prisma generate the drop.

---

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/products?featured=true` | — |
| GET | `/products/categories` | — |
| GET | `/cart` | optional |
| POST | `/cart/items` | optional |
| PATCH | `/cart/items/:id` | optional |
| DELETE | `/cart/items/:id` | optional |
| DELETE | `/cart` | optional |
| GET | `/wishlist` | required |
| POST | `/wishlist/items` | required |
| POST | `/wishlist/toggle` | required |
| DELETE | `/wishlist/items/:productId` | required |

"Optional" auth means the endpoint serves both signed-in customers and guests.
Send `Authorization: Bearer <accessToken>` when you have one.

---

## Cart

### How a cart is identified

A cart belongs to **either** a signed-in user or an anonymous browser session,
never both.

Guests are identified by a `cart_session` cookie: 32 random bytes, `httpOnly`,
30-day expiry, minted by the server on first contact with any cart route. The
client never sends or chooses this value — if it could name its own session,
guessing someone else's string would hand over their basket.

**Every cart request must therefore send cookies.** From the browser that means
`credentials: "include"` on fetch, or `withCredentials: true` on axios. Without
it the server mints a fresh session on each request and the cart appears to
empty itself between calls.

On login or register, whatever was in the guest cart is merged into the
customer's own cart, quantities summed and clamped to available stock, and the
guest cookie is retired. This happens automatically inside
`POST /auth/login` and `POST /auth/register` — the frontend does not need to
trigger it.

### The cart object

Every cart endpoint returns the same shape, so the badge, the drawer and the
checkout summary can all read one response:

```json
{
  "success": true,
  "data": {
    "id": "6f1c…",
    "items": [
      {
        "id": "b28e…",
        "quantity": 2,
        "variant": {
          "id": "9a71…",
          "sku": "TEE-IND-M",
          "title": "Indigo / M",
          "price": "2999.00",
          "compareAtPrice": "3999.00",
          "stock": 14,
          "inStock": true
        },
        "product": {
          "id": "44c0…",
          "name": "Oversized Cotton Tee",
          "slug": "oversized-cotton-tee",
          "brand": "Kalind",
          "image": "https://…"
        },
        "lineTotal": "5998.00",
        "unavailable": false,
        "exceedsStock": false
      }
    ],
    "totalQuantity": 2,
    "subtotal": "5998.00"
  }
}
```

Notes that matter when you build against this:

- **Money is a string**, always with two decimals. Do not `parseFloat` it for
  arithmetic — that is the rounding bug the `Decimal` column exists to prevent.
  Format it for display, send it back as-is.
- **`totalQuantity` counts units, not lines.** Use it for the header badge.
- **Prices are read live on every request.** A cart item stores no price; if
  the price changed since it was added, the new one is what you see. Price is
  frozen only when the order is placed.
- **`unavailable`** means the product or variant was deactivated, or stock hit
  zero, after the item was added. The line is still returned so you can grey it
  out and explain — it is excluded from `subtotal`.
- **`exceedsStock`** means the saved quantity is now higher than what is left.
- `subtotal` is the only total here. Shipping, tax and discounts belong to
  checkout; a cart that guessed at them would disagree with the order.

### GET /cart

No body. Returns the cart object above. A visitor with no cart yet gets
`items: []`, `id: null` — this endpoint never creates a row, so crawlers hitting
the homepage do not litter the table.

### POST /cart/items

```json
{ "variantId": "9a71…", "quantity": 1 }
```

`variantId`, not `productId` — price and stock live on the variant, so "add the
product" has no answer once there is more than one size. `quantity` defaults to
`1`, max `20`.

Adding a variant already in the cart **increments** it rather than adding a
second line. The stock check runs against the resulting total, so ten separate
"add 1" calls cannot walk past it.

Returns `201` with the whole cart, so you do not need a follow-up `GET`.

Errors: `404` if the variant does not exist or is deactivated (a delisted
product is reported as missing, not as disabled), `400` for out of stock or
`Only N left in stock`.

### PATCH /cart/items/:id

```json
{ "quantity": 3 }
```

`:id` is the **cart item** id, not the variant id. Quantity is the only
editable field — changing which variant a line points at is a remove plus an
add, and treating it as an update would skip the stock check on the new
variant.

Returns the whole cart. `404` if the item is not in *your* cart.

### DELETE /cart/items/:id

Removes one line. Returns the whole cart.

### DELETE /cart

Empties the cart. Clearing an already-empty cart is a success, not a `404` —
the caller wanted an empty cart and that is what they have.

---

## Wishlist

Requires a session on every route. A guest wishlist would need somewhere to
live, and for a list with no expiry and no checkout to flush it, the honest
answer is "an account". The cart earns its guest path because abandoning a
basket at the sign-in wall costs a sale; a heart click does not.

A wishlist saves **products**, not variants — hearting a jacket means "I want
this jacket", not "the blue one in medium". The size is chosen at purchase.

### GET /wishlist

```json
{
  "success": true,
  "data": [
    {
      "id": "d10a…",
      "addedAt": "2026-08-10T09:12:44.000Z",
      "product": {
        "id": "44c0…",
        "name": "Leather Biker Jacket",
        "slug": "leather-biker-jacket",
        "brand": "Kalind",
        "image": "https://…",
        "priceFrom": "12999.00",
        "compareAtPrice": "15999.00",
        "inStock": true,
        "available": true
      }
    }
  ]
}
```

Newest first. `available: false` means the product was deactivated after it was
saved — the row stays and is flagged rather than vanishing without explanation.

### POST /wishlist/toggle

```json
{ "productId": "44c0…" }
```

**This is the one product cards should call.** Returns `saved: true|false`
telling you which way the heart should now point, plus the full updated list:

```json
{ "success": true, "saved": true, "data": [ … ] }
```

Idempotent in both directions, so a page with a stale heart state cannot
produce an "already saved" error.

### POST /wishlist/items

Add-only. Saving something already saved is not an error — the row is upserted
and you get `201` with the full list.

### DELETE /wishlist/items/:productId

Keyed by **product** id, not the wishlist row id, so the card does not need a
lookup just to find the id of a row it is about to delete. `404` if it was not
in your wishlist.

---

## Home page product data

No new endpoints were needed here — the existing product routes cover it.

### Featured rails

```
GET /products?featured=true&limit=8
```

`featured=true` narrows to products flagged `isFeatured`. Omitting the param
returns the whole catalogue; it never means "the unfeatured ones".

**Nothing is featured yet.** `isFeatured` defaults to `false`, so this returns
an empty list until you flag some products:

```sql
UPDATE products SET "isFeatured" = true WHERE slug IN ('…', '…');
```

The flag exists so merchandising is a deliberate choice rather than an accident
of upload order. If you would rather the home page just showed the newest
products, use `?sort=newest&limit=8` and ignore the flag.

Combine with the existing filters for the different rails, so three sections do
not all show the same eight products:

```
GET /products?featured=true&limit=5                 # main slider
GET /products?category=jackets&limit=4              # large product slider
GET /products?sort=newest&limit=12                  # find your favourite
```

Full param list: `page`, `limit` (max 50), `search`, `category` (slug),
`brand`, `minPrice`, `maxPrice`, `sort` (`newest` | `price_asc` | `price_desc`
| `name_asc`), `inStock`, `featured`.

### Category tiles

```
GET /products/categories
```

Now returns `productCount` on every category and subcategory:

```json
{
  "success": true,
  "data": [
    {
      "id": "…", "name": "Men", "slug": "men",
      "productCount": 48,
      "children": [
        { "id": "…", "name": "Jackets", "slug": "jackets", "productCount": 12 }
      ]
    }
  ]
}
```

A parent's count includes its children's. Products are usually filed under the
leaf, so a parent tile reading `0` while its subcategories held hundreds would
look broken. Only active products are counted — advertising deactivated stock
would overstate the catalogue.

### Quick view and search

Already covered by `GET /products/:slug` and `GET /products?search=…`. The
detail response includes all images, all active variants, the ten most recent
reviews and an aggregate rating.

---

## Not built

`POST /newsletter/subscribe` was excluded deliberately. `SectionSpecialOffer`'s
email input currently throws its value away on submit; collecting those
addresses needs an endpoint and a `newsletter_subscribers` table, neither of
which exists.
