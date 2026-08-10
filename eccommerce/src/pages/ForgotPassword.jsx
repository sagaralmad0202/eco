import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  forgotPasswordUser,
  clearForgotPasswordState,
  selectForgotPasswordState,
} from "../redux/slices/authSlice";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const { loading, error, success, message } = useAppSelector(selectForgotPasswordState);

  const [email, setEmail] = useState("");

  useEffect(() => {
    dispatch(clearForgotPasswordState());
    return () => {
      dispatch(clearForgotPasswordState());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    dispatch(forgotPasswordUser({ email: email.trim().toLowerCase() }));
  };

  return (
    <div className="nc-PageForgotPass relative">
      <div className="container mb-24 lg:mb-32">
        <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
          <h1 className="mb-0 mt-20 flex items-center justify-center text-3xl leading-[1.15] font-semibold tracking-normal text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif', letterSpacing: 'normal' }}>
            Forgot password
          </h1>
          <span className="mt-4 block text-sm tracking-normal text-neutral-700 sm:text-base dark:text-neutral-200" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif', letterSpacing: 'normal' }}>
            Enter your email address to reset your password
          </span>
        </header>

        <div className="mx-auto max-w-md space-y-6">
          {/* Error Alert Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {typeof error === "string" ? error : error.message || "Failed to process request. Please try again."}
            </div>
          )}

          {/* Success Alert Banner
              Worded to match the backend, which answers identically whether or
              not the address is registered. Saying "we sent you an email" would
              turn this page into a way to check who has an account. */}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm space-y-3">
              <p className="font-medium">
                {message || "If an account exists with that email, a password reset link has been sent."}
              </p>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1">
                <p className="text-xs opacity-90">
                  Open the link in that email to choose a new password. It expires
                  in 30 minutes and can only be used once.
                </p>
                <p className="text-xs opacity-90">
                  Nothing arrived? Check your spam folder, or submit the form
                  again to send a fresh link.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} id="forgot-password-form">
            <fieldset className="*:data-[slot=text]:mt-1 data-headlessui-state">
              <div data-slot="control">
                <div className="mb-8 [&>[data-slot=label]+[data-slot=control]]:mt-2 [&>[data-slot=label]+[data-slot=description]]:mt-1 [&>[data-slot=description]+[data-slot=control]]:mt-3 [&>[data-slot=control]+[data-slot=description]]:mt-3">
                  <label htmlFor="forgot-email" data-slot="label" className="block text-left text-sm/6 font-medium text-neutral-950 select-none data-[disabled]:opacity-50 dark:text-white" style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }}>
                    Email address
                  </label>
                  <span data-slot="control" className="relative block w-full before:absolute before:inset-px before:rounded-full before:bg-white before:shadow-sm dark:before:hidden after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500">
                    <input
                      id="forgot-email"
                      type="email"
                      className="relative block w-full appearance-none rounded-full px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 bg-transparent dark:bg-white/5 focus:outline-none data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 dark:data-[invalid]:border-red-500 dark:data-[invalid]:data-[hover]:border-red-500 data-[disabled]:border-zinc-950/20 dark:data-[disabled]:border-white/15 dark:data-[disabled]:bg-white/[2.5%] dark:data-[hover]:data-[disabled]:border-white/15 dark:[color-scheme:dark]"
                      placeholder="example@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative isolate inline-flex items-center justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:outline-hidden data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 data-[disabled]:opacity-50 border-transparent bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 before:absolute before:inset-0 before:-z-10 before:rounded-full before:shadow-sm dark:before:hidden dark:border-white/5 after:absolute after:inset-0 after:-z-10 after:rounded-full dark:after:-inset-px dark:after:rounded-full dark:after:shadow-none px-[calc(--spacing(4)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(6)-1px)] sm:py-[calc(--spacing(3)-1px)] sm:text-sm/6 cursor-pointer disabled:opacity-50"
                  id="forgot-submit-btn"
                >
                  {loading ? "Sending..." : "Continue"}
                </button>
              </div>
            </fieldset>
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
