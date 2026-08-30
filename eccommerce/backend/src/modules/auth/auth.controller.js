const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const cartService = require("../cart/cart.service");
const {
  clearCartSession,
  CART_SESSION_COOKIE,
} = require("../../middleware/cartSession");
const {
  recordLoginFailure,
  clearLoginFailures,
} = require("../../middleware/loginThrottle");

const REFRESH_COOKIE_NAME = "refreshToken";

function setRefreshCookie(res, refreshToken) {
  if (!refreshToken) return;
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/auth",
  });
}

// Folds whatever the visitor had in their guest basket into the account they
// just authenticated as, then retires the guest cookie so the same items
// cannot be merged a second time.
//
// A merge failure must never fail the login. The customer has already proved
// who they are; refusing them entry because one cart row could not be moved
// would be the worse outcome by far. Logged and swallowed instead.
async function absorbGuestCart(req, res, userId) {
  const sessionId = req.cookies?.[CART_SESSION_COOKIE];
  if (!sessionId) return;

  try {
    await cartService.mergeGuestCart({ userId, sessionId });
    clearCartSession(res);
  } catch (err) {
    req.log?.warn({ err }, "guest cart merge failed");
  }
}

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken);
  await absorbGuestCart(req, res, result.user.id);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const email = req.body.email;
  let result;
  try {
    result = await authService.login(req.body);
  } catch (err) {
    // Record every failure — the throttle middleware will block this email
    // once the threshold is reached, regardless of source IP.
    if (email) recordLoginFailure(email);
    throw err;
  }
  clearLoginFailures(email);
  setRefreshCookie(res, result.refreshToken);
  await absorbGuestCart(req, res, result.user.id);
  res.json({ success: true, data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const tokenFromCookieOrBody =
    req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  if (!tokenFromCookieOrBody) {
    throw ApiError.unauthorized("Refresh token is required");
  }
  const tokens = await authService.refresh(tokenFromCookieOrBody);
  setRefreshCookie(res, tokens.refreshToken);
  res.json({ success: true, data: tokens });
});

// req.user is present only when the caller sent a usable access token
// (optionalAuth), so it is read defensively — logout must also work for a
// client whose access token has already expired.
const logout = asyncHandler(async (req, res) => {
  const tokenFromCookieOrBody =
    req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  await authService.logout({
    refreshToken: tokenFromCookieOrBody,
    userId: req.user?.id,
  });
  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out" });
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user.id);
  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out of all devices" });
});

// The reply is identical whether or not the email is registered. The service
// decides internally whether to send anything; this handler must not branch
// on the outcome, or the response itself would reveal who has an account.
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  res.json({
    success: true,
    message:
      "If an account exists for that email, a reset link is on its way. " +
      "Check your inbox and spam folder.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json({
    success: true,
    message:
      "Your password has been reset. You have been signed out of all devices.",
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const tokens = await authService.changePassword({
    userId: req.user.id,
    ...req.body,
  });

  // Fresh tokens because the change revoked every existing session. The
  // client must replace its stored pair with these or the next refresh fails.
  setRefreshCookie(res, tokens.refreshToken);
  res.json({
    success: true,
    message: "Password updated. Other devices have been signed out.",
    data: tokens,
  });
});

// req.user is attached by the authenticate middleware.
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.query);
  res.json({
    success: true,
    message: "Email verified successfully. You can now use all features.",
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification({ userId: req.user.id });
  res.json({
    success: true,
    message:
      "If your email is not yet verified, a new verification link is on its way.",
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
  // Shared with the OAuth controller — one definition so the cookie's flags
  // can never drift between the two login paths.
  setRefreshCookie,
  absorbGuestCart,
};
