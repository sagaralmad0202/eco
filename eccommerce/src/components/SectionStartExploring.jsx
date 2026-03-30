import { useState } from "react";

/* ─── Tab Data ─── */
const TABS = [
  {
    id: "women",
    label: "Women",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M12 13v8" />
        <path d="M9 18h6" />
      </svg>
    ),
  },
  {
    id: "man",
    label: "Man",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="14" r="5" />
        <path d="M19 5l-5.4 5.4" />
        <path d="M15 5h4v4" />
      </svg>
    ),
  },
  {
    id: "accessories",
    label: "Accessories",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: "footwear",
    label: "Footwear",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18v2H3z" />
        <path d="M4 17c0-4 2-8 6-9 1-.3 2 0 3 .5s3 1.5 5 1.5h2v7" />
      </svg>
    ),
  },
  {
    id: "jewelry",
    label: "Jewelry",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M2 9h20" />
        <path d="M10 3l-4 6 6 13 6-13-4-6" />
      </svg>
    ),
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2h6v8l-1 1H10L9 10z" />
        <rect x="10" y="11" width="4" height="2" rx="1" />
        <path d="M10 13c0 5-2 9 2 9s2-4 2-9" />
      </svg>
    ),
  },
];

/* ─── Card Data (per tab) ─── */
const CARDS_BY_TAB = {
  women: [
    { emoji: "👗", badge: "Top transparent", name: "Dresses", count: "120 products" },
    { emoji: "👜", badge: "Best sellers", name: "Handbags", count: "85 products" },
    { emoji: "👠", badge: "Newest arrivals", name: "Heels", count: "65 products" },
    { emoji: "🧣", badge: "Best sellers", name: "Scarves", count: "42 products" },
    { emoji: "💍", badge: "Top rated", name: "Rings", count: "78 products" },
    { emoji: "🕶️", badge: "Best seasonal", name: "Sunglasses", count: "54 products" },
  ],
  man: [
    { emoji: "🧢", badge: "Top transparent", name: "Accessories", count: "55 products" },
    { emoji: "👖", badge: "Best sellers", name: "Jeans", count: "35 products" },
    { emoji: "🧥", badge: "Newest arrivals", name: "Jackets", count: "77 products" },
    { emoji: "👕", badge: "Best sellers", name: "T-Shirts", count: "155 products" },
    { emoji: "👟", badge: "Top rated", name: "Shoes", count: "114 products" },
    { emoji: "🧥", badge: "Best seasonal", name: "Coats", count: "87 products" },
  ],
  accessories: [
    { emoji: "⌚", badge: "Top transparent", name: "Watches", count: "95 products" },
    { emoji: "🎒", badge: "Best sellers", name: "Bags", count: "68 products" },
    { emoji: "🧣", badge: "Newest arrivals", name: "Scarves", count: "42 products" },
    { emoji: "🕶️", badge: "Best sellers", name: "Sunglasses", count: "73 products" },
    { emoji: "🧢", badge: "Top rated", name: "Hats", count: "56 products" },
    { emoji: "🧤", badge: "Best seasonal", name: "Gloves", count: "31 products" },
  ],
  footwear: [
    { emoji: "👟", badge: "Top transparent", name: "Sneakers", count: "145 products" },
    { emoji: "👠", badge: "Best sellers", name: "Heels", count: "65 products" },
    { emoji: "🥾", badge: "Newest arrivals", name: "Boots", count: "88 products" },
    { emoji: "🩴", badge: "Best sellers", name: "Sandals", count: "72 products" },
    { emoji: "👞", badge: "Top rated", name: "Loafers", count: "53 products" },
    { emoji: "🩰", badge: "Best seasonal", name: "Flats", count: "41 products" },
  ],
  jewelry: [
    { emoji: "💍", badge: "Top transparent", name: "Rings", count: "98 products" },
    { emoji: "📿", badge: "Best sellers", name: "Necklaces", count: "76 products" },
    { emoji: "💎", badge: "Newest arrivals", name: "Bracelets", count: "64 products" },
    { emoji: "✨", badge: "Best sellers", name: "Earrings", count: "112 products" },
    { emoji: "⌚", badge: "Top rated", name: "Watches", count: "87 products" },
    { emoji: "👑", badge: "Best seasonal", name: "Brooches", count: "35 products" },
  ],
  beauty: [
    { emoji: "💄", badge: "Top transparent", name: "Lipstick", count: "134 products" },
    { emoji: "🧴", badge: "Best sellers", name: "Skincare", count: "98 products" },
    { emoji: "💅", badge: "Newest arrivals", name: "Nail Art", count: "67 products" },
    { emoji: "🌸", badge: "Best sellers", name: "Perfume", count: "82 products" },
    { emoji: "🪞", badge: "Top rated", name: "Makeup", count: "145 products" },
    { emoji: "🧖", badge: "Best seasonal", name: "Spa", count: "29 products" },
  ],
};

