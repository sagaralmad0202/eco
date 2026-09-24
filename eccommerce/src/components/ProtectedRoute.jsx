import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from "../redux/slices/authSlice";

import PageSkeleton from "./skeletons/PageSkeleton";
import ShopSkeleton from "./skeletons/ShopSkeleton";
import CartSkeleton from "./skeletons/CartSkeleton";
import HeaderSkeleton from "./skeletons/HeaderSkeleton";
import FooterSkeleton from "./skeletons/FooterSkeleton";
import ProductDetailsSkeleton from "./product/ProductDetailsSkeleton";

export default function ProtectedRoute({ children, fallback }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const location = useLocation();

  // If auth state is still being initialized / verified on startup, wait with skeleton loader
  if (!isInitialized) {
    if (fallback) return fallback;

    const path = location.pathname;

    if (path.startsWith("/products/")) {
      return (
        <div className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200 min-h-screen">
          <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <HeaderSkeleton />
          </div>
          <main className="container mt-5 lg:mt-11 min-h-[60vh] px-4">
            <ProductDetailsSkeleton />
          </main>
          <FooterSkeleton />
        </div>
      );
    }

    if (
      path === "/shop" ||
      path.startsWith("/collections") ||
      path.startsWith("/collection") ||
      path === "/sale-collection" ||
      path.startsWith("/search")
    ) {
      return <ShopSkeleton />;
    }

    if (path === "/cart" || path === "/checkout") {
      return <CartSkeleton />;
    }

    return <PageSkeleton />;
  }

  // Once initialization is complete, check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

