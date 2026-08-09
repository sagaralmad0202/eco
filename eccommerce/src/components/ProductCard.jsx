import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { showAddedToCartToast } from "../utils/cartToast";

const ProductCard = ({ data, gridMode = false, onQuickView }) => {
  const [isLiked, setIsLiked] = useState(data.liked || false);
  const [cartQty, setCartQty] = useState(0);
  const { addToCart } = useCart();
  
  const slug = data.handle || data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, "-") : "");

  const notifyAddToCart = () => {
    const newQty = cartQty + 1;
    setCartQty(newQty);
    
    addToCart(data, 1, "Default", "M");
    showAddedToCartToast({
      product: data,
      quantity: newQty,
      color: "Beige",
      size: "L",
    });
  };

  return (
    <div 
      className={`product-card relative flex flex-col bg-transparent w-full`}
    >
      <Link className="absolute inset-0 z-0" to={`/products/${slug}`} aria-label={data.name} />
      <div className={`group relative z-1 mx-auto shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-800 ${gridMode ? "w-full" : "w-full"}`}>
        <Link to={`/products/${slug}`} className="block aspect-[11/12] w-full">
          <img
            src={data.image}
            className="object-cover w-full h-full drop-shadow-xl"
            alt={data.name || "product"}
          />
        </Link>
        {data.badge !== false && data.badge !== null && (
        <div className="nc-shadow-lg rounded-full flex items-center justify-center absolute top-[12px] start-[12px] px-[10px] py-[6px] text-[12px] bg-white dark:bg-neutral-900 text-neutral-700 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="w-[14px] h-[14px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          <span className="ms-[4px] leading-none">{data.badge || "New in"}</span>
        </div>
        )}
        <button 
          onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
          className="flex w-[36px] h-[36px] items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg dark:bg-neutral-900 dark:text-neutral-200 absolute top-[12px] end-[12px] z-10"
        >
          <svg className={`w-[20px] h-[20px] ${isLiked ? "text-red-500" : ""}`} viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <div className="invisible absolute inset-x-[4px] bottom-0 flex justify-center gap-[6px] opacity-0 transition-all group-hover:visible group-hover:bottom-[16px] group-hover:opacity-100">
          <button 
            onClick={(e) => { e.preventDefault(); notifyAddToCart(); }}
            className="flex cursor-pointer items-center justify-center gap-[8px] rounded-full bg-neutral-900 px-[16px] h-[34px] text-[12px] leading-normal text-white shadow-lg hover:bg-neutral-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="-ml-[4px] w-[14px] h-[14px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>Add to bag</span>
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); if (onQuickView) onQuickView(data); }} className="flex cursor-pointer items-center justify-center gap-[8px] rounded-full bg-white px-[16px] h-[34px] text-[12px] leading-normal text-neutral-950 shadow-lg hover:bg-neutral-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="-ml-[4px] w-[14px] h-[14px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span>Quick view</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-[16px] px-[10px] pt-[20px] pb-[10px]">
        <div className="flex gap-[8px]">
          {(data.colors || ['rgb(245, 245, 220)', 'rgb(0, 0, 128)', 'rgb(128, 128, 0)']).map((color, idx) => (
            <div 
              key={idx} 
              className="relative w-[16px] h-[16px] cursor-pointer overflow-hidden rounded-full"
            >
              <div 
                className="absolute inset-0 z-0 rounded-full bg-cover ring-1 ring-neutral-900/20 dark:ring-white/20" 
                style={{ backgroundColor: color }}
              ></div>
            </div>
          ))}
        </div>

        <div style={{ height: "48px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", textAlign: "left" }}>
          <h2 
            className="nc-ProductCard__title font-semibold transition-colors"
            style={{ color: "var(--text-main)", fontSize: "16px", lineHeight: "24px", fontFamily: 'Poppins, sans-serif', margin: "0px", padding: "0px", textAlign: "left" }}
          >
            <Link to={`/products/${slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>
              {data.name}
            </Link>
          </h2>
          <p 
            style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "20px", fontFamily: 'Poppins, sans-serif', margin: "4px 0 0 0", padding: "0px", textAlign: "left" }}
          >
            {data.desc}
          </p>
        </div>
        
        <div 
          className={`flex items-end justify-between mt-[16px]`}
          style={{ height: "29.2px" }}
        >
          <div style={{ width: "76.45px", height: "29.2px" }}>
            <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-green-500 text-[14px] font-medium text-green-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="leading-none">${data.price}</span>
            </div>
          </div>
          <div 
            className="flex items-center text-neutral-500 dark:text-neutral-400 text-[14px] leading-none whitespace-nowrap"
            style={{ height: "16px", fontFamily: 'Poppins, sans-serif' }}
          >
            <svg className="w-[16px] h-[16px] text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="ms-[4px]">{data.rating} ({data.reviews} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
