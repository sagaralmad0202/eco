import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import profileImage from "../assets/avatar1.webp";
import leatherToteImage from "../assets/p1.webp";
import silkDressImage from "../assets/p2.webp";
import denimJacketImage from "../assets/p3.webp";
import cashmereSweaterImage from "../assets/p4.webp";
import linenBlazerImage from "../assets/p5.webp";
import velvetSkirtImage from "../assets/p6.webp";

const tabs = ["Settings", "Wishlists", "Orders history", "Change password", "Billing"];

const tabRoutes = {
  Settings: "/account",
  Wishlists: "/account-wishlists",
  "Orders history": "/orders",
  "Change password": "/account-password",
  Billing: "/account-billing",
};

const fieldTextStyle = {
  fontFamily: '"Poppins", "Poppins Fallback", sans-serif',
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "24px",
  letterSpacing: "0px",
};

const genderOptions = ["Male", "Female", "Other"];

const wishlistProducts = [
  {
    id: 1,
    name: "Leather Tote Bag",
    handle: "leather-tote-bag",
    variant: "Pink Yarrow",
    price: "85.00",
    rating: "4.5",
    reviews: 87,
    image: leatherToteImage,
    colors: ["#000000", "#7B4214", "#C6BDB5", "#F2D8CB"],
  },
  {
    id: 2,
    name: "Silk Midi Dress",
    handle: "silk-midi-dress",
    variant: "Emerald Green",
    price: "120.00",
    rating: "4.7",
    reviews: 95,
    image: silkDressImage,
    colors: ["#3B9668", "#9ED414", "#060A82", "#FF7E47"],
  },
  {
    id: 3,
    name: "Denim Jacket",
    handle: "denim-jacket",
    variant: "Light Blue",
    price: "65.00",
    rating: "4.3",
    reviews: 120,
    image: denimJacketImage,
    colors: ["#ADD8E6", "#00008B", "#000000"],
  },
  {
    id: 4,
    name: "Cashmere Sweater",
    handle: "cashmere-sweater",
    variant: "Cream",
    price: "150.00",
    rating: "4.8",
    reviews: 75,
    image: cashmereSweaterImage,
    colors: ["#3B474E", "#FC9FAF", "#811428"],
  },
  {
    id: 5,
    name: "Linen Blazer",
    handle: "linen-blazer",
    variant: "Beige",
    price: "95.00",
    rating: "4.4",
    reviews: 60,
    image: linenBlazerImage,
    colors: ["#F5F5DC", "#000080", "#808000"],
  },
  {
    id: 6,
    name: "Velvet Skirt",
    handle: "velvet-skirt",
    variant: "Wine Red",
    price: "55.00",
    rating: "4.2",
    reviews: 45,
    image: velvetSkirtImage,
    colors: ["#191970", "#722F37", "#50C878"],
  },
];

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      color="currentColor"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M14 15.5L15.521 13.979C16.3523 13.1477 17.7007 13.1477 18.532 13.979L21 16.447"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 2.5C7.77027 2.5 5.6554 2.5 4.25276 3.69797C4.05358 3.86808 3.86808 4.05358 3.69797 4.25276C2.5 5.6554 2.5 7.77027 2.5 12C2.5 16.2297 2.5 18.3446 3.69797 19.7472C3.86808 19.9464 4.05358 20.1319 4.25276 20.302C5.6554 21.5 7.77027 21.5 12 21.5C16.2297 21.5 18.3446 21.5 19.7472 20.302C19.9464 20.1319 20.1319 19.9464 20.302 19.7472C21.5 18.3446 21.5 16.2297 21.5 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M21.5 6H18M18 6H14.5M18 6V2.5M18 6V9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FieldIcon({ type }) {
  if (type === "mail") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        color="currentColor"
        data-slot="icon"
        aria-hidden="true"
      >
        <path
          d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01577 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        color="currentColor"
        data-slot="icon"
        aria-hidden="true"
      >
        <path
          d="M16 2V6M8 2V6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M3 10H21"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M10 18.5002L9.99999 13.8474C9.99999 13.6557 9.86325 13.5002 9.69458 13.5002H9M14 18.4983L15.4855 13.8923C15.4951 13.8626 15.5 13.8315 15.5 13.8002C15.5 13.6346 15.3657 13.5002 15.2 13.5002L13 13.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        color="currentColor"
        data-slot="icon"
        aria-hidden="true"
      >
        <path
          d="M22 10V9.21749C22 7.27787 22 6.30807 21.4142 5.7055C20.8284 5.10294 19.8856 5.10294 18 5.10294H15.9214C15.004 5.10294 14.9964 5.10116 14.1715 4.68834L10.8399 3.02114C9.44884 2.32504 8.75332 1.97699 8.01238 2.00118C7.27143 2.02537 6.59877 2.41808 5.25345 3.20351L4.02558 3.92037C3.03739 4.49729 2.54329 4.78576 2.27164 5.26564C2 5.74553 2 6.32993 2 7.49873V15.7157C2 17.2514 2 18.0193 2.34226 18.4467C2.57001 18.731 2.88916 18.9222 3.24226 18.9856C3.77226 19.0808 4.42148 18.7018 5.71987 17.9437C6.60156 17.429 7.45011 16.8944 8.50487 17.0394C9.38869 17.1608 10.21 17.7185 11 18.1138"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d="M8 2L8 17" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <path
          d="M15 5V9.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M18.3083 21.6835C18.0915 21.8865 17.8017 22 17.5001 22C17.1985 22 16.9087 21.8865 16.6919 21.6835C14.7063 19.813 12.0455 17.7235 13.3431 14.6898C14.0447 13.0496 15.7289 12 17.5001 12C19.2713 12 20.9555 13.0496 21.6571 14.6898C22.9531 17.7196 20.2988 19.8194 18.3083 21.6835Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M17.5 16.5H17.509"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        color="currentColor"
        data-slot="icon"
        aria-hidden="true"
      >
        <path
          d="M12 19H12.01"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M13.5 2H10.5C8.14298 2 6.96447 2 6.23223 2.73223C5.5 3.46447 5.5 4.64298 5.5 7V17C5.5 19.357 5.5 20.5355 6.23223 21.2678C6.96447 22 8.14298 22 10.5 22H13.5C15.857 22 17.0355 22 17.7678 21.2678C18.5 20.5355 18.5 19.357 18.5 17V7C18.5 4.64298 18.5 3.46447 17.7678 2.73223C17.0355 2 15.857 2 13.5 2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return null;
}

