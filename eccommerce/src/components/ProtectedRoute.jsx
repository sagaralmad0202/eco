import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectIsAuthenticated } from "../redux/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem("accessToken"));

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
