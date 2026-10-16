import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, Cart, CartItem } from '@/services/cart-api';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  cartCount: number;
  subtotal: string;
  shippingFee: string;
  tax: string;
  total: string;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  addToCart: (variantId: string, quantity?: number) => Promise<{ success: boolean; error?: string; cart?: Cart }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  items: [],
  cartCount: 0,
  subtotal: '0.00',
  shippingFee: '0.00',
  tax: '0.00',
  total: '0.00',
  isLoading: false,
  isMutating: false,
  error: null,
  addToCart: async () => ({ success: false }),
  updateQuantity: async () => ({ success: false }),
  removeItem: async () => ({ success: false }),
  clearCart: async () => ({ success: false }),
  refreshCart: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await cartApi.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      console.warn('Could not fetch cart:', err);
      // Non-fatal on boot
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (variantId: string, quantity: number = 1) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await cartApi.addItem({ variantId, quantity });
      if (res?.data) {
        setCart(res.data);
        return { success: true, cart: res.data };
      }
      return { success: false, error: 'Failed to add item to cart' };
    } catch (err: any) {
      const msg = err.message || 'Could not add to cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsMutating(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return { success: false, error: 'Quantity must be at least 1' };
    setIsMutating(true);
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      if (res?.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, error: 'Failed to update quantity' };
    } catch (err: any) {
      const msg = err.message || 'Could not update quantity';
      return { success: false, error: msg };
    } finally {
      setIsMutating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsMutating(true);
    try {
      const res = await cartApi.removeItem(itemId);
      if (res?.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, error: 'Failed to remove item' };
    } catch (err: any) {
      const msg = err.message || 'Could not remove item';
      return { success: false, error: msg };
    } finally {
      setIsMutating(false);
    }
  };

  const clearCart = async () => {
    setIsMutating(true);
    try {
      const res = await cartApi.clearCart();
      if (res?.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, error: 'Failed to clear cart' };
    } catch (err: any) {
      const msg = err.message || 'Could not clear cart';
      return { success: false, error: msg };
    } finally {
      setIsMutating(false);
    }
  };

  const items = cart?.items || [];
  const cartCount = cart?.totalQuantity ?? items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart?.subtotal || '0.00';
  const shippingFee = cart?.shippingFee || '5.00';
  const tax = cart?.tax || '0.00';
  const total = cart?.total || '0.00';

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        subtotal,
        shippingFee,
        tax,
        total,
        isLoading,
        isMutating,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
