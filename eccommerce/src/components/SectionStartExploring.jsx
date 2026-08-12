import { useState } from "react";
import { Link } from "react-router-dom";

/* ─── Asset Imports: Product Icons ─── */
import iconAccessories from "../assets/icon-accessories-bag.png";
import iconJeans from "../assets/icon-jeans-bottle.png";
import iconJackets from "../assets/icon-jackets.png";
import iconTshirts from "../assets/2.7d0fd50b.png";
import iconShoes from "../assets/5.d739cbef.png";
import iconCoats from "../assets/4.ff7a0ab1.png";
import iconSweater from "../assets/1.webp";

/* ─── Asset Imports: Decorative SVGs (position-based) ─── */
import explore1SVG from "../assets/explore1.bf5d4097.svg";
import explore2SVG from "../assets/explore2.cc3caa5d.svg";
import explore3SVG from "../assets/explore3.4ed3d7e1.svg";
import explore4SVG from "../assets/explore4.4e804f1b.svg";
import explore5SVG from "../assets/explore5.4c9535e0.svg";
import explore6SVG from "../assets/explore6.77f242e1.svg";

/* ─── Tab Data ─── */
const TABS = [
  {
    id: "women",
    label: "Women",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M12 13v8" />
        <path d="M9 18h6" />
      </svg>
    ),
  },
  {
    id: "man",
    label: "Man",
    width: "108.94px",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="14" r="5" />
        <path d="M19 5l-5.4 5.4" />
        <path d="M15 5h4v4" />
      </svg>
    ),
  },
  {
    id: "accessories",
    label: "Accessories",
    width: "162.28px",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11.0001C13.2869 11.0001 14.33 9.95687 14.33 8.67004C14.33 7.38322 13.2869 6.34009 12 6.34009C10.7132 6.34009 9.67004 7.38322 9.67004 8.67004C9.67004 9.95687 10.7132 11.0001 12 11.0001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 16.6601C16 14.8601 14.21 13.4001 12 13.4001C9.79 13.4001 8 14.8601 8 16.6601" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "footwear",
    label: "Footwear",
    width: "143.35px",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.81995 12H14.1799" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.5 14.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.5 14.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "jewelry",
    label: "Jewelry",
    width: "131.95px",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 22H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 14H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "beauty",
    label: "Beauty",
    width: "127.4px",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 22H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 14H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Card Data (per tab) ─── */
const CARDS_BY_TAB = {
  women: [
    { icon: iconSweater, iconBg: "bg-indigo-50", badge: "Newest arrivals", name: "Jackets", count: "77 products", pattern: explore1SVG, href: "/shop" },
    { icon: iconTshirts, iconBg: "bg-indigo-50", badge: "Best sellers", name: "T-Shirts", count: "155 products", pattern: explore2SVG, href: "/shop" },
    { icon: iconJeans, iconBg: "bg-indigo-50", badge: "Best sellers", name: "Jeans", count: "35 products", pattern: explore3SVG, href: "/shop" },
    { icon: iconCoats, iconBg: "bg-indigo-50", badge: "Best seasonal", name: "Coats", count: "87 products", pattern: explore4SVG, href: "/shop" },
    { icon: iconShoes, iconBg: "bg-indigo-50", badge: "Top rated", name: "Shoes", count: "114 products", pattern: explore5SVG, href: "/shop" },
    { icon: iconAccessories, iconBg: "bg-indigo-50", badge: "Top transparent", name: "Accessories", count: "55 products", pattern: explore6SVG, href: "/shop" },
  ],
  man: [
    { icon: iconAccessories, iconBg: "bg-indigo-50", badge: "Top transparent", name: "Accessories", count: "55 products", pattern: explore1SVG, href: "/shop" },
    { icon: iconJeans, iconBg: "bg-sky-50", badge: "Best sellers", name: "Jeans", count: "35 products", pattern: explore2SVG, href: "/shop" },
    { icon: iconSweater, iconBg: "bg-indigo-50", badge: "Newest arrivals", name: "Jackets", count: "77 products", pattern: explore3SVG, href: "/shop" },
    { icon: iconTshirts, iconBg: "bg-indigo-50", badge: "Best sellers", name: "T-Shirts", count: "155 products", pattern: explore4SVG, href: "/shop" },
    { icon: iconShoes, iconBg: "bg-indigo-50", badge: "Top rated", name: "Shoes", count: "114 products", pattern: explore5SVG, href: "/shop" },
    { icon: iconCoats, iconBg: "bg-indigo-50", badge: "Best seasonal", name: "Coats", count: "87 products", pattern: explore6SVG, href: "/shop" },
  ],
  accessories: [
    { icon: iconCoats, iconBg: "bg-indigo-50", badge: "Best seasonal", name: "Coats", count: "87 products", pattern: explore1SVG, href: "/shop" },
    { icon: iconTshirts, iconBg: "bg-indigo-50", badge: "Best sellers", name: "T-Shirts", count: "155 products", pattern: explore2SVG, href: "/shop" },
    { icon: iconAccessories, iconBg: "bg-indigo-50", badge: "Top transparent", name: "Accessories", count: "55 products", pattern: explore3SVG, href: "/shop" },
    { icon: iconSweater, iconBg: "bg-indigo-50", badge: "Newest arrivals", name: "Jackets", count: "77 products", pattern: explore4SVG, href: "/shop" },
    { icon: iconShoes, iconBg: "bg-indigo-50", badge: "Top rated", name: "Shoes", count: "114 products", pattern: explore5SVG, href: "/shop" },
    { icon: iconJeans, iconBg: "bg-sky-50", badge: "Best sellers", name: "Jeans", count: "35 products", pattern: explore6SVG, href: "/shop" },
  ],
  footwear: [
    { icon: iconTshirts, iconBg: "bg-indigo-50", badge: "Best sellers", name: "T-Shirts", count: "155 products", pattern: explore1SVG, href: "/shop" },
    { icon: iconCoats, iconBg: "bg-indigo-50", badge: "Best seasonal", name: "Coats", count: "87 products", pattern: explore2SVG, href: "/shop" },
    { icon: iconSweater, iconBg: "bg-indigo-50", badge: "Newest arrivals", name: "Jackets", count: "77 products", pattern: explore3SVG, href: "/shop" },
    { icon: iconJeans, iconBg: "bg-sky-50", badge: "Best sellers", name: "Jeans", count: "35 products", pattern: explore4SVG, href: "/shop" },
    { icon: iconShoes, iconBg: "bg-indigo-50", badge: "Top rated", name: "Shoes", count: "114 products", pattern: explore5SVG, href: "/shop" },
    { icon: iconAccessories, iconBg: "bg-indigo-50", badge: "Top transparent", name: "Accessories", count: "55 products", pattern: explore6SVG, href: "/shop" },
  ],
  jewelry: [
    { icon: iconSweater, iconBg: "bg-indigo-50", badge: "Newest arrivals", name: "Jackets", count: "77 products", pattern: explore1SVG, href: "/shop" },
    { icon: iconTshirts, iconBg: "bg-indigo-50", badge: "Best sellers", name: "T-Shirts", count: "155 products", pattern: explore2SVG, href: "/shop" },
    { icon: iconShoes, iconBg: "bg-indigo-50", badge: "Top rated", name: "Shoes", count: "114 products", pattern: explore3SVG, href: "/shop" },
    { icon: iconCoats, iconBg: "bg-indigo-50", badge: "Best seasonal", name: "Coats", count: "87 products", pattern: explore4SVG, href: "/shop" },
    { icon: iconAccessories, iconBg: "bg-indigo-50", badge: "Top transparent", name: "Accessories", count: "55 products", pattern: explore5SVG, href: "/shop" },
    { icon: iconJeans, iconBg: "bg-sky-50", badge: "Best sellers", name: "Jeans", count: "35 products", pattern: explore6SVG, href: "/shop" },
  ],
  beauty: [
    { icon: iconShoes, iconBg: "bg-indigo-50", badge: "Top rated", name: "Shoes", count: "114 products", pattern: explore1SVG, href: "/shop" },
    { icon: iconJeans, iconBg: "bg-sky-50", badge: "Best sellers", name: "Jeans", count: "35 products", pattern: explore2SVG, href: "/shop" },
    { icon: iconCoats, iconBg: "bg-indigo-50", badge: "Best seasonal", name: "Coats", count: "87 products", pattern: explore3SVG, href: "/shop" },
    { icon: iconTshirts, iconBg: "bg-indigo-50", badge: "Best sellers", name: "T-Shirts", count: "155 products", pattern: explore4SVG, href: "/shop" },
    { icon: iconSweater, iconBg: "bg-indigo-50", badge: "Newest arrivals", name: "Jackets", count: "77 products", pattern: explore5SVG, href: "/shop" },
    { icon: iconAccessories, iconBg: "bg-indigo-50", badge: "Top transparent", name: "Accessories", count: "55 products", pattern: explore6SVG, href: "/shop" },
  ],
};

/* ─── Arrow Up-Right Icon (Heroicons solid) ─── */
const ArrowUpRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className="size-6 text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110"
  >
    <path
      fillRule="evenodd"
      d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─── Exploring Card Component ─── */
const ExploringCard = ({ card }) => (
  <div className="group relative overflow-hidden rounded-3xl bg-white p-5 transition-shadow sm:p-8 dark:bg-neutral-900 text-left exploring-card cursor-pointer">
    <div className="absolute end-0 bottom-0 size-52 sm:size-64 xl:size-72">
      <img
        alt=""
        src={card.pattern}
        className="h-full w-full object-contain object-right-bottom opacity-60"
      />
    </div>

    <div className="flex flex-col justify-between" style={{ height: "292px" }}>
      <div className="flex items-center justify-between gap-x-2.5">
        <div
          className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full ${card.iconBg} dark:bg-neutral-800`}
        >
          <img
            src={card.icon}
            alt={card.name}
            className="h-12 w-12 object-cover"
          />
        </div>

        <ArrowUpRightIcon />
      </div>

      <div className="mt-12" style={{ height: "64px" }}>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {card.badge}
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {card.name}
        </h2>
      </div>

      <p className="mt-10 text-sm text-neutral-500 sm:mt-20 dark:text-neutral-400">
        {card.count}
      </p>

      <Link
        className="absolute inset-0 z-10"
        to={card.href || "/shop"}
        aria-label={`Explore ${card.name}`}
      />
    </div>
  </div>
);

/* ─── Main Component ─── */
const SectionStartExploring = () => {
  const [activeTab, setActiveTab] = useState("man");

  const cards = CARDS_BY_TAB[activeTab] || CARDS_BY_TAB.man;

  return (
    <div className="relative pt-24 pb-20 lg:pt-28">
      {/* ── Background Section ── */}
      <div
        className="nc-BackgroundSection absolute inset-y-0 w-screen xl:max-w-[1340px] 2xl:max-w-(--breakpoint-2xl) left-1/2 transform -translate-x-1/2 xl:rounded-[40px] z-0 bg-neutral-100/70 dark:bg-black/20"
      />

      {/* ── Content ── */}
      <div className="relative" style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}>
        {/* ─ Header: Title + Tabs ─ */}
        <div className="relative flex flex-col justify-between sm:flex-row sm:items-end mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50">
          {/* Title */}
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2
              className="justify-center text-[#111827] dark:text-neutral-50 text-3xl md:text-4xl 2xl:text-5xl font-semibold"
              style={{
                fontFamily: 'Poppins, "Poppins Fallback"',
              }}
            >
              Start exploring.
            </h2>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="relative mb-12 flex w-full justify-center lg:mb-14">
          <ul
            className="hidden-scrollbar flex overflow-x-auto rounded-full bg-white p-1 shadow-lg dark:bg-neutral-800"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id} className="relative" style={tab.width ? { width: tab.width } : {}}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`block cursor-pointer rounded-full font-medium whitespace-nowrap px-4 py-2.5 sm:text-sm sm:px-6 sm:py-3 capitalize transition-colors ${isActive
                      ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      }`}
                    style={{
                      border: "none",
                      fontFamily: 'Poppins, "Poppins Fallback"',
                      fontSize: "14px",
                      ...(tab.width && { width: tab.width })
                    }}
                  >
                    <div className="flex items-center justify-center gap-x-2 sm:gap-x-3">
                      <span className="-ml-0.5 inline-block">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ─ Grid of Cards ─ */}
        <div className="grid gap-4 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <ExploringCard
              key={`${activeTab}-${card.name}`}
              card={card}
              tabId={activeTab}
            />
          ))}
        </div>

        {/* ─ Explore All Button ─ */}
        <div className="mt-10 sm:mt-20 flex justify-center">
          <Link
            to="/shop"
            className="group relative isolate inline-flex items-center justify-center gap-x-2.5 rounded-full border border-neutral-200 bg-white px-5 py-3 sm:px-6 sm:py-3.5 text-[15px] font-medium text-neutral-900 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            style={{ fontFamily: 'Poppins, "Poppins Fallback"' }}
          >
            Explore all collections
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-neutral-500 transition-transform group-hover:translate-x-1 dark:text-neutral-400 dark:group-hover:text-neutral-100"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SectionStartExploring;
