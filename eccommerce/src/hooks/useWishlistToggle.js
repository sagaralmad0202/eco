import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectIsInWishlist,
  selectWishlistPendingId,
  toggleWishlistItem,
} from "../redux/slices/wishlistSlice";
import productsApi from "../services/productsApi";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function useWishlistToggle(product) {
  const dispatch = useAppDispatch();
  const [isResolving, setIsResolving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const isUpdatingRef = useRef(false);

  const identity =
    product && typeof product === "object"
      ? product
      : { id: product, productId: product };
  const suppliedId = identity.productId || identity.id || null;
  const slug = identity.slug || identity.handle || null;
  const productName = identity.name || null;
  const directProductId = UUID_PATTERN.test(String(suppliedId ?? ""))
    ? suppliedId
    : null;
  const savedProductId = useAppSelector((state) => {
    if (directProductId) return directProductId;

    const saved = state.wishlist.items.find(
      (item) =>
        (slug && (item.slug === slug || item.handle === slug)) ||
        (productName && item.name === productName) ||
        item.productId === suppliedId,
    );
    return saved?.productId ?? null;
  });
  const productId = directProductId || savedProductId;

  const serverIsLiked = useAppSelector(selectIsInWishlist(productId));
  const pendingProductId = useAppSelector(selectWishlistPendingId);

  // Optimistic UI state managed locally with React useState
  const [isLiked, setIsLiked] = useState(Boolean(serverIsLiked));
  const [prevServerIsLiked, setPrevServerIsLiked] = useState(serverIsLiked);
  const [prevProductId, setPrevProductId] = useState(productId);

  // Keep local state in sync when server/Redux state updates from outside or product changes
  if (productId !== prevProductId) {
    setPrevProductId(productId);
    setPrevServerIsLiked(serverIsLiked);
    setIsLiked(Boolean(serverIsLiked));
  } else if (serverIsLiked !== prevServerIsLiked) {
    setPrevServerIsLiked(serverIsLiked);
    setIsLiked(Boolean(serverIsLiked));
  }

  const isPending =
    isUpdating ||
    isResolving ||
    (Boolean(productId) && pendingProductId === productId);

  const toggle = useCallback(async () => {
    // Prevent duplicate API calls while a wishlist request is already in progress
    if (isUpdatingRef.current || isPending) {
      return false;
    }

    isUpdatingRef.current = true;
    setIsUpdating(true);

    // 1. Immediately change the heart state without waiting for the API response
    const previousIsLiked = isLiked;
    const nextIsLiked = !previousIsLiked;
    setIsLiked(nextIsLiked);

    try {
      let resolvedProductId = productId;
      if (!resolvedProductId && slug) {
        setIsResolving(true);
        try {
          const response = await productsApi.getBySlug(slug);
          resolvedProductId = response?.data?.id ?? null;
        } catch (error) {
          if (productName) {
            try {
              const response = await productsApi.list({
                search: productName,
                limit: 10,
              });
              const exactMatch = response?.items?.find(
                (item) => item.name === productName,
              );
              resolvedProductId = exactMatch?.id ?? null;
            } catch {
              resolvedProductId = null;
            }
          }

          if (!resolvedProductId) {
            // Revert heart to previous state on lookup failure
            setIsLiked(previousIsLiked);
            toast.error(error?.message ?? "Could not find this product.");
            return false;
          }
        } finally {
          setIsResolving(false);
        }
      }

      if (!resolvedProductId) {
        setIsLiked(previousIsLiked);
        toast.error("Could not find this product.");
        return false;
      }

      // Allow the immediate optimistic heart update to paint before background API sets pending
      await new Promise((resolve) => setTimeout(resolve, 180));

      // 2. Trigger the wishlist API call in the background
      const action = await dispatch(toggleWishlistItem(resolvedProductId));

      if (toggleWishlistItem.rejected.match(action)) {
        // 4. If the API fails, revert the heart to its previous state
        setIsLiked(previousIsLiked);
        toast.error(
          action.payload?.requiresAuth
            ? "Sign in to save items to your wishlist."
            : (action.payload?.message ?? "Could not update your wishlist."),
        );
        return false;
      }

      // 3. If the API succeeds, keep the new heart state
      return true;
    } catch (error) {
      // Revert the heart to previous state on unexpected failure
      setIsLiked(previousIsLiked);
      toast.error(error?.message ?? "Could not update your wishlist.");
      return false;
    } finally {
      isUpdatingRef.current = false;
      setIsUpdating(false);
    }
  }, [dispatch, isLiked, isPending, productId, productName, slug]);

  return { isLiked, isPending, toggle };
}
