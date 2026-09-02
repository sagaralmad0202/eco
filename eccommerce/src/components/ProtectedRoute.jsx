import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from "../redux/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const location = useLocation();

  // If auth state is still being initialized / verified on startup, wait with a clean loader
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      </div>
    );
  }

  // Once initialization is complete, check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

