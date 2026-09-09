import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import cartApi from "../../services/cartApi";

// The cart now lives on the server. This slice is a cache of the last response,
// not a source of truth — every mutation returns the whole cart and we replace
// what we hold with it.
//
// Nothing is persisted to localStorage any more. Guests are identified by the
// httpOnly `cart_session` cookie the backend mints, so the basket already
// survives a refresh without our help. Keeping a second copy in localStorage
// would let the two disagree, and the stale one would win on first paint.

// The API returns money as two-decimal STRINGS and describes a line as
// { variant, product }, while every component here was written against a flat
// item with a NUMBER price. Rather than rewrite six components, the shape is
// translated once, on the way in.
//
// Number() is applied only at this boundary, for display arithmetic. Anything
// that must be exact — what the customer is actually charged — uses the
// server's string, which is why priceString and subtotal are both kept.
function toUiItem(item) {
  // Variant titles read "Indigo / M". The cart drawer shows colour and size in
  // separate columns, so split rather than print the raw title.
  const [colour, size] = String(item.variant.title ?? "")
    .split("/")
    .map((part) => part.trim());

  return {
    // The CART ITEM id. Every mutation is keyed by this, not by the variant or
    // a composed string, because that is what the API takes.
    id: item.id,
    variantId: item.variant.id,
    productId: item.product.id,

    name: item.product.name,
    slug: item.product.slug,
    brand: item.product.brand,
    image: item.product.image,

    color: colour || "Default",
    size: size || "One Size",
    sku: item.variant.sku,

    quantity: item.quantity,
    price: Number(item.variant.price),
    priceString: item.variant.price,
    lineTotal: item.lineTotal,

    // Surfaced so the drawer can grey a line out and explain, rather than
    // letting the customer reach checkout and be told there.
    stock: item.variant.stock,
    unavailable: item.unavailable,
    exceedsStock: item.exceedsStock,
  };
}

function applyCart(state, cart) {
  state.id = cart?.id ?? null;
  const rawItems = (cart?.items ?? []).map(toUiItem);
  const pendingIds = state.pendingRemoveIds || [];
  state.items = rawItems.filter((item) => !pendingIds.includes(item.id));

  if (state.items.length === 0) {
    state.totalQuantity = 0;
    state.subtotal = "0.00";
    state.shippingFee = "0.00";
    state.tax = "0.00";
    state.total = "0.00";
  } else if (pendingIds.length > 0) {
    const subtotalNum = state.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0,
    );
    const totalQty = state.items.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    const shippingNum = subtotalNum > 0 ? 5.0 : 0;
    const taxNum = Number((subtotalNum * 0.1).toFixed(2));
    state.totalQuantity = totalQty;
    state.subtotal = subtotalNum.toFixed(2);
    state.shippingFee = shippingNum.toFixed(2);
    state.tax = taxNum.toFixed(2);
    state.total = (subtotalNum + shippingNum + taxNum).toFixed(2);
  } else {
    state.totalQuantity = cart?.totalQuantity ?? 0;
    state.subtotal = cart?.subtotal ?? "0.00";
    state.shippingFee = cart?.shippingFee ?? "0.00";
    state.tax = cart?.tax ?? "0.00";
    state.total = cart?.total ?? "0.00";
  }
  state.error = null;
}

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ variantId, quantity = 1 }, { rejectWithValue }) => {
    if (!variantId) {
      // A product with no variant has no price and no stock, so there is
      // nothing to add. Failing here with a readable reason beats sending
      // `undefined` and reading a 400 back.
      return rejectWithValue("This product has no size available to add.");
    }

    try {
      const response = await cartApi.addItem({ variantId, quantity });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateItem(itemId, quantity);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeItem(itemId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (itemId, { getState }) => {
      const { cart } = getState();
      if (cart.pendingRemoveIds?.includes(itemId)) {
        return false;
      }
      return true;
    },
  },
);

export const clearCartOnServer = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.clearCart();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  id: null,
  items: [],
  totalQuantity: 0,
  // String, matching the server. Converted to a number only in the selector
  // that feeds display.
  subtotal: "0.00",
  shippingFee: "0.00",
  tax: "0.00",
  total: "0.00",
  isOpen: false,
  // Distinguishes "still loading" from "loaded and empty". Without it the
  // drawer flashes "Your cart is empty" on every page load before the first
  // response lands.
  status: "idle",
  // Set only while a mutation is in flight, so the badge and the drawer do not
  // blank out during an add.
  isMutating: false,
  pendingRemoveIds: [],
  previousCart: null,
  error: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartOpen: (state, action) => {
      state.isOpen = Boolean(action.payload);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    dismissCartError: (state) => {
      state.error = null;
    },
    // Called on logout. The server cart is untouched — it belongs to the
    // account and should still be there at the next sign-in — this only drops
    // the local copy so the next visitor does not see the last one's basket.
    resetCartState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        applyCart(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load your cart.";
      });

    // Mutations other than remove
    [addItemToCart, updateCartItem, clearCartOnServer].forEach(
      (thunk) => {
        builder
          .addCase(thunk.pending, (state) => {
            state.isMutating = true;
            state.error = null;
          })
          .addCase(thunk.fulfilled, (state, action) => {
            state.isMutating = false;
            state.status = "succeeded";
            applyCart(state, action.payload);
          })
          .addCase(thunk.rejected, (state, action) => {
            state.isMutating = false;
            state.error = action.payload ?? "Could not update your cart.";
          });
      },
    );

    // Optimistic removal with rollback on failure
    builder
      .addCase(removeCartItem.pending, (state, action) => {
        state.isMutating = true;
        state.error = null;
        const itemId = action.meta.arg;
        if (!state.pendingRemoveIds.includes(itemId)) {
          state.pendingRemoveIds.push(itemId);
        }

        // Snapshot prior state for rollback if not already capturing an ongoing burst
        if (!state.previousCart) {
          state.previousCart = {
            items: [...state.items],
            totalQuantity: state.totalQuantity,
            subtotal: state.subtotal,
            shippingFee: state.shippingFee,
            tax: state.tax,
            total: state.total,
          };
        }

        const remainingItems = state.items.filter((item) => item.id !== itemId);
        state.items = remainingItems;

        if (remainingItems.length === 0) {
          state.totalQuantity = 0;
          state.subtotal = "0.00";
          state.shippingFee = "0.00";
          state.tax = "0.00";
          state.total = "0.00";
        } else {
          const subtotalNum = remainingItems.reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
            0,
          );
          const totalQty = remainingItems.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0,
          );
          const shippingNum = subtotalNum > 0 ? 5.0 : 0;
          const taxNum = Number((subtotalNum * 0.1).toFixed(2));
          state.totalQuantity = totalQty;
          state.subtotal = subtotalNum.toFixed(2);
          state.shippingFee = shippingNum.toFixed(2);
          state.tax = taxNum.toFixed(2);
          state.total = (subtotalNum + shippingNum + taxNum).toFixed(2);
        }
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const itemId = action.meta.arg;
        state.pendingRemoveIds = state.pendingRemoveIds.filter(
          (id) => id !== itemId,
        );
        state.isMutating = state.pendingRemoveIds.length > 0;
        state.status = "succeeded";
        if (state.pendingRemoveIds.length === 0) {
          state.previousCart = null;
        }
        applyCart(state, action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg;
        state.pendingRemoveIds = state.pendingRemoveIds.filter(
          (id) => id !== itemId,
        );
        state.isMutating = state.pendingRemoveIds.length > 0;
        if (state.previousCart) {
          state.items = state.previousCart.items;
          state.totalQuantity = state.previousCart.totalQuantity;
          state.subtotal = state.previousCart.subtotal;
          state.shippingFee = state.previousCart.shippingFee;
          state.tax = state.previousCart.tax;
          state.total = state.previousCart.total;
          state.previousCart = null;
        }
        state.error = action.payload ?? "Could not remove item from cart.";
      });
  },
});

