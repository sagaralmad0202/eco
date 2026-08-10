const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.json({ success: true, message: "Logged out" });
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user.id);
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
};
