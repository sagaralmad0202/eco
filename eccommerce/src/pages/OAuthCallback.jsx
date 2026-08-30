import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../redux/hooks";
import {
  exchangeOAuthCode,
  clearLoginState,
} from "../redux/slices/authSlice";

/**
 * Seamless OAuth callback handler.
 * Swaps one-time code for session tokens and immediately redirects to home.
 */
export default function OAuthCallback() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      toast.error(errorParam);
      window.location.replace("/login");
      return;
    }

    if (!code) {
      toast.error("Social login did not complete. Please try again.");
      window.location.replace("/login");
      return;
    }

    dispatch(exchangeOAuthCode({ code }))
      .unwrap()
      .then(() => {
        toast.success("Logged in successfully! Welcome back.");
        dispatch(clearLoginState());
        window.location.replace("/");
      })
      .catch((err) => {
        console.error("OAuth exchange failed:", err);
        const msg =
          typeof err === "string"
            ? err
            : err?.message || "Social login failed. Please try again.";
        toast.error(msg);
        dispatch(clearLoginState());
        window.location.replace("/login");
      });
  }, [dispatch, searchParams]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-neutral-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-neutral-300 border-t-primary-600 dark:border-neutral-700 dark:border-t-primary-400" />
      </div>
    </div>
  );
}
