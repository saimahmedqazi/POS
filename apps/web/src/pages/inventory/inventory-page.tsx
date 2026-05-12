import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

type Product = {
  id: string;

  name: string;

  sku: string;

  barcode: string;

  salePrice: number;

  costPrice: number;

  inventory?: {
    quantity: number;
  }[];
};

export default function InventoryPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchProducts =
      async () => {
        try {
          const response =
            await api.get(
              '/products',
            );

          setProducts(
            response.data,
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

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading inventory...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Inventory
          </h1>

          <p className="text-slate-500 mt-1">
            Product stock management
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-4">
                  Product
                </th>

                <th className="text-left p-4">
                  SKU
                </th>

                <th className="text-left p-4">
                  Barcode
                </th>

                <th className="text-left p-4">
                  Cost
                </th>

                <th className="text-left p-4">
                  Sale
                </th>

                <th className="text-left p-4">
                  Stock
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map(
                (
                  product,
                ) => (
                  <tr
                    key={
                      product.id
                    }
                    className="border-t"
                  >
                    <td className="p-4 font-medium">
                      {
                        product.name
                      }
                    </td>

                    <td className="p-4">
                      {
                        product.sku
                      }
                    </td>

                    <td className="p-4">
                      {
                        product.barcode
                      }
                    </td>

                    <td className="p-4">
                      Rs.{' '}
                      {
                        product.costPrice
                      }
                    </td>

                    <td className="p-4">
                      Rs.{' '}
                      {
                        product.salePrice
                      }
                    </td>

                    <td className="p-4">
                      {product
                        .inventory?.[0]
                        ?.quantity ??
                        0}
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