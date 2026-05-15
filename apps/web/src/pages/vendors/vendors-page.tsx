import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

type Vendor = {
  id: string;

  name: string;

  phone: string;

  currentBalance: number;
};

export default function VendorsPage() {
  const [
    vendors,
    setVendors,
  ] = useState<Vendor[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchVendors =
      async () => {
        try {
          const response =
            await api.get(
              '/vendors',
            );

          setVendors(
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

    fetchVendors();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading vendors...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Vendors
          </h1>

          <p className="text-slate-500 mt-1">
            Supplier and procurement management
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-4">
                  Name
                </th>

                <th className="text-left p-4">
                  Phone
                </th>

                <th className="text-left p-4">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody>
              {vendors.map(
                (
                  vendor,
                ) => (
                  <tr
                    key={
                      vendor.id
                    }
                    className="border-t"
                  >
                    <td className="p-4 font-medium">
                      {
                        vendor.name
                      }
                    </td>

                    <td className="p-4">
                      {
                        vendor.phone
                      }
                    </td>

                    <td
                      className={`p-4 font-semibold ${
                        vendor.currentBalance >
                        0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      Rs.{' '}
                      {
                        vendor.currentBalance
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