import heroRightImage from "../assets/hero-right-4.webp";
import backgroundLine from "../assets/BackgroundLine.svg";

export default function HeroSection() {
  return (
    <section className="relative text-left">
      <div className="container mx-auto">
        <div className="relative mx-auto h-[637.35px] w-[1456.6px] max-w-full overflow-hidden rounded-2xl bg-[#F7F0EA]">
          <div className="relative inset-x-0 top-1/10 z-1 h-[325.2px] px-8 pt-8 sm:top-1/5 lg:absolute lg:pt-0">
            <div className="flex h-[325.2px] w-[672px] max-w-lg flex-col items-start xl:max-w-2xl">
              <span
                className="font-semibold"
                style={{
                  fontFamily: 'Poppins, "Poppins Fallback"',
                  fontSize: "20px",
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "#111827",
                }}
              >
                In this season, find the best {"\u{1F525}"}
              </span>
              <h2
                className="font-bold text-neutral-950"
                style={{
                  fontSize: "72px",
                  lineHeight: 1.15,
                  fontWeight: 700,
                  fontFamily: 'Poppins, "Poppins Fallback"',
                  color: "lab(2.75381% 0 0)",
                  marginTop: "88px",
                }}
              >
                Sports equipment collection.
              </h2>
              <div className="mt-[110px] sm:mt-[120px]">
                <button className="relative isolate inline-flex h-[46px] w-[203px] items-center justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 data-disabled:opacity-50 *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center *:data-[slot=icon]:text-(--btn-icon) sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText] border-transparent bg-(--btn-border) dark:bg-(--btn-bg) before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-(--btn-bg) before:shadow-sm dark:before:hidden dark:border-white/5 after:absolute after:inset-0 after:-z-10 after:rounded-full after:shadow-[shadow:inset_0_1px_--theme(--color-white/15%)] data-active:after:bg-(--btn-hover-overlay) data-hover:after:bg-(--btn-hover-overlay) dark:after:-inset-px dark:after:rounded-full data-disabled:before:shadow-none data-disabled:after:shadow-none text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10 dark:text-zinc-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:var(--color-zinc-950)]/5 [--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)] dark:[--btn-icon:var(--color-zinc-500)] dark:data-active:[--btn-icon:var(--color-zinc-400)] dark:data-hover:[--btn-icon:var(--color-zinc-400)] px-[calc(--spacing(4)-1px)] sm:text-sm/6 cursor-default" type="button" data-headlessui-state >
                
                <span className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden" aria-hidden="true">
                </span>
                <span
                  className="me-1 whitespace-nowrap"
                  style={{
                    fontFamily: 'Poppins, "Poppins Fallback"',
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#FFFFFF",
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
  <path
    d="M17 17L21 21"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>

                </button>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-[54%] lg:block">
            <img
              src={heroRightImage}
              alt="hero"
              className="h-full w-full object-contain object-bottom-right"
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-10">
         <img
              src={backgroundLine}
              alt="background line"
              className="h-full w-full object-contain object-bottom-right"
            />

      </div>
    </section>
  );
}
