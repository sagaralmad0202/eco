import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SectionHowItWork from "./components/SectionHowItWork";
import SectionSliderProductCard from "./components/SectionSliderProductCard";

export default function App() {
  return (
    <div className="nc-PageHome2 relative">
      <Header />
      <HeroSection />
      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionHowItWork />
        <SectionSliderProductCard />
      </div>
    </div>
  );
}
