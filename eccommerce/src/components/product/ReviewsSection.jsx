import { useState, useRef, useEffect } from "react";

const REVIEWS = [
  {
    name: "S. Walkinshaw",
    avatar: "/src/assets/avatar1.webp",
    date: "May 16, 2025",
    rating: 5,
    text: [
      "I was really pleased with the overall shopping experience. My order even included a little personal, handwritten note, which delighted me!",
      "The product quality is amazing, it looks and feel even better than I had anticipated.",
    ],
  },
  {
    name: "Risako M",
    avatar: null,
    date: "May 16, 2025",
    rating: 4,
    text: [
      "The product quality is amazing, it looks and feel even better than I had anticipated.",
      "I like it better than a regular hoody because it is tailored to be a slimmer fit. Perfect for going out when you want to stay comfy. The head opening is a little tight which makes it a little.",
    ],
  },
  {
    name: "Eden Birch",
    avatar: null,
    date: "May 16, 2025",
    rating: 4,
    text: [
      "I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.",
      "The product quality is amazing!",
    ],
  },
  {
    name: "Jonathan Edwards",
    avatar: null,
    date: "May 16, 2025",
    rating: 5,
    text: [
      "I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.",
      "The product quality is amazing!",
    ],
  },
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
];

function StarIcon({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`${filled ? "text-yellow-400" : "text-gray-200"} size-5 shrink-0`}
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarRating({ rating, max = 5 }) {
  return (
    <div className="mt-0.5 flex text-yellow-500">
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

function ReviewCard({ review, colorIndex }) {
  const initial = review.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-4">
        <div className="shrink-0 pt-0.5">
          <div className="relative inline-flex shrink-0 items-center justify-center font-semibold text-neutral-100 uppercase shadow-inner rounded-full size-10 text-lg ring-1 ring-white dark:ring-neutral-900">
            {review.avatar ? (
              <img
                alt={review.name}
                loading="lazy"
                className="absolute inset-0 object-cover rounded-full"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src={review.avatar}
              />
            ) : (
              <div
                className={`absolute inset-0 rounded-full ${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]} flex items-center justify-center text-white font-semibold text-lg`}
              >
                {initial}
              </div>
            )}
            <span className="sr-only">{initial}</span>
          </div>
        </div>
        <div className="flex flex-1 justify-between">
          <div className="text-sm sm:text-base">
            <span className="block font-semibold">{review.name}</span>
            <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
              {review.date}
            </span>
          </div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      <div className="prose prose-sm mt-4 sm:prose sm:max-w-2xl dark:prose-invert">
        <div className="text-neutral-600 dark:text-neutral-300">
          {review.text.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Write a Review Modal ─── */
function WriteReviewModal({ isOpen, onClose }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else if (!isOpen && prevIsOpenRef.current) {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleSubmit = () => {
    onClose();
    setSelectedRating(0);
    setHoverRating(0);
    setReviewText("");
  };

  const handleCancel = () => {
    onClose();
    setSelectedRating(0);
    setHoverRating(0);
    setReviewText("");
  };

  const displayRating = hoverRating || selectedRating;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop — fade in/out 150ms */}
      <div
        className="absolute inset-0 bg-zinc-950/25"
        onClick={handleCancel}
        style={{
          transition: "opacity 150ms ease",
          opacity: isAnimating ? 1 : 0,
        }}
      />

      {/* Modal panel — slide up + fade on mobile, scale + fade on desktop */}
      <div
        className="relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-neutral-800 rounded-t-3xl sm:rounded-2xl shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10"
        style={{
          transition: "opacity 150ms, transform 150ms",
          transitionTimingFunction: isAnimating ? "ease-out" : "ease-in",
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating
            ? "translateY(0) scale(1)"
            : typeof window !== "undefined" && window.innerWidth >= 640
              ? "translateY(0) scale(0.95)"
              : "translateY(48px) scale(1)",
        }}
      >
        <div className="p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg/6 font-semibold text-balance text-zinc-950 sm:text-base/6 dark:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M12.5 3.00372C11.6049 2.99039 10.7047 3.01289 9.8294 3.07107C5.64639 3.34913 2.31441 6.72838 2.04024 10.9707C1.98659 11.8009 1.98659 12.6607 2.04024 13.4909C2.1401 15.036 2.82343 16.4666 3.62791 17.6746C4.09501 18.5203 3.78674 19.5758 3.30021 20.4978C2.94941 21.1626 2.77401 21.495 2.91484 21.7351C3.05568 21.9752 3.37026 21.9829 3.99943 21.9982C5.24367 22.0285 6.08268 21.6757 6.74868 21.1846C7.1264 20.9061 7.31527 20.7668 7.44544 20.7508C7.5756 20.7348 7.83177 20.8403 8.34401 21.0513C8.8044 21.2409 9.33896 21.3579 9.8294 21.3905C11.2536 21.4852 12.7435 21.4854 14.1706 21.3905C18.3536 21.1125 21.6856 17.7332 21.9598 13.4909C22.0021 12.836 22.011 12.1627 21.9866 11.5" />
              <path d="M8.5 15H15.5M8.5 10H12" />
              <path d="M15 5.5H22M18.5 2L18.5 9" />
            </svg>
            Write a review
          </h2>
          <p className="mt-2 text-pretty text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
            Your email address will not be published. Required fields are marked
            with an asterisk (*).
          </p>
          <div className="mt-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="cursor-pointer p-0 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setSelectedRating(star)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`size-6 transition-colors ${
                    star <= displayRating
                      ? "text-yellow-400"
                      : "text-gray-200 dark:text-neutral-600"
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ))}
          </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Your review <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none focus:ring-0 resize-y transition-colors"
              placeholder="Share your thoughts about this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ height: '160px' }}
            />
          </div>
          <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-full border border-transparent hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm"
            >
              Submit review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  return (
    <div>
      <div>
        <h2
          className="flex scroll-mt-8 items-center text-2xl font-semibold"
          id="reviews"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="mb-0.5 size-7"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-1.5">4.5 · 87 Reviews</span>
        </h2>
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
            {REVIEWS.map((review, idx) => (
              <ReviewCard key={review.name} review={review} colorIndex={idx} />
            ))}
          </div>
        </div>

        {/* Write a review button */}
        <button
          className="mt-10 relative isolate inline-flex items-center justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:outline-hidden border-transparent bg-zinc-900 text-white px-4 py-2.5 sm:px-6 sm:py-3 sm:text-sm/6 cursor-pointer hover:bg-zinc-800 transition-colors before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-zinc-900 before:shadow-sm after:absolute after:inset-0 after:-z-10 after:rounded-full dark:bg-zinc-600 dark:text-white dark:before:bg-zinc-600"
          type="button"
          onClick={() => setReviewModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
          >
            <path
              d="M12.5 3.00372C11.6049 2.99039 10.7047 3.01289 9.8294 3.07107C5.64639 3.34913 2.31441 6.72838 2.04024 10.9707C1.98659 11.8009 1.98659 12.6607 2.04024 13.4909C2.1401 15.036 2.82343 16.4666 3.62791 17.6746C4.09501 18.5203 3.78674 19.5758 3.30021 20.4978C2.94941 21.1626 2.77401 21.495 2.91484 21.7351C3.05568 21.9752 3.37026 21.9829 3.99943 21.9982C5.24367 22.0285 6.08268 21.6757 6.74868 21.1846C7.1264 20.9061 7.31527 20.7668 7.44544 20.7508C7.5756 20.7348 7.83177 20.8403 8.34401 21.0513C8.8044 21.2409 9.33896 21.3579 9.8294 21.3905C11.2536 21.4852 12.7435 21.4854 14.1706 21.3905C18.3536 21.1125 21.6856 17.7332 21.9598 13.4909C22.0021 12.836 22.011 12.1627 21.9866 11.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M8.5 15H15.5M8.5 10H12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M15 5.5H22M18.5 2L18.5 9"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          Write a review
        </button>
      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  );
}

