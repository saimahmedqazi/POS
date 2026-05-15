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

export default function DashboardPage() {
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

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchDashboard =
      async () => {
        try {
          const [
            salesRes,
            profitRes,
            inventoryRes,
          ] = await Promise.all([
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

          setDailySales(
            salesRes.data,
          );

          setProfitSummary(
            profitRes.data,
          );

          setInventoryValuation(
            inventoryRes.data,
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

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading dashboard...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Business overview and analytics"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Revenue
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  Rs.{' '}
                  {dailySales?.totalRevenue?.toFixed(
                    2,
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
                    dailySales?.totalTransactions
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
                  Rs.{' '}
                  {profitSummary?.grossProfit?.toFixed(
                    2,
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
                    inventoryValuation?.totalQuantity
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
                      Rs.{' '}
                      {profitSummary?.totalRevenue?.toFixed(
                        2,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Cost
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {profitSummary?.totalCost?.toFixed(
                        2,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Margin
                    </span>

                    <span className="font-semibold text-green-600">
                      {
                        profitSummary?.profitMargin
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
                      Rs.{' '}
                      {inventoryValuation?.totalCostValue?.toFixed(
                        2,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Sale Value
                    </span>

                    <span className="font-semibold">
                      Rs.{' '}
                      {inventoryValuation?.totalSaleValue?.toFixed(
                        2,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Est. Profit
                    </span>

                    <span className="font-semibold text-purple-600">
                      Rs.{' '}
                      {inventoryValuation?.estimatedProfit?.toFixed(
                        2,
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
                  Rs.{' '}
                  {dailySales?.averageOrderValue?.toFixed(
                    2,
                  )}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">
                  Estimated Inventory Profit
                </p>

                <h3 className="text-2xl font-bold mt-2 text-green-600">
                  Rs.{' '}
                  {inventoryValuation?.estimatedProfit?.toFixed(
                    2,
                  )}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">
                  Profit Margin
                </p>

                <h3 className="text-2xl font-bold mt-2 text-purple-600">
                  {
                    profitSummary?.profitMargin
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