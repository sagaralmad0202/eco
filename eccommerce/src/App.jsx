import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Import Pages
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import SaleCollection from "./pages/SaleCollection";
import ProductPage from "./pages/ProductPage";
import SearchPage from "./pages/SearchPage";
import OrderSuccessful from "./pages/OrderSuccessful";
import OrderDetail from "./pages/OrderDetail";
import Contact from "./pages/Contact";


function HomePage() {
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
        isOpen={quickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account initialTab="Settings" />} />
        <Route path="/account-wishlists" element={<Account initialTab="Wishlists" />} />
        <Route path="/wishlist" element={<Account initialTab="Wishlists" />} />
        <Route path="/orders" element={<Account initialTab="Orders history" />} />
        <Route path="/account-password" element={<Account initialTab="Change password" />} />
        <Route path="/account-billing" element={<Account initialTab="Billing" />} />
        <Route path="/shop" element={<SaleCollection />} />
        <Route path="/collections/sale-collection" element={<Navigate to="/shop" replace />} />
        <Route path="/sale-collection" element={<Navigate to="/shop" replace />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/order-successful" element={<OrderSuccessful />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </CartProvider>
  );
}