/* ─── Decorative SVG Patterns ─── */
const DecorativePattern1 = () => (
  <svg width="120" height="110" viewBox="0 0 120 110" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.7 }}>
    {/* Diagonal colored bars */}
    <rect x="30" y="10" width="8" height="55" rx="4" fill="#4f46e5" transform="rotate(-25 34 37)" />
    <rect x="45" y="10" width="8" height="55" rx="4" fill="#06b6d4" transform="rotate(-25 49 37)" />
    <rect x="60" y="10" width="8" height="55" rx="4" fill="#818cf8" transform="rotate(-25 64 37)" />
    <rect x="75" y="10" width="8" height="55" rx="4" fill="#f43f5e" transform="rotate(-25 79 37)" />
    <rect x="30" y="60" width="8" height="40" rx="4" fill="#fb923c" transform="rotate(-25 34 80)" />
    <rect x="45" y="60" width="8" height="40" rx="4" fill="#38bdf8" transform="rotate(-25 49 80)" />
    <rect x="60" y="60" width="8" height="40" rx="4" fill="#f87171" transform="rotate(-25 64 80)" />
  </svg>
);

const DecorativePattern2 = () => (
  <svg width="130" height="120" viewBox="0 0 130 120" fill="none" style={{ position: "absolute", bottom: -5, right: -5, opacity: 0.6 }}>
    {/* Zigzag wavy lines */}
    <polyline points="20,20 35,40 50,20 65,40 80,20 95,40 110,20" stroke="#f9a8d4" strokeWidth="2.5" fill="none" />
    <polyline points="20,35 35,55 50,35 65,55 80,35 95,55 110,35" stroke="#67e8f9" strokeWidth="2.5" fill="none" />
    <polyline points="20,50 35,70 50,50 65,70 80,50 95,70 110,50" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
    <polyline points="30,65 45,85 60,65 75,85 90,65 105,85" stroke="#f9a8d4" strokeWidth="2" fill="none" />
    <polyline points="30,78 45,98 60,78 75,98 90,78 105,98" stroke="#67e8f9" strokeWidth="2" fill="none" />
    {/* Small diamond accent */}
    <polygon points="105,95 110,100 105,105 100,100" stroke="#22c55e" strokeWidth="1.5" fill="none" />
  </svg>
);

const DecorativePattern3 = () => (
  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.6 }}>
    {/* Concentric dotted circles */}
    <circle cx="75" cy="55" r="10" stroke="#f87171" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    <circle cx="75" cy="55" r="20" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    <circle cx="75" cy="55" r="30" stroke="#f87171" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    <circle cx="75" cy="55" r="40" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    <circle cx="75" cy="55" r="50" stroke="#f87171" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
  </svg>
);

const DecorativePattern4 = () => (
  <svg width="140" height="130" viewBox="0 0 140 130" fill="none" style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.5 }}>
    {/* Abstract curvy T-shirt outlines */}
    <path d="M60,15 Q45,30 50,55 Q55,80 45,110" stroke="#22c55e" strokeWidth="2" fill="none" />
    <path d="M75,10 Q60,35 65,60 Q70,85 55,115" stroke="#22c55e" strokeWidth="2" fill="none" />
    <path d="M90,15 Q75,40 80,65 Q85,90 70,120" stroke="#22c55e" strokeWidth="1.5" fill="none" />
    <path d="M105,20 Q88,45 93,70 Q98,95 85,125" stroke="#22c55e" strokeWidth="1.5" fill="none" />
    <path d="M55,30 Q40,55 48,80 Q53,100 42,125" stroke="#22c55e" strokeWidth="1" fill="none" />
  </svg>
);

const DecorativePattern5 = () => (
  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.7 }}>
    {/* Scattered bubbles/dots */}
    <circle cx="80" cy="30" r="3" fill="#d4d08f" opacity="0.4" />
    <circle cx="90" cy="25" r="2" fill="#d4d08f" opacity="0.3" />
    <circle cx="75" cy="45" r="4" fill="#d4d08f" opacity="0.5" />
    <circle cx="90" cy="50" r="5" fill="#c4b85b" opacity="0.6" />
    <circle cx="60" cy="65" r="6" fill="#c4b85b" opacity="0.7" />
    <circle cx="78" cy="68" r="8" fill="#b8a93e" opacity="0.7" />
    <circle cx="55" cy="82" r="4" fill="#c4b85b" opacity="0.6" />
    <circle cx="70" cy="88" r="9" fill="#b8a93e" opacity="0.8" />
    <circle cx="90" cy="80" r="7" fill="#22c55e" opacity="0.6" />
    <circle cx="50" cy="95" r="10" fill="#b8a93e" opacity="0.7" />
  </svg>
);

