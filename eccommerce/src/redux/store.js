import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import uiReducer from "./slices/uiSlice";
import authReducer, { tokensUpdated, logout } from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";
import { onAuthChange } from "../services/api";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    auth: authReducer,
    products: productsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

// Synchronize token refreshes and logouts between Axios interceptor and Redux
onAuthChange((tokens) => {
  if (tokens) {
    store.dispatch(tokensUpdated(tokens));
  } else {
    store.dispatch(logout());
  }
});

export default store;

