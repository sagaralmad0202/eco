import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";
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
  resetCartState,
} from "../redux/slices/cartSlice";
import {
  fetchWishlist,
  resetWishlistState,
} from "../redux/slices/wishlistSlice";
import { selectIsAuthenticated } from "../redux/slices/authSlice";

const CartContext = createContext();

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

export function CartProvider({ children }) {
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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Refetched on mount and again whenever the session changes.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      return;
    }

    // Signed out. Drop the local copies first so the previous account's basket
    // cannot flash on screen, then read the guest cart the cookie points at.
    dispatch(resetCartState());
    dispatch(resetWishlistState());
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  /**
   * Add a product to the cart.
   */
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

  /** `itemId` is the cart item id, which is what the API keys on. */
  const removeFromCart = useCallback(
    (itemId) => dispatch(removeCartItem(itemId)),
    [dispatch],
  );

  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      // The server rejects anything below 1; removing is a separate call with
      // separate intent, so do not quietly turn one into the other.
      if (newQuantity < 1) return undefined;
      return dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    },
    [dispatch],
  );

  /**
   * Units of a product currently in the cart, summed across its sizes.
   *
   * The old signature took (productId, color, size) and rebuilt a
   * `${id}-${color}-${size}` key. That key was a client invention with no
   * counterpart on the server, so the extra arguments are accepted and ignored
   * rather than silently returning 0 for every caller that still passes them.
   */
  const getItemQuantity = useCallback(
    (productId) =>
      items
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  /** Units of one specific variant. What a size picker wants. */
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

  const value = useMemo(
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
      // "loading" only until the first response lands; after that a refetch
      // keeps the old items on screen rather than blanking the drawer.
      isLoading: status === "loading",
      isMutating,
      error,
      clearError,
      // Non-empty means at least one line went out of stock or was delisted
      // after it was added. Checkout should refuse while it is.
      issues,
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
      openCart,
      closeCart,
      toggleCart,
      dispatch,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
