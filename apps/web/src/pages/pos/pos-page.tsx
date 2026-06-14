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

import { useHotkeys } from 'react-hotkeys-hook';
import { useBarcodeScanner } from '../../hooks/use-barcode-scanner';
import { Trash2, Maximize2, Minimize2, Loader2, Info } from 'lucide-react';

import AppLayout from '../../layouts/app-layout';

import Toast from '../../components/ui/toast';

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

  // CASH
  const [
    cashReceived,
    setCashReceived,
  ] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const cashReceivedNumber =
    Number(
      cashReceived || 0,
    );

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

  const changeAmount =
    paymentStatus ===
      'PAID'
      ? safeMoney(
        Math.max(
          cashReceivedNumber -
          total,
          0,
        ),
      )
      : 0;

  const remainingAmount =
    paymentStatus ===
      'PAID'
      ? safeMoney(
        Math.max(
          total -
          cashReceivedNumber,
          0,
        ),
      )
      : 0;

  const loadLocalData =
    async () => {
      try {
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

  useEffect(() => {
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
      setErrorMessage(
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

  useHotkeys('f2', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  });

  useHotkeys('f3', (e) => {
    e.preventDefault();
    setScannerOpen(true);
  });

  useHotkeys('f9', (e) => {
    e.preventDefault();
    if (!checkoutLoading && items.length > 0) {
      handleCheckout();
    }
  });

  useHotkeys('esc', (e) => {
    if (items.length > 0) {
      e.preventDefault();
      if (!showConfirmClear) {
        setShowConfirmClear(true);
      } else {
        clearCart();
        setCashReceived('');
        setShowConfirmClear(false);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  });

  useHotkeys('f11', (e) => {
    e.preventDefault();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  useBarcodeScanner({
    onScan: (barcode) => {
      handleBarcodeScan(barcode);
    }
  });

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
      setErrorMessage(
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
        setErrorMessage(
          'Cart is empty',
        );

        return;
      }

      if (
        total < 0
      ) {
        setErrorMessage(
          'Cart total cannot be negative',
        );

        return;
      }

      // CASH VALIDATION
      if (
        paymentStatus ===
        'PAID' &&
        cashReceivedNumber <
        total
      ) {
        setErrorMessage(
          'Insufficient cash received',
        );

        return;
      }

      // CREDIT VALIDATION
      if (
        paymentStatus ===
        'CREDIT' &&
        !selectedCustomerId
      ) {
        setErrorMessage(
          'You must select a customer for credit sales',
        );

        return;
      }

      try {
        setCheckoutLoading(
          true,
        );

        const latestProducts =
          await getProducts();

        for (const item of items) {
          const latestProduct =
            (
              latestProducts as any[]
            ).find(
              (
                product: any,
              ) =>
                product.id ===
                item.productId,
            );

          if (
            !latestProduct
          ) {
            setErrorMessage(
              `${item.name} no longer exists`,
            );

            return;
          }

          if (
            Number(
              latestProduct.quantity ||
              0,
            ) < item.quantity
          ) {
            setErrorMessage(
              `Insufficient stock for ${item.name}`,
            );

            return;
          }
        }

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
            setErrorMessage(
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
            setErrorMessage(
              `Invalid quantity: ${item.name}`,
            );

            return;
          }
        }

        await createLocalSale(
          salePayload,
        );

        setCheckoutLoading(
          false,
        );

        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);

        const refreshedProducts =
          await getProducts();

        setProducts(
          (
            refreshedProducts as any[]
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

        const receiptData = [
          ...items,
        ];

        const receiptTotal =
          total;

        clearCart();

        setSelectedCustomerId(
          '',
        );

        setPaymentStatus(
          'PAID',
        );

        setSearch('');

        setCashReceived(
          '',
        );

        setReceiptItems(
          receiptData,
        );

        setReceiptTotal(
          receiptTotal,
        );

        setReceiptOpen(
          true,
        );
      } catch (
      error
      ) {
        console.error(
          error,
        );

        setCheckoutLoading(
          false,
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to complete sale.',
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
        setErrorMessage(
          'Product not found',
        );

        return;
      }

      const stock =
        match.quantity || 0;

      if (stock <= 0) {
        setErrorMessage(
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
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-foreground/70 font-medium animate-pulse">
            Loading products...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <PageHeader
            title="POS Terminal"
            subtitle="Cashier workspace"
          />

          {!isFullscreen && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-medium bg-surface border border-border px-3 py-2 rounded-xl shadow-sm">
              <span className="bg-background px-2 py-1 rounded-md border border-border">F2 Search</span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">F3 Scan</span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">F9 Checkout</span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">ESC Clear</span>
            </div>
          )}
        </div>
        
        {showConfirmClear && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Info size={16} /> Press ESC again or click confirm to empty the cart.
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="!py-1.5 !px-3 !text-xs" onClick={() => setShowConfirmClear(false)}>Cancel</Button>
              <Button variant="danger" className="!py-1.5 !px-3 !text-xs" onClick={() => {
                clearCart();
                setCashReceived('');
                setShowConfirmClear(false);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}>Clear Cart</Button>
            </div>
          </div>
        )}

        <Toast message={errorMessage} variant="error" onClose={() => setErrorMessage('')} />
        <Toast message={successMessage} variant="success" onClose={() => setSuccessMessage('')} />

        <div className="flex flex-col lg:grid lg:grid-cols-[2fr_1fr] flex-1 min-h-0 gap-3">
          {/* PRODUCTS */}
          <div className="min-h-[50vh] lg:min-h-0">
            <Card className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  {
                    filteredProducts.length
                  }{' '}
                  products
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (
                        !document.fullscreenElement
                      ) {
                        document.documentElement.requestFullscreen();
                      } else {
                        document.exitFullscreen();
                      }
                    }}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 size={16} /> Exit Full Screen
                      </>
                    ) : (
                      <>
                        <Maximize2 size={16} /> Full Screen
                      </>
                    )}
                  </Button>

                  <Button
                    disabled={
                      checkoutLoading ||
                      scannerOpen
                    }
                    onClick={() =>
                      setScannerOpen(
                        true,
                      )
                    }
                  >
                    Scan Barcode
                  </Button>
                </div>

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
                  <div className="bg-surface/50 border border-border rounded-2xl p-8 text-center text-muted-foreground">
                    No products found
                  </div>
                )}
<div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map(
                  (
                    product,
                  ) => (
                    <Card
                      key={
                        product.id
                      }
                      className="border border-border hover:shadow-md transition p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {
                              product.name
                            }
                          </h3>


                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              product.quantity >
                                0
                                ? product.quantity <=
                                  5
                                  ? 'warning'
                                  : 'success'
                                : 'danger'
                            }
                          >
                            {product.quantity >
                              0
                              ? product.quantity <=
                                5
                                ? 'Low Stock'
                                : 'In Stock'
                              : 'Out of Stock'}
                          </Badge>

                          <div className="text-sm font-semibold text-foreground">
                            Qty:{' '}
                            {
                              product.quantity
                            }
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
                          disabled={
                            checkoutLoading
                          }
                          onClick={() => {
                            const stock =
                              product.quantity ||
                              0;

                            if (
                              stock <= 0
                            ) {
                              setErrorMessage(
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
              </div>
            </Card>
          </div>

          {/* CART */}
          <div className="min-h-0 flex flex-col">
            <Card className="h-full flex flex-col min-h-0">
              <h2 className="text-2xl font-bold mb-3">
                Cart
              </h2>

              {items.length ===
                0 ? (
                <p className="text-muted-foreground">
                  Cart is empty
                </p>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto">
                    {items.map(
                      (
                        item: any,
                      ) => (
                        <div
                          key={item.productId}
                          className="border border-border rounded-2xl p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="font-bold text-primary">
                                  Rs. {item.price}
                                </p>
                                <span className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground">
                                  Stock: {item.stock}
                                </span>
                              </div>
                            </div>

                            <Button
                              variant="danger"
                              className="!p-2"
                              disabled={checkoutLoading}
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3 mt-4">
                            <Button
                              variant={item.quantity <= 1 ? 'danger' : 'secondary'}
                              className="w-12 h-12 p-0 text-xl font-bold flex items-center justify-center shrink-0"
                              disabled={checkoutLoading}
                              onClick={() => {
                                if (item.quantity <= 1) {
                                  removeItem(item.productId);
                                } else {
                                  decreaseQuantity(item.productId);
                                }
                              }}
                            >
                              −
                            </Button>

                            <Input
                              disabled={checkoutLoading}
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (!raw.trim()) return;
                                const value = Number(raw);
                                if (!Number.isFinite(value)) return;
                                const sanitized = Math.floor(value);
                                if (sanitized < 1) {
                                  setQuantity(item.productId, 1);
                                  return;
                                }
                                if (sanitized > item.stock) {
                                  setQuantity(item.productId, item.stock);
                                  return;
                                }
                                setQuantity(item.productId, sanitized);
                              }}
                              className="flex-1 h-12 text-center text-lg font-bold appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <Button
                              variant="secondary"
                              className="w-12 h-12 p-0 text-xl font-bold flex items-center justify-center shrink-0"
                              disabled={checkoutLoading || item.quantity >= item.stock}
                              onClick={() => increaseQuantity(item.productId)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="border-t pt-5 mt-6 space-y-4">
                    {/* CUSTOMER */}
                    <div>
                      <label className="block mb-2 font-medium">
                        Customer
                      </label>

                      <select
                        disabled={
                          checkoutLoading
                        }
                        value={
                          selectedCustomerId
                        }
                        onChange={(
                          e,
                        ) => {
                          setSelectedCustomerId(
                            e.target
                              .value,
                          );

                          if (
                            !e.target
                              .value
                          ) {
                            setPaymentStatus(
                              'PAID',
                            );
                          }
                        }}
                        className="w-full border border-border rounded-xl p-3 bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        <option value="">
                          Walk-in
                          Customer
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

                    {/* PAYMENT */}
                    <div>
                      <label className="block mb-2 font-medium">
                        Payment
                        Type
                      </label>

                      <div className="flex gap-4 bg-surface/50 border border-border p-3 rounded-2xl">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={
                              paymentStatus ===
                              'PAID'
                            }
                            disabled={
                              checkoutLoading
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
                              checkoutLoading ||
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
                        <p className="text-sm text-muted-foreground mt-2">
                          Credit only
                          available
                          for
                          registered
                          customers.
                        </p>
                      )}
                    </div>

                    {/* TOTALS */}
                    <div className="bg-surface rounded-xl p-4 border border-border space-y-3 shadow-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          Items
                        </span>

                        <span>
                          {
                            items.reduce(
                              (
                                acc: number,
                                item: any,
                              ) =>
                                acc +
                                item.quantity,
                              0,
                            )
                          }
                        </span>
                      </div>

                      <div className="flex justify-between text-3xl font-bold">
                        <span>
                          Total
                        </span>

                        <span>
                          Rs.{' '}
                          {total}
                        </span>
                      </div>
                    </div>

                    {/* CASH */}
                    {paymentStatus ===
                      'PAID' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block mb-2 font-medium">
                              Cash
                              Received
                            </label>

                            <Input
                              disabled={
                                checkoutLoading
                              }
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Enter cash amount"
                              value={
                                cashReceived
                              }
                              onChange={(
                                e,
                              ) =>
                                setCashReceived(
                                  e.target
                                    .value,
                                )
                              }
                              className="text-lg font-semibold"
                            />
                          </div>

                          {/* QUICK CASH */}
                          <div className="flex flex-wrap gap-2">
                            {[
                              total,
                              total +
                              100,
                              total +
                              500,
                              total +
                              1000,
                            ].map(
                              (
                                amount,
                                index,
                              ) => (
                                <button
                                  key={
                                    index
                                  }
                                  type="button"
                                  disabled={
                                    checkoutLoading
                                  }
                                  onClick={() =>
                                    setCashReceived(
                                      String(
                                        safeMoney(
                                          amount,
                                        ),
                                      ),
                                    )
                                  }
                                  className="px-4 py-2 rounded-xl border border-border bg-surface/50 hover:bg-surface text-sm font-medium transition"
                                >
                                  Rs.{' '}
                                  {safeMoney(
                                    amount,
                                  )}
                                </button>
                              ),
                            )}
                          </div>

                          {/* CHANGE */}
                          <div className="rounded-2xl border border-border overflow-hidden">
                            <div className="flex justify-between p-4 bg-surface/50 border-t border-border">
                              <span className="font-medium">
                                Received
                              </span>

                              <span className="font-semibold">
                                Rs.{' '}
                                {cashReceivedNumber ||
                                  0}
                              </span>
                            </div>

                            <div className="border-t border-border flex justify-between p-4 bg-surface/50">
                              <span className="font-medium">
                                Change
                              </span>

                              <span className="text-xl font-bold text-emerald-600">
                                Rs.{' '}
                                {
                                  changeAmount
                                }
                              </span>
                            </div>

                            {remainingAmount >
                              0 && (
                                <div className="border-t border-border flex justify-between p-4 bg-red-500/10">
                                  <span className="font-medium text-red-700">
                                    Remaining
                                  </span>

                                  <span className="text-lg font-bold text-red-700">
                                    Rs.{' '}
                                    {
                                      remainingAmount
                                    }
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* ACTIONS */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="secondary"
                        className="flex-1 h-12"
                       onClick={() => {
  clearCart();

  setCashReceived('');

  setTimeout(() => {
    searchInputRef.current?.focus();
  }, 50);
}}
                        disabled={
                          checkoutLoading
                        }
                      >
                        Clear
                      </Button>

                      <Button
                        className="flex-[2] h-12 text-base font-semibold"
                        onClick={() => {
                          if (
                            checkoutLoading
                          ) {
                            return;
                          }

                          handleCheckout();
                        }}
                        disabled={
                          checkoutLoading ||
                          items.length ===
                          0 ||
                          (
                            paymentStatus ===
                            'PAID' &&
                            cashReceivedNumber <
                            total
                          )
                        }
                      >
                        {checkoutLoading
                          ? 'Processing...'
                          : paymentStatus ===
                            'PAID'
                            ? 'Complete Sale'
                            : 'Save Credit Sale'}
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
  onClose={() => {
    setReceiptOpen(false);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }}
/>
      <BarcodeScannerModal
  open={scannerOpen}
  onClose={() => {
    setScannerOpen(false);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }}
  onScan={
    handleBarcodeScan
  }
/>
    </AppLayout>
  );
}
