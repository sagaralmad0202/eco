import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchCart, clearCartOnServer } from "../redux/slices/cartSlice";
import { fetchWishlist } from "../redux/slices/wishlistSlice";
import { toggleTheme } from "../redux/slices/uiSlice";
import { logout, loginSuccess } from "../redux/slices/authSlice";

export default function ReduxStateInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cart");

  const dispatch = useAppDispatch();
  const fullState = useAppSelector((state) => state);

  const cartState = fullState.cart;
  const wishlistState = fullState.wishlist;
  const uiState = fullState.ui;
  const authState = fullState.auth;
  const productsState = fullState.products;

  // The cart and wishlist now live on the server, so there is no longer a
  // "dispatch a made-up product" action to demonstrate. Adding requires a real
  // variant id that exists in the database; inventing one here would only ever
  // produce a 404. Refetching is the honest equivalent.
  const handleRefetch = () => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Open Redux Toolkit Inspector"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Redux Toolkit
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
            Active
          </span>
        </button>
      ) : (
        <div className="w-[360px] sm:w-[420px] max-h-[550px] flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white dark:bg-black dark:border-b dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-600 text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none text-white">Redux Toolkit Live Inspector</h3>
                <p className="text-[10px] text-neutral-400">@reduxjs/toolkit &amp; react-redux</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Action Toolbar */}
          <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-1.5">
            <button
              onClick={handleRefetch}
              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition text-[11px]"
            >
              ⟳ Refetch Server State
            </button>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition text-[11px]"
            >
              🌓 Theme
            </button>
            <button
              onClick={() => dispatch(clearCartOnServer())}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition text-[11px]"
            >
              Clear Cart
            </button>
          </div>

          {/* Slice Tabs */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-2 pt-2 gap-1 overflow-x-auto scrollbar-none">
            {["cart", "wishlist", "ui", "auth", "products"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-t-lg font-medium capitalize text-[11px] transition ${
                  activeTab === tab
                    ? "bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab}
                {tab === "cart" && (
                  <span className="ml-1 px-1.5 py-0.2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-full text-[10px]">
                    {cartState.items.length}
                  </span>
                )}
                {tab === "wishlist" && (
                  <span className="ml-1 px-1.5 py-0.2 bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 rounded-full text-[10px]">
                    {wishlistState.items.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* State View Body */}
          <div className="p-3 overflow-y-auto max-h-[300px] font-mono text-[11px] bg-neutral-900 text-neutral-200 leading-relaxed scrollbar-thin">
            {activeTab === "cart" && (
              <div>
                <div className="text-purple-400 font-bold mb-1">// Redux State: state.cart</div>
                <div className="text-neutral-400 text-[10px] mb-2">
                  Total Items: {cartState.items.reduce((acc, i) => acc + i.quantity, 0)} | Drawer Open: {String(cartState.isOpen)}
                </div>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(cartState, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <div className="text-pink-400 font-bold mb-1">// Redux State: state.wishlist</div>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(wishlistState, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === "ui" && (
              <div>
                <div className="text-amber-400 font-bold mb-1">// Redux State: state.ui</div>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(uiState, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === "auth" && (
              <div>
                <div className="text-emerald-400 font-bold mb-1">// Redux State: state.auth</div>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(authState, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <div className="text-blue-400 font-bold mb-1">// Redux State: state.products</div>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(productsState, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2 bg-neutral-100 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 dark:text-neutral-400 flex justify-between items-center px-3">
            <span>Store: 5 Slices Loaded</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Cart &amp; Wishlist: Server Synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
