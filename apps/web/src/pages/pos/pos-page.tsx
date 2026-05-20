import {
  useMemo,
} from 'react';

import {
  getCustomers,
} from '../../repositories/customer.repository';

import {
  useEffect,
  useRef,
  useState,
} from 'react';



import {
  useCartStore,
} from '../../store/cart.store';

import AppLayout from '../../layouts/app-layout';

import {
  getProducts,
} from '../../repositories/product.repository';



import BarcodeScannerModal from '../../components/barcode-scanner-modal';

import ReceiptModal from '../../components/receipt-modal';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Input from '../../components/ui/input';

import Badge from '../../components/ui/badge';

import PageHeader from '../../components/ui/page-header';

import {
  createLocalSale,
} from '../../repositories/sale.repository';

type Product = {
  id: string;

  name: string;

  salePrice: number;

  sku: string;

  barcode: string;

  quantity: number;
};

const safeMoney = (
    value: number,
  ) =>
    Number(
      value.toFixed(2),
    );
export default function PosPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    [],
  );


  
  const setQuantity =
    useCartStore(
      (state: any) =>
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
      (state: any) =>
        state.items,
    );

  const addItem =
    useCartStore(
      (state: any) =>
        state.addItem,
    );

  const clearCart =
    useCartStore(
      (state: any) =>
        state.clearCart,
    );

  const increaseQuantity =
    useCartStore(
      (state: any) =>
        state.increaseQuantity,
    );

  const decreaseQuantity =
    useCartStore(
      (state: any) =>
        state.decreaseQuantity,
    );

  const removeItem =
    useCartStore(
      (state: any) =>
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
    const loadLocalData =
      async () => {
        try {
          // PRODUCTS
          const localProducts =
            await getProducts();

          setProducts(
            (
              localProducts as any[]
            ).map(
              (
                product: any,
              ) => ({
                id: product.id,

                name:
                  product.name,

                salePrice:
                  Number(
                    product.sale_price ||
                    0,
                  ),

                sku:
                  product.sku || '',

                barcode:
                  product.barcode ||
                  '',

                quantity:
                  Number(
                    product.quantity ||
                    0,
                  ),
              }),
            ),
          );


          const localCustomers =
            await getCustomers();

          setCustomers(
            localCustomers as any[],
          );
        } catch (
        error
        ) {
          console.error(
            'Failed loading local POS data',
            error,
          );
        } finally {
          setLoading(false);
        }
      };

    loadLocalData();
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
      exactMatch.quantity || 0;

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
    safeMoney(
      items.reduce(
        (
          sum: number,
          item: any,
        ) =>
          sum +
          safeMoney(
            item.price *
            item.quantity,
          ),
        0,
      ),
    );
  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return products;
      }

     return products.filter(
  (product) =>
    product.name
      ?.toLowerCase()
      .includes(query) ||

    product.sku
      ?.toLowerCase()
      .includes(query) ||

    product.barcode
      ?.toLowerCase()
      .includes(query),
);
    }, [
      products,
      search,
    ]);

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
if (
  match.quantity <= 0
) {
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

      stock:
        match.quantity || 0,
    });

    setSearch('');

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleCheckout =
    async () => {
      if (
        checkoutLoading
      ) {
        return;
      }

      if (
        items.length === 0
      ) {
        alert(
          'Cart is empty',
        );

        return;
      }

      try {
        setCheckoutLoading(
          true,
        );

        const salePayload = {
          saleId:
            crypto.randomUUID(),

          customerId:
            selectedCustomerId ||
            undefined,

          items: items.map(
            (
              item: any,
            ) => ({
              productId:
                item.productId,

              quantity:
                Number(
                  item.quantity,
                ),

              unitPrice:
  safeMoney(
    Number(
      item.price,
    ),
  ),
            }),
          ),

          discount: 0,

          paymentStatus,
        };
for (const item of items) {
  if (
    !Number.isFinite(
      Number(item.price),
    )
  ) {
    alert(
      `Invalid product price: ${item.name}`,
    );

    return;
  }

  if (
    !Number.isFinite(
      Number(item.quantity),
    ) ||
    Number(item.quantity) <= 0
  ) {
    alert(
      `Invalid quantity: ${item.name}`,
    );

    return;
  }
}
        // SAVE LOCALLY
        await createLocalSale(
          salePayload,
        );

        // UPDATE UI STOCK
        setProducts((prev) =>
          prev.map(
            (
              product: any,
            ) => {
              const soldItem =
                salePayload.items.find(
                  (
                    item: any,
                  ) =>
                    item.productId ===
                    product.id,
                );

              if (
                !soldItem
              ) {
                return product;
              }

              return {
                ...product,

                quantity:
                  Math.max(
                    Number(
                      product.quantity ||
                      0,
                    ) -
                    Number(
                      soldItem.quantity,
                    ),
                    0,
                  ),
              };
            },
          ),
        );

        // RECEIPT
        setReceiptItems([
          ...items,
        ]);

        setReceiptTotal(
          total,
        );

        setReceiptOpen(
          true,
        );

        // RESET
        clearCart();

        setSelectedCustomerId(
          '',
        );

        setPaymentStatus(
          'PAID',
        );

        setSearch('');

        alert(
          'Sale completed successfully.',
        );
      } catch (
      error
      ) {
        console.error(
          error,
        );

        alert(
          'Failed to complete sale.',
        );
      } finally {
        setCheckoutLoading(
          false,
        );

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
        match.quantity || 0;
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
{filteredProducts.length ===
  0 && (
  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
    No products found
  </div>
)}
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

                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              product.quantity > 0
                                ? product.quantity <= 5
                                  ? 'warning'
                                  : 'success'
                                : 'danger'
                            }
                          >
                            {product.quantity > 0
                              ? product.quantity <= 5
                                ? 'Low Stock'
                                : 'In Stock'
                              : 'Out of Stock'}
                          </Badge>

                          <div className="text-sm font-semibold text-slate-600">
                            Qty:
                            {' '}
                            {product.quantity}
                          </div>
                        </div>
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
                              product.quantity || 0;

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
                        item: any,
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
                                const raw =
                                  e.target.value;

                                const value =
                                  Number(raw);

                                // INVALID
                                if (
                                  !Number.isFinite(
                                    value,
                                  )
                                ) {
                                  return;
                                }

                                // NO DECIMALS
                                const sanitized =
                                  Math.floor(value);

                                // MINIMUM 1
                                if (
                                  sanitized < 1
                                ) {
                                  setQuantity(
                                    item.productId,
                                    1,
                                  );

                                  return;
                                }

                                // STOCK LIMIT
                                if (
                                  sanitized >
                                  item.stock
                                ) {
                                  alert(
                                    `Only ${item.stock} items available`,
                                  );

                                  setQuantity(
                                    item.productId,
                                    item.stock,
                                  );

                                  return;
                                }

                                setQuantity(
                                  item.productId,
                                  sanitized,
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