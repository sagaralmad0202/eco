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
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <HeaderSkeleton />
      </div>
      <HeroSectionSkeleton />
      <div className="relative container mx-auto px-[20px] sm:px-4 my-24 flex flex-col gap-y-24 lg:my-28 lg:gap-y-28">
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
