import {
  useEffect,
  useState,
} from 'react';

import AppLayout from '../../layouts/app-layout';

import PageHeader from '../../components/ui/page-header';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Modal from '../../components/ui/modal';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../../components/ui/table';

import {
  fetchRetailerOrders,
  updateRetailerOrderStatus,
  updateRetailerOrderItems,
} from '../../services/retailer-orders.service';

import {
  getProducts,
} from '../../repositories/product.repository';

import {
  createLocalSale,
} from '../../repositories/sale.repository';

type OrderItem = {
  id: string;

  product_id: string;

  product_name: string;

  requested_quantity: number;

  fulfilled_quantity: number;

  unit_price: number;

  subtotal: number;
};

type FulfillmentItem = {
  itemId: string;

  productId: string;

  productName: string;

  requestedQuantity: number;

  originalRequestedQuantity: number;

  alreadyFulfilledQuantity: number;

  availableStock: number;

  fulfillQuantity: number;

  unitPrice: number;
  editableUnitPrice: number;
};

type RetailerOrder = {
  id: string;

  status:
    | 'PENDING'
    | 'PARTIAL'
    | 'FULFILLED'
    | 'REJECTED';

  total_amount: number;

  notes?: string;

  created_at: string;

  retailers?: {
  business_name: string;

  phone?: string;

  customer_local_id?: string;
};
  retailer_order_items: OrderItem[];
};

export default function OrdersPage() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    orders,
    setOrders,
  ] = useState<
    RetailerOrder[]
  >([]);

  const [
    selectedOrder,
    setSelectedOrder,
  ] =
    useState<RetailerOrder | null>(
      null,
    );

  const [
    detailsModalOpen,
    setDetailsModalOpen,
  ] = useState(false);

  const [
    fulfillmentModalOpen,
    setFulfillmentModalOpen,
  ] = useState(false);

  const [
    fulfillmentItems,
    setFulfillmentItems,
  ] = useState<
    FulfillmentItem[]
  >([]);
  const [
  invoiceOverrideTotal,
  setInvoiceOverrideTotal,
] = useState<
  number | null
