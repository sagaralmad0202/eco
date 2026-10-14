import { useCart } from "../hooks/useCart";

/**
 * @deprecated CartContext has been replaced by the custom `useCart` hook in `src/hooks/useCart.js`.
 * This file is retained as a compatibility shim.
 */
export { useCart };

export function CartProvider({ children }) {
  return <>{children}</>;
}

export default useCart;
