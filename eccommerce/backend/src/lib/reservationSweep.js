// Automatically releases inventory for expired PENDING reservations.
//
// When customers create an order, inventory is reserved for 15 minutes.
// If the customer abandons the Razorpay modal or closes the browser,
// this sweeper cancels the order and replenishes the stock so other
// customers can buy it.

const logger = require("./logger");
const { releaseExpiredReservations } = require("../modules/orders/order.service");

const SWEEP_INTERVAL_MS = 60 * 1000; // run every 60 seconds

async function runReservationSweep() {
  try {
    const count = await releaseExpiredReservations();
    if (count > 0) {
      logger.info({ releasedOrders: count }, "Released expired inventory reservations");
    }
    return count;
  } catch (err) {
    logger.error({ err }, "Reservation sweeper encountered an error during sweep");
    return 0;
  }
}

function startReservationSweeper() {
  const run = () =>
    runReservationSweep().catch((err) =>
      logger.error({ err }, "Reservation sweeper task error"),
    );

  const timer = setInterval(run, SWEEP_INTERVAL_MS);
  timer.unref();

  // Run once at boot so long-standing expired reservations are cleaned up immediately
  run();

  return () => clearInterval(timer);
}

module.exports = { runReservationSweep, startReservationSweeper };
