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
} from 'lucide-react';

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
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Business overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  Revenue
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Rs.{' '}
                  {
                    dailySales?.totalRevenue
                  }
                </h2>
              </div>

              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  Transactions
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {
                    dailySales?.totalTransactions
                  }
                </h2>
              </div>

              <div className="bg-blue-100 p-3 rounded-xl">
                <ShoppingCart className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  Gross Profit
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Rs.{' '}
                  {
                    profitSummary?.grossProfit
                  }
                </h2>
              </div>

              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  Inventory Qty
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {
                    inventoryValuation?.totalQuantity
                  }
                </h2>
              </div>

              <div className="bg-orange-100 p-3 rounded-xl">
                <Package className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Profit Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>
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
                <span>
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
                <span>
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
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Inventory Valuation
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>
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
                <span>
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
                <span>
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}