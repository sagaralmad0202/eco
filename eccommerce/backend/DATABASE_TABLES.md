# Database Tables Specification

This document outlines all the database tables required to power the **Eco / Ciseco E-commerce** application (Web + Mobile), their schema definitions, relationships, and the specific frontend components/pages they support.

---

## Architecture Overview

* **Database Engine:** PostgreSQL (Serverless on [Neon.tech](https://neon.tech))
* **ORM:** Prisma ORM (`@prisma/client`)
* **Schema File:** [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## Entity Relationship Summary

```
users ──┬──< refresh_tokens
        ├──< addresses
        ├──── carts ──────────< cart_items >──────── product_variants >── products >── categories
        ├──< orders ──────────< order_items >───────┘                     │
        │       └──< payments                                             ├──< product_images
        ├──< reviews >────────────────────────────────────────────────────┘
        └──< wishlist_items >─────────────────────────────────────────────┘

coupons (Standalone promotional discount rules)
```

---

## Tables Breakdown

### 1. `users`
**Purpose:** User accounts, authentication credentials, customer profile details, and role permissions.  
**Frontend Pages:** `/signup`, `/login`, `/account` (Profile Settings, DOB, Gender, Bio, Avatar).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique user identifier |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Customer email address |
| `passwordHash` | `TEXT` | `NOT NULL` | Bcrypt hashed password |
| `fullName` | `VARCHAR(100)` | `NOT NULL` | Full customer name |
| `phone` | `VARCHAR(20)` | `UNIQUE`, `NULLABLE` | Contact phone number |
| `dateOfBirth` | `DATE` | `NULLABLE` | Customer birth date (for DOB field in `/account`) |
| `gender` | `VARCHAR(20)` | `NULLABLE` | Selected gender (`Male`, `Female`, `Other`) |
| `aboutYou` | `TEXT` | `NULLABLE` | Short biography / profile description |
| `avatarUrl` | `TEXT` | `NULLABLE` | URL to customer profile picture |
| `role` | `ENUM` | Default `'CUSTOMER'` (`CUSTOMER`, `ADMIN`) | User access privileges |
| `isActive` | `BOOLEAN` | Default `true` | Account active flag |
| `emailVerifiedAt` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp of email verification |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Account registration date |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Timestamp of last profile edit |

---

### 2. `refresh_tokens`
**Purpose:** Secure, hashed JWT refresh token persistence for persistent login sessions.  
**Frontend Features:** Token refresh interceptor across web and mobile app.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique token record ID |
| `userId` | `UUID` | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Associated user ID |
| `tokenHash` | `TEXT` | `UNIQUE`, `NOT NULL` | SHA-256 hash of refresh token |
| `expiresAt` | `TIMESTAMPTZ` | `NOT NULL` | Token expiration timestamp |
| `revokedAt` | `TIMESTAMPTZ` | `NULLABLE` | Revocation timestamp (on logout) |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Creation timestamp |

---

### 3. `addresses`
**Purpose:** Stores customer shipping and billing addresses for fast checkout.  
**Frontend Pages:** `/account` (Address management), `/checkout` (Saved address selection).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique address ID |
| `userId` | `UUID` | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Associated user ID |
| `type` | `ENUM` | Default `'SHIPPING'` (`SHIPPING`, `BILLING`) | Address categorization |
| `fullName` | `VARCHAR(100)` | `NOT NULL` | Recipient name |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Recipient contact number |
| `line1` | `TEXT` | `NOT NULL` | Street address / Building / Apartment |
| `line2` | `TEXT` | `NULLABLE` | Suite / Landmark |
| `city` | `VARCHAR(100)` | `NOT NULL` | City name |
| `state` | `VARCHAR(100)` | `NOT NULL` | State or Province |
| `postalCode` | `VARCHAR(20)` | `NOT NULL` | Postal / PIN / ZIP code |
| `country` | `VARCHAR(50)` | Default `'IN'` | Country code or name |
| `isDefault` | `BOOLEAN` | Default `false` | Default address toggle |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Update timestamp |

---

### 4. `categories`
**Purpose:** Hierarchical product categorization.  
**Frontend Pages:** Navigation bar, `/shop` (Category filter tabs), Home "Start Exploring" categories.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique category identifier |
| `name` | `VARCHAR(100)` | `NOT NULL` | Name (e.g. *Jackets, Women, Men, Beauty, Bags, Sport*) |
| `slug` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | URL slug (e.g. *jackets*, *beauty*) |
| `description` | `TEXT` | `NULLABLE` | Category summary |
| `imageUrl` | `TEXT` | `NULLABLE` | Category feature banner image |
| `parentId` | `UUID` | `FOREIGN KEY (categories.id) ON DELETE SET NULL` | Parent category for subcategories |
| `isActive` | `BOOLEAN` | Default `true` | Visibility status |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Record update timestamp |

---

### 5. `products`
**Purpose:** Core product catalog data.  
**Frontend Pages:** Home product sliders, `/shop` grid, `/search`, `/products/:slug` (Product detail page).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique product identifier |
| `name` | `VARCHAR(200)` | `NOT NULL` | Title (e.g. *"Cashmere Sweater"*) |
| `slug` | `VARCHAR(200)` | `UNIQUE`, `NOT NULL` | URL slug (e.g. *"cashmere-sweater"*) |
| `description` | `TEXT` | `NULLABLE` | Full product description |
| `brand` | `VARCHAR(100)` | `NULLABLE` | Brand name |
| `categoryId` | `UUID` | `FOREIGN KEY (categories.id) ON DELETE SET NULL` | Category assignment |
| `badge` | `VARCHAR(50)` | `NULLABLE` | Badge tag (e.g. *"New in"*, *"50% Discount"*) |
| `hasSizes` | `BOOLEAN` | Default `true` | `false` for perfumes/bags where size is not needed |
| `rating` | `DECIMAL(3,2)` | Default `0.00` | Cached average review rating (1.00 - 5.00) |
| `reviewsCount` | `INTEGER` | Default `0` | Cached total reviews count |
| `isActive` | `BOOLEAN` | Default `true` | Product active status |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Created date |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Last updated date |

---

### 6. `product_variants`
**Purpose:** Specific purchasable SKU instances containing stock, price, color, and size options.  
**Frontend Components:** `ProductVariants.jsx`, `QuickViewPanel.jsx`, price badges, color swatches, size buttons.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique variant identifier |
| `productId` | `UUID` | `FOREIGN KEY (products.id) ON DELETE CASCADE` | Associated parent product |
| `sku` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | Stock Keeping Unit code |
| `title` | `VARCHAR(100)` | `NOT NULL` | Combination title (e.g. *"Brown / L"*) |
| `colorName` | `VARCHAR(50)` | `NULLABLE` | Color name (e.g. *"Black"*, *"Brown"*, *"Beige"*) |
| `colorHex` | `VARCHAR(20)` | `NULLABLE` | Color hex code (e.g. *`#000000`*, *`#C6BDB5`*) |
| `size` | `VARCHAR(20)` | `NULLABLE` | Size option (e.g. *"XXS"*, *"XS"*, *"M"*, *"L"*, *"XL"*) |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | Live selling price (NEVER floating point) |
| `compareAtPrice` | `DECIMAL(10,2)` | `NULLABLE` | Original price for strikethrough sale display |
| `stock` | `INTEGER` | Default `0`, `NOT NULL` | Units available in inventory |
| `isActive` | `BOOLEAN` | Default `true` | Variant availability status |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Record update timestamp |

---

### 7. `product_images`
**Purpose:** High-resolution product images and thumbnail galleries.  
**Frontend Components:** `ProductGallery.jsx`, `QuickViewPanel.jsx`, product card hover previews.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique image record ID |
| `productId` | `UUID` | `FOREIGN KEY (products.id) ON DELETE CASCADE` | Associated product |
| `url` | `TEXT` | `NOT NULL` | Asset image URL (WebP) |
| `alt` | `VARCHAR(255)` | `NULLABLE` | Accessible alt description |
| `position` | `INTEGER` | Default `0` | Sort order in image carousel/thumbs |

---

### 8. `wishlist_items`
**Purpose:** Stores customer saved/liked products.  
**Frontend Pages:** Heart like icons across cards, `/wishlist`, `/account-wishlists`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique wishlist item ID |
| `userId` | `UUID` | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Owner user ID |
| `productId` | `UUID` | `FOREIGN KEY (products.id) ON DELETE CASCADE` | Liked product ID |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Timestamp of addition |

*Constraints:* `UNIQUE(userId, productId)` prevents duplicate bookmarking.

---

### 9. `carts` & `cart_items`
**Purpose:** User & guest shopping cart management.  
**Frontend Components:** `Header` cart badge count, `SideCart` drawer, `/cart` page.

#### `carts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique cart identifier |
| `userId` | `UUID` | `UNIQUE`, `FOREIGN KEY (users.id) ON DELETE CASCADE`, `NULLABLE` | Linked registered user |
| `sessionId` | `VARCHAR(100)` | `UNIQUE`, `NULLABLE` | Guest session tracking cookie |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Cart creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Cart activity timestamp |

#### `cart_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Item row ID |
| `cartId` | `UUID` | `FOREIGN KEY (carts.id) ON DELETE CASCADE` | Parent cart ID |
| `variantId` | `UUID` | `FOREIGN KEY (product_variants.id) ON DELETE CASCADE` | Selected product variant |
| `quantity` | `INTEGER` | Default `1`, `CHECK (quantity >= 1)` | Quantity chosen by customer |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Added date |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Last quantity change date |

*Constraints:* `UNIQUE(cartId, variantId)` ensures quantity is incremented rather than creating duplicate lines.

---

### 10. `orders` & `order_items`
**Purpose:** Checkout orders, purchase price snapshots, history, and status tracking.  
**Frontend Pages:** `/checkout`, `/order-successful`, `/orders` history tab, `/orders/:orderId` invoice details.

#### `orders`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique order identifier |
| `orderNumber` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Human-readable ID (e.g. *"ORD-2026-000148"*) |
| `userId` | `UUID` | `FOREIGN KEY (users.id) ON DELETE SET NULL`, `NULLABLE` | Customer ID (preserves orders if user deleted) |
| `status` | `ENUM` | Default `'PENDING'` (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`) | Order fulfillment lifecycle stage |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL` | Sum of item totals |
| `discount` | `DECIMAL(10,2)` | Default `0.00` | Applied coupon discount amount |
| `shippingFee` | `DECIMAL(10,2)` | Default `0.00` | Calculated shipping estimate |
| `tax` | `DECIMAL(10,2)` | Default `0.00` | Calculated sales tax estimate |
| `total` | `DECIMAL(10,2)` | `NOT NULL` | Final total paid |
| `currency` | `VARCHAR(10)` | Default `'INR'` | Currency code (`INR`, `USD`) |
| `shippingName` | `VARCHAR(100)` | `NOT NULL` | Snapshot shipping recipient name |
| `shippingPhone` | `VARCHAR(20)` | `NOT NULL` | Snapshot contact phone |
| `shippingLine1` | `TEXT` | `NOT NULL` | Snapshot street address |
| `shippingLine2` | `TEXT` | `NULLABLE` | Snapshot suite / landmark |
| `shippingCity` | `VARCHAR(100)` | `NOT NULL` | Snapshot city |
| `shippingState` | `VARCHAR(100)` | `NOT NULL` | Snapshot state |
| `shippingPostalCode`| `VARCHAR(20)` | `NOT NULL` | Snapshot postal code |
| `shippingCountry` | `VARCHAR(50)` | Default `'IN'` | Snapshot country |
| `couponCode` | `VARCHAR(50)` | `NULLABLE` | Applied discount promo code |
| `placedAt` | `TIMESTAMPTZ` | Default `now()` | Order placement time |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Last status change timestamp |

#### `order_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Line item identifier |
| `orderId` | `UUID` | `FOREIGN KEY (orders.id) ON DELETE CASCADE` | Parent order reference |
| `variantId` | `UUID` | `FOREIGN KEY (product_variants.id) ON DELETE SET NULL`, `NULLABLE` | Variant reference |
| `productName` | `VARCHAR(200)` | `NOT NULL` | Immutable snapshot of product title |
| `variantTitle` | `VARCHAR(100)` | `NOT NULL` | Immutable snapshot of variant (e.g. *"Brown / L"*) |
| `sku` | `VARCHAR(100)` | `NOT NULL` | Snapshot SKU |
| `unitPrice` | `DECIMAL(10,2)` | `NOT NULL` | Unit purchase price frozen at checkout |
| `quantity` | `INTEGER` | `NOT NULL` | Quantity purchased |
| `lineTotal` | `DECIMAL(10,2)` | `NOT NULL` | `unitPrice * quantity` |

---

### 11. `payments`
**Purpose:** Razorpay payment transactions, webhook signatures, and verification status.  
**Frontend Feature:** Razorpay Secure Checkout integration on `/checkout`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Internal transaction ID |
| `orderId` | `UUID` | `FOREIGN KEY (orders.id) ON DELETE CASCADE` | Associated order |
| `provider` | `VARCHAR(50)` | Default `'razorpay'` | Payment gateway name |
| `providerOrderId` | `VARCHAR(100)` | `NULLABLE` | Razorpay order ID (`order_xxx`) |
| `providerPaymentId` | `VARCHAR(100)` | `UNIQUE`, `NULLABLE` | Razorpay payment confirmation ID (`pay_xxx`) |
| `amount` | `DECIMAL(10,2)` | `NOT NULL` | Paid amount |
| `currency` | `VARCHAR(10)` | Default `'INR'` | Currency code |
| `status` | `ENUM` | Default `'PENDING'` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`) | Transaction state |
| `rawPayload` | `JSONB` | `NULLABLE` | Full webhook JSON response payload |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Payment initiation time |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Payment status update time |

---

### 12. `reviews`
**Purpose:** Customer product reviews, feedback comments, and 1–5 star ratings.  
**Frontend Section:** `ReviewsSection.jsx` on `/products/:slug`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique review ID |
| `userId` | `UUID` | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Reviewer ID |
| `productId` | `UUID` | `FOREIGN KEY (products.id) ON DELETE CASCADE` | Reviewed product ID |
| `rating` | `SMALLINT` | `NOT NULL`, `CHECK (rating BETWEEN 1 AND 5)` | Star rating (1 to 5) |
| `title` | `VARCHAR(150)` | `NULLABLE` | Review headline |
| `comment` | `TEXT` | `NULLABLE` | Review text |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Review posting date |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Edit timestamp |

*Constraints:* `UNIQUE(userId, productId)` prevents duplicate reviews from the same user on the same product.

---

### 13. `coupons`
**Purpose:** Promo discount codes with percentage or flat reduction rules.  
**Frontend Feature:** "Discount code" input on Cart & Checkout pages.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique coupon ID |
| `code` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Promo code string (e.g. *"SUMMER20"*) |
| `discountType` | `ENUM` | `NOT NULL` (`PERCENT`, `FIXED`) | Percentage off or flat dollar/rupee off |
| `value` | `DECIMAL(10,2)` | `NOT NULL` | Discount value (e.g. `20.00` for 20% or flat $20) |
| `minOrderTotal` | `DECIMAL(10,2)` | `NULLABLE` | Minimum order subtotal required |
| `maxDiscount` | `DECIMAL(10,2)` | `NULLABLE` | Maximum discount cap for percentage coupons |
| `usageLimit` | `INTEGER` | `NULLABLE` | Maximum global redemption count |
| `usedCount` | `INTEGER` | Default `0` | Number of times used so far |
| `startsAt` | `TIMESTAMPTZ` | `NULLABLE` | Coupon activation date |
| `expiresAt` | `TIMESTAMPTZ` | `NULLABLE` | Coupon expiration date |
| `isActive` | `BOOLEAN` | Default `true` | Active status toggle |
| `createdAt` | `TIMESTAMPTZ` | Default `now()` | Creation date |
| `updatedAt` | `TIMESTAMPTZ` | Auto-updated on modify | Update date |

---

## How to Deploy to PostgreSQL

1. Add your Neon / PostgreSQL connection string to `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-pooler.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://user:password@ep-direct.neon.tech/neondb?sslmode=require"
   ```

2. Run the Prisma migration to create all tables:
   ```bash
   cd backend
   npx prisma migrate dev --name init_tables
   ```

3. Seed initial products, categories, and test users:
   ```bash
   npm run db:seed
   ```

4. Launch Prisma Studio to inspect tables visually:
   ```bash
   npm run db:studio
   ```
