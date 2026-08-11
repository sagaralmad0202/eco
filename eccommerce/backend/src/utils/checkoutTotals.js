const env = require("../config/env");
const { ZERO, round, toDecimal } = require("./money");

/**
 * Computes the shipping, tax, and payable total shared by cart and checkout.
 * Keeping this in one place guarantees that the cart quote and immutable order
 * use identical rates, thresholds, Decimal arithmetic, and rounding.
 */
function calculateTotals(goodsAmount) {
  const base = toDecimal(goodsAmount);

  if (base.lessThanOrEqualTo(ZERO)) {
    return { shippingFee: ZERO, tax: ZERO, total: ZERO };
  }

  const shippingIsFree =
    env.FREE_SHIPPING_ABOVE != null &&
    base.greaterThanOrEqualTo(toDecimal(env.FREE_SHIPPING_ABOVE));

  const shippingFee = shippingIsFree
    ? ZERO
    : round(toDecimal(env.SHIPPING_FLAT_FEE));
  const tax = round(base.mul(toDecimal(env.TAX_PERCENT)).div(100));

  return {
    shippingFee,
    tax,
    total: round(base.add(shippingFee).add(tax)),
  };
}

module.exports = { calculateTotals };
