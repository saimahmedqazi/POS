import {
  useEffect,
  useState,
} from 'react';

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

import {
  getDatabase,
} from '../../lib/database';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#64748b'];

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

type CustomerBalance = {
  name: string;

  current_balance: number;
};

type Sale = {
  id: string;

  final_amount: number;

  payment_status: string;

  created_at: string;

  customer_name?: string;
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
    customerBalances,
    setCustomerBalances,
  ] = useState<
    CustomerBalance[]
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
    | 'inventory'
    | 'customers'
  >('sales');

  const [
    selectedPaymentType,
    setSelectedPaymentType,
  ] = useState('');

  const [dateFilter, setDateFilter] = useState('today');

  const filteredSales =
    sales.filter(
      (sale) => {
        if (
          selectedPaymentType &&
          sale.payment_status !==
          selectedPaymentType
        ) {
          return false;
        }

        return true;
      },
    );

const safeMoney = (
  value: any,
) =>
  Number(
    Number(
      value || 0,
    ).toFixed(2),
  );
  const loadReports =
      async () => {
        try {
          const db =
            getDatabase();

          let dateCondition = '';
          let salesDateCondition = '';
          if (dateFilter === 'today') {
            dateCondition = "WHERE DATE(sales.created_at, 'localtime') = DATE('now', 'localtime')";
            salesDateCondition = "WHERE DATE(s.created_at, 'localtime') = DATE('now', 'localtime')";
          } else if (dateFilter === 'week') {
            dateCondition = "WHERE DATE(sales.created_at, 'localtime') >= DATE('now', 'localtime', '-7 days')";
            salesDateCondition = "WHERE DATE(s.created_at, 'localtime') >= DATE('now', 'localtime', '-7 days')";
          } else if (dateFilter === 'month') {
            dateCondition = "WHERE DATE(sales.created_at, 'localtime') >= DATE('now', 'localtime', 'start of month')";
            salesDateCondition = "WHERE DATE(s.created_at, 'localtime') >= DATE('now', 'localtime', 'start of month')";
          }

          // SALES
          const salesData =
            await db.select(
              `
              SELECT
                sales.*,
                customers.name as customer_name
              FROM sales
              LEFT JOIN customers
              ON sales.customer_id = customers.id
              ${dateCondition ? dateCondition + " AND sales.payment_status NOT IN ('RETURNED', 'REVERTED')" : "WHERE sales.payment_status NOT IN ('RETURNED', 'REVERTED')"}
              ORDER BY sales.created_at DESC
              `,
            );

          setSales(
            salesData as Sale[],
          );

          // AGGREGATE SALES
          const dailyResult =
            await db.select(
              `
              SELECT
                COUNT(*) as totalTransactions,
                COALESCE(
                  SUM(final_amount),
                  0
                ) as totalRevenue,
                (
                  SELECT COALESCE(SUM(si.quantity * p.cost_price), 0)
                  FROM sale_items si
                  JOIN sales s ON si.sale_id = s.id
                  LEFT JOIN products p ON si.product_id = p.id
                  ${salesDateCondition ? salesDateCondition + " AND s.payment_status NOT IN ('RETURNED', 'REVERTED')" : "WHERE s.payment_status NOT IN ('RETURNED', 'REVERTED')"}
                ) as totalCost
              FROM sales
              ${dateCondition ? dateCondition + " AND payment_status NOT IN ('RETURNED', 'REVERTED')" : "WHERE payment_status NOT IN ('RETURNED', 'REVERTED')"}
              `,
            );

          const daily =
            (
              dailyResult as any[]
            )[0];

          const totalRevenue =
            Number(
              daily.totalRevenue ||
              0,
            );

          const actualTotalCost = Number(daily.totalCost || 0);
          const actualGrossProfit = totalRevenue - actualTotalCost;

          const totalTransactions =
            Number(
              daily.totalTransactions ||
              0,
            );

          setDailySales({
            totalRevenue,

            totalTransactions,

            averageOrderValue:
              totalTransactions >
                0
                ? totalRevenue /
                totalTransactions
                : 0,
          });

          // PRODUCTS
          const products =
            await db.select(
              `
              SELECT *
              FROM products
              `,
            );

          const totalQuantity =
            (
              products as any[]
            ).reduce(
              (
                sum: number,
                product: any,
              ) =>
                sum +
                Number(
                  product.quantity ||
                  0,
                ),
              0,
            );

          const totalCostValue =
  safeMoney(
    (
      products as any[]
    ).reduce(
      (
        sum: number,
        product: any,
      ) =>
        sum +
        safeMoney(
          safeMoney(
            product.cost_price,
          ) *
            Number(
              product.quantity ||
                0,
            ),
        ),
      0,
    ),
  );
          const totalSaleValue =
  safeMoney(
    (
      products as any[]
    ).reduce(
      (
        sum: number,
        product: any,
      ) =>
        sum +
        safeMoney(
          safeMoney(
            product.sale_price,
          ) *
            Number(
              product.quantity ||
                0,
            ),
        ),
      0,
    ),
  );

         const grossProfit =
  safeMoney(
    totalSaleValue -
      totalCostValue,
  );

          setProfitSummary({
            totalRevenue,

            totalCost:
              actualTotalCost,

            grossProfit: actualGrossProfit,

            profitMargin:
              totalRevenue > 0
                ? (
                  actualGrossProfit /
                  totalRevenue
                ) *
                100
                : 0,
          });

          setInventoryValuation({
            totalQuantity,

            totalCostValue,

            totalSaleValue,

            estimatedProfit:
              grossProfit,
          });

         // TOP PRODUCTS
const topProductsResult =
  await db.select(
    `
    SELECT
      products.id as productId,
      products.name as productName,
      COALESCE(
        SUM(sale_items.quantity),
        0
      ) as totalQuantitySold,
      COALESCE(
        SUM(sale_items.subtotal),
        0
      ) as totalRevenue
    FROM sale_items
    INNER JOIN products
      ON sale_items.product_id =
         products.id
    INNER JOIN sales
      ON sale_items.sale_id = sales.id
    ${dateCondition}
    GROUP BY products.id
    ORDER BY totalRevenue DESC
    LIMIT 10
    `,
  );

setTopProducts(
  (topProductsResult as any[])
    .map(
      (product: any) => ({
        productId:
          product.productId,

        productName:
          product.productName,

        totalQuantitySold:
          Number(
            product.totalQuantitySold ||
              0,
          ),

        totalRevenue:
          safeMoney(
            product.totalRevenue,
          ),
      }),
    ),
);

          // CUSTOMERS
          const customers =
            await db.select(
              `
              SELECT *
              FROM customers
              ORDER BY current_balance DESC
              `,
            );

          setCustomerBalances(
            customers as CustomerBalance[],
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

  useEffect(() => {
    loadReports();
  }, [dateFilter]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-foreground/70 text-lg font-medium animate-pulse">
            Loading reports...
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
            title="Reports & Analytics"
            subtitle="Offline business analytics"
          />

          <Button
            onClick={loadReports}
          >
            Refresh Reports
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 space-y-6 min-h-0">
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-border rounded-xl px-4 py-2 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50 min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>

            <select
              value={
                selectedPaymentType
              }
              onChange={(e) =>
                setSelectedPaymentType(
                  e.target
                    .value,
                )
              }
              className="border border-border rounded-xl px-4 py-2 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50 min-w-[150px]"
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
        </Card>

        <div className="flex gap-2 flex-wrap bg-surface p-2 rounded-2xl shadow-sm border border-border w-fit">
          {[
            {
              key: 'sales',
              label: 'Sales',
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
                  value={`Rs. ${Number(
                    dailySales?.totalRevenue ||
                    0,
                  ).toFixed(2)}`}
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
                  value={`Rs. ${Number(
                    profitSummary?.grossProfit ||
                    0,
                  ).toFixed(2)}`}
                />

                <StatCard
                  title="Inventory Quantity"
                  value={
                    inventoryValuation?.totalQuantity ||
                    0
                  }
                />
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

                <div className="w-full mb-8">
                  {topProducts.filter(p => p.totalQuantitySold > 0 || p.totalRevenue > 0).length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={topProducts.filter(p => p.totalQuantitySold > 0 || p.totalRevenue > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="totalRevenue"
                          nameKey="productName"
                        >
                          {topProducts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `Rs. ${value}`}
                          contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--foreground)' }}
                          itemStyle={{ color: 'var(--primary)' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No product sales yet.
                    </div>
                  )}
                </div>

                <Table>
                  <TableHead>
                    <tr>
                      <th className="text-left p-4">
                        Product
                      </th>

                      <th className="text-left p-4">
                        Qty Sold
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
                            Rs.{' '}
                            {
                              product.totalRevenue
                            }
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
                          key={sale.id}
                        >
                          <TableCell>
                            #
                            {sale.id.slice(
                              0,
                              8,
                            )}
                          </TableCell>

                          <TableCell>
                            {sale.customer_name ||
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
                            Rs.{' '}
                            {Number(
                              sale.final_amount,
                            ).toFixed(
                              2,
                            )}
                          </TableCell>

                          <TableCell>
                            {new Date(
                              sale.created_at,
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
          'inventory' && (
            <Card className="p-0 overflow-hidden">
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
                      Number(
                        inventoryValuation?.totalCostValue ||
                        0,
                      ).toFixed(2)
                    }
                  </TableCell>

                  <TableCell>
                    Rs.{' '}
                    {
                      Number(
                        inventoryValuation?.totalSaleValue ||
                        0,
                      ).toFixed(2)
                    }
                  </TableCell>

                  <TableCell>
                    Rs.{' '}
                    {
                      Number(
                        inventoryValuation?.estimatedProfit ||
                        0,
                      ).toFixed(2)
                    }
                  </TableCell>
                </TableRow>
              </TableBody>
              </Table>
            </Card>
          )}

        {activeTab ===
          'customers' && (
            <Card className="p-0 overflow-hidden">
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
                {customerBalances.map(
                  (
                    customer,
                  ) => (
                    <TableRow
                      key={
                        customer.name
                      }
                    >
                      <TableCell>
                        {
                          customer.name
                        }
                      </TableCell>

                      <TableCell>
                        Rs.{' '}
                        {
                          customer.current_balance
                        }
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}