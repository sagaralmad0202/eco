import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsAuthenticated } from "../redux/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  // Check for either token. When the short-lived access token expires the
  // Axios interceptor silently refreshes it on the next API call — kicking
  // the user to /login just because the access token is gone would defeat
  // that mechanism. A refresh token means the session can still be restored.
  const hasSession = Boolean(
    localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"),
  );

  if (!isAuthenticated && !hasSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
