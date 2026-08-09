import { createContext, useContext, useState, useCallback } from "react";

import p4 from "../assets/p4.webp";
import p5 from "../assets/p5.webp";
import p6 from "../assets/p6.webp";

const INITIAL_CART_ITEMS = [
  {
    id: "p4-Sienna-L",
    productId: 4,
    name: "Cashmere Sweater",
    slug: "cashmere-sweater",
    color: "Sienna",
    size: "L",
    price: 199.0,
    quantity: 1,
    image: p4,
  },
  {
    id: "p5-Black-XL",
    productId: 5,
    name: "Linen Blazer",
    slug: "linen-blazer",
    color: "Black",
    size: "XL",
    price: 99.0,
    quantity: 1,
    image: p5,
  },
  {
    id: "p6-White-M",
    productId: 6,
    name: "Velvet Skirt",
    slug: "velvet-skirt",
    color: "White",
    size: "M",
    price: 119.0,
    quantity: 1,
    image: p6,
  },
];

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(INITIAL_CART_ITEMS);

  const addToCart = useCallback((product, quantity = 1, selectedColor, selectedSize) => {
    const color = selectedColor || "Default";
    const size = selectedSize || "One Size";
    const cartId = `${product.id}-${color}-${size}`;
    let newQuantity = quantity;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartId);
      if (existing) {
        newQuantity = existing.quantity + quantity;
        return prev.map((item) =>
          item.id === cartId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          color,
          size,
          price: parseFloat(product.price),
          quantity,
          image: product.image || (product.thumbs && product.thumbs[0]),
        },
      ];
    });

    return { cartId, totalQuantity: newQuantity };
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setItems((prev) => prev.filter((item) => item.id !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId, newQuantity) => {
    if (newQuantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const getItemQuantity = useCallback((productId, selectedColor, selectedSize) => {
    const color = selectedColor || "Default";
    const size = selectedSize || "One Size";
    const cartId = `${productId}-${color}-${size}`;
    const found = items.find((item) => item.id === cartId || item.productId === productId);
    return found ? found.quantity : 0;
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
