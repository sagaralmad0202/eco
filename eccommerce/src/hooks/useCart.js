import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCartOnServer,
  setCartOpen,
  toggleCart as toggleCartAction,
  dismissCartError,
  setItemQuantityOptimistic,
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectCartSubtotalString,
  selectCartShippingFeeString,
  selectCartTaxString,
  selectCartTotalString,
  selectCartStatus,
  selectCartIsMutating,
  selectCartError,
  selectCartIssues,
  selectIsCartOpen,
} from "../redux/slices/cartSlice";

// Shared module-scoped debounce maps so multi-component operations coalesce seamlessly
const updateDebounceTimers = new Map();
const pendingQuantities = new Map();

// Picks which variant a bare "add to bag" or detail page click means.
function resolveVariantId(product, selectedSize) {
  if (!product) return null;
  if (product.variantId) return product.variantId;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    if (selectedSize) {
      const wanted = String(selectedSize).trim().toLowerCase();
      const match = variants.find((variant) => {
        const parts = String(variant.title ?? "").split("/");
        const size = parts[parts.length - 1].trim().toLowerCase();
        return size === wanted;
      });
      if (match?.id) return match.id;
    }

    const sellable = variants.filter(
      (variant) => (variant.inStock ?? variant.stock > 0) && variant.isActive !== false,
    );
    const pool = sellable.length ? sellable : variants;

    const chosen = pool.reduce(
      (cheapest, variant) =>
        Number(variant.price) < Number(cheapest.price) ? variant : cheapest,
      pool[0],
    );
    if (chosen?.id) return chosen.id;
  }

  return null;
}

/**
 * Custom hook to interact directly with Redux cart state & actions.
 * Replaces the old CartContext layer with direct, optimized Redux integration.
 */
export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const subtotalString = useAppSelector(selectCartSubtotalString);
  const shippingFeeString = useAppSelector(selectCartShippingFeeString);
  const taxString = useAppSelector(selectCartTaxString);
  const totalString = useAppSelector(selectCartTotalString);
  const isCartOpen = useAppSelector(selectIsCartOpen);
  const status = useAppSelector(selectCartStatus);
  const isMutating = useAppSelector(selectCartIsMutating);
  const error = useAppSelector(selectCartError);
  const issues = useAppSelector(selectCartIssues);

  const addToCart = useCallback(
    async (
      product,
      quantity = 1,
      _selectedColor,
      selectedSize,
      shouldOpenCart = false,
    ) => {
      const variantId = resolveVariantId(product, selectedSize);

      if (!variantId) {
        return { ok: false, error: "No available variant found for this product." };
      }

      const action = await dispatch(addItemToCart({ variantId, quantity }));

      if (addItemToCart.rejected.match(action)) {
        return { ok: false, error: action.payload };
      }

      if (shouldOpenCart) {
        dispatch(setCartOpen(true));
      }

      const line = action.payload?.items?.find(
        (item) => item.variant?.id === variantId,
      );

      return {
        ok: true,
        cartId: line?.id ?? null,
        totalQuantity: line?.quantity ?? quantity,
        variantId,
      };
    },
    [dispatch],
  );

  const flushPendingUpdates = useCallback(() => {
    for (const [itemId, timer] of updateDebounceTimers.entries()) {
      clearTimeout(timer);
      const qty = pendingQuantities.get(itemId);
      if (qty !== undefined) {
        dispatch(updateCartItem({ itemId, quantity: qty }));
      }
    }
    updateDebounceTimers.clear();
    pendingQuantities.clear();
  }, [dispatch]);

  const removeFromCart = useCallback(
    (itemId) => {
      if (updateDebounceTimers.has(itemId)) {
        clearTimeout(updateDebounceTimers.get(itemId));
        updateDebounceTimers.delete(itemId);
        pendingQuantities.delete(itemId);
      }
      return dispatch(removeCartItem(itemId));
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      if (newQuantity < 1) return undefined;

      dispatch(setItemQuantityOptimistic({ itemId, quantity: newQuantity }));
      pendingQuantities.set(itemId, newQuantity);

      if (updateDebounceTimers.has(itemId)) {
        clearTimeout(updateDebounceTimers.get(itemId));
      }

      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          updateDebounceTimers.delete(itemId);
          const finalQty = pendingQuantities.get(itemId) ?? newQuantity;
          pendingQuantities.delete(itemId);

          try {
            const result = await dispatch(
              updateCartItem({ itemId, quantity: finalQty }),
            );
            if (updateCartItem.rejected.match(result)) {
              toast.error(result.payload || "Could not update quantity.");
            }
            resolve(result);
          } catch (err) {
            toast.error(err?.message || "Could not update quantity.");
            resolve({ error: err });
          }
        }, 300);

        updateDebounceTimers.set(itemId, timer);
      });
    },
    [dispatch],
  );

  const getItemQuantity = useCallback(
    (productId) =>
      items
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const getVariantQuantity = useCallback(
    (variantId) =>
      items.find((item) => item.variantId === variantId)?.quantity ?? 0,
    [items],
  );

  const clearCart = useCallback(
    () => dispatch(clearCartOnServer()),
    [dispatch],
  );

  const openCart = useCallback(() => dispatch(setCartOpen(true)), [dispatch]);
  const closeCart = useCallback(() => dispatch(setCartOpen(false)), [dispatch]);
  const clearError = useCallback(
    () => dispatch(dismissCartError()),
    [dispatch],
  );
  const toggleCart = useCallback(
    () => dispatch(toggleCartAction()),
    [dispatch],
  );

  return useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      getItemQuantity,
      getVariantQuantity,
      clearCart,
      cartCount,
      subtotal,
      subtotalString,
      shippingFeeString,
      taxString,
      totalString,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      isLoading: status === "loading",
      isMutating,
      error,
      clearError,
      issues,
      flushPendingUpdates,
      refreshCart: () => dispatch(fetchCart()),
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      getItemQuantity,
      getVariantQuantity,
      clearCart,
      cartCount,
      subtotal,
      subtotalString,
      shippingFeeString,
      taxString,
      totalString,
      isCartOpen,
      status,
      isMutating,
      error,
      clearError,
      issues,
      flushPendingUpdates,
      openCart,
      closeCart,
      toggleCart,
      dispatch,
    ],
  );
}

export default useCart;
