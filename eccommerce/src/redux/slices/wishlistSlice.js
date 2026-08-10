import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistApi from "../../services/wishlistApi";
import { wishlistRowToCardProduct } from "../../utils/productAdapter";

// Server-backed, like the cart — but unlike the cart there is no guest path.
// Every wishlist route requires a session, so an anonymous visitor has an empty
// wishlist and a 401 waiting behind the first heart they click.
//
// That 401 is a normal event, not a fault. It is recorded as `requiresAuth`
// rather than as an error message, so the UI can open the sign-in prompt
// instead of showing a red banner to someone who has done nothing wrong.

// Only the product ids are held in a Set-like array for the fast "is this
// hearted" lookup every card does on render. The full rows are kept alongside
// for the saved-items grid.
function applyItems(state, rows) {
  const list = Array.isArray(rows) ? rows : [];
  state.items = list.map(wishlistRowToCardProduct).filter(Boolean);
  state.productIds = state.items.map((item) => item.productId);
  state.error = null;
  state.requiresAuth = false;
}

// 401 means "not signed in", which for this feature is a state rather than a
// failure. Anything else is a real error worth showing.
function isUnauthorised(err) {
  return err?.status === 401;
}

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.getWishlist();
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        requiresAuth: isUnauthorised(err),
      });
    }
  }
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.toggle(productId);
      // `saved` tells the card which way the heart should now point, so it is
      // carried through rather than inferred by diffing the list.
      return { saved: response.saved, items: response.data, productId };
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        requiresAuth: isUnauthorised(err),
        productId,
      });
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.removeItem(productId);
      return { items: response.data, productId };
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        requiresAuth: isUnauthorised(err),
        productId,
      });
    }
  }
);

const initialState = {
  items: [],
  productIds: [],
  status: "idle",
  // Which product is mid-flight, so one card can show a spinner without every
  // heart on the page freezing.
  pendingProductId: null,
  // True when the last attempt failed only because nobody is signed in.
  requiresAuth: false,
  error: null,
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    dismissWishlistError: (state) => {
      state.error = null;
      state.requiresAuth = false;
    },
    // Called on logout. Clears the local copy only — the rows belong to the
    // account and are still there at the next sign-in.
    resetWishlistState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        applyItems(state, action.payload);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        // A signed-out visitor genuinely has an empty wishlist, so treat the
        // 401 as a successful load of nothing rather than leaving the grid in
        // a permanent loading state.
        state.status = "succeeded";
        state.items = [];
        state.productIds = [];
        state.requiresAuth = Boolean(action.payload?.requiresAuth);
        state.error = action.payload?.requiresAuth
          ? null
          : action.payload?.message ?? "Could not load your wishlist.";
      });

    builder
      .addCase(toggleWishlistItem.pending, (state, action) => {
        state.pendingProductId = action.meta.arg;
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.pendingProductId = null;
        state.status = "succeeded";
        applyItems(state, action.payload.items);
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.pendingProductId = null;
        state.requiresAuth = Boolean(action.payload?.requiresAuth);
        state.error = action.payload?.requiresAuth
          ? null
          : action.payload?.message ?? "Could not update your wishlist.";
      });

    builder
      .addCase(removeWishlistItem.pending, (state, action) => {
        state.pendingProductId = action.meta.arg;
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.pendingProductId = null;
        applyItems(state, action.payload.items);
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.pendingProductId = null;
        state.requiresAuth = Boolean(action.payload?.requiresAuth);
        state.error = action.payload?.requiresAuth
          ? null
          : action.payload?.message ?? "Could not update your wishlist.";
      });
  },
});

export const { dismissWishlistError, resetWishlistState } =
  wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistProductIds = (state) => state.wishlist.productIds;
export const selectWishlistStatus = (state) => state.wishlist.status;
export const selectWishlistPendingId = (state) => state.wishlist.pendingProductId;
export const selectWishlistRequiresAuth = (state) => state.wishlist.requiresAuth;
export const selectWishlistError = (state) => state.wishlist.error;

export const selectWishlistCount = createSelector(
  [selectWishlistItems],
  (items) => items.length
);

export const selectIsInWishlist = (productId) => (state) =>
  Boolean(productId) && state.wishlist.productIds.includes(productId);

export default wishlistSlice.reducer;
