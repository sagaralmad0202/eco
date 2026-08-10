// Money arithmetic.
//
// Every amount in this codebase is a Prisma.Decimal backed by a
// Decimal(10,2) column. The rules, in order of how much damage breaking them
// does:
//
//   1. Never convert money to a JS number to do arithmetic on it.
//      0.1 + 0.2 === 0.30000000000000004. Over a few thousand orders that
//      becomes a real discrepancy someone has to reconcile by hand.
//   2. Serialise money to a STRING at the API boundary, never a number —
//      JSON.parse would immediately undo rule 1 on the client.
//
// product.service.js already serialises variant prices this way; these helpers
// exist so orders, carts and coupons do it identically instead of each
// module inventing its own rounding.

const { Prisma } = require("@prisma/client");

const Decimal = Prisma.Decimal;

const ZERO = new Decimal(0);

function toDecimal(value) {
  return value instanceof Decimal ? value : new Decimal(value ?? 0);
}

// Money leaves this API as a fixed-2 string: "2999.00", never 2999 or "2999".
function toMoneyString(value) {
  return toDecimal(value).toFixed(2);
}

function multiply(amount, quantity) {
  return toDecimal(amount).mul(quantity);
}

function sum(amounts) {
  return amounts.reduce((total, amount) => total.add(toDecimal(amount)), ZERO);
}

// Rounds to paise, half-up — the behaviour a customer expects when they see
// a total, and what the Decimal column will store anyway.
function round(value) {
  return toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

// Razorpay (like Stripe) works in the smallest currency unit. Sending rupees
// where paise are expected undercharges by 100x, so this conversion is
// centralised rather than written inline at the call site.
function toMinorUnits(value) {
  return round(value).mul(100).toNumber();
}

/**
 * Applies a coupon to a subtotal.
 *
 * Returns the discount as a Decimal, never more than the subtotal itself —
 * a fixed ₹500 coupon on a ₹300 cart must not produce a negative total that
 * the payment gateway would reject.
 */
function calculateDiscount({ subtotal, discountType, value, maxDiscount }) {
  const base = toDecimal(subtotal);
  let discount;

  if (discountType === "PERCENT") {
    discount = base.mul(toDecimal(value)).div(100);

    // maxDiscount caps percentage coupons: "20% off, up to ₹500".
    if (maxDiscount != null) {
      const cap = toDecimal(maxDiscount);
      if (discount.greaterThan(cap)) discount = cap;
    }
  } else {
    discount = toDecimal(value);
  }

  if (discount.greaterThan(base)) discount = base;
  if (discount.lessThan(ZERO)) discount = ZERO;

  return round(discount);
}

module.exports = {
  Decimal,
  ZERO,
  toDecimal,
  toMoneyString,
  multiply,
  sum,
  round,
  toMinorUnits,
  calculateDiscount,
};
