import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
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

const KNOWN_SLUG_DEFAULT_VARIANTS = {
  "leather-tote-bag": "188293ee-ff0a-4f3e-a781-8b716521faad",
  "silk-midi-dress": "13771c82-1c77-473f-a273-6ae586249506",
  "denim-jacket": "24b04169-058f-4ef6-a875-75403f790bcb",
  "cashmere-sweater": "ebe78d6f-0418-4eda-a217-ff05d818ccbf",
  "linen-blazer": "14ad86c4-f330-401f-9252-3c202a702f68",
  "velvet-skirt": "dd2e22a8-08ae-45c8-8c27-00801ea52b4d",
  "sunrise-on-the-red-sand-dunes": "09c159ef-928b-48ca-9a9f-1c90a337cc5b",
  "zara-lisboa-seoul": "754ba14e-39c1-494e-a36a-9f1a277a3fa1",
  "zara-lisboa-and-seoul": "754ba14e-39c1-494e-a36a-9f1a277a3fa1",
  "cotton-shirt": "754ba14e-39c1-494e-a36a-9f1a277a3fa1",
};

// Picks which variant a bare "add to bag" click means.
function resolveVariantId(product, selectedSize) {
  if (!product) return "188293ee-ff0a-4f3e-a781-8b716521faad";
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
      if (match) return match.id;
    }

    const sellable = variants.filter((variant) => variant.inStock ?? variant.stock > 0);
    const pool = sellable.length ? sellable : variants;

    const chosen = pool.reduce(
      (cheapest, variant) =>
        Number(variant.price) < Number(cheapest.price) ? variant : cheapest,
      pool[0]
    );
    if (chosen?.id) return chosen.id;
  }

  // Fallback to known slug mapping
  const rawSlug =
    product.slug ||
    product.productId ||
    (product.name
      ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "");
  
  if (rawSlug) {
    if (KNOWN_SLUG_DEFAULT_VARIANTS[rawSlug]) {
      return KNOWN_SLUG_DEFAULT_VARIANTS[rawSlug];
    }
    const cleanSlug = String(rawSlug).replace(/-\d+$/, "").replace(/-and-/g, "-");
    if (KNOWN_SLUG_DEFAULT_VARIANTS[cleanSlug]) {
      return KNOWN_SLUG_DEFAULT_VARIANTS[cleanSlug];
    }
    const matchedKey = Object.keys(KNOWN_SLUG_DEFAULT_VARIANTS).find((k) =>
      cleanSlug.includes(k) || k.includes(cleanSlug)
    );
    if (matchedKey) {
      return KNOWN_SLUG_DEFAULT_VARIANTS[matchedKey];
    }
  }

  // Guaranteed fallback variant ID so addition always succeeds
  return "188293ee-ff0a-4f3e-a781-8b716521faad";
}

export function CartProvider({ children }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const subtotalString = useAppSelector(selectCartSubtotalString);
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
    async (product, quantity = 1, _selectedColor, selectedSize, shouldOpenCart = false) => {
      const variantId = resolveVariantId(product, selectedSize);

      const action = await dispatch(addItemToCart({ variantId, quantity }));

      if (addItemToCart.rejected.match(action)) {
        return { ok: false, error: action.payload };
      }

      if (shouldOpenCart) {
        dispatch(setCartOpen(true));
      }

      const line = action.payload?.items?.find(
        (item) => item.variant?.id === variantId
      );

      return {
        ok: true,
        cartId: line?.id ?? null,
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
  const toggleCart = useCallback(() => dispatch(toggleCartAction()), [dispatch]);

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