function TextInput({
  label,
  icon,
  fieldClassName = "",
  controlHeightClass = "h-11",
  iconLeftClass = "left-[13px]",
  iconPaddingClass = "pl-[44px]",
  inputWidthClass = "flex-1",
  inputHeightClass = "h-full",
  style,
  ...props
}) {
  return (
    <label className={`block text-left ${fieldClassName}`}>
      <span className="block text-sm/6 font-medium text-neutral-950 select-none dark:text-white">{label}</span>
      <div className={`relative mt-2 flex ${controlHeightClass} items-center rounded-full border border-neutral-950/10 bg-white text-neutral-500 shadow-sm transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#3b82f6] dark:border-white/10 dark:bg-white/5 dark:text-neutral-400`}>
        {icon ? <span className={`pointer-events-none absolute ${iconLeftClass} top-1/2 shrink-0 -translate-y-1/2`}>{icon}</span> : null}
        <input
          className={`${inputWidthClass} ${inputHeightClass} min-w-0 appearance-none rounded-full border-0 bg-transparent py-[9px] pr-[13px] text-base/6 text-neutral-950 outline-none placeholder:text-neutral-500 focus:ring-0 sm:text-sm/6 dark:text-white ${
            icon ? iconPaddingClass : "pl-[13px]"
          }`}
          style={{ ...fieldTextStyle, ...style }}
          {...props}
        />
      </div>
    </label>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-8 text-left dark:border-neutral-700">
      <h2 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  );
}

