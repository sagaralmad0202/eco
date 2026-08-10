import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "light";
  }
  return "light";
};

const initialState = {
  theme: getInitialTheme(),
  quickViewProduct: null,
  isQuickViewOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      state.theme = nextTheme;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", nextTheme);
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    openQuickView: (state, action) => {
      state.quickViewProduct = action.payload;
      state.isQuickViewOpen = true;
    },
    closeQuickView: (state) => {
      state.isQuickViewOpen = false;
    },
    setSearchOpen: (state, action) => {
      state.isSearchOpen = Boolean(action.payload);
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = Boolean(action.payload);
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  openQuickView,
  closeQuickView,
  setSearchOpen,
  setMobileMenuOpen,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectQuickViewProduct = (state) => state.ui.quickViewProduct;
export const selectIsQuickViewOpen = (state) => state.ui.isQuickViewOpen;
export const selectIsSearchOpen = (state) => state.ui.isSearchOpen;
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;

export default uiSlice.reducer;
