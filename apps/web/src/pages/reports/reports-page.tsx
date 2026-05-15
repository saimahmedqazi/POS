import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Badge from '../../components/ui/badge';

import PageHeader from '../../components/ui/page-header';

import StatCard from '../../components/ui/stat-card';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/ui/table';

type DailySales = {
  totalRevenue: number;

  totalTransactions: number;

  averageOrderValue: number;
};

type ProfitSummary = {
  totalRevenue: number;

  totalCost: number;

  grossProfit: number;

  profitMargin: number;
};

type InventoryValuation = {
  totalQuantity: number;

  totalCostValue: number;

  totalSaleValue: number;

  estimatedProfit: number;
};

type TopProduct = {
  productId: string;

  productName: string;

  totalQuantitySold: number;

  totalRevenue: number;
};

type LedgerEntry = {
  id: string;

  amount: number;

  type: string;

  referenceType?: string;

  createdAt: string;

  customer: {
    name: string;
  };
};

type Sale = {
  id: string;

  finalAmount: number;

  paymentStatus: string;

  createdAt: string;

  customer?: {
    name: string;
  };
};

export default function ReportsPage() {
  const [
    dailySales,
    setDailySales,
  ] = useState<DailySales | null>(
    null,
  );

  const [
    profitSummary,
    setProfitSummary,
  ] = useState<ProfitSummary | null>(
    null,
  );

  const [
    inventoryValuation,
    setInventoryValuation,
  ] = useState<InventoryValuation | null>(
    null,
  );

  const [
    topProducts,
    setTopProducts,
  ] = useState<TopProduct[]>(
    [],
  );

  const [
    ledgerEntries,
    setLedgerEntries,
  ] = useState<
    LedgerEntry[]
  >([]);

  const [
    sales,
    setSales,
  ] = useState<Sale[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    | 'sales'
    | 'ledger'
    | 'inventory'
    | 'customers'
  >('sales');

  const [
    selectedPaymentType,
    setSelectedPaymentType,
  ] = useState('');

  const [
    selectedDateRange,
    setSelectedDateRange,
  ] = useState('today');

  const filteredSales =
    sales.filter(
      (sale) => {
        if (
          selectedPaymentType &&
          sale.paymentStatus !==
            selectedPaymentType
        ) {
          return false;
        }

        return true;
      },
    );

  useEffect(() => {
    const fetchReports =
      async () => {
        try {
          const [
            analyticsRes,
            profitRes,
            inventoryRes,
            topProductsRes,
            ledgerRes,
            salesListRes,
          ] =
            await Promise.all([
              api.get(
                '/reports/daily-sales',
              ),

              api.get(
                '/reports/profit-summary',
              ),

              api.get(
                '/reports/inventory-valuation',
              ),

              api.get(
                '/reports/top-products',
              ),

              api.get(
                '/ledger',
              ),

              api.get(
                '/sales',
              ),
            ]);

          setDailySales(
            analyticsRes.data,
          );

          setProfitSummary(
            profitRes.data,
          );

          setInventoryValuation(
            inventoryRes.data,
          );

          setTopProducts(
            topProductsRes.data,
          );

          setLedgerEntries(
            ledgerRes.data,
          );

          setSales(
            salesListRes.data,
          );
        } catch (
          error
        ) {
          console.error(
            error,
          );
        } finally {
          setLoading(false);
        }
      };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading reports...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Business insights and performance"
        />

        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-4">
              <select
                value={
                  selectedDateRange
                }
                onChange={(e) =>
                  setSelectedDateRange(
                    e.target.value,
                  )
                }
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white min-w-[180px]"
              >
                <option value="today">
                  Today
                </option>

                <option value="week">
                  This Week
                </option>

                <option value="month">
                  This Month
                </option>

                <option value="all">
                  All Time
                </option>
              </select>

              <select
                value={
                  selectedPaymentType
                }
                onChange={(e) =>
                  setSelectedPaymentType(
                    e.target.value,
                  )
                }
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white min-w-[180px]"
              >
                <option value="">
                  All Payments
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="CREDIT">
                  Credit
                </option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 flex-wrap bg-white p-2 rounded-2xl shadow-sm w-fit">
          {[
            {
              key: 'sales',
              label: 'Sales',
            },

            {
              key: 'ledger',
              label: 'Ledger',
            },

            {
              key: 'inventory',
              label: 'Inventory',
            },

            {
              key: 'customers',
              label: 'Customers',
            },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={
                activeTab ===
                tab.key
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() =>
                setActiveTab(
                  tab.key as any,
                )
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab ===
          'sales' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Revenue"
                value={`Rs. ${dailySales?.totalRevenue}`}
              />

              <StatCard
                title="Transactions"
                value={
                  dailySales?.totalTransactions ||
                  0
                }
              />

              <StatCard
                title="Gross Profit"
                value={`Rs. ${profitSummary?.grossProfit}`}
              />

              <StatCard
                title="Inventory Quantity"
                value={
                  inventoryValuation?.totalQuantity ||
                  0
                }
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-xl font-semibold mb-6">
                  Profit Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Revenue
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {
                        profitSummary?.totalRevenue
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Cost
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {
                        profitSummary?.totalCost
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Margin
                    </span>

                    <span className="font-semibold">
                      {
                        profitSummary?.profitMargin
                      }
                      %
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-6">
                  Inventory Valuation
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Cost Value
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {
                        inventoryValuation?.totalCostValue
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Sale Value
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {
                        inventoryValuation?.totalSaleValue
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Estimated Profit
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {
                        inventoryValuation?.estimatedProfit
                      }
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Top Products
                </h2>

                <Badge variant="neutral">
                  {
                    topProducts.length
                  }{' '}
                  Products
                </Badge>
              </div>

              <Table>
                <TableHead>
                  <tr>
                    <th className="text-left p-4">
                      Product
                    </th>

                    <th className="text-left p-4">
                      Quantity Sold
                    </th>

                    <th className="text-left p-4">
                      Revenue
                    </th>
                  </tr>
                </TableHead>

                <TableBody>
                  {topProducts.map(
                    (
                      product,
                    ) => (
                      <TableRow
                        key={
                          product.productId
                        }
                      >
                        <TableCell>
                          {
                            product.productName
                          }
                        </TableCell>

                        <TableCell>
                          {
                            product.totalQuantitySold
                          }
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold">
                            Rs.{' '}
                            {
                              product.totalRevenue
                            }
                          </span>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Sales Report
                </h2>

                <Badge variant="neutral">
                  {
                    filteredSales.length
                  }{' '}
                  Sales
                </Badge>
              </div>

              <Table>
                <TableHead>
                  <tr>
                    <th className="text-left p-4">
                      Invoice
                    </th>

                    <th className="text-left p-4">
                      Customer
                    </th>

                    <th className="text-left p-4">
                      Payment
                    </th>

                    <th className="text-left p-4">
                      Amount
                    </th>

                    <th className="text-left p-4">
                      Date
                    </th>
                  </tr>
                </TableHead>

                <TableBody>
                  {filteredSales.map(
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
                          {sale
                            .customer
                            ?.name ||
                            'Walk-in'}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              sale.paymentStatus ===
                              'CREDIT'
                                ? 'danger'
                                : 'success'
                            }
                          >
                            {
                              sale.paymentStatus
                            }
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold">
                            Rs.{' '}
                            {
                              sale.finalAmount
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          {new Date(
                            sale.createdAt,
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </Card>
          </>
        )}

        {activeTab ===
          'ledger' && (
          <Table>
            <TableHead>
              <tr>
                <th className="text-left p-4">
                  Date
                </th>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Type
                </th>

                <th className="text-left p-4">
                  Reference
                </th>

                <th className="text-left p-4">
                  Amount
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {ledgerEntries.map(
                (
                  entry,
                ) => (
                  <TableRow
                    key={entry.id}
                  >
                    <TableCell>
                      {new Date(
                        entry.createdAt,
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {
                        entry.customer
                          .name
                      }
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          entry.type ===
                          'DEBIT'
                            ? 'danger'
                            : 'success'
                        }
                      >
                        {
                          entry.type
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {entry.referenceType ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold">
                        Rs.{' '}
                        {
                          entry.amount
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        )}

        {activeTab ===
          'inventory' && (
          <Table>
            <TableHead>
              <tr>
                <th className="text-left p-4">
                  Total Quantity
                </th>

                <th className="text-left p-4">
                  Cost Value
                </th>

                <th className="text-left p-4">
                  Sale Value
                </th>

                <th className="text-left p-4">
                  Estimated Profit
                </th>
              </tr>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>
                  {
                    inventoryValuation?.totalQuantity
                  }
                </TableCell>

                <TableCell>
                  Rs.{' '}
                  {
                    inventoryValuation?.totalCostValue
                  }
                </TableCell>

                <TableCell>
                  Rs.{' '}
                  {
                    inventoryValuation?.totalSaleValue
                  }
                </TableCell>

                <TableCell>
                  Rs.{' '}
                  {
                    inventoryValuation?.estimatedProfit
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {activeTab ===
          'customers' && (
          <Table>
            <TableHead>
              <tr>
                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Balance
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {ledgerEntries.map(
                (
                  entry,
                ) => (
                  <TableRow
                    key={entry.id}
                  >
                    <TableCell>
                      {
                        entry.customer
                          .name
                      }
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold">
                        Rs.{' '}
                        {
                          entry.amount
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </AppLayout>
  );
}