import { create } from 'zustand';

type CartItem = {
  productId: string;

  name: string;

  price: number;

  quantity: number;
};

type CartState = {
  items: CartItem[];

  addItem: (
    item: CartItem,
  ) => void;

  increaseQuantity: (
    productId: string,
  ) => void;

  decreaseQuantity: (
    productId: string,
  ) => void;

  removeItem: (
    productId: string,
  ) => void;

  clearCart: () => void;
};

export const useCartStore =
  create<CartState>(
    (set, get) => ({
      items: [],

      addItem: (
        item,
      ) => {
        const existing =
          get().items.find(
            (
              i,
            ) =>
              i.productId ===
              item.productId,
          );

        if (existing) {
          set({
            items:
              get().items.map(
                (
                  i,
                ) =>
                  i.productId ===
                  item.productId
                    ? {
                        ...i,

                        quantity:
                          i.quantity +
                          1,
                      }
                    : i,
              ),
          });

          return;
        }

        set({
          items: [
            ...get().items,

            item,
          ],
        });
      },

      increaseQuantity: (
        productId,
      ) => {
        set({
          items:
            get().items.map(
              (
                item,
              ) =>
                item.productId ===
                productId
                  ? {
                      ...item,

                      quantity:
                        item.quantity +
                        1,
                    }
                  : item,
            ),
        });
      },

      decreaseQuantity: (
        productId,
      ) => {
        const existing =
          get().items.find(
            (
              item,
            ) =>
              item.productId ===
              productId,
          );

        if (
          existing &&
          existing.quantity ===
            1
        ) {
          set({
            items:
              get().items.filter(
                (
                  item,
                ) =>
                  item.productId !==
                  productId,
              ),
          });

          return;
        }

        set({
          items:
            get().items.map(
              (
                item,
              ) =>
                item.productId ===
                productId
                  ? {
                      ...item,

                      quantity:
                        item.quantity -
                        1,
                    }
                  : item,
            ),
        });
      },

      removeItem: (
        productId,
      ) => {
        set({
          items:
            get().items.filter(
              (
                item,
              ) =>
                item.productId !==
                productId,
            ),
        });
      },

      clearCart: () => {
        set({
          items: [],
        });
      },
    }),
  );