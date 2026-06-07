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

import {
  getLocalSales,
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

 useEffect(() => {
  const loadLocalSales =
    async () => {
      try {
        const localSales =
          await getLocalSales();

        setSales(
          localSales as Sale[],
        );
      } catch (
        error
      ) {
        console.error(
          'Failed loading local sales',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

  loadLocalSales();
}, []);

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
      <div>
        <PageHeader
          title="Sales History"
          subtitle="Sales transactions and invoices"
        />

        <Card className="p-0 overflow-hidden">
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
              {sales.map(
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
                          sale.payment_status ===
                          'CREDIT'
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
                      <Button
                        className="px-3 py-2"
                        onClick={() =>
                          setSelectedSale(
                            sale,
                          )
                        }
                      >
                        View
                      </Button>
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
        </Card>

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
      </div>
    </AppLayout>
  );
}