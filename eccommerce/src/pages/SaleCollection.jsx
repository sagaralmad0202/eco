import { useState, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CollectionHero from "../components/collection/CollectionHero";
import FilterBar from "../components/collection/FilterBar";
import ProductGrid from "../components/collection/ProductGrid";
import Pagination from "../components/collection/Pagination";
import ChosenByExperts from "../components/collection/ChosenByExperts";
import QuickViewPanel from "../components/QuickViewPanel";
import MobileFilterDrawer from "../components/search/MobileFilterDrawer";
import PromoBanner from "../components/search/PromoBanner";

const SUBCATEGORIES = [
  "New Arrivals",
  "Jackets",
  "Shirts",
  "Polos",
  "Bags",
  "Fragrance",
];
const COLOR_OPTIONS = [
  { name: "Blue" },
  { name: "Beige" },
  { name: "Black" },
  { name: "Brown" },
  { name: "Pink" },
  { name: "Green" },
  { name: "Red" },
  { name: "White" },
];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];
const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low", "Most Popular"];

export default function SaleCollection() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileSort, setMobileSort] = useState("Newest");

  // Filter state for mobile drawer
  const [selectedSubcategories, setSelectedSubcategories] = useState(["New Arrivals", "Jackets"]);
  const [selectedColors, setSelectedColors] = useState(["Blue", "Beige"]);
  const [selectedSizes, setSelectedSizes] = useState(["XS", "S"]);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  const activeFilterCount =
    selectedSubcategories.length + selectedColors.length + selectedSizes.length;

  return (
    <div className="nc-SaleCollection relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      {/* Main Page Container wrapper */}
      <div className="container mx-auto flex flex-col gap-y-20 py-20 sm:gap-y-20 sm:py-20 lg:gap-y-28 lg:py-28 px-4 sm:px-8">
        {/* Hero + Filter grouped together */}
        <div>
          {/* Hero Section */}
          <CollectionHero />

          {/* Mobile: All filters + Newest row (visible below lg) */}
          <div className="flex flex-wrap items-center gap-6 mt-10 lg:hidden">
            {/* All filters button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium select-none ring-2 ring-inset ring-black hover:bg-neutral-50 focus:outline-none cursor-pointer transition-colors"
              style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
            >
              {/* Filter icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 21L7 18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 21L17 15" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 6L17 3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 9L7 3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 18C6.06812 18 5.60218 18 5.23463 17.8478C4.74458 17.6448 4.35523 17.2554 4.15224 16.7654C4 16.3978 4 15.9319 4 15C4 14.0681 4 13.6022 4.15224 13.2346C4.35523 12.7446 4.74458 12.3552 5.23463 12.1522C5.60218 12 6.06812 12 7 12C7.93188 12 8.39782 12 8.76537 12.1522C9.25542 12.3552 9.64477 12.7446 9.84776 13.2346C10 13.6022 10 14.0681 10 15C10 15.9319 10 16.3978 9.84776 16.7654C9.64477 17.2554 9.25542 17.6448 8.76537 17.8478C8.39782 18 7.93188 18 7 18Z" />
                <path d="M17 12C16.0681 12 15.6022 12 15.2346 11.8478C14.7446 11.6448 14.3552 11.2554 14.1522 10.7654C14 10.3978 14 9.93188 14 9C14 8.06812 14 7.60218 14.1522 7.23463C14.3552 6.74458 14.7446 6.35523 15.2346 6.15224C15.6022 6 16.0681 6 17 6C17.9319 6 18.3978 6 18.7654 6.15224C19.2554 6.35523 19.6448 6.74458 19.8478 7.23463C20 7.60218 20 8.06812 20 9C20 9.93188 20 10.3978 19.8478 10.7654C19.6448 11.2554 19.2554 11.6448 18.7654 11.8478C18.3978 12 17.9319 12 17 12Z" />
              </svg>
              <span className="ms-2">All filters</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ms-3 w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              {/* Badge count */}
              {activeFilterCount > 0 && (
                <span className="absolute top-0 -right-0.5 flex w-[18px] h-[18px] items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white ring-2 ring-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Newest sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileSortOpen(!mobileSortOpen)}
                className="flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-200 select-none hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none cursor-pointer transition-colors"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
              >
                <svg className="h-[18px] w-[18px] text-neutral-900 dark:text-neutral-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 14H8.42109C9.35119 14 9.81624 14 9.94012 14.2801C10.064 14.5603 9.74755 14.8963 9.11466 15.5684L5.47691 19.4316C4.84402 20.1037 4.52757 20.4397 4.65145 20.7199C4.77533 21 5.24038 21 6.17048 21H10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 9L6.10557 4.30527C6.49585 3.43509 6.69098 3 7.00002 3C7.30907 3 7.50419 3.43509 7.89443 4.30527L10 9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 20V4M17.5 20C16.7998 20 15.4915 18.0057 15 17.5M17.5 20C18.2002 20 19.5085 18.0057 20 17.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ms-2">{mobileSort}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`ms-3 w-4 h-4 transition-transform ${mobileSortOpen ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {mobileSortOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl bg-white dark:bg-neutral-900 p-1.5 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setMobileSort(opt); setMobileSortOpen(false); }}
                      className={`flex w-full items-center gap-x-2.5 rounded-xl px-3 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                        mobileSort === opt
                          ? "bg-sky-50 text-sky-900 font-medium dark:bg-sky-950/40 dark:text-sky-200"
                          : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      }`}
                      style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                    >
                      {mobileSort === opt ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                      <span className="truncate">{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Full Filter Bar (hidden on mobile) */}
          <div className="hidden lg:block mt-16 lg:mt-24">
            <FilterBar />
          </div>

          {/* Product Grid */}
          <div className="mt-8 lg:mt-10">
            <ProductGrid onQuickView={handleQuickView} />
          </div>
        </div>

        {/* Pagination */}
        <Pagination totalPages={4} />
      </div>

      {/* Chosen by Experts */}
      <div className="relative border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 py-16 lg:py-24">
        <ChosenByExperts />
      </div>

      {/* Promo Banner with kid on skateboard */}
      <PromoBanner />

      {/* Footer */}
      <Footer />

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        subcategories={SUBCATEGORIES}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={setSelectedSubcategories}
        colorOptions={COLOR_OPTIONS}
        selectedColors={selectedColors}
        onColorsChange={setSelectedColors}
        sizeOptions={SIZE_OPTIONS}
        selectedSizes={selectedSizes}
        onSizesChange={setSelectedSizes}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
      />

      {/* Quick View Panel */}
      <QuickViewPanel
        isOpen={quickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />
    </div>
  );
}