export const { setCartOpen, toggleCart, dismissCartError, resetCartState } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectIsCartOpen = (state) => state.cart.isOpen;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartIsMutating = (state) => state.cart.isMutating;
export const selectCartError = (state) => state.cart.error;

// Counts units, not lines — a badge reading "1" for three of the same t-shirt
// looks wrong to the customer who added three. Taken from the server rather
// than recomputed, so the badge cannot disagree with the drawer.
export const selectCartCount = (state) => state.cart.totalQuantity;

// A number, because the pages that show it add shipping and tax to it. The
// exact string stays available for anywhere the charged amount is shown.
export const selectCartSubtotal = (state) => Number(state.cart.subtotal);
export const selectCartSubtotalString = (state) => state.cart.subtotal;
export const selectCartShippingFeeString = (state) => state.cart.shippingFee;
export const selectCartTaxString = (state) => state.cart.tax;
export const selectCartTotalString = (state) => state.cart.total;

// Any line the server flagged. Checkout should refuse to proceed while this is
// non-empty rather than let the order fail on submit.
export const selectCartIssues = createSelector([selectCartItems], (items) =>
  items.filter((item) => item.unavailable || item.exceedsStock),
);

// Quantity of a given variant currently in the cart. Keyed by variant, not by
// the old `${id}-${color}-${size}` string — that string was invented on the
// client and had no counterpart on the server.
export const selectVariantQuantity = (variantId) => (state) => {
  if (!variantId) return 0;
  const found = state.cart.items.find((item) => item.variantId === variantId);
  return found ? found.quantity : 0;
};

// How many units of a product are in the cart, across all of its sizes. What a
// product card actually wants to know, since it does not pick a size.
export const selectProductQuantity = (productId) => (state) => {
  if (!productId) return 0;
  return state.cart.items
    .filter((item) => item.productId === productId)
    .reduce((total, item) => total + item.quantity, 0);
};

export default cartSlice.reducer;
