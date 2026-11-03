import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, MenuItem } from '../types';

interface CartContextType {
  items: CartItem[];
  tableNumber: number | null;
  setTableNumber: (table: number | null) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  updateQuantity: (cart_id: string, delta: number) => void;
  removeItem: (cart_id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cafe_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [tableNumber, setTableNumberState] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('aura_cafe_table');
      return saved ? parseInt(saved, 10) : 1;
    } catch (e) {
      return 1;
    }
  });

  const [orderNotes, setOrderNotes] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('aura_cafe_cart', JSON.stringify(items));
  }, [items]);

  const setTableNumber = (table: number | null) => {
    setTableNumberState(table);
    if (table) {
      localStorage.setItem('aura_cafe_table', table.toString());
    } else {
      localStorage.removeItem('aura_cafe_table');
    }
  };

  const addToCart = (item: MenuItem, quantity: number = 1, notes: string = '') => {
    const trimmedNotes = notes.trim();
    const cart_id = `${item.id}_${trimmedNotes}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cart_id === cart_id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            cart_id,
            menu_id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            quantity,
            notes: trimmedNotes
          }
        ];
      }
    });
  };

  const updateQuantity = (cart_id: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.cart_id === cart_id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeItem = (cart_id: string) => {
    setItems((prev) => prev.filter((item) => item.cart_id !== cart_id));
  };

  const clearCart = () => {
    setItems([]);
    setOrderNotes('');
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        setTableNumber,
        orderNotes,
        setOrderNotes,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalAmount,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
