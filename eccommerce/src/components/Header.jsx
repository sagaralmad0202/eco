import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="relative w-full bg-white">
      <div
        className={`relative z-40 flex h-full items-center border-neutral-200 bg-white px-4 sm:px-8 dark:border-neutral-700 dark:bg-neutral-900 ${
          isSearchOpen ? "border-b" : ""
        }`}
        style={{ height: "80px" }}
      >
        {/* Mobile left area */}
        <div className="flex h-[80px] w-[111.6px] items-center lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
            className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 7H20" strokeWidth="1.5" strokeLinecap="round"></path>
              <path d="M4 12H20" strokeWidth="1.5" strokeLinecap="round"></path>
              <path d="M4 17H20" strokeWidth="1.5" strokeLinecap="round"></path>
            </svg>
          </button>
        </div>

        {/* Logo area */}
        <div className="flex items-center lg:flex-1">
          <a href="/" className="flex shrink-0 text-neutral-950 dark:text-neutral-50">
            <svg
              width="112"
              height="44"
              viewBox="0 0 112 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >

                {/* Circle */}
                <path
                  d="M15 37C23.2843 37 30 30.2843 30 22C30 13.7157 23.2843 7 15 7C6.71573 7 0 13.7157 0 22C0 30.2843 6.71573 37 15 37Z"
                  fill="black"
                />

                {/* Slash lines */}
                <rect
                  x="23.8064"
                  y="10.0613"
                  width="2"
                  height="20"
                  rx="1"
                  transform="rotate(50.5422 23.8064 10.0613)"
                  fill="white"
                />

                <rect
                  x="21.5823"
                  y="19.8572"
                  width="2"
                  height="20"
                  rx="1"
                  transform="rotate(50.5422 21.5823 19.8572)"
                  fill="white"
                />

                {/* eco text */}
                <path
                  d="M57.537 22.2C57.537 22.8933 57.497 23.6267 57.417 24.4H39.897C40.0304 26.56 40.7637 28.2533 42.097 29.48C43.457 30.68 45.097 31.28 47.017 31.28C48.5904 31.28 49.897 30.92 50.937 30.2C52.0037 29.4533 52.7504 28.4667 53.177 27.24H57.097C56.5104 29.3467 55.337 31.0667 53.577 32.4C51.817 33.7067 49.6304 34.36 47.017 34.36C44.937 34.36 43.0704 33.8933 41.417 32.96C39.7904 32.0267 38.5104 30.7067 37.577 29C36.6437 27.2667 36.177 25.2667 36.177 23C36.177 20.7333 36.6304 18.7467 37.537 17.04C38.4437 15.3333 39.7104 14.0267 41.337 13.12C42.9904 12.1867 44.8837 11.72 47.017 11.72C49.097 11.72 50.937 12.1733 52.537 13.08C54.137 13.9867 55.3637 15.24 56.217 16.84C57.097 18.4133 57.537 20.2 57.537 22.2ZM53.777 21.44C53.777 20.0533 53.4704 18.8667 52.857 17.88C52.2437 16.8667 51.4037 16.1067 50.337 15.6C49.297 15.0667 48.137 14.8 46.857 14.8C45.017 14.8 43.4437 15.3867 42.137 16.56C40.857 17.7333 40.1237 19.36 39.937 21.44H53.777ZM58.9817 23C58.9817 20.7333 59.4351 18.76 60.3417 17.08C61.2484 15.3733 62.5017 14.0533 64.1017 13.12C65.7284 12.1867 67.5817 11.72 69.6617 11.72C72.3551 11.72 74.5684 12.3733 76.3017 13.68C78.0617 14.9867 79.2217 16.8 79.7817 19.12H75.8617C75.4884 17.7867 74.7551 16.7333 73.6617 15.96C72.5951 15.1867 71.2617 14.8 69.6617 14.8C67.5817 14.8 65.9017 15.52 64.6217 16.96C63.3417 18.3733 62.7017 20.3867 62.7017 23C62.7017 25.64 63.3417 27.68 64.6217 29.12C65.9017 30.56 67.5817 31.28 69.6617 31.28C71.2617 31.28 72.5951 30.9067 73.6617 30.16C74.7284 29.4133 75.4617 28.3467 75.8617 26.96H79.7817C79.1951 29.2 78.0217 31 76.2617 32.36C74.5017 33.6933 72.3017 34.36 69.6617 34.36C67.5817 34.36 65.7284 33.8933 64.1017 32.96C62.5017 32.0267 61.2484 30.7067 60.3417 29C59.4351 27.2933 58.9817 25.2933 58.9817 23ZM92.1986 34.36C90.1453 34.36 88.2786 33.8933 86.5986 32.96C84.9453 32.0267 83.6386 30.7067 82.6786 29C81.7453 27.2667 81.2786 25.2667 81.2786 23C81.2786 20.76 81.7586 18.7867 82.7186 17.08C83.7053 15.3467 85.0386 14.0267 86.7186 13.12C88.3986 12.1867 90.2786 11.72 92.3586 11.72C94.4386 11.72 96.3186 12.1867 97.9986 13.12C99.6786 14.0267 100.999 15.3333 101.959 17.04C102.945 18.7467 103.439 20.7333 103.439 23C103.439 25.2667 102.932 27.2667 101.919 29C100.932 30.7067 99.5853 32.0267 97.8786 32.96C96.1719 33.8933 94.2786 34.36 92.1986 34.36ZM92.1986 31.16C93.5053 31.16 94.7319 30.8533 95.8786 30.24C97.0253 29.6267 97.9453 28.7067 98.6386 27.48C99.3586 26.2533 99.7186 24.76 99.7186 23C99.7186 21.24 99.3719 19.7467 98.6786 18.52C97.9853 17.2933 97.0786 16.3867 95.9586 15.8C94.8386 15.1867 93.6253 14.88 92.3186 14.88C90.9853 14.88 89.7586 15.1867 88.6386 15.8C87.5453 16.3867 86.6653 17.2933 85.9986 18.52C85.3319 19.7467 84.9986 21.24 84.9986 23C84.9986 24.7867 85.3186 26.2933 85.9586 27.52C86.6253 28.7467 87.5053 29.6667 88.5986 30.28C89.6919 30.8667 90.8919 31.16 92.1986 31.16ZM107.385 34.24C106.691 34.24 106.105 34 105.625 33.52C105.145 33.04 104.905 32.4533 104.905 31.76C104.905 31.0667 105.145 30.48 105.625 30C106.105 29.52 106.691 29.28 107.385 29.28C108.051 29.28 108.611 29.52 109.065 30C109.545 30.48 109.785 31.0667 109.785 31.76C109.785 32.4533 109.545 33.04 109.065 33.52C108.611 34 108.051 34.24 107.385 34.24Z"
                  fill="currentColor"
                />

            </svg>
          </a>
        </div>

        {/* Center Navigation */}
        <div className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center lg:flex">
          <ul className="flex items-center gap-x-0">
            <li className="relative menu-item flex h-[80px] items-center">
              <a
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:text-[15px] xl:px-5"
                data-headlessui-state
                href="/"
              >
                Home
              </a>
            </li>
            <li className="relative menu-item flex h-[80px] items-center">
              <a
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:text-[15px] xl:px-5"
                data-headlessui-state
                href="/"
              >
                Shop
              </a>
            </li>
            <li className="relative menu-item flex h-[80px] items-center">
              <a
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:text-[15px] xl:px-5"
                data-headlessui-state
                href="/"
              >
                Beauty
              </a>
            </li>
            <li className="relative menu-item flex h-[80px] items-center">
              <a
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:text-[15px] xl:px-5"
                data-headlessui-state
                href="/"
              >
                Sport
              </a>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-x-0">
          <button
            className={`flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-[10px] text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-0 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${
              isSearchOpen ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200" : ""
            }`}
            type="button"
            aria-label="Search"
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsMobileMenuOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor">
              <path d="M17 17L21 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
              <path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
            </svg>
          </button>

          <button
            className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-[10px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-0 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            type="button"
            aria-label="Account"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor">
              <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M14.75 9.5C14.75 11.0188 13.5188 12.25 12 12.25C10.4812 12.25 9.25 11.0188 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5Z" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M5.49994 19.0001L6.06034 18.0194C6.95055 16.4616 8.60727 15.5001 10.4016 15.5001H13.5983C15.3926 15.5001 17.0493 16.4616 17.9395 18.0194L18.4999 19.0001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
            </svg>
          </button>

          <button
            className="relative flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-[10px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-0 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            type="button"
            aria-label="Cart"
          >
            <div className="absolute top-2 right-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-primary-500 text-[10px] leading-none font-medium text-white dark:bg-primary-600">
              <span className="mt-px">3</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor">
              <path d="M8 16L16.7201 15.2733C19.4486 15.046 20.0611 14.45 20.3635 11.7289L21 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              <path d="M6 6H22" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              <circle cx="6" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
              <circle cx="17" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
              <path d="M8 20L15 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              <path d="M2 2H2.966C3.91068 2 4.73414 2.62459 4.96326 3.51493L7.93852 15.0765C8.08887 15.6608 7.9602 16.2797 7.58824 16.7616L6.63213 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            </svg>
           
          </button>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 top-[80px] z-30 border-t border-neutral-200 bg-white shadow-sm transition-all duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <nav className="flex flex-col px-4 py-3">
          <a href="/" className="rounded-md px-2 py-3 text-[15px] font-medium text-neutral-800 hover:bg-neutral-100">Home</a>
          <a href="/" className="rounded-md px-2 py-3 text-[15px] font-medium text-neutral-800 hover:bg-neutral-100">Shop</a>
          <a href="/" className="rounded-md px-2 py-3 text-[15px] font-medium text-neutral-800 hover:bg-neutral-100">Beauty</a>
          <a href="/" className="rounded-md px-2 py-3 text-[15px] font-medium text-neutral-800 hover:bg-neutral-100">Sport</a>
        </nav>
      </div>

      <div
        data-closed={isSearchOpen ? undefined : ""}
        className={`header-popover-full-panel absolute inset-x-0 top-[80px] z-30 bg-white text-neutral-950 shadow-xl transition-all duration-300 ease-out will-change-transform dark:border-b dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100 ${
          isSearchOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-[72px] w-full items-center px-4 sm:px-8 lg:max-w-[860px] lg:justify-between">
          <div className="flex flex-1 items-center gap-x-1 lg:ml-[225px] lg:w-[520px] lg:flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor">
              <path d="M17 17L21 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
              <path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              name="q"
              aria-label="Search for products"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full !border-none pl-0 pr-4 py-2 text-sm/6 uppercase !ring-0 focus-visible:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="group ml-2 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-neutral-700 lg:ml-0 lg:mr-[220px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor" className="transition-transform duration-300 ease-out group-hover:rotate-90">
              <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
