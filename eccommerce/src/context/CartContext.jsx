import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCartOnServer,
  setCartOpen,
  dismissCartError,
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectCartSubtotalString,
  selectCartStatus,
  selectCartIsMutating,
  selectCartError,
  selectCartIssues,
  resetCartState,
} from "../redux/slices/cartSlice";
import {
  fetchWishlist,
  resetWishlistState,
} from "../redux/slices/wishlistSlice";
import { selectIsAuthenticated } from "../redux/slices/authSlice";

const CartContext = createContext();

// Picks which variant a bare "add to bag" click means.
//
// A card does not ask for a size, but the server needs one — price and stock
// live on the variant. The rules, in order:
//   1. an explicit variantId always wins;
//   2. a variant whose title matches the chosen size ("Indigo / M");
//   3. the cheapest in-stock variant, which is the one the card's "from ₹X"
//      price label already refers to.
//
// Returning null rather than guessing at a product with no variants lets the
// thunk reject with something a customer can read.
function resolveVariantId(product, selectedSize) {
  if (!product) return null;
  if (product.variantId) return product.variantId;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;

  if (selectedSize) {
    const wanted = String(selectedSize).trim().toLowerCase();
    const match = variants.find((variant) => {
      const parts = String(variant.title ?? "").split("/");
      const size = parts[parts.length - 1].trim().toLowerCase();
      return size === wanted;
    });
    if (match) return match.id;
  }

  const sellable = variants.filter((variant) => variant.inStock ?? variant.stock > 0);
  const pool = sellable.length ? sellable : variants;

  return pool.reduce(
    (cheapest, variant) =>
      Number(variant.price) < Number(cheapest.price) ? variant : cheapest,
    pool[0]
  ).id;
}

export function CartProvider({ children }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const subtotalString = useAppSelector(selectCartSubtotalString);
  const status = useAppSelector(selectCartStatus);
  const isMutating = useAppSelector(selectCartIsMutating);
  const error = useAppSelector(selectCartError);
  const issues = useAppSelector(selectCartIssues);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Refetched on mount and again whenever the session changes.
  //
  // The provider wraps the whole app, so this is the only place that needs to
  // ask — and GET /cart creates nothing server-side, so a visitor who never
  // adds anything leaves no row behind.
  //
  // Keying on isAuthenticated is what makes the guest-cart merge visible. The
  // backend folds the guest basket into the account inside POST /auth/login,
  // but the copy in this store is still the guest one; without a refetch the
  // customer sees their pre-merge cart until the next full page load.
  //
  // The wishlist is fetched here too. It has no provider of its own and the
  // same two events — mount and sign-in — are exactly when it needs reading.
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
   *
   * Signature kept as (product, quantity, color, size) so the existing callers
   * did not all have to change on the same commit. Colour is accepted and
   * ignored: the variant carries it, and letting a caller pass a colour that
   * contradicts the variant would put a lie in the drawer.
   *
   * Returns a result object rather than throwing — callers fire this from a
   * click handler and a rejected promise there is an unhandled rejection.
   */
  const addToCart = useCallback(
    async (product, quantity = 1, _selectedColor, selectedSize) => {
      const variantId = resolveVariantId(product, selectedSize);

      const action = await dispatch(addItemToCart({ variantId, quantity }));

      if (addItemToCart.rejected.match(action)) {
        return { ok: false, error: action.payload };
      }

      const line = action.payload.items.find(
        (item) => item.variant.id === variantId
      );

      return {
        ok: true,
        cartId: line?.id ?? null,
        // What is in the cart now, which is not the same as what was just
        // added — adding a second of something already there returns 2.
        totalQuantity: line?.quantity ?? quantity,
        variantId,
      };
    },
    [dispatch]
  );

  /** `itemId` is the cart item id, which is what the API keys on. */
  const removeFromCart = useCallback(
    (itemId) => dispatch(removeCartItem(itemId)),
    [dispatch]
  );

  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      // The server rejects anything below 1; removing is a separate call with
      // separate intent, so do not quietly turn one into the other.
      if (newQuantity < 1) return undefined;
      return dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    },
    [dispatch]
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
    [items]
  );

  /** Units of one specific variant. What a size picker wants. */
  const getVariantQuantity = useCallback(
    (variantId) => items.find((item) => item.variantId === variantId)?.quantity ?? 0,
    [items]
  );

  const clearCart = useCallback(
    () => dispatch(clearCartOnServer()),
    [dispatch]
  );

  const openCart = useCallback(() => dispatch(setCartOpen(true)), [dispatch]);
  const closeCart = useCallback(() => dispatch(setCartOpen(false)), [dispatch]);
  const clearError = useCallback(() => dispatch(dismissCartError()), [dispatch]);

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
      // "loading" only until the first response lands; after that a refetch
      // keeps the old items on screen rather than blanking the drawer.
      isLoading: status === "loading",
      isMutating,
      error,
      clearError,
      // Non-empty means at least one line went out of stock or was delisted
      // after it was added. Checkout should refuse while it is.
      issues,
      openCart,
      closeCart,
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
      status,
      isMutating,
      error,
      clearError,
      issues,
      openCart,
      closeCart,
      dispatch,
    ]
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
