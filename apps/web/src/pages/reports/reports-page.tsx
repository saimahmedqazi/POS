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
              ORDER BY sales.created_at DESC
              `,
            );

          setSales(
            salesData as Sale[],
          );

          // DAILY SALES
          const dailyResult =
            await db.select(
              `
              SELECT
                COUNT(*) as totalTransactions,
                COALESCE(
                  SUM(final_amount),
                  0
                ) as totalRevenue
              FROM sales
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
              totalCostValue,

            grossProfit,

            profitMargin:
              totalRevenue > 0
                ? (
                  grossProfit /
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
         <div className="flex items-center justify-between">
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
        <Card className="mb-6">
          <div className="flex gap-4">
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
        </Card>

        <div className="flex gap-2 flex-wrap bg-white p-2 rounded-2xl shadow-sm w-fit">
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
          )}
      </div>
    </AppLayout>
  );
}