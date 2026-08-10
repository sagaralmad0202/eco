import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
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
  state.items = (cart?.items ?? []).map(toUiItem);
  state.totalQuantity = cart?.totalQuantity ?? 0;
  state.subtotal = cart?.subtotal ?? "0.00";
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
  }
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
  }
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
  }
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
  }
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
  }
);

const initialState = {
  id: null,
  items: [],
  totalQuantity: 0,
  // String, matching the server. Converted to a number only in the selector
  // that feeds display.
  subtotal: "0.00",
  isOpen: false,
  // Distinguishes "still loading" from "loaded and empty". Without it the
  // drawer flashes "Your cart is empty" on every page load before the first
  // response lands.
  status: "idle",
  // Set only while a mutation is in flight, so the badge and the drawer do not
  // blank out during an add.
  isMutating: false,
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

    // The four mutations behave identically: mark in-flight, then replace the
    // cart with whatever the server returned. Registered in a loop so a fifth
    // one cannot be added later with subtly different handling.
    [addItemToCart, updateCartItem, removeCartItem, clearCartOnServer].forEach(
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
            // State is deliberately left as it was. The server rejected the
            // change, so the cart on screen is still the true one — rolling it
            // back to something else would be the actual lie.
            state.error = action.payload ?? "Could not update your cart.";
          });
      }
    );
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

// Any line the server flagged. Checkout should refuse to proceed while this is
// non-empty rather than let the order fail on submit.
export const selectCartIssues = createSelector([selectCartItems], (items) =>
  items.filter((item) => item.unavailable || item.exceedsStock)
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
