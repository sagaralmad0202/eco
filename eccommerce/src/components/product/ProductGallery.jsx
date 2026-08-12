import p1Asset from "../../assets/p1.webp";
import p1_3Asset from "../../assets/p1.3.webp";
import p1_2Asset from "../../assets/p1-2.webp";
import p1_3DashAsset from "../../assets/p1-3.webp";
import useWishlistToggle from "../../hooks/useWishlistToggle";

const defaultProductImages = [
  p1Asset,
  p1Asset,
  p1_3Asset,
  p1_2Asset,
  p1_3DashAsset,
];

export default function ProductGallery({
  images = defaultProductImages,
  product,
}) {
  const { isLiked, isPending, toggle } = useWishlistToggle(product);

  // Ensure images array is not empty and has valid image
  const galleryImages =
    images && images.length > 0 ? images : defaultProductImages;

  return (
    <div className="relative">
      <div>
        {/* Main/Hero Image */}
        <div className="relative">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <img
              alt="Product"
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300 hover:brightness-95"
              src={galleryImages[0]}
            />
          </div>
        </div>

        {/* 2×2 Grid of secondary images */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6">
          {galleryImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
            >
              <img
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300 hover:brightness-95"
                src={img}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Wishlist Heart Button */}
      <button
        onClick={() => void toggle()}
        disabled={isPending}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg dark:bg-neutral-900 dark:text-neutral-200 absolute top-3 left-3"
        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isLiked}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
            stroke="currentColor"
            fill={isLiked ? "currentColor" : "none"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
