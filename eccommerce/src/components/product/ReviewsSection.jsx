import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectUser, selectIsAuthenticated } from "../../redux/slices/authSlice";
import reviewApi from "../../services/reviewApi";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-indigo-500",
];

function StarIcon({ filled, className = "size-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`${filled ? "text-yellow-400" : "text-gray-200 dark:text-neutral-600"} ${className} shrink-0`}
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

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ReviewCard({ review, colorIndex, currentUserId, onEdit, onDelete }) {
  const author = review.user;
  const authorName = author?.fullName || "Verified Buyer";
  const initial = authorName.charAt(0).toUpperCase() || "U";
  const formattedDate = formatDate(review.updatedAt || review.createdAt);
  const isOwner = currentUserId && author?.id && currentUserId === author.id;

  // Split multi-line comments into paragraphs
  const paragraphs = review.comment
    ? review.comment.split("\n").filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-4">
        <div className="shrink-0 pt-0.5">
          <div className="relative inline-flex shrink-0 items-center justify-center font-semibold text-neutral-100 uppercase shadow-inner rounded-full size-10 text-lg ring-1 ring-white dark:ring-neutral-900">
            {author?.avatarUrl ? (
              <img
                alt={authorName}
                loading="lazy"
                className="absolute inset-0 object-cover rounded-full size-full"
                src={author.avatarUrl}
              />
            ) : (
              <div
                className={`absolute inset-0 rounded-full ${
                  AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
                } flex items-center justify-center text-white font-semibold text-lg`}
              >
                {initial}
              </div>
            )}
            <span className="sr-only">{initial}</span>
          </div>
        </div>
        <div className="flex flex-1 justify-between items-start">
          <div className="text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="block font-semibold">{authorName}</span>
              {isOwner && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  You
                </span>
              )}
            </div>
            {formattedDate && (
              <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
                {formattedDate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            {isOwner && (
              <div className="flex items-center gap-1.5 ml-2.5">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(review)}
                    className="size-7 sm:size-8 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer"
                    title="Edit review"
                    aria-label="Edit review"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="size-3.5 sm:size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(review.id)}
                    className="size-7 sm:size-8 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer"
                    title="Delete review"
                    aria-label="Delete review"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="size-3.5 sm:size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="prose prose-sm mt-4 sm:prose sm:max-w-2xl dark:prose-invert">
        {review.title && (
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
            {review.title}
          </h4>
        )}
        <div className="text-neutral-600 dark:text-neutral-300">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
          ) : (
            <p>{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="flex gap-x-4">
        <div className="size-10 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
        </div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
      </div>
    </div>
  );
}

/* ─── Write / Edit Review Modal ─── */
function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  editingReview = null,
  onReviewSubmitted,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevIsOpenRef = useRef(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const isEditMode = Boolean(editingReview);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e) => {
        if (e.key === "Escape" && !submitting) onClose();
      };
      document.addEventListener("keydown", handleKeyDown);

      if (!prevIsOpenRef.current) {
        setIsVisible(true);
        setErrorMessage("");
        if (editingReview) {
          setSelectedRating(editingReview.rating || 0);
          setReviewTitle(editingReview.title || "");
          setReviewText(editingReview.comment || "");
        } else {
          setSelectedRating(0);
          setReviewTitle("");
          setReviewText("");
        }
        setHoverRating(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsAnimating(true));
        });
      }
      prevIsOpenRef.current = true;

      return () => {
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else if (prevIsOpenRef.current) {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 150);
      prevIsOpenRef.current = false;
      return () => clearTimeout(timer);
    }
  }, [isOpen, editingReview, submitting, onClose]);

  if (!isVisible && !isOpen) return null;

  const resetForm = () => {
    setSelectedRating(0);
    setHoverRating(0);
    setReviewTitle("");
    setReviewText("");
    setErrorMessage("");
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose();
    resetForm();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!isAuthenticated) {
      setErrorMessage(
        isEditMode
          ? "Please log in to update your review."
          : "Please log in to submit a review.",
      );
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setErrorMessage("Please select a star rating from 1 to 5.");
      return;
    }

    const trimmedComment = reviewText.trim();
    if (!trimmedComment) {
      setErrorMessage("Please write a review comment.");
      return;
    }

    if (trimmedComment.length > 2000) {
      setErrorMessage("Review comment cannot exceed 2000 characters.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        rating: selectedRating,
        comment: trimmedComment,
        title: reviewTitle.trim() || (isEditMode ? null : undefined),
      };

      if (isEditMode && editingReview?.id) {
        await reviewApi.updateReview(editingReview.id, payload);
      } else {
        await reviewApi.createReview(productId, payload);
      }

      onClose();
      resetForm();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to save review. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || selectedRating;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/25 dark:bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleCancel}
        style={{
          transition: "opacity 150ms ease",
          opacity: isAnimating ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Modal panel container */}
      <div className="fixed inset-0 z-[10000] w-screen overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 overflow-hidden max-h-[90vh] flex flex-col transition-all"
          style={{
            transition: "opacity 150ms, transform 150ms",
            transitionTimingFunction: isAnimating ? "ease-out" : "ease-in",
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? "scale(1)" : "scale(0.95)",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="absolute top-5 right-5 size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto">
            <h2 className="flex items-center gap-2 text-lg/6 font-semibold text-balance text-zinc-950 sm:text-base/6 dark:text-white">
              {isEditMode ? (
                <>
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
                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Edit your review
                </>
              ) : (
                <>
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
                </>
              )}
            </h2>

            {!isAuthenticated ? (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
                <p className="font-medium">
                  You need to sign in to {isEditMode ? "edit" : "review"} this product.
                </p>
                <div className="mt-3 flex gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-600 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-pretty text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                Posting as{" "}
                <span className="font-medium text-neutral-900 dark:text-white">
                  {user?.fullName || "User"}
                </span>
                . Required fields are marked with an asterisk (*).
              </p>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 shrink-0 text-red-500 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Star selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Overall rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!isAuthenticated || submitting}
                    className="cursor-pointer p-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setSelectedRating(star)}
                    aria-label={`${star} star`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`size-7 transition-colors ${
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
                {selectedRating > 0 && (
                  <span className="ml-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {selectedRating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Review title <span className="text-neutral-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                disabled={!isAuthenticated || submitting}
                maxLength={200}
                placeholder="E.g., Exceptional quality and fit!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-neutral-900 dark:focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>

            {/* Comment Textarea */}
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Your review <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-neutral-400">
                  {reviewText.length}/2000
                </span>
              </div>
              <textarea
                disabled={!isAuthenticated || submitting}
                maxLength={2000}
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-neutral-900 dark:focus:border-white focus:outline-none resize-y transition-colors disabled:opacity-50"
                placeholder="Share your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{ height: "140px" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto">
              <button
                type="button"
                disabled={submitting}
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-full border border-transparent hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isAuthenticated || submitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin size-4 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : isEditMode ? (
                  "Update review"
                ) : (
                  "Submit review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Delete Review Modal ─── */
function DeleteReviewModal({
  isOpen,
  onClose,
  reviewId,
  onDeleted,
}) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e) => {
        if (e.key === "Escape" && !deleting) onClose();
      };
      document.addEventListener("keydown", handleKeyDown);

      if (!prevIsOpenRef.current) {
        setIsVisible(true);
        setErrorMessage("");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsAnimating(true));
        });
      }
      prevIsOpenRef.current = true;

      return () => {
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else if (prevIsOpenRef.current) {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 150);
      prevIsOpenRef.current = false;
      return () => clearTimeout(timer);
    }
  }, [isOpen, deleting, onClose]);

  if (!isVisible && !isOpen) return null;

  const handleCancel = () => {
    if (deleting) return;
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!reviewId || deleting) return;
    try {
      setDeleting(true);
      setErrorMessage("");
      await reviewApi.deleteReview(reviewId);
      onClose();
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to delete review. Please try again.";
      setErrorMessage(msg);
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/25 dark:bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleCancel}
        style={{
          transition: "opacity 150ms ease",
          opacity: isAnimating ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[10000] w-screen overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-review-title"
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-neutral-800 p-6 sm:p-8 shadow-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 text-center transition-all"
          style={{
            transition: "opacity 150ms, transform 150ms",
            transitionTimingFunction: isAnimating ? "ease-out" : "ease-in",
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? "scale(1)" : "scale(0.95)",
          }}
        >
          {/* Close button top right */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={deleting}
            className="absolute top-4 right-4 size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Red Trash Icon */}
          <div className="mx-auto size-14 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 ring-8 ring-red-50/60 dark:ring-red-950/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </div>

          <h3
            id="delete-review-title"
            className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white"
          >
            Delete your review?
          </h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Are you sure you want to permanently delete this review? This action cannot be undone.
          </p>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs text-left">
              {errorMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
            <button
              type="button"
              disabled={deleting}
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-full text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <svg
                    className="animate-spin size-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete review"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ReviewsSection({
  productId,
  onSummaryUpdate,
}) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const currentUser = useSelector(selectUser);
  const onSummaryUpdateRef = useRef(onSummaryUpdate);

  useEffect(() => {
    onSummaryUpdateRef.current = onSummaryUpdate;
  }, [onSummaryUpdate]);

  // Fetch summary and reviews whenever productId, page, or sort changes
  const fetchReviewsData = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch summary and paginated reviews in parallel
      const [summaryRes, reviewsRes] = await Promise.all([
        reviewApi.getReviewSummary(productId),
        reviewApi.getProductReviews(productId, {
          page,
          limit: 10,
          sort,
        }),
      ]);

      if (summaryRes?.data) {
        setSummary(summaryRes.data);
        if (onSummaryUpdateRef.current) {
          onSummaryUpdateRef.current(summaryRes.data);
        }
      }

      if (reviewsRes?.data) {
        setReviews(reviewsRes.data.reviews || []);
        if (reviewsRes.data.pagination) {
          setPagination(reviewsRes.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError("Unable to load reviews for this product. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [productId, page, sort]);

  // Reset page to 1 when productId changes or sort changes
  useEffect(() => {
    setPage(1);
  }, [productId, sort]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  // Handle review editing
  const handleOpenEditModal = (review) => {
    setEditingReview(review);
    setReviewModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingReview(null);
    setReviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setReviewModalOpen(false);
    setEditingReview(null);
  };

  // Handle review deletion modal
  const handleOpenDeleteModal = (reviewId) => {
    setDeletingReviewId(reviewId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingReviewId(null);
  };

  const handleDeleteSuccess = () => {
    handleCloseDeleteModal();
    fetchReviewsData();
  };

  const handleReviewSubmitted = () => {
    // Reload reviews and summary
    fetchReviewsData();
  };

  const averageRatingFormatted =
    summary.averageRating > 0 ? Number(summary.averageRating).toFixed(1) : "0.0";
  const totalReviewsCount = summary.totalReviews || 0;
  const reviewLabel = totalReviewsCount === 1 ? "Review" : "Reviews";

  return (
    <div>
      <div>
        {/* Section Header with Real Aggregate Rating */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2
            className="flex scroll-mt-8 items-center text-2xl font-semibold"
            id="reviews"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="mb-0.5 size-7 text-yellow-400"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-1.5">
              {averageRatingFormatted} · {totalReviewsCount} {reviewLabel}
            </span>
          </h2>

          {/* Sort Selector */}
          {totalReviewsCount > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="review-sort"
                className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Sort by:
              </label>
              <select
                id="review-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-full px-3 py-1.5 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors cursor-pointer"
              >
                <option value="newest" className="bg-white dark:bg-neutral-800">
                  Newest first
                </option>
                <option value="oldest" className="bg-white dark:bg-neutral-800">
                  Oldest first
                </option>
                <option
                  value="highest_rating"
                  className="bg-white dark:bg-neutral-800"
                >
                  Highest rating
                </option>
                <option
                  value="lowest_rating"
                  className="bg-white dark:bg-neutral-800"
                >
                  Lowest rating
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="mt-10">
          {loading && reviews.length === 0 ? (
            <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
              <ReviewSkeleton />
              <ReviewSkeleton />
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-center">
              <p className="text-neutral-600 dark:text-neutral-300 mb-4 text-sm">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchReviewsData}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-center">
              <div className="flex justify-center text-yellow-400 mb-3">
                <StarRating rating={5} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                No reviews yet
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                Be the first to share your thoughts and help other shoppers!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
              {reviews.map((review, idx) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  colorIndex={idx}
                  currentUserId={currentUser?.id}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-6">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                const el = document.getElementById("reviews");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 text-sm font-medium rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => {
                setPage((p) => Math.min(pagination.totalPages, p + 1));
                const el = document.getElementById("reviews");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 text-sm font-medium rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Write a review button */}
        <button
          className="mt-10 relative isolate inline-flex items-center justify-center gap-x-2 rounded-full border text-base/6 font-medium focus:outline-hidden border-transparent bg-zinc-900 text-white px-4 py-2.5 sm:px-6 sm:py-3 sm:text-sm/6 cursor-pointer hover:bg-zinc-800 transition-colors before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-zinc-900 before:shadow-sm after:absolute after:inset-0 after:-z-10 after:rounded-full dark:bg-zinc-600 dark:text-white dark:before:bg-zinc-600"
          type="button"
          onClick={handleOpenCreateModal}
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

      {/* Write / Edit Review Modal */}
      <WriteReviewModal
        isOpen={reviewModalOpen}
        onClose={handleCloseModal}
        productId={productId}
        editingReview={editingReview}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteReviewModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        reviewId={deletingReviewId}
        onDeleted={handleDeleteSuccess}
      />
    </div>
  );
}
