import { useState, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CollectionHero from "../components/collection/CollectionHero";
import FilterBar from "../components/collection/FilterBar";
import ProductGrid from "../components/collection/ProductGrid";
import Pagination from "../components/collection/Pagination";
import ChosenByExperts from "../components/collection/ChosenByExperts";
import QuickViewPanel from "../components/QuickViewPanel";

export default function SaleCollection() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  return (
    <div className="nc-SaleCollection relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      {/* Main Page Container wrapper */}
      <div className="container mx-auto flex flex-col gap-y-16 py-16 sm:gap-y-20 sm:py-20 lg:gap-y-28 lg:py-28 px-4 sm:px-8 bg-white dark:bg-neutral-900">
        {/* Hero Section */}
        <CollectionHero />

        {/* Filter Bar */}
        <FilterBar />

        {/* Product Grid */}
        <ProductGrid onQuickView={handleQuickView} />

        {/* Pagination */}
        <Pagination totalPages={4} />
      </div>

      {/* Chosen by Experts */}
      <div className="relative border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 py-16 lg:py-24">
        <ChosenByExperts />
      </div>

      {/* Footer */}
      <Footer />

      {/* Quick View Panel */}
      <QuickViewPanel
        isOpen={quickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />
    </div>
  );
}
