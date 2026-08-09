import promoKidImage from "../../assets/promo2.webp";

export default function PromoBanner() {
  return (
    <section className="container mx-auto px-4 sm:px-8 my-20 lg:my-28">
      <div
        className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-[#fcf8e3] dark:bg-yellow-950/20"
        style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
      >
        {/* Decorative colored dots */}
        <div className="absolute top-14 right-1/3 w-4 h-4 rounded-full bg-[#34d399] opacity-80 pointer-events-none hidden sm:block" />
        <div className="absolute bottom-16 left-12 w-3 h-3 rounded-full bg-[#fb7185] opacity-80 pointer-events-none hidden sm:block" />
        <div className="absolute bottom-16 right-16 w-3.5 h-3.5 rounded-full bg-[#fbbf24] opacity-90 pointer-events-none hidden sm:block" />

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 min-h-[420px]">
          {/* Left: Kid image with skateboard */}
          <div className="relative flex items-end justify-center pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-8 lg:px-12">
            <img
              src={promoKidImage}
              alt="Special offer in kids products"
              className="w-full max-w-md sm:max-w-lg lg:max-w-xl object-contain drop-shadow-md select-none"
            />
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center px-6 pb-12 pt-0 sm:px-10 lg:py-16 lg:pr-16 text-left">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                <svg className="w-6 h-6 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                </svg>
                <span>eco.</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.15]">
              Special offer <br />
              in kids products
            </h2>

            {/* Description */}
            <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-md leading-relaxed">
              Fashion is a form of self-expression and autonomy at a particular period and place.
            </p>

            {/* Action button */}
            <div className="mt-8">
              <a
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 text-white px-7 py-3 text-sm font-medium hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
              >
                Discover more
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
