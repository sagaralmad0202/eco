import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  resetPasswordUser,
  clearResetPasswordState,
  selectResetPasswordState,
} from "../redux/slices/authSlice";

export default function ResetPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // The reset token arrives in the emailed link as ?token=... — see
  // resetUrlFor() in the backend's auth.service.js. It is a 64-character hex
  // string, not an email: the backend looks up a PasswordResetToken row by its
  // hash and never sees an address at this step.
  const token = searchParams.get("token") || "";

  const { loading, error, success, message } = useAppSelector(selectResetPasswordState);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    dispatch(clearResetPasswordState());
    return () => {
      dispatch(clearResetPasswordState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Password updated successfully! Please log in with your new password.");
      dispatch(clearResetPasswordState());
      navigate("/login", { replace: true });
    }
  }, [success, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }

    // Mirrors the backend's zod rules so an obvious miss is caught before a
    // round trip. The server still enforces them — this is convenience only.
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must be at least 8 characters and include a letter and a number.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    dispatch(resetPasswordUser({ token, password }));
  };

  // Without a token there is nothing to submit. Showing the form anyway would
  // only lead to a confusing "invalid or expired link" after the user has typed
  // a password twice, so the dead end is surfaced up front.
  if (!token) {
    return (
      <div className="nc-PageResetPass relative">
        <div className="signup-container">
          <div className="signup-content">
            <h1 className="signup-heading">Reset Password</h1>
            <div className="signup-form-wrapper">
              <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm space-y-3">
                <p className="font-medium">This reset link is incomplete.</p>
                <p className="text-xs opacity-90">
                  Open the most recent link from your password reset email, or
                  request a new one below.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="self-start text-xs font-semibold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition cursor-pointer"
                >
                  Request a new link &rarr;
                </button>
              </div>

              <p className="signup-signin-text">
                Remember your password?{" "}
                <Link to="/login" className="signup-signin-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-PageResetPass relative">
      <div className="signup-container">
        <div className="signup-content">
          <h1 className="signup-heading">Reset Password</h1>

          <div className="signup-form-wrapper">
            {/* Global API Error Alert Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm space-y-2">
                <p>
                  {typeof error === "string"
                    ? error
                    : error.message || "This reset link is invalid or has expired."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold underline hover:no-underline cursor-pointer"
                >
                  Request a new link
                </button>
              </div>
            )}

            {/* Success Message Banner */}
            {message && success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
                {message}
              </div>
            )}

            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Choose a new password. It must be at least 8 characters and include
              a letter and a number.
            </p>

            {/* Reset Password Form */}
            <form onSubmit={handleSubmit} className="signup-form" id="reset-password-form">
              {/* New Password Input */}
              <div className="signup-field">
                <label htmlFor="reset-password" className="signup-label">
                  New Password
                </label>
                <div className="signup-password-wrapper">
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="relative block w-full appearance-none rounded-full px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20 bg-transparent dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    id="reset-toggle-password"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="signup-field">
                <label htmlFor="reset-confirm-password" className="signup-label">
                  Confirm New Password
                </label>
                <div className="signup-password-wrapper">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="relative block w-full appearance-none rounded-full px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20 bg-transparent dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    id="reset-toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="signup-submit-btn cursor-pointer disabled:opacity-50"
                id="reset-submit-btn"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>

            {/* Back to Sign In Link */}
            <p className="signup-signin-text">
              Remember your password?{" "}
              <Link to="/login" className="signup-signin-link" id="reset-signin-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
