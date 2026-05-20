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

        const grossProfit =
          totalSaleValue -
          totalCostValue;

        setProfitSummary({
          totalRevenue:
            revenue,

          totalCost:
            totalCostValue,

          grossProfit,

          profitMargin:
            totalSaleValue > 0
              ? (
                  grossProfit /
                  totalSaleValue
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
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
                <p className="text-slate-500 text-sm font-medium">
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
                <p className="text-slate-500 text-sm font-medium">
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
                <p className="text-slate-500 text-sm font-medium">
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
        </div>
      </div>
    </AppLayout>
  );
}