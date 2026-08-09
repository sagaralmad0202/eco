import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import PolicyCards from "../components/product/PolicyCards";
import ProductDetails from "../components/product/ProductDetails";
import ReviewsSection from "../components/product/ReviewsSection";
import RelatedProducts from "../components/product/RelatedProducts";
import QuickViewPanel from "../components/QuickViewPanel";
import PromoBanner from "../components/search/PromoBanner";

export default function ProductPage() {
  const { slug } = useParams();
  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((prod) => {
    setQuickViewProduct(prod);
    setQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  return (
    <div className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
      {/* Header */}
      <div className="relative z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      {/* Main Content */}
      <main className="container mt-5 lg:mt-11">
        {/* Product Section: Gallery + Info */}
        <div className="lg:flex">
          {/* Gallery - Left side */}
          <div className="w-full lg:w-[55%]">
            <ProductGallery images={product.thumbs || [product.image]} />
          </div>

          {/* Info - Right side */}
          <div className="w-full pt-10 lg:w-[45%] lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10 lg:sticky lg:top-8 lg:self-start">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Below-fold sections */}
        <div className="mt-12 flex flex-col gap-y-10 sm:mt-16 sm:gap-y-16">
          {/* Policy Cards - visible only below xl */}
          <PolicyCards className="block xl:hidden" />

          {/* Product Details */}
          <ProductDetails />

          {/* Divider */}
          <hr
            role="presentation"
            className="w-full border-t border-neutral-950/10 dark:border-white/10"
          />

          {/* Reviews */}
          <ReviewsSection />

          {/* Divider */}
          <hr
            role="presentation"
            className="mt-10 w-full border-t border-neutral-950/10 dark:border-white/10"
          />

          {/* Related Products */}
          <RelatedProducts onQuickView={handleQuickView} />
        </div>
      </main>

      {/* Promo Banner with kid image */}
      <PromoBanner />

      {/* Footer */}
      <Footer />

      {/* Quick View Modal */}
      <QuickViewPanel
        isOpen={quickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />
    </div>
  );
}

