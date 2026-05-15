import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Badge from '../../components/ui/badge';

import PageHeader from '../../components/ui/page-header';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/ui/table';

type LedgerEntry = {
  id: string;

  type: string;

  amount: number;

  createdAt: string;

  referenceType?: string;

  referenceId?: string;

  customer?: {
    name: string;
  };
};

export default function LedgerPage() {
  const [
    entries,
    setEntries,
  ] = useState<LedgerEntry[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchLedger =
      async () => {
        try {
          const response =
            await api.get(
              '/ledger',
            );

          setEntries(
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

    fetchLedger();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading ledger...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <PageHeader
          title="Ledger"
          subtitle="Financial transaction history"
        />

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <th className="text-left p-4">
                  Date
                </th>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Type
                </th>

                <th className="text-left p-4">
                  Reference
                </th>

                <th className="text-left p-4">
                  Amount
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {entries.map(
                (
                  entry,
                ) => (
                  <TableRow
                    key={
                      entry.id
                    }
                  >
                    <TableCell>
                      {new Date(
                        entry.createdAt,
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {entry
                        .customer
                        ?.name ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          entry.type ===
                          'DEBIT'
                            ? 'danger'
                            : 'success'
                        }
                      >
                        {
                          entry.type
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {entry.referenceType ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`font-semibold ${
                          entry.type ===
                          'DEBIT'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        Rs.{' '}
                        {
                          entry.amount
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ),
              )}

              {entries.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-500"
                  >
                    No ledger entries found
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}