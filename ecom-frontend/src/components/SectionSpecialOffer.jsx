import backgroundLineSvg from "../assets/BackgroundLine.svg";
import promo3Image from "../assets/promo3.webp";

const OFFER_POINTS = [
  { id: "01", label: "Savings combos", color: "#A35DE2", background: "#F1E2FF" },
  { id: "02", label: "Freeship", color: "#2FA96B", background: "#DDF5E7" },
  { id: "03", label: "Premium magazines", color: "#E26B76", background: "#FFE2E6" },
];

const fontBase = 'Poppins, "Poppins Fallback", sans-serif';

export default function SectionSpecialOffer() {
  return (
    <section
      className="xl:pt-10 2xl:pt-24"
      style={{ maxWidth: "1456.8px", width: "100%", margin: "0 auto" }}
    >
      <div className="relative flex flex-col rounded-2xl bg-[#F9FAFB] p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:p-14 xl:min-h-[670px] xl:px-20 xl:py-24 2xl:py-32">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 xl:inset-10 overflow-hidden rounded-[inherit]">
          <img
            src={backgroundLineSvg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain object-bottom dark:opacity-5"
          />
        </div>

        {/* Text content */}
        <div className="relative z-10 max-w-lg text-left lg:w-1/2">
          <h2
            className="text-4xl leading-[1.15] font-semibold text-[#111827] md:text-5xl"
            style={{
              fontFamily: fontBase,
              margin: 0,
              letterSpacing: "normal",
            }}
          >
            Don&apos;t miss out{" "}
            <br className="block sm:hidden" />
            on{" "}
            <br className="block sm:hidden" />
            special offers.
          </h2>

          <p
            className="mt-7"
            style={{
              fontFamily: fontBase,
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#6B7280",
              marginTop: "28px",
            }}
          >
            Register to receive news about the latest,
            <br />
            savings combos, discount codes.
          </p>

          <ul className="mt-10 flex flex-col gap-y-4">
            {OFFER_POINTS.map((item) => (
              <li key={item.label} className="flex items-center gap-x-4">
                <span
                  style={{
                    fontFamily: fontBase,
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: "20px",
                    color: item.color,
                    backgroundColor: item.background,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    padding: "2px 6px",
                  }}
                >
                  {item.id}
                </span>
                <span
                  style={{
                    fontFamily: fontBase,
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    color: "#374151",
                  }}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <form
            className="relative mt-10 max-w-sm"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="special-offer-email">
              Email address
            </label>
            <input
              id="special-offer-email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-full border border-neutral-200 outline-none transition placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              style={{
                fontFamily: fontBase,
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "24px",
                color: "#09090B",
                padding: "9px 13px",
                paddingRight: "48px",
                backgroundColor: "transparent",
              }}
            />

            <button
              type="submit"
              className="absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900 text-neutral-50 transition-colors hover:bg-neutral-800"
              style={{
                width: "36px",
                height: "36px",
                right: "4px",
                padding: 0,
              }}
              aria-label="Submit email"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12H19" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>

        {/* Promo image */}
        <div className="relative mt-10 block lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:max-w-[calc(50%-40px)]">
          <img
            src={promo3Image}
            alt="Special offers illustration"
            className="pointer-events-none relative z-10 mx-auto h-auto w-full max-w-[280px] select-none object-contain sm:max-w-sm lg:mx-0 lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
