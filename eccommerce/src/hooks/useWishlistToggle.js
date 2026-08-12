import { useCallback, useState } from "react";
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
  const isLiked = useAppSelector(selectIsInWishlist(productId));
  const pendingProductId = useAppSelector(selectWishlistPendingId);
  const isPending =
    isResolving || (Boolean(productId) && pendingProductId === productId);

  const toggle = useCallback(async () => {
    if (isPending) return false;

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
          toast.error(error?.message ?? "Could not find this product.");
          return false;
        }
      } finally {
        setIsResolving(false);
      }
    }

    if (!resolvedProductId) {
      toast.error("Could not find this product.");
      return false;
    }

    const action = await dispatch(toggleWishlistItem(resolvedProductId));
    if (toggleWishlistItem.rejected.match(action)) {
      toast.error(
        action.payload?.requiresAuth
          ? "Sign in to save items to your wishlist."
          : (action.payload?.message ?? "Could not update your wishlist."),
      );
      return false;
    }

    return true;
  }, [dispatch, isPending, productId, productName, slug]);

  return { isLiked, isPending, toggle };
}
