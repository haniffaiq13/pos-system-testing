// Cart store - manages shopping cart for user purchases

import { create } from 'zustand';
import type { CartItem } from '@shared/schema';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (productId: string, productName: string, price: number, quantity?: number, imageUrl?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (productId, productName, price, quantity = 1, imageUrl) => {
    set((state) => {
      const existingItem = state.items.find(item => item.productId === productId);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { productId, productName, price, quantity, imageUrl }],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(item => item.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  openCart: () => {
    set({ isOpen: true });
  },

  closeCart: () => {
    set({ isOpen: false });
  },

  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));
