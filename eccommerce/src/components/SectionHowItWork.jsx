import React from "react";
import VectorImg from "../assets/VectorHIW.9ea5867b.svg";
import hiw1 from "../assets/HIW1img.webp";
import hiw2 from "../assets/HIW2img.webp";
import hiw3 from "../assets/HIW3img.webp";
import hiw4 from "../assets/HIW4img.webp";

const DEMO_DATA = [
  {
    id: 1,
    img: hiw1,
    title: "Filter & Discover",
    desc: "Smart filtering and suggestions make it easy to find",
    badgeClasses: "bg-red-500/15 text-red-700 group-data-hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hover:bg-red-500/20",
  },
  {
    id: 2,
    img: hiw2,
    title: "Add to bag",
    desc: "Easily select the correct items and add them to the cart",
    badgeClasses: "bg-indigo-500/15 text-indigo-700 group-data-hover:bg-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-data-hover:bg-indigo-500/20",
  },
  {
    id: 3,
    img: hiw3,
    title: "Fast shipping",
    desc: "The carrier will confirm and ship quickly to you",
    badgeClasses: "bg-yellow-500/15 text-yellow-700 group-data-hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-400 dark:group-data-hover:bg-yellow-500/20",
  },
  {
    id: 4,
    img: hiw4,
    title: "Enjoy the product",
    desc: "Have fun and enjoy your 5-star quality products",
    badgeClasses: "bg-purple-500/15 text-purple-700 group-data-hover:bg-purple-500/25 dark:bg-purple-500/10 dark:text-purple-400 dark:group-data-hover:bg-purple-500/20",
  },
];

const SectionHowItWork = ({ className = "", data = DEMO_DATA }) => {
  return (
    <div 
      className={`nc-SectionHowItWork ${className}`} 
      data-nc-id="SectionHowItWork" 
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
        <img
          alt="vector"
          loading="lazy"
          width="1431"
          height="105"
          decoding="async"
          data-nimg="1"
          className="absolute inset-x-0 top-5 hidden md:block"
          src={VectorImg}
          style={{ color: "transparent" }}
        />

        {data.map((item, index) => (
          <div
            key={item.id}
            className="relative mx-auto flex w-full flex-col items-center gap-2"
            style={{ width: "100%", maxWidth: "304.2px", minHeight: "321.74px" }}
          >
            <div className="mb-4 sm:mb-10 max-w-[140px] mx-auto">
              <img
                alt="HIW"
                loading="lazy"
                width="450"
                height="451"
                decoding="async"
                data-nimg="1"
                className="rounded-3xl"
                src={item.img}
                style={{ color: "transparent" }}
              />
            </div>
            <div className="mt-auto text-center">
              <span
                className={`inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline ${item.badgeClasses}`}
              >
                Step {index + 1}
              </span>
              <h3 
                className="mt-[20px] text-base font-semibold"
                style={{ fontFamily: 'Poppins, "Poppins Fallback"', fontSize: "16px", height: "24px", color: "var(--text-main)" }}
              >
                {item.title}
              </h3>
              <span 
                className="mt-4 block text-sm leading-6 text-neutral-600 dark:text-neutral-400"
                style={{ fontFamily: 'Poppins, "Poppins Fallback"', fontSize: "14px", marginTop: "16px", color: "var(--text-secondary)" }}
              >
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHowItWork;
