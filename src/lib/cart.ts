'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics';
import { trackAddToCart as pixelAddToCart } from '@/lib/pixels';
import type { Product, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, selectedColor) => {
        // Track add to cart
        trackAddToCart(product.id, product.name, product.price, quantity);
        // Track on all pixels
        pixelAddToCart({
          content_id: product.id,
          content_name: product.name,
          value: product.price * quantity,
          quantity,
          currency: 'DZD',
        });

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.selectedColor === selectedColor
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.selectedColor === selectedColor
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity, selectedColor }],
          };
        });
      },

      removeItem: (productId) => {
        const item = get().items.find(i => i.product.id === productId);
        if (item) {
          trackRemoveFromCart(productId);
        }
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'tiarphone-cart',
    }
  )
);
