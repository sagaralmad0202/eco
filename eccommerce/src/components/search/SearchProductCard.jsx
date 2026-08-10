import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";

export default function SearchProductCard({ data, onQuickView, onCartUpdate }) {
  const [isLiked, setIsLiked] = useState(data.liked || false);
  const { addToCart } = useCart();

  const productId = data.id || data.productId || data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, "-") : "");

  const notifyAddToCart = () => {
    if (onCartUpdate) onCartUpdate(1);
    addToCart(data, 1, "Default", "M");

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-[slideInRight_0.3s_ease-out_forwards]" : "animate-[slideOutRight_0.3s_ease-in_forwards]"
          } pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-left text-neutral-900 shadow-lg ring-1 ring-black/5`}
          style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }}
        >
          <p className="mt-1 block text-base leading-none font-semibold">Added to cart!</p>
          <div className="mt-6 flex">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
              <img
                src={data.image}
                alt={data.name}
                className="h-full w-full object-contain object-center"
              />
            </div>
            <div className="ml-4 flex flex-1 flex-col">
              <div className="flex justify-between">
                <div className="text-left">
                  <h3 className="text-base font-medium">{data.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{data.desc}</p>
                </div>
                <div className="mt-0.5">
                  <div className="flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1.5 text-sm font-medium leading-none text-green-500">
                    ${data.price}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { duration: 3000, position: "top-right", id: String(data.id) }
    );
  };

  return (
    <div className="product-card relative flex flex-col bg-transparent w-full">
      <Link className="absolute inset-0 z-[1]" to={`/products/${productId}`} aria-label={data.name} />
      <div className="group relative z-[2] mx-auto shrink-0 overflow-hidden rounded-3xl bg-neutral-50 w-full">
        <Link to={`/products/${productId}`} className="block aspect-[11/12] w-full">
          <img
            src={data.image}
            className="object-cover w-full h-full drop-shadow-xl"
            alt={data.name}
          />
        </Link>
        {/* Badge */}
        {data.badge && (
          <div className="rounded-full flex items-center justify-center absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white text-neutral-700 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="ms-1 leading-none">{data.badge}</span>
          </div>
        )}
        {/* Heart button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLiked(!isLiked); }}
          className="flex w-9 h-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm absolute top-3 end-3 z-10 hover:scale-110 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg className={`w-5 h-5 ${isLiked ? "text-red-500" : ""}`} viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Hover actions */}
        <div className="invisible absolute inset-x-1 bottom-0 flex justify-center gap-1.5 opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); notifyAddToCart(); }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 h-[34px] text-xs leading-normal text-white shadow-lg hover:bg-neutral-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="-ml-1 w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>Add to bag</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onQuickView) onQuickView(data); }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 h-[34px] text-xs leading-normal text-neutral-950 shadow-lg hover:bg-neutral-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="-ml-1 w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span>Quick view</span>
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-4 px-2.5 pt-5 pb-2.5">
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
          <h2
            className="font-semibold transition-colors text-neutral-900"
            style={{ fontSize: "16px", lineHeight: "24px", fontFamily: 'Poppins, sans-serif' }}
          >
            <Link to={`/products/${productId}`} className="hover:text-primary-600 transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>
              {data.name}
            </Link>
          </h2>
          <p
            className="text-neutral-500"
            style={{ fontSize: "14px", lineHeight: "20px", fontFamily: 'Poppins, sans-serif', marginTop: "4px" }}
          >
            {data.desc}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1.5 text-sm font-medium text-green-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="leading-none">${data.price}</span>
            </div>
          </div>
          <div className="flex items-center text-neutral-500 text-sm leading-none whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="ms-1">{data.rating} ({data.reviews} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
