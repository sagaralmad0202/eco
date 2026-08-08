import { useRef, useEffect } from "react";

export default function SearchHero({ searchQuery, onSearchChange, onSearchSubmit }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div>
      {/* Icy-blue background band */}
      <div className="h-24 w-full 2xl:h-28" style={{ backgroundColor: "#eff8fd" }} />
      <div className="container mx-auto px-4 sm:px-8">
        <header className="mx-auto -mt-10 flex max-w-2xl flex-col lg:-mt-7">
          <form className="relative w-full" onSubmit={handleSubmit}>
            <fieldset className="text-neutral-500">
              <label htmlFor="search-input" className="sr-only">Search all products</label>
              {/* Search icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-2xl sm:left-5"
              >
                <path d="M17 17L21 21" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                ref={inputRef}
                className="block w-full rounded-full border-2 border-neutral-200 ring-0 bg-white py-4 pr-16 pl-12 text-neutral-900 placeholder:text-zinc-500 focus:border-neutral-900 focus:ring-2 focus:ring-sky-200 focus:outline-none sm:py-5 sm:text-sm md:pl-14"
                id="search-input"
                type="search"
                placeholder="Type your keywords"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
              />
              {/* Submit button */}
              <button
                className="flex items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 absolute top-1/2 right-2 -translate-y-1/2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                type="submit"
                aria-label="Search"
                style={{ width: "44px", height: "44px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </fieldset>
          </form>
        </header>
      </div>
    </div>
  );
}
