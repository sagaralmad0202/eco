import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle logic
    console.log("Forgot password submitted:", { email });
  };

  return (
    <div className="nc-PageForgotPass relative">
      <div className="container mb-24 lg:mb-32 mx-auto">
        <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
          <h1 className="mb-0 mt-20 text-3xl leading-[1.15] font-semibold text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif', lineHeight: 1.15 }}>
            Forgot password
          </h1>
          <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }}>
            Enter your email address to reset your password
          </span>
        </header>

        <div className="mx-auto max-w-md space-y-6 px-[20px] sm:px-0">
          <form onSubmit={handleSubmit} id="forgot-password-form">
            <div className="signup-field">
              <label htmlFor="forgot-email" className="signup-label block mb-2 text-sm font-medium text-neutral-900 dark:text-white" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }}>
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                className="relative block w-full appearance-none rounded-full px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20 bg-transparent dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500 data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/[2.5%] dark:data-hover:data-disabled:border-white/15 dark:[color-scheme:dark] shadow-sm"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mt-[32px]">
              <button
                type="submit"
                className="signup-submit-btn w-full !mt-0"
                id="forgot-submit-btn"
              >
                Continue
              </button>
            </div>
          </form>

          {/* Bottom Links */}
          <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }}>
            Go back for{" "}
            <Link to="/login" className="text-[#0284C7] underline">
              Sign in
            </Link>
            <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
            <Link to="/signup" className="text-[#0284C7] underline">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