function GenderDropdown() {
  const [selectedGender, setSelectedGender] = useState("Male");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <label className="block text-left">
      <span className="block text-sm/6 font-medium text-neutral-950 select-none dark:text-white">Gender</span>
      <div ref={dropdownRef} className="relative mt-2">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className="flex h-11 w-full items-center justify-between rounded-full border border-neutral-950/10 bg-white px-[13px] py-[9px] text-left text-neutral-950 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-inset focus:ring-[#3b82f6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          style={fieldTextStyle}
        >
          <span>{selectedGender}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-neutral-500"
          >
            <path d="M5 6.5L8 3.5L11 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M5 9.5L8 12.5L11 9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>

        {isOpen ? (
          <div
            role="listbox"
            aria-label="Gender"
            className="absolute left-0 right-0 top-full z-30 border border-[#767676] bg-white text-neutral-950 shadow-none"
            style={fieldTextStyle}
          >
            {genderOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === selectedGender}
                onClick={() => {
                  setSelectedGender(option);
                  setIsOpen(false);
                }}
                className={`block h-9 w-full px-[13px] text-left ${
                  option === selectedGender ? "bg-[#256ed2] text-white" : "bg-white text-neutral-950 hover:bg-[#256ed2] hover:text-white"
                }`}
                style={fieldTextStyle}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}

        <input type="hidden" name="gender" value={selectedGender} />
      </div>
    </label>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-5 w-5 pb-px text-amber-400"
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.965 2.033-1.96 1.425L12 18.354l-4.626 2.825c-.996.608-2.232-.29-1.961-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.005Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      data-slot="icon"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WishlistProductCard({ product }) {
  return (
    <div className="product-card relative flex flex-col bg-transparent">
      <a
        className="absolute inset-0 z-10"
        href={`/products/${product.handle}`}
        aria-label={product.name}
      />

      <div className="group relative z-0 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
        <div className="relative aspect-[11/12] w-full">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-4 px-2.5 pt-5">
        <div className="flex gap-x-2">
          {product.colors.map((color) => (
            <span
              key={color}
              className="relative size-4 cursor-pointer overflow-hidden rounded-full"
              aria-label={color}
              role="img"
            >
              <span
                className="absolute inset-0 z-0 rounded-full bg-cover ring-1 ring-neutral-900/20 dark:ring-white/20"
                style={{ backgroundColor: color }}
              />
            </span>
          ))}
        </div>

        <div className="text-left">
          <h2 className="nc-ProductCard__title text-base font-semibold text-neutral-900 transition-colors dark:text-neutral-100">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {product.variant}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center rounded-lg border-2 border-green-500 px-2 py-1 text-sm font-medium md:px-2.5 md:py-1.5">
            <span className="leading-none text-green-500">${product.price}</span>
          </div>
          <div className="mb-0.5 flex items-center">
            <StarIcon />
            <span className="ms-1 text-sm text-neutral-500 dark:text-neutral-400">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WishlistPanel() {
  return (
    <div className="flex flex-col gap-y-10 text-left sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Wishlists</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Check out your wishlists. You can add or remove items from your wishlists.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
        {wishlistProducts.map((product) => (
          <WishlistProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center sm:mt-2">
        <button
          type="button"
          className="relative isolate inline-flex h-[46px] items-center justify-center gap-x-2 rounded-full border border-transparent bg-neutral-900 px-[23px] text-sm/6 font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <span className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <span>Show me more</span>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

export default function Account({ initialTab = "Settings" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="nc-AccountPage min-h-screen bg-white font-[Poppins] text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header height="79.2px" />
      </div>

      <main className="container">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-4xl">
            <section className="max-w-2xl text-left">
              <h1 className="text-3xl font-semibold xl:text-4xl">
                Account
              </h1>
              <span className="mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
                <span className="font-semibold text-neutral-950 dark:text-neutral-50">Enrico Cole</span>
                {", ciseco@gmail.com "}
                <span className="text-neutral-400 dark:text-neutral-500">.</span>
                {" Los Angeles, CA"}
              </span>
            </section>

            <hr className="mt-10 w-full border-t border-neutral-200 dark:border-neutral-800" />

            <div>
              <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
                {tabs.map((tab) => (
                  <a
                    key={tab}
                    href={tabRoutes[tab]}
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveTab(tab);
                      if (tab === "Settings" || tab === "Wishlists") {
                        navigate(tabRoutes[tab]);
                      }
                    }}
                    className={`block shrink-0 border-b-2 py-5 text-sm sm:text-base md:py-8 ${
                      activeTab === tab
                        ? "border-[#0ea5e9] font-medium text-neutral-950 dark:text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
                    }`}
                  >
                    {tab}
                  </a>
                ))}
              </div>
            </div>

            <hr className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
        </div>

        <div className={`mx-auto max-w-4xl pt-14 sm:pt-16 ${activeTab === "Settings" ? "pb-40" : "pb-24 lg:pb-32"}`}>
          {activeTab === "Settings" ? (
            <form className="text-left">
              <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-200">
                Account information
              </h1>

              <div className="mt-16 flex flex-col gap-10 md:flex-row md:items-start md:gap-20">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full">
                  <img src={profileImage} alt="Enrico Cole" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50">
                      <CameraIcon />
                      <span className="mt-1 text-xs">Change Image</span>
                  </div>
                  <input
                    aria-label="Choose File"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    type="file"
                    name="avatar"
                  />
                </div>

                <div className="w-full space-y-8">
                  <TextInput label="Full name" type="text" defaultValue="Enrico Cole" />
                  <TextInput
                    label="Email"
                    type="email"
                    defaultValue="example@email.com"
                    style={{ color: "#6b7280" }}
                    icon={<FieldIcon type="mail" />}
                  />
                  <TextInput
                    label="Date of birth"
                    type="date"
                    name="date-of-birth"
                    defaultValue="1990-07-22"
                    fieldClassName="w-[512px] max-w-full"
                    controlHeightClass="h-[43.6px]"
                    inputWidthClass="w-[512px] shrink-0"
                    inputHeightClass="h-[43.6px]"
                    icon={<FieldIcon type="calendar" />}
                  />
                  <TextInput
                    label="Address"
                    type="text"
                    defaultValue="Los Angeles, CA"
                    icon={<FieldIcon type="location" />}
                  />

                  <GenderDropdown />

                  <TextInput
                    label="Phone number"
                    type="tel"
                    defaultValue="003 888 232"
                    iconLeftClass="left-[17px]"
                    iconPaddingClass="pl-[42px]"
                    icon={<FieldIcon type="phone" />}
                  />

                  <label className="block text-left">
                    <span className="block text-sm/6 font-medium text-neutral-950 select-none dark:text-white">About you</span>
                    <textarea
                      rows="5"
                      defaultValue="Hello, this is my account profile. I love clean fashion, simple products, and fast checkout experiences."
                      className="mt-2 w-full resize-none rounded-3xl border border-neutral-950/10 bg-white px-[13px] py-[9px] text-base/6 text-neutral-950 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-inset focus:ring-[#3b82f6] sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      style={fieldTextStyle}
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-[46px] w-[160.24px] items-center justify-center rounded-full bg-neutral-900 px-[16px] py-[11px] text-sm/6 font-medium whitespace-nowrap text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                  >
                    Update account
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          {activeTab === "Wishlists" ? (
            <WishlistPanel />
          ) : null}

          {activeTab === "Orders history" ? (
            <PlaceholderPanel
              title="Orders history"
              description="Recent orders, delivery status, and purchase details will appear here."
            />
          ) : null}

          {activeTab === "Change password" ? (
            <PlaceholderPanel
              title="Change password"
              description="Password update controls will appear here."
            />
          ) : null}

          {activeTab === "Billing" ? (
            <PlaceholderPanel
              title="Billing"
              description="Saved payment methods, billing addresses, and invoices will appear here."
            />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
