// Interactive transactions use Prisma's very short defaults unless options
// are supplied. Checkout talks to a pooled, remote Neon database and performs
// several dependent reads/writes, so a cold connection can otherwise hit
// P2028 before any genuinely slow query exists.
//
// Keep this scoped to checkout rather than changing every transaction in the
// application. There are no payment-provider HTTP calls inside these blocks.
const CHECKOUT_TRANSACTION_OPTIONS = Object.freeze({
  maxWait: 10000,
  timeout: 30000,
});

module.exports = { CHECKOUT_TRANSACTION_OPTIONS };