>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  async function loadOrders() {
    try {
      setLoading(true);

      const data =
        await fetchRetailerOrders();

      setOrders(
  data as unknown as RetailerOrder[],
);
    } catch (
      error
    ) {
      console.error(
        error,
      );

      setErrorMessage(
        'Failed loading orders',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusUpdate(
    orderId: string,
    status:
      | 'PENDING'
      | 'PARTIAL'
      | 'FULFILLED'
      | 'REJECTED',
  ) {
    try {
      setSaving(true);

      await updateRetailerOrderStatus(
        orderId,
        status,
      );

      setSuccessMessage(
        `Order marked as ${status}`,
      );

      await loadOrders();
    } catch (
      error
    ) {
      console.error(
        error,
      );

      setErrorMessage(
        'Failed updating order status',
      );
    } finally {
      setSaving(false);
    }
  }

  async function openFulfillmentModal(
    order: RetailerOrder,
  ) {
    try {
      const products =
        await getProducts();

      const mappedItems =
        order.retailer_order_items.map(
          (
            item,
          ) => {
            const product =
              (
                products as any[]
              ).find(
                (
                  p: any,
                ) =>
                  p.id ===
                  item.product_id,
              );

            const availableStock =
              Number(
                product?.quantity ||
                  0,
              );

            const requestedQuantity =
              Number(
                item.requested_quantity,
              );

            const alreadyFulfilled =
              Number(
                item.fulfilled_quantity ||
                  0,
              );

            const remainingQty =
              requestedQuantity -
              alreadyFulfilled;

            return {
              itemId:
                item.id,

              productId:
                item.product_id,

              productName:
                item.product_name,

              requestedQuantity:
                remainingQty,

              originalRequestedQuantity:
                requestedQuantity,

              alreadyFulfilledQuantity:
                alreadyFulfilled,

              availableStock,

              fulfillQuantity:
                Math.min(
                  remainingQty,
                  availableStock,
                ),

              unitPrice:
  Number(
    item.unit_price ||
      0,
  ),

editableUnitPrice:
  Number(
    item.unit_price ||
      0,
  ),
            };
          },
        );

      setSelectedOrder(
        order,
      );

      setFulfillmentItems(
        mappedItems,
      );
      setInvoiceOverrideTotal(
  null,
);

      setFulfillmentModalOpen(
        true,
      );
    } catch (
      error
    ) {
      console.error(
        error,
      );

      setErrorMessage(
        'Failed preparing fulfillment',
      );
    }
  }

  async function handleConfirmFulfillment() {
    if (
      !selectedOrder
    ) {
      return;
    }

    try {
      setSaving(true);

      const fulfilledItems =
        fulfillmentItems.filter(
          (
            item,
          ) =>
            item.fulfillQuantity >
            0,
        );

      if (
        fulfilledItems.length ===
        0
      ) {
        setErrorMessage(
          'No items selected for fulfillment',
        );

        return;
      }

      await createLocalSale(
        {
          saleId:
            crypto.randomUUID(),

       customerId:
  selectedOrder
    .retailers
    ?.customer_local_id ||
  null,

          paymentStatus:
            'CREDIT',

          discount: 0,

          items:
            fulfilledItems.map(
              (
                item,
              ) => ({
                productId:
                  item.productId,

                quantity:
                  item.fulfillQuantity,

                unitPrice:
                  item.editableUnitPrice,
              }),
            ),
        },
      );

     try {
  await updateRetailerOrderItems(
    fulfilledItems.map(
      (
        item,
      ) => ({
        itemId:
          item.itemId,

        fulfilledQuantity:
          item.alreadyFulfilledQuantity +
          item.fulfillQuantity,
      }),
    ),
  );

  let fullyFulfilled =
    true;

  for (const item of fulfillmentItems) {
    const totalFulfilled =
      item.alreadyFulfilledQuantity +
      item.fulfillQuantity;

    if (
      totalFulfilled <
      item.originalRequestedQuantity
    ) {
      fullyFulfilled =
        false;

      break;
    }
  }

  await updateRetailerOrderStatus(
    selectedOrder.id,
    fullyFulfilled
      ? 'FULFILLED'
      : 'PARTIAL',
  );
} catch (error) {
  console.error(
    'ORDER SYNC FAILED:',
    error,
  );

  setErrorMessage(
    'Sale completed locally, but retailer sync failed. Please refresh and retry sync.',
  );
}

      let fullyFulfilled =
        true;

      for (const item of fulfillmentItems) {
        const totalFulfilled =
          item.alreadyFulfilledQuantity +
          item.fulfillQuantity;

        if (
          totalFulfilled <
          item.originalRequestedQuantity
        ) {
          fullyFulfilled =
            false;

          break;
        }
      }

      await updateRetailerOrderStatus(
        selectedOrder.id,
        fullyFulfilled
          ? 'FULFILLED'
          : 'PARTIAL',
      );

      setSuccessMessage(
        fullyFulfilled
          ? 'Order fulfilled successfully'
          : 'Order partially fulfilled',
      );

      setFulfillmentModalOpen(
        false,
      );

      setSelectedOrder(
        null,
      );

      setFulfillmentItems(
        [],
      );

      await loadOrders();
    } catch (
      error
    ) {
      console.error(
        error,
      );

      setErrorMessage(
        'Failed fulfilling order',
      );
    } finally {
      setSaving(false);
    }
  }

  function getStatusStyles(
    status: string,
  ) {
    switch (
      status
    ) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';

      case 'PARTIAL':
        return 'bg-orange-100 text-orange-700';

      case 'FULFILLED':
        return 'bg-green-100 text-green-700';

      case 'REJECTED':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  const calculatedFulfillmentTotal =
  fulfillmentItems.reduce(
    (
      sum,
      item,
    ) =>
      sum +
      item.fulfillQuantity *
        item.editableUnitPrice,
    0,
  );

const finalInvoiceTotal =
  invoiceOverrideTotal ??
  calculatedFulfillmentTotal;

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          Loading orders...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
 <div className="flex items-center justify-between">
          <PageHeader
            title="Orders"
            subtitle="Retailer incoming orders"
          />

          <Button
            variant="secondary"
            onClick={
              loadOrders
            }
          >
            Refresh
          </Button>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div className="flex items-center justify-between">
              <span>
                {errorMessage}
              </span>

              <button
                onClick={() =>
                  setErrorMessage(
                    '',
                  )
                }
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <div className="flex items-center justify-between">
              <span>
                {successMessage}
              </span>

              <button
                onClick={() =>
                  setSuccessMessage(
                    '',
                  )
                }
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <th className="text-left p-4">
                  Retailer
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Amount
                </th>

                <th className="text-left p-4">
                  Date
                </th>

                <th className="text-left p-4">
                  Actions
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {orders.map(
                (
                  order,
                ) => (
                  <TableRow
                    key={
                      order.id
                    }
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order
                            .retailers
                            ?.business_name ||
                            'Unknown Retailer'}
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                          {order
                            .retailers
                            ?.phone ||
                            '-'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                          order.status,
                        )}`}
                      >
                        {
                          order.status
                        }
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold">
                        Rs.{' '}
                        {Number(
                          order.total_amount ||
                            0,
                        ).toFixed(
                          2,
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        order.created_at,
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => {
                            setSelectedOrder(
                              order,
                            );

                            setDetailsModalOpen(
                              true,
                            );
                          }}
                        >
                          View
                        </Button>

                        {order.status ===
                          'PENDING' && (
                          <>
                            <Button
                              className="px-3 py-2"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                openFulfillmentModal(
                                  order,
                                )
                              }
                            >
                              Fulfill
                            </Button>

                            <Button
                              variant="danger"
                              className="px-3 py-2"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                handleStatusUpdate(
                                  order.id,
                                  'REJECTED',
                                )
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}

              {orders.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-500"
                  >
                    No retailer orders found
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </Card>

        <Modal
          open={
            detailsModalOpen &&
            !!selectedOrder
          }
          title="Order Details"
          onClose={() =>
            setDetailsModalOpen(
              false,
            )
          }
        >
          <div className="space-y-6">
            <div>
              <div className="font-semibold text-lg">
                {selectedOrder
                  ?.retailers
                  ?.business_name ||
                  'Unknown Retailer'}
              </div>

              <div className="text-sm text-slate-500 mt-1">
                {selectedOrder
                  ?.retailers
                  ?.phone ||
                  '-'}
              </div>
            </div>

          <div className="space-y-3">
  {(
    selectedOrder?.retailer_order_items ||
    []
  ).map(
    (
      item,
    ) => (
      <div
        key={
          item.id
        }
        className="rounded-2xl border border-slate-200 p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              {
                item.product_name
              }
            </div>

            <div className="text-sm text-slate-500 mt-1">
              Qty:{' '}
              {
                item.requested_quantity
              }
            </div>
          </div>

          <div className="font-semibold">
            Rs.{' '}
            {Number(
              item.subtotal ||
                0,
            ).toFixed(
              2,
            )}
          </div>
        </div>
      </div>
    ),
  )}

  {(
    selectedOrder?.retailer_order_items ||
    []
  ).length === 0 && (
    <div className="text-sm text-slate-500">
      No order items found
    </div>
  )}
</div>

            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-lg font-bold">
                  Rs.{' '}
                  {Number(
                    selectedOrder?.total_amount ||
                      0,
                  ).toFixed(
                    2,
                  )}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() =>
                setDetailsModalOpen(
                  false,
                )
              }
            >
              Close
            </Button>
          </div>
        </Modal>

        <Modal
          open={
            fulfillmentModalOpen
          }
          title="Fulfill Order"
          onClose={() =>
            setFulfillmentModalOpen(
              false,
            )
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {fulfillmentItems.map(
              (
                item,
                index,
              ) => (
                <div
                  key={
                    item.itemId
                  }
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium">
                        {
                          item.productName
                        }
                      </div>

                      <div className="text-sm text-slate-500 mt-2 space-y-1">
                        <div>
                          Requested:{' '}
                          {
                            item.requestedQuantity
                          }
                        </div>

                        <div>
                          Available Stock:{' '}
                          {
                            item.availableStock
                          }
                        </div>
                      </div>
                    </div>

                    <div className="w-28">
                      <label className="text-xs text-slate-500 mb-1 block">
                        Fulfill Qty
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={
                          item.availableStock
                        }
                        value={
                          item.fulfillQuantity
                        }
                        onChange={(e) => {
                          const value =
                            Math.max(
                              0,
                              Math.min(
                                Number(
                                  e.target
                                    .value ||
                                    0,
                                ),
                                item.availableStock,
                                item.requestedQuantity,
                              ),
                            );

                          setFulfillmentItems(
                            (
                              prev,
                            ) =>
                              prev.map(
                                (
                                  p,
                                  i,
                                ) =>
                                  i ===
                                  index
                                    ? {
                                        ...p,

                                        fulfillQuantity:
                                          value,
                                      }
                                    : p,
                              ),
                          );
                        }}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="w-32">
  <label className="text-xs text-slate-500 mb-1 block">
    Unit Price
  </label>

  <input
    type="number"
    min={0}
    value={
      item.editableUnitPrice
    }
    onChange={(e) => {
      const value =
        Math.max(
          0,
          Number(
            e.target.value ||
              0,
          ),
        );

      setFulfillmentItems(
        (
          prev,
        ) =>
          prev.map(
            (
              p,
              i,
            ) =>
              i === index
                ? {
                    ...p,

                    editableUnitPrice:
                      value,
                  }
                : p,
          ),
      );
    }}
    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
  />
</div>
                  </div>
                </div>
              ),
            )}

          <div className="rounded-2xl bg-slate-100 p-4 space-y-4">
  <div className="flex items-center justify-between">
    <span className="font-semibold">
      Fulfillment Total
    </span>

    <span className="text-lg font-bold">
      Rs.{' '}
      {finalInvoiceTotal.toFixed(
        2,
      )}
    </span>
  </div>

  <div>
    <label className="text-sm font-medium block mb-2">
      Final Invoice Override
    </label>

    <input
      type="number"
      min={0}
      placeholder="Optional override total"
      value={
        invoiceOverrideTotal ??
        ''
      }
      onChange={(e) => {
        const value =
          e.target.value;

        setInvoiceOverrideTotal(
          value === ''
            ? null
            : Number(
                value,
              ),
        );
      }}
      className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
    />

    <div className="text-xs text-slate-500 mt-2">
      Leave empty to use calculated fulfillment total
    </div>
  </div>
</div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  setFulfillmentModalOpen(
                    false,
                  )
                }
              >
                Cancel
              </Button>
        <Button
          className="flex-1"
          disabled={saving}
          onClick={
            handleConfirmFulfillment
          }
        >
          Confirm Fulfillment
        </Button>
      </div>
            </div> 
    </Modal>

      </div>
    </AppLayout>
  );
}
  
