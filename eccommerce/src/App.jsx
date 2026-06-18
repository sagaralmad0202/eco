import { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

import Footer from "./components/Footer";

// Import Pages
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";

// Import Page Skeleton
import PageSkeleton from "./components/skeletons/PageSkeleton";

function HomePage() {
  // Basic: useState for loading state
  // Advanced: Redux loading state would look like: const isLoading = useSelector((state) => state.page.isLoading);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    // Delay clearing product data so close animation completes
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show skeleton for 3 seconds to demonstrate
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="nc-PageHome2 relative">
      <Header />
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
        isOpen={quickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account-wishlists" element={<Account initialTab="Wishlists" />} />
      </Routes>
    </>
  );
}
