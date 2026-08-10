const crypto = require("crypto");
const env = require("../config/env");

// Name is deliberately boring. This cookie identifies a shopping session, not
// a login, and nothing about it should suggest otherwise.
const COOKIE_NAME = "cart_session";

// Long enough that a customer who leaves a full basket and comes back next
// week still finds it. Shorter than that and abandoned-cart recovery — the
// single highest-value email an online store sends — has nothing to recover.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Gives every visitor a cart identity.
 *
 * Signed-in customers already have one: their user id. Guests get an opaque
 * random id in an httpOnly cookie, minted on first contact with a cart route.
 *
 * The id is issued by the server and never read from the request body. If a
 * client could name its own session, guessing someone else's string would hand
 * over their basket — and with it their browsing history and, at checkout,
 * anything they had entered.
 */
function cartSession(req, res, next) {
  // A signed-in customer needs no guest id. Minting one anyway would leave a
  // second, orphaned cart behind on every visit.
  if (req.user) {
    req.cartOwner = { userId: req.user.id };
    return next();
  }

  let sessionId = req.cookies?.[COOKIE_NAME];

  // Length check, not just presence: a truncated or hand-edited cookie should
  // be replaced rather than trusted.
  if (typeof sessionId !== "string" || sessionId.length !== 64) {
    sessionId = crypto.randomBytes(32).toString("hex");

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true, // JavaScript cannot read it, so XSS cannot steal the cart
      sameSite: "lax", // survives normal navigation, not cross-site form posts
      // Same switch the refresh-token cookie uses. A Secure cookie is silently
      // dropped over plain http, so hardcoding it would break the entire guest
      // cart on localhost — env.js already refuses to boot in production
      // without it.
      secure: env.COOKIE_SECURE,
      maxAge: MAX_AGE_MS,
      path: "/",
    });
  }

  req.cartOwner = { sessionId };
  next();
}

// Used after login and signup to fold the guest cart into the real one, then
// retire the cookie so the merge cannot run twice.
function clearCartSession(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

module.exports = { cartSession, clearCartSession, CART_SESSION_COOKIE: COOKIE_NAME };
