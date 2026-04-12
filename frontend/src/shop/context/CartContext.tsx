import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, ShopItem } from '../../types';

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: ShopItem) => void;
  removeFromCart: (itemId: number) => void;
  isInCart: (itemId: number) => boolean;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'secondhand-shop-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(item: ShopItem) {
    setCartItems((prev) => {
      const exists = prev.some((cartItem) => cartItem.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  }

  function removeFromCart(itemId: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function isInCart(itemId: number) {
    return cartItems.some((item) => item.id === itemId);
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.length;

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        isInCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart muss innerhalb von CartProvider verwendet werden');
  }

  return context;
}