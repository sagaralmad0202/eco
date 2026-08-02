import { useState, useRef, useEffect } from "react";
import p1Asset from "../../assets/p1.webp";
import p2Asset from "../../assets/p2.webp";
import p3Asset from "../../assets/p3.webp";
import p4Asset from "../../assets/p4.webp";
import p5Asset from "../../assets/p5.webp";

const FEATURED = [
  { id: 1, name: "Leather Tote Bag", desc: "Pink Yarrow", price: "85.00", rating: 4.5, reviews: 87, image: p1Asset },
  { id: 2, name: "Silk Midi Dress", desc: "Emerald Green", price: "120.00", rating: 4.7, reviews: 95, image: p2Asset },
  { id: 3, name: "Denim Jacket", desc: "Light Blue", price: "65.00", rating: 4.3, reviews: 120, image: p3Asset },
  { id: 4, name: "Cashmere Sweater", desc: "Cream", price: "150.00", rating: 4.8, reviews: 75, image: p4Asset },
  { id: 5, name: "Linen Blazer", desc: "Beige", price: "95.00", rating: 4.4, reviews: 60, image: p5Asset },
];

export default function FeaturedProducts() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => { if (el) el.removeEventListener("scroll", updateScrollState); };
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="mt-24 lg:mt-36">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
            Chosen by experts.
          </h2>
          <span className="block mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-500" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
            Featured of the week
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              canScrollLeft ? "hover:bg-neutral-100 text-neutral-700" : "text-neutral-300 cursor-not-allowed"
            }`}
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              canScrollRight ? "hover:bg-neutral-100 text-neutral-700" : "text-neutral-300 cursor-not-allowed"
            }`}
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="hidden-scrollbar flex gap-6 overflow-x-auto pb-4"
      >
        {FEATURED.map((item) => (
          <div key={item.id} className="shrink-0 w-[280px] sm:w-[300px]">
            <div className="rounded-3xl overflow-hidden bg-neutral-50 aspect-[11/12]">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 text-left">
              <h3 className="font-semibold text-neutral-900" style={{ fontFamily: 'Poppins, sans-serif', fontSize: "16px" }}>{item.name}</h3>
              <p className="text-sm text-neutral-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1.5 text-sm font-medium text-green-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ${item.price}
                </div>
                <div className="flex items-center text-neutral-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="ms-1">{item.rating} ({item.reviews})</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Show me more card */}
        <div className="shrink-0 w-[280px] sm:w-[300px]">
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[11/12] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-neutral-200 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-neutral-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <span className="text-sm font-medium text-neutral-600" style={{ fontFamily: 'Poppins, sans-serif' }}>Show me more</span>
          </div>
        </div>
      </div>
    </section>
  );
}
