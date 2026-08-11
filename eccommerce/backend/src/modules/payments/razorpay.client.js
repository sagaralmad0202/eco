const Razorpay = require("razorpay");

const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");

let client;

function getRazorpayClient() {
  if (!env.PAYMENTS_ENABLED) {
    throw new ApiError(
      503,
      "Razorpay TEST MODE is not configured on the server",
    );
  }

  // env validation already rejects live key ids. Keep this runtime guard next
  // to SDK construction so a future config refactor cannot silently weaken it.
  if (!env.RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
    throw new ApiError(503, "Only Razorpay TEST MODE is enabled");
  }

  client ??= new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });

  return client;
}

module.exports = { getRazorpayClient };
