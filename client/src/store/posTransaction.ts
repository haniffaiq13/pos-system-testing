// POS Transaction store - manages current transaction state for POS app

import { create } from 'zustand';
import type { CartItem } from '@shared/schema';

interface POSTransactionStore {
  items: CartItem[];
  customerId: string | null;
  customerEmail: string;
  voucherCode: string;
  addItem: (productId: string, productName: string, price: number, imageUrl?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (id: string | null, email: string) => void;
  setVoucherCode: (code: string) => void;
  clearTransaction: () => void;
  getSubtotal: () => number;
}

export const usePOSTransactionStore = create<POSTransactionStore>((set, get) => ({
  items: [],
  customerId: null,
  customerEmail: '',
  voucherCode: '',

  addItem: (productId, productName, price, imageUrl) => {
    set((state) => {
      const existingItem = state.items.find(item => item.productId === productId);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { productId, productName, price, quantity: 1, imageUrl }],
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

  setCustomer: (id, email) => {
    set({ customerId: id, customerEmail: email });
  },

  setVoucherCode: (code) => {
    set({ voucherCode: code });
  },

  clearTransaction: () => {
    set({
      items: [],
      customerId: null,
      customerEmail: '',
      voucherCode: '',
    });
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
