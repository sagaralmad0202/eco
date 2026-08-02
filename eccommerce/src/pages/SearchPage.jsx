import { useState, useCallback, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import QuickViewPanel from "../components/QuickViewPanel";
import SearchHero from "../components/search/SearchHero";
import CategoryTabs from "../components/search/CategoryTabs";
import FilterToolbar from "../components/search/FilterToolbar";
import MobileFilterDrawer from "../components/search/MobileFilterDrawer";
import SearchProductCard from "../components/search/SearchProductCard";
import Pagination from "../components/search/Pagination";
import FeaturedProducts from "../components/search/FeaturedProducts";
import PromoBanner from "../components/search/PromoBanner";
import {
  SEARCH_PRODUCTS,
  CATEGORIES,
  SUBCATEGORIES,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  ITEMS_PER_PAGE,
} from "../data/searchProducts";

export default function SearchPage() {
  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Category
  const [activeCategory, setActiveCategory] = useState("All items");

  // Filters
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedSubcategories, setSelectedSubcategories] = useState(["New Arrivals", "Backpacks"]);
  const [selectedColors, setSelectedColors] = useState(["Black", "Brown"]);
  const [selectedSizes, setSelectedSizes] = useState(["S", "M"]);
  const [priceRange, setPriceRange] = useState([0, 300]);

  // Sort
  const [sortOption, setSortOption] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Quick view
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Cart count (used via setCartCount in handleCartUpdate, read by Header via shared state)
  const [, setCartCount] = useState(3);

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCartUpdate = useCallback((delta) => {
    setCartCount((prev) => prev + delta);
  }, []);

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let products = [...SEARCH_PRODUCTS];

    // Search filter
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== "All items") {
      products = products.filter((p) => p.category === activeCategory);
    }

    // Price filter
    products = products.filter((p) => {
      const price = parseFloat(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortOption) {
      case "price-asc":
        products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        // Keep original order
        break;
    }

    return products;
  }, [appliedSearch, activeCategory, priceRange, sortOption]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalFilterCount = selectedSubcategories.length + selectedColors.length + selectedSizes.length;

  return (
    <div className="relative bg-white" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
        <Header />
      </div>

      {/* Search Hero */}
      <SearchHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-8 flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:pt-20 lg:pb-28">
        <main>
          <div className="relative flex flex-col mb-12">
            {/* Category tabs + filter toggle */}
            <CategoryTabs
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onCategoryChange={(cat) => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
              isFilterOpen={isFilterOpen}
            />

            {/* Filter toolbar */}
            <FilterToolbar
              isOpen={isFilterOpen}
              subcategories={SUBCATEGORIES}
              selectedSubcategories={selectedSubcategories}
              onSubcategoriesChange={(v) => { setSelectedSubcategories(v); setCurrentPage(1); }}
              colorOptions={COLOR_OPTIONS}
              selectedColors={selectedColors}
              onColorsChange={(v) => { setSelectedColors(v); setCurrentPage(1); }}
              sizeOptions={SIZE_OPTIONS}
              selectedSizes={selectedSizes}
              onSizesChange={(v) => { setSelectedSizes(v); setCurrentPage(1); }}
              priceRange={priceRange}
              onPriceRangeChange={(v) => { setPriceRange(v); setCurrentPage(1); }}
              sortOption={sortOption}
              onSortChange={setSortOption}
              sortOptions={SORT_OPTIONS}
              onMobileFilterToggle={() => setMobileFilterOpen(true)}
              totalFilterCount={totalFilterCount}
            />
          </div>

          {/* Product grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10">
              {paginatedProducts.map((product) => (
                <SearchProductCard
                  key={product.id}
                  data={product}
                  onQuickView={handleQuickView}
                  onCartUpdate={handleCartUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-16 h-16 text-neutral-300 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-900" style={{ fontFamily: 'Poppins, sans-serif' }}>No products found</h3>
              <p className="text-neutral-500 mt-2 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </main>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Promo Banner */}
        <PromoBanner />
      </div>

      {/* Footer */}
      <Footer />

      {/* Quick View Panel */}
      <QuickViewPanel
        isOpen={quickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        subcategories={SUBCATEGORIES}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={(v) => { setSelectedSubcategories(v); setCurrentPage(1); }}
        colorOptions={COLOR_OPTIONS}
        selectedColors={selectedColors}
        onColorsChange={(v) => { setSelectedColors(v); setCurrentPage(1); }}
        sizeOptions={SIZE_OPTIONS}
        selectedSizes={selectedSizes}
        onSizesChange={(v) => { setSelectedSizes(v); setCurrentPage(1); }}
        priceRange={priceRange}
        onPriceRangeChange={(v) => { setPriceRange(v); setCurrentPage(1); }}
      />
    </div>
  );
}
