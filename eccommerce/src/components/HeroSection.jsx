import heroRightImage from "../assets/hero-right-4.webp";
import backgroundLine from "../assets/BackgroundLine.svg";

export default function HeroSection() {
  return (
    <section className="relative text-left">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto h-[601.54px] w-full max-w-full overflow-hidden rounded-2xl bg-[#F7F0EA] dark:bg-neutral-800 lg:h-[637.35px] lg:w-[1456.6px]">
          {/* Text Content */}
          <div className="relative inset-x-0 z-10 h-[243.1px] px-8 pt-8 pb-0 lg:absolute lg:top-1/5 lg:h-[325.2px] lg:pt-0 lg:px-8">
            <div className="flex flex-col items-start gap-y-4 lg:h-[325.2px] lg:w-[672px] lg:max-w-lg xl:max-w-2xl xl:gap-y-8">
              <span
                className="font-semibold text-[16px] sm:text-[20px] leading-[24px]"
                style={{
                  fontFamily: 'Poppins, "Poppins Fallback"',
                  color: "var(--text-secondary)"
                }}
              >
                In this season, find the best {"\u{1F525}"}
              </span>

              <h2
                className="font-bold theme-text-main"
                style={{
                  lineHeight: 1.15,
                  fontWeight: 700,
                  fontFamily: 'Poppins, "Poppins Fallback"',
                  color: "var(--text-main)",
                }}
              >
                <span className="block max-w-[220px] text-[30px] sm:text-[48px] lg:max-w-[860px] lg:text-[72px]">
                  Sports equipment collection.
                </span>
              </h2>

              <div>
                <button
                  className="relative isolate inline-flex h-[46px] w-[203px] items-center justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 data-disabled:opacity-50 *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center *:data-[slot=icon]:text-(--btn-icon) sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText] border-transparent bg-(--btn-border) dark:bg-(--btn-bg) before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-(--btn-bg) before:shadow-sm dark:before:hidden dark:border-white/5 after:absolute after:inset-0 after:-z-10 after:rounded-full after:shadow-[shadow:inset_0_1px_--theme(--color-white/15%)] data-active:after:bg-(--btn-hover-overlay) data-hover:after:bg-(--btn-hover-overlay) dark:after:-inset-px dark:after:rounded-full data-disabled:before:shadow-none data-disabled:after:shadow-none text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10 dark:text-zinc-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:var(--color-zinc-950)]/5 [--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)] dark:[--btn-icon:var(--color-zinc-500)] dark:data-active:[--btn-icon:var(--color-zinc-400)] dark:data-hover:[--btn-icon:var(--color-zinc-400)] px-[calc(--spacing(4)-1px)] sm:text-sm/6 cursor-default"
                  type="button"
                  data-headlessui-state
                >
                  <span
                    className="me-1 whitespace-nowrap text-[16px] sm:text-[14px]"
                    style={{
                      fontFamily: 'Poppins, "Poppins Fallback"',
                      fontWeight: 500,
                    }}
                  >
                    Start your search
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M17 17L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="pointer-events-none absolute right-0 bottom-0 h-[56%] w-full translate-y-0 lg:absolute lg:right-0 lg:bottom-0 lg:h-full lg:w-[54%] lg:translate-y-0 lg:block">
            <img
              src={heroRightImage}
              alt="hero"
              className="h-full w-full object-contain object-bottom lg:object-right-bottom"
            />
          </div>
        </div>
      </div>

      {/* Background Line */}
      <div className="absolute inset-10 hidden lg:block">
        <img
          src={backgroundLine}
          alt="background line"
          className="h-full w-full object-contain object-bottom-right"
        />
      </div>
    </section>
  );
}
