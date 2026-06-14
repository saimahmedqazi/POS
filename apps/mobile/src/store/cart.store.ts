import {
  create,
} from 'zustand';
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Product,
} from '../types/product';

export type CartItem =
  Product & {
    quantity: number;
  };

type CartStore = {
  items: CartItem[];

  addItem: (
    product: Product,
  ) => void;

  removeItem: (
    productId: string,
  ) => void;

  clearCart: () => void;

  increaseQuantity: (productId: string) => void;

  decreaseQuantity: (productId: string) => void;

  setQuantity: (productId: string, quantity: number) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (
        product,
      ) =>
        set(
          (
            state,
          ) => {
            const existing =
              state.items.find(
                (
                  item,
                ) =>
                  item.id ===
                  product.id,
              );

            if (
              existing
            ) {
              return {
                items:
                  state.items.map(
                    (
                      item,
                    ) =>
                      item.id ===
                      product.id
                        ? {
                            ...item,

                            quantity:
                              item.quantity +
                              1,
                          }
                        : item,
                  ),
              };
            }

            return {
              items: [
                ...state.items,

                {
                  ...product,

                  quantity: 1,
                },
              ],
            };
          },
        ),

      removeItem: (
        productId,
      ) =>
        set(
          (
            state,
          ) => ({
            items:
              state.items.filter(
                (
                  item,
                ) =>
                  item.id !==
                  productId,
              ),
          }),
        ),

      clearCart: () =>
        set({
          items: [],
        }),

      increaseQuantity:
        (
          productId,
        ) =>
          set(
            (
              state,
            ) => ({
              items:
                state.items.map(
                  (
                    item,
                  ) =>
                    item.id ===
                    productId
                      ? {
                          ...item,

                          quantity:
                            item.quantity +
                            1,
                        }
                      : item,
                ),
            }),
          ),

      decreaseQuantity:
        (
          productId,
        ) =>
          set(
            (
              state,
            ) => ({
              items:
                state.items
                  .map(
                    (
                      item,
                      ) =>
                      item.id ===
                      productId
                        ? {
                            ...item,

                            quantity:
                              item.quantity -
                              1,
                          }
                        : item,
                  )
                  .filter(
                    (
                      item,
                    ) =>
                      item.quantity >
                      0,
                  ),
            }),
          ),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== productId)
              : state.items.map((item) =>
                  item.id === productId
                    ? { ...item, quantity: Math.floor(quantity) }
                    : item,
                ),
        })),
    }),
    {
      name: 'shopping-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);