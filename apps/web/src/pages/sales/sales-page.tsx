import {
  useEffect,
  useState,
} from 'react';


import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Badge from '../../components/ui/badge';

import Modal from '../../components/ui/modal';

import PageHeader from '../../components/ui/page-header';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/ui/table';

import SaleInvoiceBill from '../../components/sale-invoice-bill';

import {
  getLocalSales,
  revertLocalSale,
} from '../../repositories/sale.repository';

type SaleItem = {
  id: string;

  quantity: number;

  unit_price: number;

  subtotal: number;

  product?: {
    name: string;
  };

  product_name?: string;
};

type Sale = {
  id: string;

  total_amount: number;

  discount: number;

  final_amount: number;

  payment_status: string;

  created_at: string;

  customer?: {
    name: string;
  };

  items: SaleItem[];
};

export default function SalesPage() {
  const [
    sales,
    setSales,
  ] = useState<Sale[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    selectedSale,
    setSelectedSale,
  ] = useState<Sale | null>(
    null,
  );

  const [
    printSale,
    setPrintSale,
  ] = useState<Sale | null>(null);

  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
  const [revertTargetId, setRevertTargetId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const paginatedSales = sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const loadLocalSales = async () => {
    try {
      const localSales = await getLocalSales();
      setSales(localSales as Sale[]);
    } catch (error) {
      console.error('Failed loading local sales', error);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  loadLocalSales();
}, []);

  async function handleRevertSale() {
    if (!revertTargetId) return;

    try {
      setRevertingId(revertTargetId);
      await revertLocalSale(revertTargetId);
      setSuccessMessage('Sale reverted successfully. Inventory and ledger updated.');
      await loadLocalSales();
    } catch (error: any) {
      console.error('Failed reverting sale', error);
      setErrorMessage(error.message || 'Failed reverting sale');
    } finally {
      setRevertingId(null);
      setRevertConfirmOpen(false);
      setRevertTargetId(null);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-foreground/70 text-lg font-medium animate-pulse">
            Loading sales history...
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
            title="Sales History"
            subtitle="Sales transactions and invoices"
          />
        </div>

        {errorMessage && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-green-100 text-green-700 p-3 rounded-lg border border-green-200">
            {successMessage}
          </div>
        )}

        <Modal
          open={revertConfirmOpen}
          title="Revert Sale"
          onClose={() => {
            setRevertConfirmOpen(false);
            setRevertTargetId(null);
          }}
        >
          <div className="p-6">
            <p className="text-slate-600 mb-6">
              Are you sure you want to revert this sale? This action will:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Mark the sale as RETURNED</li>
                <li>Restore item quantities back to inventory</li>
                <li>Refund customer credit balance (if applicable)</li>
              </ul>
              <br />
              <strong>This action cannot be undone.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setRevertConfirmOpen(false);
                  setRevertTargetId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={revertingId !== null}
                onClick={handleRevertSale}
              >
                {revertingId ? 'Reverting...' : 'Confirm Revert'}
              </Button>
            </div>
          </div>
        </Modal>

        <div className="flex-1 min-h-0 pb-6">
          <Card className="h-full flex flex-col p-0 overflow-hidden border border-border">
            <div className="flex-1 overflow-y-auto">
              <Table>
            <TableHead>
              <tr>
                <th className="text-left p-4">
                  Invoice
                </th>

                <th className="text-left p-4">
                  Date
                </th>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Payment
                </th>

                <th className="text-left p-4">
                  Items
                </th>

                <th className="text-left p-4">
                  Total
                </th>

                <th className="text-left p-4">
                  Action
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {paginatedSales.map(
                (
                  sale,
                ) => (
                  <TableRow
                    key={
                      sale.id
                    }
                  >
                    <TableCell>
                      <span className="font-medium">
                        #
                        {sale.id.slice(
                          0,
                          8,
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        sale.created_at,
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {sale.customer
                        ?.name ||
                        'Walk-in'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          sale.payment_status === 'RETURNED' || sale.payment_status === 'REVERTED'
                            ? 'neutral'
                            : sale.payment_status === 'CREDIT'
                            ? 'danger'
                            : 'success'
                        }
                      >
                        {
                          sale.payment_status
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {
                        sale.items
                          .length
                      }
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold">
                        Rs.{' '}
                        {Number(
                          sale.final_amount,
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() =>
                            setSelectedSale(
                              sale,
                            )
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => {
                            setPrintSale(sale);
                            setTimeout(() => {
                              window.print();
                            }, 100);
                          }}
                        >
                          Print
                        </Button>
                        
                        {sale.payment_status !== 'RETURNED' && sale.payment_status !== 'REVERTED' && (
                          <Button
                            variant="danger"
                            className="px-3 py-2"
                            onClick={() => {
                              setRevertTargetId(sale.id);
                              setRevertConfirmOpen(true);
                            }}
                          >
                            Revert
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}

              {sales.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-500"
                  >
                    No sales found
                  </td>
                </tr>
              )}
            </TableBody>
              </Table>
            </div>
          </Card>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sales.length)} of {sales.length} records
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-hover disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-hover disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        <Modal
          open={
            !!selectedSale
          }
          title={`Invoice #${selectedSale?.id.slice(
            0,
            8,
          )}`}
          onClose={() =>
            setSelectedSale(
              null,
            )
          }
        >
          {selectedSale && (
            <>
              <p className="text-slate-500 mb-6">
                {new Date(
                  selectedSale.created_at,
                ).toLocaleString()}
              </p>

              <div className="mb-6">
                <p>
                  <span className="font-semibold">
                    Customer:
                  </span>{' '}
                  {selectedSale
                    .customer
                    ?.name ||
                    'Walk-in'}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">
                    Payment:
                  </span>{' '}
                  {
                    selectedSale.payment_status
                  }
                </p>
              </div>

              <Card className="p-0 overflow-hidden">
                <Table>
                  <TableHead>
                    <tr>
                      <th className="text-left p-4">
                        Product
                      </th>

                      <th className="text-left p-4">
                        Qty
                      </th>

                      <th className="text-left p-4">
                        Price
                      </th>

                      <th className="text-left p-4">
                        Total
                      </th>
                    </tr>
                  </TableHead>

                  <TableBody>
                    {selectedSale.items.map(
                      (
                        item,
                      ) => (
                        <TableRow
                          key={
                            item.id
                          }
                        >
                          <TableCell>
                            {item
                              .product
                              ?.name ||
                              item.product_name ||
                              'Product'}
                          </TableCell>

                          <TableCell>
                            {
                              item.quantity
                            }
                          </TableCell>

                          <TableCell>
                            Rs.{' '}
                            {
                              item.unit_price
                            }
                          </TableCell>

                          <TableCell>
                            <span className="font-semibold">
                              Rs.{' '}
                              {
                                item.subtotal
                              }
                            </span>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </Card>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span>
                    Total
                  </span>

                  <span>
                    Rs.{' '}
                    {
                      selectedSale.total_amount
                    }
                  </span>
                </div>

                <div className="flex justify-between text-lg mt-2">
                  <span>
                    Discount
                  </span>

                  <span>
                    Rs.{' '}
                    {
                      selectedSale.discount
                    }
                  </span>
                </div>

                <div className="flex justify-between text-2xl font-bold mt-4">
                  <span>
                    Final Amount
                  </span>

                  <span>
                    Rs.{' '}
                    {Number(
                      selectedSale.final_amount,
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </Modal>

        <div className="hidden print:block">
          {printSale && (
            <SaleInvoiceBill
              data={{
                invoiceNo: printSale.id.slice(0, 8).toUpperCase(),
                date: new Date(printSale.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-').toUpperCase(),
                serialNo: '14',
                customerName: printSale.customer?.name,
                items: printSale.items.map((i, index) => ({
                  id: i.id || String(index),
                  code: (i.product?.name || i.product_name || 'N/A').slice(0, 5).toUpperCase(),
                  description: i.product?.name || i.product_name || 'Product',
                  quantity: i.quantity,
                  rate: i.unit_price,
                  discount: 0, // Since item-level discount is 0
                  total: i.subtotal
                })),
                totalQuantity: printSale.items.reduce((acc, i) => acc + i.quantity, 0),
                totalAmount: printSale.total_amount,
                transportation: 0,
                grandTotal: printSale.final_amount
              }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}