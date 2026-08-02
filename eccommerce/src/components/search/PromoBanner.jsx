import promoImage from "../../assets/promo3.webp";

export default function PromoBanner() {
  return (
    <section className="mt-24 lg:mt-36">
      <div className="relative rounded-3xl overflow-hidden" style={{ backgroundColor: "#f1f5f9" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text content */}
          <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 lg:py-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
              Earn free money<br />with Ciseco.
            </h2>
            <p className="mt-4 text-neutral-600 text-base sm:text-lg max-w-md" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
              With Ciseco you will get freeship &amp; savings combo.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
              >
                Savings combo
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 px-6 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors"
                style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
              >
                Discover more
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex items-end justify-center lg:justify-end">
            <img
              src={promoImage}
              alt="Promotional banner"
              className="w-full max-w-sm lg:max-w-md xl:max-w-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
