import { useState, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SectionHowItWork from "./components/SectionHowItWork";
import SectionSliderProductCard from "./components/SectionSliderProductCard";
import SectionSliderLargeProduct from "./components/SectionSliderLargeProduct";
import SectionSpecialOffer from "./components/SectionSpecialOffer";
import SectionStartExploring from "./components/SectionStartExploring";
import SectionDiscoverMore from "./components/SectionDiscoverMore";
import SectionFindFavorite from "./components/SectionFindFavorite";
import QuickViewPanel from "./components/QuickViewPanel";
import ProtectedRoute from "./components/ProtectedRoute";

import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Import Pages
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import SaleCollection from "./pages/SaleCollection";
import ProductPage from "./pages/ProductPage";
import SearchPage from "./pages/SearchPage";
import OrderSuccessful from "./pages/OrderSuccessful";
import OrderDetail from "./pages/OrderDetail";
import Contact from "./pages/Contact";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { openQuickView, closeQuickView, selectQuickViewProduct, selectIsQuickViewOpen } from "./redux/slices/uiSlice";
import { logout } from "./redux/slices/authSlice";

function HomePage() {
  const dispatch = useAppDispatch();
  const reduxQuickViewProduct = useAppSelector(selectQuickViewProduct);
  const reduxQuickViewOpen = useAppSelector(selectIsQuickViewOpen);

  const [localQuickViewProduct, setLocalQuickViewProduct] = useState(null);
  const [localQuickViewOpen, setLocalQuickViewOpen] = useState(false);

  const activeProduct = reduxQuickViewProduct || localQuickViewProduct;
  const isOpen = reduxQuickViewOpen || localQuickViewOpen;

  const handleQuickView = useCallback((product) => {
    dispatch(openQuickView(product));
    setLocalQuickViewProduct(product);
    setLocalQuickViewOpen(true);
  }, [dispatch]);

  const handleCloseQuickView = useCallback(() => {
    dispatch(closeQuickView());
    setLocalQuickViewOpen(false);
    setTimeout(() => setLocalQuickViewProduct(null), 300);
  }, [dispatch]);

  return (
    <div className="nc-PageHome2 relative">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>
      <HeroSection />
      <div className="relative container mx-auto px-[20px] sm:px-4 my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionHowItWork />
        <SectionSliderProductCard onQuickView={handleQuickView} />
        <SectionSpecialOffer />
        <SectionSliderLargeProduct />
        <SectionStartExploring />
        <SectionDiscoverMore />
        <SectionFindFavorite onQuickView={handleQuickView} />
      </div>
      <Footer />

      {/* Quick View Slide-in Panel */}
      <QuickViewPanel
        isOpen={isOpen}
        onClose={handleCloseQuickView}
        product={activeProduct}
      />
    </div>
  );
}

// Global Auth Sync Component
function GlobalAuthCheck() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
    const token = localStorage.getItem("accessToken");

    if (!token) {
      dispatch(logout());
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
    }
  }, [location.pathname, dispatch, navigate]);

  return null;
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Toaster position="top-right" />
      <GlobalAuthCheck />
      <Routes>
        {/* Auth Public Pages */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Pages - Requires accessToken */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><SaleCollection /></ProtectedRoute>} />
        <Route path="/collections" element={<Navigate to="/shop" replace />} />
        <Route path="/collections/*" element={<Navigate to="/shop" replace />} />
        <Route path="/collection" element={<Navigate to="/shop" replace />} />
        <Route path="/collection/*" element={<Navigate to="/shop" replace />} />
        <Route path="/sale-collection" element={<Navigate to="/shop" replace />} />
        <Route path="/products/:slug" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account initialTab="Settings" /></ProtectedRoute>} />
        <Route path="/account-wishlists" element={<ProtectedRoute><Account initialTab="Wishlists" /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Account initialTab="Wishlists" /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Account initialTab="Orders history" /></ProtectedRoute>} />
        <Route path="/account-password" element={<ProtectedRoute><Account initialTab="Change password" /></ProtectedRoute>} />
        <Route path="/account-billing" element={<ProtectedRoute><Account initialTab="Billing" /></ProtectedRoute>} />
        <Route path="/order-successful" element={<ProtectedRoute><OrderSuccessful /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

        {/* Fallback wildcard route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </CartProvider>
  );
}
