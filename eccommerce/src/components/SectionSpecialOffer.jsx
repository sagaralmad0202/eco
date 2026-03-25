import promo3Image from "../assets/promo3.webp";

const OFFER_POINTS = [
  { label: "Saving combos", color: "#FF7B61" },
  { label: "Free shipping", color: "#6BCB9B" },
  { label: "Premium magazines", color: "#C78BE0" },
];

export default function SectionSpecialOffer() {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] bg-[#F5F6F8] dark:bg-neutral-900"
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      <div className="absolute inset-x-0 top-0 h-[30px] bg-[#DDF2D2]" />

      <div className="relative grid min-h-[520px] gap-10 px-[24px] pt-[54px] pb-[24px] sm:px-[32px] lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:items-end lg:px-[56px] lg:pt-[64px] lg:pb-0 xl:px-[72px]">
        <div className="max-w-[420px] pb-4 lg:pb-[52px]">
          <h2
            className="max-w-[360px] text-[34px] font-semibold leading-[1.08] text-neutral-900 dark:text-white sm:text-[44px] lg:text-[48px]"
            style={{ fontFamily: 'Poppins, "Poppins Fallback"' }}
          >
            Don&apos;t miss out on special offers.
          </h2>

          <p
            className="mt-4 max-w-[320px] text-[15px] leading-6 text-neutral-500 dark:text-neutral-300"
            style={{ fontFamily: 'Poppins, "Poppins Fallback"' }}
          >
            Register to receive news about the latest savings combos, discount lists,
            and members-only picks.
          </p>

          <div className="mt-6 space-y-3">
            {OFFER_POINTS.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="inline-block h-[10px] w-[10px] rounded-[3px]"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className="text-[15px] text-neutral-700 dark:text-neutral-200"
                  style={{ fontFamily: 'Poppins, "Poppins Fallback"' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <form className="mt-8 max-w-[340px]" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="special-offer-email">
              Email address
            </label>
            <div className="flex items-center rounded-full bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:bg-neutral-800">
              <input
                id="special-offer-email"
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 border-none bg-transparent px-4 py-3 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                style={{ fontFamily: 'Poppins, "Poppins Fallback"' }}
              />
              <button
                type="submit"
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                aria-label="Submit email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 12H19" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="relative flex items-end justify-center lg:justify-end">
          <img
            src={promo3Image}
            alt="Special offers illustration"
            className="w-full max-w-[520px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
