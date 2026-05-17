import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Activity,
  Wallet,
  RefreshCw,
} from 'lucide-react';

import PageHeader from '../../components/ui/page-header';

import Card from '../../components/ui/card';

import Badge from '../../components/ui/badge';

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
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const fetchDashboard =
    async () => {
      try {
        setLoading(true);

        setError('');

        const results =
          await Promise.allSettled([
            api.get(
              '/reports/daily-sales',
            ),

            api.get(
              '/reports/profit-summary',
            ),

            api.get(
              '/reports/inventory-valuation',
            ),
          ]);

        const [
          salesRes,
          profitRes,
          inventoryRes,
        ] = results;

        if (
          salesRes.status ===
          'fulfilled'
        ) {
          setDailySales(
            salesRes.value.data,
          );
        }

        if (
          profitRes.status ===
          'fulfilled'
        ) {
          setProfitSummary(
            profitRes.value.data,
          );
        }

        if (
          inventoryRes.status ===
          'fulfilled'
        ) {
          setInventoryValuation(
            inventoryRes.value.data,
          );
        }

        const failed =
          results.some(
            (r) =>
              r.status ===
              'rejected',
          );

        if (failed) {
          setError(
            'Some dashboard data failed to load.',
          );
        }
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
      `Rs. ${Number(
        value || 0,
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
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl"
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Financial Overview
              </h2>

              <Badge variant="neutral">
                Live Metrics
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <Wallet className="text-green-600 w-5 h-5" />
                  </div>

                  <h3 className="font-semibold">
                    Profit Summary
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Revenue
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        profitSummary.totalRevenue,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Cost
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        profitSummary.totalCost,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Margin
                    </span>

                    <span className="font-semibold text-green-600">
                      {
                        profitSummary.profitMargin
                      }
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-xl">
                    <Package className="text-orange-600 w-5 h-5" />
                  </div>

                  <h3 className="font-semibold">
                    Inventory Value
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Cost Value
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        inventoryValuation.totalCostValue,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Sale Value
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        inventoryValuation.totalSaleValue,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Est. Profit
                    </span>

                    <span className="font-semibold text-purple-600">
                      {formatCurrency(
                        inventoryValuation.estimatedProfit,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Performance
              </h2>

              <Activity className="text-slate-400" />
            </div>

            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">
                  Average Order Value
                </p>

                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(
                    dailySales.averageOrderValue,
                  )}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">
                  Estimated Inventory Profit
                </p>

                <h3 className="text-2xl font-bold mt-2 text-green-600">
                  {formatCurrency(
                    inventoryValuation.estimatedProfit,
                  )}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">
                  Profit Margin
                </p>

                <h3 className="text-2xl font-bold mt-2 text-purple-600">
                  {
                    profitSummary.profitMargin
                  }
                  %
                </h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}