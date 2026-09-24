import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SectionHowItWork from "./components/SectionHowItWork";
import ProtectedRoute from "./components/ProtectedRoute";

import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PageSkeleton from "./components/skeletons/PageSkeleton";
import ShopSkeleton from "./components/skeletons/ShopSkeleton";
import CartSkeleton from "./components/skeletons/CartSkeleton";
import HeaderSkeleton from "./components/skeletons/HeaderSkeleton";
import FooterSkeleton from "./components/skeletons/FooterSkeleton";
import ProductDetailsSkeleton from "./components/product/ProductDetailsSkeleton";
import SectionSliderProductCardSkeleton from "./components/skeletons/SectionSliderProductCardSkeleton";
import SectionSliderLargeProductSkeleton from "./components/skeletons/SectionSliderLargeProductSkeleton";
import SectionSpecialOfferSkeleton from "./components/skeletons/SectionSpecialOfferSkeleton";
import SectionStartExploringSkeleton from "./components/skeletons/SectionStartExploringSkeleton";
import SectionDiscoverMoreSkeleton from "./components/skeletons/SectionDiscoverMoreSkeleton";
import SectionFindFavoriteSkeleton from "./components/skeletons/SectionFindFavoriteSkeleton";

// Below-fold homepage sections — lazy loaded so the page is interactive faster
const SectionSliderProductCard = lazy(() => import("./components/SectionSliderProductCard"));
const SectionSliderLargeProduct = lazy(() => import("./components/SectionSliderLargeProduct"));
const SectionSpecialOffer = lazy(() => import("./components/SectionSpecialOffer"));
const SectionStartExploring = lazy(() => import("./components/SectionStartExploring"));
const SectionDiscoverMore = lazy(() => import("./components/SectionDiscoverMore"));
const SectionFindFavorite = lazy(() => import("./components/SectionFindFavorite"));
const QuickViewPanel = lazy(() => import("./components/QuickViewPanel"));

// Pages — lazy loaded so only the current route's code is fetched
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Account = lazy(() => import("./pages/Account"));
const SaleCollection = lazy(() => import("./pages/SaleCollection"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const OrderSuccessful = lazy(() => import("./pages/OrderSuccessful"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Contact = lazy(() => import("./pages/Contact"));

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { openQuickView, closeQuickView, selectQuickViewProduct, selectIsQuickViewOpen } from "./redux/slices/uiSlice";
import { initializeAuth } from "./redux/slices/authSlice";

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
      <div className="relative container mx-auto px-[20px] sm:px-4 my-24 flex flex-col gap-y-24 lg:my-28 lg:gap-y-28">
        <SectionHowItWork />
        <Suspense
          fallback={
            <div className="flex flex-col gap-y-24 lg:gap-y-28">
              <SectionSliderProductCardSkeleton />
              <SectionSpecialOfferSkeleton />
              <SectionSliderLargeProductSkeleton />
              <SectionStartExploringSkeleton />
              <SectionDiscoverMoreSkeleton />
              <SectionFindFavoriteSkeleton />
            </div>
          }
        >
          <SectionSliderProductCard onQuickView={handleQuickView} />
          <SectionSpecialOffer />
          <SectionSliderLargeProduct />
          <SectionStartExploring />
          <SectionDiscoverMore />
          <SectionFindFavorite onQuickView={handleQuickView} />
        </Suspense>
      </div>
      <Footer />

      {/* Quick View Slide-in Panel — lazy loaded, only rendered on interaction */}
      <Suspense fallback={null}>
        <QuickViewPanel
          isOpen={isOpen}
          onClose={handleCloseQuickView}
          product={activeProduct}
        />
      </Suspense>
    </div>
  );
}



export default function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const renderRouteSkeleton = () => {
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
  };

  return (
    <CartProvider>
      <ScrollToTop />
      <Toaster position="top-right" />

      <Suspense fallback={renderRouteSkeleton()}>
        <Routes>
          {/* Auth Public Pages */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          {/* Public: the backend's social-login redirect lands here with a
              one-time code, which this page swaps for a session. */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />
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
      </Suspense>
    </CartProvider>
  );
}
