import {
  useEffect,
  useState,
} from 'react';

import {
  getProducts,
} from '../../repositories/product.repository';

import AppLayout from '../../layouts/app-layout';

import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

import PageHeader from '../../components/ui/page-header';

import Card from '../../components/ui/card';

import Badge from '../../components/ui/badge';

import {
  getDashboardStats,
} from '../../repositories/dashboard.repository';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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

const defaultDailySales: DailySales =
  {
    totalRevenue: 0,

    totalTransactions: 0,

    averageOrderValue: 0,
  };

const defaultProfitSummary: ProfitSummary =
  {
    totalRevenue: 0,

    totalCost: 0,

    grossProfit: 0,

    profitMargin: 0,
  };

const defaultInventoryValuation: InventoryValuation =
  {
    totalQuantity: 0,

    totalCostValue: 0,

    totalSaleValue: 0,

    estimatedProfit: 0,
  };

const safeNumber = (
  value: any,
) =>
  Number.isFinite(
    Number(value),
  )
    ? Number(value)
    : 0;

export default function DashboardPage() {
  const [
    dailySales,
    setDailySales,
  ] = useState<DailySales>(
    defaultDailySales,
  );

  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  const [
    profitSummary,
    setProfitSummary,
  ] = useState<ProfitSummary>(
    defaultProfitSummary,
  );

  const [
    inventoryValuation,
    setInventoryValuation,
  ] = useState<InventoryValuation>(
    defaultInventoryValuation,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    ledgerBalance,
    setLedgerBalance,
  ] = useState(0);

  const fetchDashboard =
    async () => {
      // PREVENT SPAM
      if (loading) {
        return;
      }

      try {
        setLoading(true);

        setError('');

        // DASHBOARD STATS
        const localStats =
          await getDashboardStats();

        const revenue =
          safeNumber(
            localStats.revenue,
          );

        const totalSales =
          safeNumber(
            localStats.totalSales,
          );

        setLedgerBalance(
          safeNumber((localStats as any).totalReceivables)
        );

        setDailySales({
          totalRevenue:
            revenue,

          totalTransactions:
            totalSales,

          averageOrderValue:
            totalSales > 0
              ? revenue /
                totalSales
              : 0,
        });

        // Format weekly dates (always show last 7 days)
        const past7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });

        const formattedWeekly = past7Days.map(dateObj => {
          const dateStr = dateObj.toISOString().split('T')[0];
          const found = (localStats.weeklySales as any[])?.find(s => s.date === dateStr);
          return {
            name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: found ? safeNumber(found.revenue) : 0
          };
        });
        setWeeklyData(formattedWeekly);

        // PRODUCTS
        const products =
          await getProducts();

        const totalQuantity =
          (
            products as any[]
          ).reduce(
            (
              sum: number,
              product: any,
            ) =>
              sum +
              safeNumber(
                product.quantity,
              ),
            0,
          );

        const totalCostValue =
          (
            products as any[]
          ).reduce(
            (
              sum: number,
              product: any,
            ) =>
              sum +
              safeNumber(
                product.cost_price,
              ) *
                safeNumber(
                  product.quantity,
                ),
            0,
          );

        const totalSaleValue =
          (
            products as any[]
          ).reduce(
            (
              sum: number,
              product: any,
            ) =>
              sum +
              safeNumber(
                product.sale_price,
              ) *
                safeNumber(
                  product.quantity,
                ),
            0,
          );

        // Actual Gross Profit from today's sales
        const todayCost = safeNumber((localStats as any).todayCost);
        const grossProfit = revenue - todayCost;

        setProfitSummary({
          totalRevenue:
            revenue,

          totalCost:
            todayCost,

          grossProfit,

          profitMargin:
            revenue > 0
              ? (
                  grossProfit /
                  revenue
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
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setError(
          'Failed to load dashboard.',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency =
    (
      value?: number,
    ) =>
      `Rs. ${safeNumber(
        value,
      ).toFixed(2)}`;

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          Loading dashboard...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Dashboard"
            subtitle="Business overview and analytics"
          />

          <button
            onClick={
              fetchDashboard
            }
            disabled={
              loading
            }
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />

            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Revenue
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {formatCurrency(
                    dailySales.totalRevenue,
                  )}
                </h2>

                <div className="mt-4">
                  <Badge variant="success">
                    Sales Income
                  </Badge>
                </div>
              </div>

              <div className="bg-green-100 p-4 rounded-2xl">
                <DollarSign className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Transactions
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {
                    dailySales.totalTransactions
                  }
                </h2>

                <div className="mt-4">
                  <Badge variant="neutral">
                    Orders
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-100 p-4 rounded-2xl">
                <ShoppingCart className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Gross Profit
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {formatCurrency(
                    profitSummary.grossProfit,
                  )}
                </h2>

                <div className="mt-4">
                  <Badge variant="success">
                    Profit
                  </Badge>
                </div>
              </div>

              <div className="bg-purple-100 p-4 rounded-2xl">
                <TrendingUp className="text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Inventory Qty
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {
                    inventoryValuation.totalQuantity
                  }
                </h2>

                <div className="mt-4">
                  <Badge variant="warning">
                    Stock
                  </Badge>
                </div>
              </div>

              <div className="bg-orange-100 p-4 rounded-2xl">
                <Package className="text-orange-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Ledger Receivables
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {formatCurrency(ledgerBalance)}
                </h2>

                <div className="mt-4">
                  <Badge variant="danger">
                    Owed by Customers
                  </Badge>
                </div>
              </div>

              <div className="bg-red-100 p-4 rounded-2xl">
                <DollarSign className="text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-bold mb-6">Revenue Over Time (Last 7 Days)</h2>
            <div className="h-[350px] w-full">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-fg)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-fg)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                      itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sales data available for the last 7 days.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}