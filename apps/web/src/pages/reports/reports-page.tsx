import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

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

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchReports =
      async () => {
        try {
          const [
            salesRes,
            profitRes,
            inventoryRes,
            topProductsRes,
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

            api.get(
              '/reports/top-products',
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

          setTopProducts(
            topProductsRes.data,
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
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Reports & Analytics
          </h1>

          <p className="text-slate-500 mt-1">
            Business insights and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
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

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-slate-500 text-sm">
              Transactions
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {
                dailySales?.totalTransactions
              }
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
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

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-slate-500 text-sm">
              Inventory Quantity
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {
                inventoryValuation?.totalQuantity
              }
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">
              Profit Summary
            </h2>

            <div className="space-y-4">
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
            <h2 className="text-xl font-semibold mb-6">
              Inventory Valuation
            </h2>

            <div className="space-y-4">
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

        <div className="bg-white rounded-2xl shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold mb-6">
            Top Products
          </h2>

          <table className="w-full">
            <thead className="bg-slate-100">
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
            </thead>

            <tbody>
              {topProducts.map(
                (
                  product,
                ) => (
                  <tr
                    key={
                      product.productId
                    }
                    className="border-t"
                  >
                    <td className="p-4 font-medium">
                      {
                        product.productName
                      }
                    </td>

                    <td className="p-4">
                      {
                        product.totalQuantitySold
                      }
                    </td>

                    <td className="p-4">
                      Rs.{' '}
                      {
                        product.totalRevenue
                      }
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}