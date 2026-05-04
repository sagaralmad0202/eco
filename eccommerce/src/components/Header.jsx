import { useEffect, useRef, useState } from "react";
import SideCart from "./SideCart";
import profileImage from "../assets/profile image.webp";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="relative w-full bg-white dark:bg-black">
      <div
        className={`relative z-40 container mx-auto flex h-full justify-between border-neutral-200 bg-white px-4 sm:px-8 dark:border-neutral-700 dark:bg-neutral-900 ${isSearchOpen ? "border-b" : ""
          }`}
        style={{ height: "80px" }}
      >
        {/* Mobile left area */}
        <div className="flex h-full flex-1 items-center lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
            className="-m-2.5 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-2.5 text-[#111111] hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              color="currentColor"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                d="M4 5L20 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M4 12L20 12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M4 19L20 19"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        {/* Logo area */}
        <div className="flex h-full items-center lg:flex-1">
          <a href="/" className="flex shrink-0 text-neutral-950 dark:text-neutral-50">
            <svg
              width="112"
              height="44"
              viewBox="0 0 112 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 37C23.2843 37 30 30.2843 30 22C30 13.7157 23.2843 7 15 7C6.71573 7 0 13.7157 0 22C0 30.2843 6.71573 37 15 37Z"
                fill="black"
              />
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
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white dark:hover:bg-neutral-800 lg:text-[15px] xl:px-5"
                data-headlessui-state
                href="/"
              >
                Home
              </a>
            </li>
            <li className="relative menu-item flex h-[80px] items-center">
              <a
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white dark:hover:bg-neutral-800 lg:text-[15px] xl:px-5"
                data-headlessui-state
                href="/"
              >
                Shop
              </a>
            </li>
            <li className="relative menu-item flex h-[80px] items-center">
              <a
                className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white dark:hover:bg-neutral-800 lg:text-[15px] xl:px-5"
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
        <div className="flex h-full flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
          <button
            className={`-m-2.5 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-[10px] text-[#111111] transition-colors hover:bg-neutral-100 focus-visible:outline-0 dark:text-white dark:hover:bg-neutral-800 ${isSearchOpen ? "bg-neutral-100 dark:bg-neutral-800" : ""
              }`}
            type="button"
            aria-label="Search"
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M17 17L21 21"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="relative flex items-center">
            <button
              className={`-m-2.5 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-[10px] text-[#111111] hover:bg-neutral-100 focus-visible:outline-0 dark:text-white dark:hover:bg-neutral-800 ${isAccountOpen ? "bg-neutral-100 dark:bg-neutral-800" : ""
                }`}
              type="button"
              aria-label="Account"
              aria-expanded={isAccountOpen}
              onClick={() => {
                setIsAccountOpen((prev) => !prev);
                setIsSearchOpen(false);
                setIsMobileMenuOpen(false);
                setIsCartOpen(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor">
                <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M14.75 9.5C14.75 11.0188 13.5188 12.25 12 12.25C10.4812 12.25 9.25 11.0188 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M5.49994 19.0001L6.06034 18.0194C6.95055 16.4616 8.60727 15.5001 10.4016 15.5001H13.5983C15.3926 15.5001 17.0493 16.4616 17.9395 18.0194L18.4999 19.0001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </button>

            {/* Account Popover Container */}
            {isAccountOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-3 w-80 rounded-3xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition duration-200 ease-in-out"
                style={{ fontFamily: "Poppins, 'Poppins Fallback'" }}
              >
                <div className="overflow-hidden rounded-3xl ring-1 ring-white/5 dark:ring-white/10">
                  <div
                    className="relative grid grid-cols-1 gap-6 bg-white px-6 py-7 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    style={{ height: "353.6px" }}
                  >
                    {/* User Info Section */}
                    <div className="flex items-center space-x-3">
                      <div className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold text-neutral-100 uppercase shadow-inner ring-1 ring-white dark:ring-neutral-900">
                        <img
                          alt="Eden Smith"
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full rounded-full object-cover"
                          src={profileImage}
                        />
                      </div>
                      <div className="grow text-left">
                        <h4 className="font-semibold text-neutral-950 dark:text-neutral-50">Eden Smith</h4>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Los Angeles, CA</p>
                      </div>
                    </div>

                    <hr role="presentation" className="w-full border-t border-neutral-950/10 dark:border-white/10" />

                    <a className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700" href="/account">
                      <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                      </div>
                      <span className="ml-4 text-sm font-medium">My Account</span>
                    </a>

                    <a className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700" href="/orders">
                      <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M8 12.2H15" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M8 16.2H12.38" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                      </div>
                      <span className="ml-4 text-sm font-medium">My Orders</span>
                    </a>

                    <a className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700" href="/wishlist">
                      <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                      </div>
                      <span className="ml-4 text-sm font-medium">Wishlist</span>
                    </a>

                    <hr role="presentation" className="w-full border-t border-neutral-950/10 dark:border-white/10" />

                    <a className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700" href="/help">
                      <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.97 22C17.4928 22 21.97 17.5228 21.97 12C21.97 6.47715 17.4928 2 11.97 2C6.44715 2 1.97 6.47715 1.97 12C1.97 17.5228 6.44715 22 11.97 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M4.89999 4.92993L8.43999 8.45993" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M4.89999 19.07L8.43999 15.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M19.05 19.07L15.51 15.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M19.05 4.92993L15.51 8.45993" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                      </div>
                      <span className="ml-4 text-sm font-medium">Help</span>
                    </a>

                    <a className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700" href="/logout">
                      <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M15 12H3.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M5.85 8.6499L2.5 11.9999L5.85 15.3499" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                      </div>
                      <span className="ml-4 text-sm font-medium">Log out</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="relative -m-2.5 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full p-[10px] text-[#111111] hover:bg-neutral-100 focus-visible:outline-0 dark:text-white dark:hover:bg-neutral-800"
            type="button"
            aria-label="Cart"
            onClick={() => { setIsCartOpen(true); setIsSearchOpen(false); setIsMobileMenuOpen(false); }}
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
        className={`fixed inset-y-0 right-0 z-50 flex max-w-full lg:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`fixed inset-0 bg-black/25 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        <aside
          className={`relative h-screen w-screen max-w-md overflow-hidden bg-white dark:bg-neutral-950 text-start align-middle transition duration-200 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex h-full flex-col px-4 md:px-8">
            <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-900/10 dark:border-white/10 md:h-20">
              <a href="/" className="flex shrink-0 text-neutral-950 dark:text-neutral-50">
                <svg
                  width="112"
                  height="44"
                  viewBox="0 0 112 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 37C23.2843 37 30 30.2843 30 22C30 13.7157 23.2843 7 15 7C6.71573 7 0 13.7157 0 22C0 30.2843 6.71573 37 15 37Z"
                    fill="black"
                  />
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
                  <path
                    d="M57.537 22.2C57.537 22.8933 57.497 23.6267 57.417 24.4H39.897C40.0304 26.56 40.7637 28.2533 42.097 29.48C43.457 30.68 45.097 31.28 47.017 31.28C48.5904 31.28 49.897 30.92 50.937 30.2C52.0037 29.4533 52.7504 28.4667 53.177 27.24H57.097C56.5104 29.3467 55.337 31.0667 53.577 32.4C51.817 33.7067 49.6304 34.36 47.017 34.36C44.937 34.36 43.0704 33.8933 41.417 32.96C39.7904 32.0267 38.5104 30.7067 37.577 29C36.6437 27.2667 36.177 25.2667 36.177 23C36.177 20.7333 36.6304 18.7467 37.537 17.04C38.4437 15.3333 39.7104 14.0267 41.337 13.12C42.9904 12.1867 44.8837 11.72 47.017 11.72C49.097 11.72 50.937 12.1733 52.537 13.08C54.137 13.9867 55.3637 15.24 56.217 16.84C57.097 18.4133 57.537 20.2 57.537 22.2ZM53.777 21.44C53.777 20.0533 53.4704 18.8667 52.857 17.88C52.2437 16.8667 51.4037 16.1067 50.337 15.6C49.297 15.0667 48.137 14.8 46.857 14.8C45.017 14.8 43.4437 15.3867 42.137 16.56C40.857 17.7333 40.1237 19.36 39.937 21.44H53.777ZM58.9817 23C58.9817 20.7333 59.4351 18.76 60.3417 17.08C61.2484 15.3733 62.5017 14.0533 64.1017 13.12C65.7284 12.1867 67.5817 11.72 69.6617 11.72C72.3551 11.72 74.5684 12.3733 76.3017 13.68C78.0617 14.9867 79.2217 16.8 79.7817 19.12H75.8617C75.4884 17.7867 74.7551 16.7333 73.6617 15.96C72.5951 15.1867 71.2617 14.8 69.6617 14.8C67.5817 14.8 65.9017 15.52 64.6217 16.96C63.3417 18.3733 62.7017 20.3867 62.7017 23C62.7017 25.64 63.3417 27.68 64.6217 29.12C65.9017 30.56 67.5817 31.28 69.6617 31.28C71.2617 31.28 72.5951 30.9067 73.6617 30.16C74.7284 29.4133 75.4617 28.3467 75.8617 26.96H79.7817C79.1951 29.2 78.0217 31 76.2617 32.36C74.5017 33.6933 72.3017 34.36 69.6617 34.36C67.5817 34.36 65.7284 33.8933 64.1017 32.96C62.5017 32.0267 61.2484 30.7067 60.3417 29C59.4351 27.2933 58.9817 25.2933 58.9817 23ZM92.1986 34.36C90.1453 34.36 88.2786 33.8933 86.5986 32.96C84.9453 32.0267 83.6386 30.7067 82.6786 29C81.7453 27.2667 81.2786 25.2667 81.2786 23C81.2786 20.76 81.7586 18.7867 82.7186 17.08C83.7053 15.3467 85.0386 14.0267 86.7186 13.12C88.3986 12.1867 90.2786 11.72 92.3586 11.72C94.4386 11.72 96.3186 12.1867 97.9986 13.12C99.6786 14.0267 100.999 15.3333 101.959 17.04C102.945 18.7467 103.439 20.7333 103.439 23C103.439 25.2667 102.932 27.2667 101.919 29C100.932 30.7067 99.5853 32.0267 97.8786 32.96C96.1719 33.8933 94.2786 34.36 92.1986 34.36ZM92.1986 31.16C93.5053 31.16 94.7319 30.8533 95.8786 30.24C97.0253 29.6267 97.9453 28.7067 98.6386 27.48C99.3586 26.2533 99.7186 24.76 99.7186 23C99.7186 21.24 99.3719 19.7467 98.6786 18.52C97.9853 17.2933 97.0786 16.3867 95.9586 15.8C94.8386 15.1867 93.6253 14.88 92.3186 14.88C90.9853 14.88 89.7586 15.1867 88.6386 15.8C87.5453 16.3867 86.6653 17.2933 85.9986 18.52C85.3319 19.7467 84.9986 21.24 84.9986 23C84.9986 24.7867 85.3186 26.2933 85.9586 27.52C86.6253 28.7467 87.5053 29.6667 88.5986 30.28C89.6919 30.8667 90.8919 31.16 92.1986 31.16ZM107.385 34.24C106.691 34.24 106.105 34 105.625 33.52C105.145 33.04 104.905 32.4533 104.905 31.76C104.905 31.0667 105.145 30.48 105.625 30C106.105 29.52 106.691 29.28 107.385 29.28C108.051 29.28 108.611 29.52 109.065 30C109.545 30.48 109.785 31.0667 109.785 31.76C109.785 32.4533 109.545 33.04 109.065 33.52C108.611 34 108.051 34.24 107.385 34.24Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <div className="flex items-center gap-x-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-[#111111] hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group -m-4 cursor-pointer p-4 text-[#111111] dark:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    color="currentColor"
                    className="transition-transform duration-200 group-hover:rotate-90"
                    strokeWidth="1"
                    stroke="currentColor"
                  >
                    <path
                      d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                    />
                  </svg>
                </button>
              </div>
            </header>

            <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
              <span
                className="block text-[16px] leading-[1.4666667] text-neutral-800"
                style={{
                  fontFamily: "Poppins, 'Poppins Fallback'",
                  fontWeight: 400,
                  color: "var(--text-main)",
                }}
              >
                <span className="block whitespace-nowrap">Discover the most outstanding articles on</span>
                <span className="block whitespace-nowrap">all topics of life. Write your stories and</span>
                <span className="block whitespace-nowrap">share them</span>
              </span>

              <div className="mt-4 flex items-center justify-between">
                <nav className="flex items-center gap-x-4 gap-y-2 text-2xl text-neutral-600 dark:text-neutral-300">
                  <a className="relative block h-6 w-6" target="_blank" rel="noopener noreferrer" title="Facebook" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#1877F2" />
                      <path d="M13.1 7.5H15V5h-2.2C10.7 5 9.6 6.3 9.6 8.4V10H8v2.7h1.6V19h2.9v-6.3h2.2l.4-2.7h-2.6V8.7c0-.8.2-1.2 1.1-1.2Z" fill="white" />
                    </svg>
                  </a>
                  <a className="relative block h-6 w-6" target="_blank" rel="noopener noreferrer" title="Twitter" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#111111" />
                      <path d="M14.6 7H16L13 10.4L16.5 17H13.7L11.4 12.7L7.7 17H6.3L9.6 13.2L6.2 7H9.1L11.2 11L14.6 7Z" fill="white" />
                    </svg>
                  </a>
                  <a className="relative block h-6 w-6" target="_blank" rel="noopener noreferrer" title="Youtube" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#FF0000" />
                      <path d="M9.5 8.8V15.2L15.2 12L9.5 8.8Z" fill="white" />
                    </svg>
                  </a>
                  <a className="relative block h-6 w-6" target="_blank" rel="noopener noreferrer" title="Telegram" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#2CA5E0" />
                      <path d="M17.3 7.6L15.7 16.2C15.6 16.9 15.2 17.1 14.6 16.8L11.8 14.7L10.4 16.1C10.2 16.3 10.1 16.4 9.9 16.4L10.1 13.5L15.4 8.7C15.6 8.5 15.3 8.4 15 8.6L8.4 12.8L5.6 11.9C5 11.7 5 11.3 5.7 11L16.5 6.8C17 6.6 17.5 6.9 17.3 7.6Z" fill="white" />
                    </svg>
                  </a>
                </nav>
              </div>

              <div className="mt-5">
                <form action="#" method="POST" className="flex-1 text-neutral-900 dark:text-neutral-200">
                  <div className="flex h-full items-center gap-x-2.5 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="stroke-[1.5]" stroke="currentColor">
                      <path d="M17 17L21 21" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 11C19 6.58 15.42 3 11 3C6.58 3 3 6.58 3 11C3 15.42 6.58 19 11 19C15.42 19 19 15.42 19 11Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="search"

                      placeholder="Type and press enter"
                      className="w-full border-none bg-transparent text-sm placeholder:text-sm placeholder:leading-5 focus:ring-0 focus:outline-hidden"
                      style={{ fontFamily: "Poppins, 'Poppins Fallback'" }}
                    />
                  </div>
                  <input hidden type="submit" value="" />
                </form>
              </div>

              <nav className="mt-5">
                <ul className="flex flex-col gap-y-1 px-2 py-6">
                  <li className="text-neutral-900 dark:text-white" data-headlessui-state>
                    <a
                      href="/"
                      className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      HOME
                    </a>
                  </li>
                  <li className="text-neutral-900 dark:text-white" data-headlessui-state>
                    <a
                      href="/"
                      className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      SHOP
                    </a>
                  </li>
                  <li className="text-neutral-900 dark:text-white" data-headlessui-state>
                    <a
                      href="/"
                      className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      BEAUTY
                    </a>
                  </li>
                  <li className="text-neutral-900 dark:text-white" data-headlessui-state>
                    <a
                      href="/"
                      className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      SPORT
                    </a>
                  </li>

                </ul>
              </nav>
              <hr role="presentation" className="mb-6 w-full border-t border-neutral-950/10 dark:border-white/10" />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://themeforest.net/item/ciseco-shop-ecommerce-nextjs-template/44210635"
                className="!px-8 relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 px-[calc(var(--spacing)*4-1px)] py-[calc(var(--spacing)*2.5-1px)] sm:px-[calc(var(--spacing)*6-1px)] sm:py-[calc(var(--spacing)*3-1px)] sm:text-sm/6 border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              >
                Buy this template
              </a>

            </div>
          </div>
        </aside>
      </div>

      {/* Search overlay panel */}
      <div
        data-closed={isSearchOpen ? undefined : ""}
        className={`header-popover-full-panel h-[72px] absolute inset-x-0 top-[80px] z-30 flex flex-col bg-white text-neutral-950 transition-all duration-300 ease-out will-change-transform dark:border-b dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100 ${isSearchOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col py-4">
          {/* Search row */}
          <div className="flex flex-1 items-center gap-x-1">
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
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
              className="group -m-2.5 flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" stroke="currentColor" className="transition-transform duration-300 ease-out group-hover:rotate-90">
                <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Keyboard hint bar */}
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          <div className="mx-auto flex max-w-xl items-center py-3">
            <div
              className="block text-xs/6 text-neutral-500 uppercase md:hidden"
              style={{ fontFamily: "Poppins, 'Poppins Fallback'" }}
            >
              Press{" "}
              <a className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-900" href="/search">
                Enter
              </a>{" "}
              to search or{" "}
              <kbd className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-900">
                <span className="text-xs">Esc</span>
              </kbd>{" "}
              to cancel
            </div>
          </div>
        </div>
      </div>

      {/* Side Cart Drawer */}
      <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
