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

import BarcodeScannerModal from '../../components/barcode-scanner-modal';

import ReceiptModal from '../../components/receipt-modal';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Input from '../../components/ui/input';

import Badge from '../../components/ui/badge';

import PageHeader from '../../components/ui/page-header';

type Product = {
  id: string;

  name: string;

  salePrice: number;

  sku: string;

  barcode: string;

  inventory?: {
    quantity: number;
  }[];
};

export default function PosPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    [],
  );

  const setQuantity =
    useCartStore(
      (state) =>
        state.setQuantity,
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
  ] = useState<any[]>(
    [],
  );

  const [
    receiptTotal,
    setReceiptTotal,
  ] = useState(0);

  const [
    scannerOpen,
    setScannerOpen,
  ] = useState(false);

  const [
    customers,
    setCustomers,
  ] = useState<any[]>(
    [],
  );

  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState('');

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<
    'PAID' | 'CREDIT'
  >('PAID');

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
          error: any
        ) {
          if (
            error.response
              ?.status === 401
          ) {
            return;
          }

          console.error(
            'Offline mode: loading cached products',
          );

          const cachedProducts =
            await db.cachedProducts.toArray();

          setProducts(
            cachedProducts,
          );
        }

        try {
          const customersResponse =
            await api.get(
              '/customers',
            );

          setCustomers(
            customersResponse.data,
          );
        } catch (
          error
        ) {
          console.error(
            'Failed to load customers',
            error,
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
    if (!search.trim()) {
      return;
    }

    const exactMatch =
      products.find(
        (
          product,
        ) =>
          product.barcode
            ?.trim()
            .toLowerCase() ===
          search
            .trim()
            .toLowerCase(),
      );

    if (!exactMatch) {
      return;
    }

    const stock =
      exactMatch
        .inventory?.[0]
        ?.quantity || 0;

    if (stock <= 0) {
      alert(
        'Out of stock',
      );

      setSearch('');

      return;
    }

    addItem({
      productId:
        exactMatch.id,

      name:
        exactMatch.name,

      price:
        exactMatch.salePrice,

      quantity: 1,

      stock,
    });

    setSearch('');

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, [
    search,
    products,
  ]);

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

      stock:
        match.inventory?.[0]
          ?.quantity || 0,
    });

    setSearch('');

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleCheckout =
    async () => {
      try {
        setCheckoutLoading(
          true,
        );

        const salePayload = {
          customerId:
            selectedCustomerId ||
            undefined,

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

          paymentStatus,
        };

        if (
        !navigator.onLine
      ) {
        await db.offlineSales.add({
          payload:
            salePayload,

          synced: false,

          serverSynced:
            false,

          createdAt:
            new Date().toISOString(),
        });

        clearCart();

        alert(
          'Sale saved offline. Will sync automatically.',
        );

        return;
      }

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

        setSelectedCustomerId(
          '',
        );

        setPaymentStatus(
          'PAID',
        );

        clearCart();
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        alert(
          error?.response?.data
            ?.message ||
            'Checkout failed',
        );
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

  const handleBarcodeScan =
    (
      barcode: string,
    ) => {
      const match =
        products.find(
          (
            product,
          ) =>
            product.barcode
              ?.trim()
              .toLowerCase() ===
            barcode
              .trim()
              .toLowerCase(),
        );

      if (!match) {
        alert(
          'Product not found',
        );

        return;
      }

      const stock =
        match.inventory?.[0]
          ?.quantity || 0;

      if (stock <= 0) {
        alert(
          'Out of stock',
        );

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

        stock,
      });

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
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
      <div className="space-y-6">
        <PageHeader
          title="POS Terminal"
          subtitle="Cashier workspace"
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card>
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() =>
                    setScannerOpen(
                      true,
                    )
                  }
                >
                  Scan Barcode
                </Button>
              </div>

              <div className="mb-6">
                <Input
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(
                  (
                    product,
                  ) => (
                    <Card
                      key={
                        product.id
                      }
                      className="border border-slate-100 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
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
                        </div>

                        <Badge
                          variant={
                            (product
                              .inventory?.[0]
                              ?.quantity ||
                              0) > 0
                              ? 'success'
                              : 'danger'
                          }
                        >
                          {(product
                            .inventory?.[0]
                            ?.quantity ||
                            0) > 0
                            ? 'In Stock'
                            : 'Out of Stock'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <span className="text-2xl font-bold">
                          Rs.{' '}
                          {
                            product.salePrice
                          }
                        </span>

                        <Button
                          onClick={() => {
                            const stock =
                              product
                                .inventory?.[0]
                                ?.quantity || 0;

                            if (
                              stock <= 0
                            ) {
                              alert(
                                'Out of stock',
                              );

                              return;
                            }

                            addItem({
                              productId:
                                product.id,

                              name:
                                product.name,

                              price:
                                product.salePrice,

                              quantity: 1,

                              stock,
                            });
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
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

                            <Button
                              variant="danger"
                              className="px-3 py-1"
                              onClick={() =>
                                removeItem(
                                  item.productId,
                                )
                              }
                            >
                              ×
                            </Button>
                          </div>

                          <p className="text-slate-500 text-sm mt-1">
                            Rs.{' '}
                            {
                              item.price
                            }
                          </p>

                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="secondary"
                              className="w-8 h-8 p-0"
                              onClick={() =>
                                decreaseQuantity(
                                  item.productId,
                                )
                              }
                            >
                              -
                            </Button>

                            <Input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(e) => {
                                const value =
                                  Number(
                                    e.target.value,
                                  );

                                if (
                                  value >
                                  item.stock
                                ) {
                                  alert(
                                    `Only ${item.stock} items available`,
                                  );

                                  return;
                                }

                                setQuantity(
                                  item.productId,
                                  value,
                                );
                              }}
                              className="w-16 text-center"
                            />

                            <Button
                              variant="secondary"
                              className="w-8 h-8 p-0"
                              onClick={() =>
                                increaseQuantity(
                                  item.productId,
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="border-t pt-4 mt-6 space-y-4">
                    <div>
                      <label className="block mb-2 font-medium">
                        Customer
                      </label>

                      <select
                        value={
                          selectedCustomerId
                        }
                        onChange={(e) => {
                          setSelectedCustomerId(
                            e.target.value,
                          );

                          if (
                            !e.target.value
                          ) {
                            setPaymentStatus(
                              'PAID',
                            );
                          }
                        }}
                        className="w-full border border-slate-200 rounded-2xl p-3 bg-white"
                      >
                        <option value="">
                          Walk-in Customer
                        </option>

                        {customers.map(
                          (
                            customer,
                          ) => (
                            <option
                              key={
                                customer.id
                              }
                              value={
                                customer.id
                              }
                            >
                              {
                                customer.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">
                        Payment Type
                      </label>

                      <div className="flex gap-4 bg-slate-100 p-3 rounded-2xl">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={
                              paymentStatus ===
                              'PAID'
                            }
                            onChange={() =>
                              setPaymentStatus(
                                'PAID',
                              )
                            }
                          />

                          <span>
                            Paid
                          </span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={
                              paymentStatus ===
                              'CREDIT'
                            }
                            disabled={
                              !selectedCustomerId
                            }
                            onChange={() =>
                              setPaymentStatus(
                                'CREDIT',
                              )
                            }
                          />

                          <span>
                            Credit
                          </span>
                        </label>
                      </div>

                      {!selectedCustomerId && (
                        <p className="text-sm text-slate-500 mt-2">
                          Credit only
                          available for
                          registered
                          customers.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>
                        Total
                      </span>

                      <span>
                        Rs. {total}
                      </span>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={
                          clearCart
                        }
                      >
                        Clear
                      </Button>

                      <Button
                        className="flex-1"
                        onClick={
                          handleCheckout
                        }
                        disabled={
                          checkoutLoading
                        }
                      >
                        {checkoutLoading
                          ? 'Processing...'
                          : 'Checkout'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
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

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() =>
          setScannerOpen(
            false,
          )
        }
        onScan={
          handleBarcodeScan
        }
      />
    </AppLayout>
  );
}