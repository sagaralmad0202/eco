import { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SectionHowItWork from "./components/SectionHowItWork";
import SectionSliderProductCard from "./components/SectionSliderProductCard";
import SectionSliderLargeProduct from "./components/SectionSliderLargeProduct";
import SectionSpecialOffer from "./components/SectionSpecialOffer";
import SectionStartExploring from "./components/SectionStartExploring";
import SectionDiscoverMore from "./components/SectionDiscoverMore";
import SectionFindFavorite from "./components/SectionFindFavorite";

import Footer from "./components/Footer";

// Import Page Skeleton
import PageSkeleton from "./components/skeletons/PageSkeleton";

export default function App() {
  // Basic: useState for loading state
  // Advanced: Redux loading state would look like: const isLoading = useSelector((state) => state.page.isLoading);
  const [isLoading, setIsLoading] = useState(true);

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
        <SectionSliderProductCard />
        <SectionSpecialOffer />
        <SectionSliderLargeProduct />
        <SectionStartExploring />
        <SectionDiscoverMore />
        <SectionFindFavorite />
      </div>
      <Footer />
    </div>
  );
}