const DecorativePattern6 = () => (
  <svg width="120" height="110" viewBox="0 0 120 110" fill="none" style={{ position: "absolute", bottom: 0, right: -5, opacity: 0.7 }}>
    {/* Diagonal stripes */}
    <rect x="50" y="-10" width="10" height="130" rx="5" fill="#60a5fa" transform="rotate(-35 55 55)" opacity="0.7" />
    <rect x="65" y="-10" width="8" height="130" rx="4" fill="#22c55e" transform="rotate(-35 69 55)" opacity="0.7" />
    <rect x="80" y="-10" width="12" height="130" rx="6" fill="#4ade80" transform="rotate(-35 86 55)" opacity="0.6" />
    <rect x="95" y="-10" width="7" height="130" rx="3.5" fill="#93c5fd" transform="rotate(-35 98 55)" opacity="0.6" />
    <rect x="108" y="-10" width="9" height="130" rx="4.5" fill="#86efac" transform="rotate(-35 112 55)" opacity="0.5" />
  </svg>
);

const DECORATIVE_PATTERNS = [
  DecorativePattern1,
  DecorativePattern2,
  DecorativePattern3,
  DecorativePattern4,
  DecorativePattern5,
  DecorativePattern6,
];

/* ─── Arrow Icon Component ─── */
const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
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
      <div className="relative">
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
            className="hidden-scrollbar flex overflow-x-auto rounded-full p-1 shadow-lg"
            style={{
              backgroundColor: "var(--card-bg, #ffffff)",
              listStyle: "none",
              margin: 0,
              padding: "4px",
              gap: 0,
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id} className="nc-NavItem2 relative flex-shrink-0">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="exploring-tab-btn"
                    style={{
                      display: "block",
                      cursor: "pointer",
                      borderRadius: "9999px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      padding: "10px 20px",
                      fontSize: "14px",
                      textTransform: "capitalize",
                      border: "none",
                      fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                      transition: "all 0.2s ease",
                      ...(isActive
                        ? {
                          backgroundColor: "var(--text-main, #111827)",
                          color: "#ffffff",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        }
                        : {
                          backgroundColor: "transparent",
                          color: "var(--text-secondary, #6b7280)",
                        }),
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ─ Grid of Cards ─ */}
        <div className="exploring-grid grid gap-4 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => {
            const Pattern = DECORATIVE_PATTERNS[index % DECORATIVE_PATTERNS.length];
            return (
              <div
                key={`${activeTab}-${card.name}`}
                className="exploring-card group"
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  padding: "24px",
                  overflow: "hidden",
                  backgroundColor: "var(--exploring-card-bg, #f3f4f6)",
                  cursor: "pointer",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  minHeight: "240px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Top Row: Icon + Arrow */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  {/* Emoji Icon Circle */}
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "var(--exploring-icon-bg, #ddd6fe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      flexShrink: 0,
                    }}
                  >
                    {card.emoji}
                  </div>

                  {/* Arrow */}
                  <div
                    style={{
                      color: "var(--text-secondary, #9ca3af)",
                      opacity: 0.6,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <ArrowIcon />
                  </div>
                </div>

                {/* Badge + Name */}
                <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                      color: "var(--text-muted, #9ca3af)",
                      textTransform: "capitalize",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {card.badge}
                  </span>
                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                      color: "var(--text-main)",
                      margin: "4px 0 0",
                      lineHeight: "1.3",
                    }}
                  >
                    {card.name}
                  </h3>
                </div>

                {/* Product Count */}
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
                    color: "var(--text-muted, #9ca3af)",
                    marginTop: "16px",
                  }}
                >
                  {card.count}
                </span>

                {/* Decorative Pattern */}
                <Pattern />
              </div>
            );
          })}
        </div>

        {/* ─ Explore All Button ─ */}
        <div className="mt-20 flex justify-center">
          <button
            className="exploring-cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "9999px",
              border: "2px solid var(--border-main, #e5e7eb)",
              backgroundColor: "transparent",
              color: "var(--text-main)",
              fontSize: "15px",
              fontWeight: 500,
              fontFamily: 'Poppins, "Poppins Fallback", sans-serif',
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Explore all collections
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionStartExploring;
