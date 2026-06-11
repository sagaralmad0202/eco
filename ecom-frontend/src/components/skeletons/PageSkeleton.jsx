import React from "react";
import HeaderSkeleton from "./HeaderSkeleton";
import HeroSectionSkeleton from "./HeroSectionSkeleton";
import SectionHowItWorkSkeleton from "./SectionHowItWorkSkeleton";
import SectionSliderProductCardSkeleton from "./SectionSliderProductCardSkeleton";
import SectionSpecialOfferSkeleton from "./SectionSpecialOfferSkeleton";
import SectionSliderLargeProductSkeleton from "./SectionSliderLargeProductSkeleton";
import SectionStartExploringSkeleton from "./SectionStartExploringSkeleton";
import SectionDiscoverMoreSkeleton from "./SectionDiscoverMoreSkeleton";
import SectionFindFavoriteSkeleton from "./SectionFindFavoriteSkeleton";
import FooterSkeleton from "./FooterSkeleton";

export default function PageSkeleton() {
  return (
    <div className="nc-PageHome2 relative">
      <HeaderSkeleton />
      <HeroSectionSkeleton />
      <div className="relative container mx-auto px-[20px] sm:px-4 my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionHowItWorkSkeleton />
        <SectionSliderProductCardSkeleton />
        <SectionSpecialOfferSkeleton />
        <SectionSliderLargeProductSkeleton />
        <SectionStartExploringSkeleton />
        <SectionDiscoverMoreSkeleton />
        <SectionFindFavoriteSkeleton />
      </div>
      <FooterSkeleton />
    </div>
  );
}
