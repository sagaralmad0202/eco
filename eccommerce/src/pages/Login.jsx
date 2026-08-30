import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  loginUser,
  clearLoginState,
  selectLoginState,
} from "../redux/slices/authSlice";

import { useSearchParams } from "react-router-dom";

// Full-page navigation, not an axios call: the backend must redirect the
// browser to the provider, so the page actually leaves the SPA. No client
// secret is involved at any point — that stays on the backend.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const oauthUrl = (provider) => `${API_BASE_URL}/auth/oauth/${provider}`;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { loading, error, success } = useAppSelector(selectLoginState);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    dispatch(clearLoginState());
    return () => {
      dispatch(clearLoginState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Logged in successfully! Welcome back.");
      dispatch(clearLoginState());
      navigate("/", { replace: true });
    }
  }, [success, navigate, dispatch]);

  // Handle auto-redirect to signup if user is new / login rejected
  useEffect(() => {
    if (error) {
      toast.error("Account not found or invalid credentials. Redirecting to Sign Up...");
      const timer = setTimeout(() => {
        dispatch(clearLoginState());
        navigate("/signup", { state: { email } });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error, navigate, dispatch, email]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    const credentials = {
      email: email.trim().toLowerCase(),
      password,
    };

    dispatch(loginUser(credentials));
  };

  return (
    <div className="nc-PageLogin relative">
      <div className="signup-container">
        <div className="signup-content">
          <h1 className="signup-heading">Login</h1>

          <div className="signup-form-wrapper">
            {/* Global API Error Alert Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm flex flex-col gap-2">
                <div>
                  <strong>Invalid Login or Account Not Found.</strong>
                  <p className="text-xs mt-0.5 opacity-90">
                    If you don't have an account yet, redirecting you to Sign Up...
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearLoginState());
                    navigate("/signup", { state: { email } });
                  }}
                  className="self-start text-xs font-semibold px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                >
                  Go to Sign Up Now &rarr;
                </button>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="signup-social-grid">
              {/* Google */}
              <a href={oauthUrl("google")} className="signup-social-btn" id="login-google-btn">
                <svg
                  className="signup-social-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M3.15283 7.3455L6.43833 9.755C7.32733 7.554 9.48033 6 11.9998 6C13.5293 6 14.9208 6.577 15.9803 7.5195L18.8088 4.691C17.0228 3.0265 14.6338 2 11.9998 2C8.15883 2 4.82783 4.1685 3.15283 7.3455Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M12.0002 22C14.5832 22 16.9302 21.0115 18.7047 19.404L15.6097 16.785C14.5719 17.5742 13.3039 18.001 12.0002 18C9.39916 18 7.19066 16.3415 6.35866 14.027L3.09766 16.5395C4.75266 19.778 8.11366 22 12.0002 22Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                    fill="#1976D2"
                  />
                </svg>
                <span className="signup-social-text">Continue with Google</span>
              </a>
            </div>

            {/* OR Divider */}
            <div className="signup-divider">
              <div className="signup-divider-line"></div>
              <span className="signup-divider-text">OR</span>
              <div className="signup-divider-line"></div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="signup-form" id="login-form">
              <div className="signup-field">
                <label htmlFor="login-email" className="signup-label">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="relative block w-full appearance-none rounded-full px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20 bg-transparent dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500 data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/[2.5%] dark:data-hover:data-disabled:border-white/15 dark:[color-scheme:dark] shadow-sm"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="signup-label">
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ color: '#0284C7', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }} className="hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="signup-password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="relative block w-full appearance-none rounded-full px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20 bg-transparent dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500 data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/[2.5%] dark:data-hover:data-disabled:border-white/15 dark:[color-scheme:dark] shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    id="login-toggle-password"
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

              <button
                type="submit"
                disabled={loading}
                className="signup-submit-btn cursor-pointer disabled:opacity-50"
                id="login-submit-btn"
              >
                {loading ? "Continuing..." : "Continue"}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="signup-signin-text">
              New user?{" "}
              <Link to="/signup" className="signup-signin-link" id="login-signup-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
