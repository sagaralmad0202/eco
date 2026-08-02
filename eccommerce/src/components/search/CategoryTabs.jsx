export default function CategoryTabs({ categories, activeCategory, onCategoryChange, onFilterToggle, isFilterOpen }) {
  return (
    <div className="flex flex-col justify-between gap-y-6 lg:flex-row lg:items-center lg:gap-x-2 lg:gap-y-0">
      {/* Category pills */}
      <ul className="hidden-scrollbar flex overflow-x-auto sm:gap-x-2">
        {categories.map((cat) => (
          <li key={cat} className="relative shrink-0">
            <button
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap inline-flex items-center justify-center rounded-full border text-sm font-medium transition-colors cursor-pointer px-5 py-2.5 sm:px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                activeCategory === cat
                  ? "border-transparent bg-zinc-900 text-white"
                  : "border-transparent text-zinc-950 hover:bg-zinc-950/5"
              }`}
              style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>

      {/* Filter button - desktop */}
      <span className="hidden shrink-0 lg:block">
        <button
          type="button"
          onClick={onFilterToggle}
          className="inline-flex items-center justify-center rounded-full border border-transparent bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 sm:px-6 cursor-pointer hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
        >
          {/* Filter/funnel icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="-ml-1">
            <path d="M8.85746 12.5061C6.36901 10.6456 4.59564 8.59915 3.62734 7.44867C3.3276 7.09253 3.22938 6.8319 3.17033 6.3728C2.96811 4.8008 2.86701 4.0148 3.32795 3.5074C3.7889 3 4.60404 3 6.23433 3H17.7657C19.396 3 20.2111 3 20.672 3.5074C21.133 4.0148 21.0319 4.8008 20.8297 6.37281C20.7706 6.83191 20.6724 7.09254 20.3726 7.44867C19.403 8.60062 17.6261 10.6507 15.1326 12.5135C14.907 12.6821 14.7583 12.9567 14.7307 13.2614C14.4837 15.992 14.2559 17.4876 14.1141 18.2442C13.8853 19.4657 12.1532 20.2006 11.226 20.8563C10.6741 21.2466 10.0043 20.782 9.93278 20.1778C9.79643 19.0261 9.53961 16.6864 9.25927 13.2614C9.23409 12.9539 9.08486 12.6761 8.85746 12.5061Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-2">Filter</span>
          {/* Chevron */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-5 h-5 ml-1 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </span>
    </div>
  );
}
