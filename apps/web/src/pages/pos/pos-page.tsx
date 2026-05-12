import {
  useEffect,
  useRef,
  useState,
} from 'react';

import api from '../../api/client';

import {
  useCartStore,
} from '../../store/cart.store';

import AppLayout from '../../layouts/app-layout';

import {
  db,
} from '../../utils/db';

type Product = {
  id: string;

  name: string;

  salePrice: number;

  sku: string;

  barcode: string;
};

import ReceiptModal from '../../components/receipt-modal';

export default function PosPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [
    checkoutLoading,
    setCheckoutLoading,
  ] = useState(false);

  const [search, setSearch] =
    useState('');

  const searchInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const items =
    useCartStore(
      (state) =>
        state.items,
    );

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  const clearCart =
    useCartStore(
      (state) =>
        state.clearCart,
    );

  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity,
    );

  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity,
    );

  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem,
    );

    const [
  receiptOpen,
  setReceiptOpen,
] = useState(false);

const [
  receiptItems,
  setReceiptItems,
] = useState<any[]>([]);

const [
  receiptTotal,
  setReceiptTotal,
] = useState(0);

  useEffect(() => {
    const fetchProducts =
      async () => {
        try {
          const response =
            await api.get(
              '/products',
            );

          const fetchedProducts =
            response.data;

          setProducts(
            fetchedProducts,
          );

          await db.cachedProducts.clear();

          await db.cachedProducts.bulkPut(
            fetchedProducts,
          );
        } catch (
          error
        ) {
          console.error(
            'Offline mode: loading cached products',
          );

          const cachedProducts =
            await db.cachedProducts.toArray();

          setProducts(
            cachedProducts,
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProducts();
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const syncOfflineSales =
      async () => {
        if (
          !navigator.onLine
        ) {
          return;
        }

        const unsyncedSales =
          await db.offlineSales
          .filter(
  (sale) =>
    sale.synced ===
    false,
)
            .toArray();

        for (const sale of unsyncedSales) {
          try {
            await api.post(
              '/sales',
              sale.payload,
            );

            if (
              sale.id
            ) {
              await db.offlineSales.update(
                sale.id,
                {
                  synced: true,

                  serverSynced: true,
                },
              );
            }

            console.log(
              'Offline sale synced',
            );
          } catch (
            error
          ) {
            console.error(
              'Sync failed',
              error,
            );
          }
        }
      };

    syncOfflineSales();

    window.addEventListener(
      'online',
      syncOfflineSales,
    );

    return () => {
      window.removeEventListener(
        'online',
        syncOfflineSales,
      );
    };
  }, []);

  const total =
    items.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.price *
          item.quantity,

      0,
    );

  const filteredProducts =
    products.filter(
      (product) => {
        const query =
          search.toLowerCase();

        return (
          product.name
            .toLowerCase()
            .includes(query) ||

          product.sku
            .toLowerCase()
            .includes(query) ||

          product.barcode
            .toLowerCase()
            .includes(query)
        );
      },
    );

  const handleSearchEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== 'Enter') {
      return;
    }

    const match =
      filteredProducts[0];

    if (!match) {
      return;
    }

    addItem({
      productId:
        match.id,

      name:
        match.name,

      price:
        match.salePrice,

      quantity: 1,
    });

    setSearch('');

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const salePayload = {
    items: items.map(
      (item) => ({
        productId:
          item.productId,

        quantity:
          item.quantity,

        unitPrice:
          item.price,
      }),
    ),

    discount: 0,

    paymentStatus:
      'PAID',
  };

  const handleCheckout =
    async () => {
      try {
        setCheckoutLoading(
          true,
        );

        await api.post(
          '/sales',
          salePayload,
        );

       setReceiptItems(
  [...items],
);

setReceiptTotal(
  total,
);

setReceiptOpen(
  true,
);

clearCart();
      } catch (
        error
      ) {
        console.error(
          'Offline sale stored locally',
        );

        await db.offlineSales.add(
          {
            payload:
              salePayload,

            synced: false,

            serverSynced: false,

            createdAt:
              new Date().toISOString(),
          },
        );

        alert(
          'Offline sale saved locally',
        );

        clearCart();
      } finally {
        setCheckoutLoading(
          false,
        );

        setSearch('');

        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    };

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading products...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            POS Terminal
          </h1>

          <p className="text-slate-500 mt-1">
            Cashier workspace
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="mb-4">
                <input
                  ref={
                    searchInputRef
                  }
                  type="text"
                  placeholder="Search by name, SKU or barcode..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target
                        .value,
                    )
                  }
                  onKeyDown={
                    handleSearchEnter
                  }
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(
                  (
                    product,
                  ) => (
                    <div
                      key={
                        product.id
                      }
                      className="border border-slate-200 rounded-2xl p-4"
                    >
                      <h3 className="text-lg font-semibold">
                        {
                          product.name
                        }
                      </h3>

                      <p className="text-slate-500 text-sm mt-1">
                        SKU:{' '}
                        {
                          product.sku
                        }
                      </p>

                      <p className="text-slate-500 text-sm">
                        Barcode:{' '}
                        {
                          product.barcode
                        }
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-bold">
                          Rs.{' '}
                          {
                            product.salePrice
                          }
                        </span>

                        <button
                          onClick={() =>
                            addItem({
                              productId:
                                product.id,

                              name:
                                product.name,

                              price:
                                product.salePrice,

                              quantity: 1,
                            })
                          }
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">
                Cart
              </h2>

              {items.length ===
              0 ? (
                <p className="text-slate-500">
                  Cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map(
                      (
                        item,
                      ) => (
                        <div
                          key={
                            item.productId
                          }
                          className="border-b border-slate-200 pb-4"
                        >
                          <div className="flex justify-between">
                            <h4 className="font-semibold">
                              {
                                item.name
                              }
                            </h4>

                            <button
                              onClick={() =>
                                removeItem(
                                  item.productId,
                                )
                              }
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </div>

                          <p className="text-slate-500 text-sm mt-1">
                            Rs.{' '}
                            {
                              item.price
                            }
                          </p>

                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.productId,
                                )
                              }
                              className="w-8 h-8 rounded-lg border"
                            >
                              -
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.productId,
                                )
                              }
                              className="w-8 h-8 rounded-lg border"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>
                        Total
                      </span>

                      <span>
                        Rs. {total}
                      </span>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={
                          clearCart
                        }
                        className="flex-1 border border-slate-300 py-3 rounded-xl"
                      >
                        Clear
                      </button>

                      <button
                        onClick={
                          handleCheckout
                        }
                        disabled={
                          checkoutLoading
                        }
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800"
                      >
                        {checkoutLoading
                          ? 'Processing...'
                          : 'Checkout'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    <ReceiptModal
  open={receiptOpen}
  items={receiptItems}
  total={receiptTotal}
  onClose={() =>
    setReceiptOpen(false)
  }
/>
</AppLayout>
  );
}