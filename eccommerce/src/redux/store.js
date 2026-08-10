import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";

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

export default store;
