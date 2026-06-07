import {
  useEffect,
  useState,
} from 'react';

import {
  getDatabase,
} from '../../lib/database';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import PageHeader from '../../components/ui/page-header';

import Button from '../../components/ui/button';

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

  const loadLedger =
    async () => {
      try {
        const db =
          getDatabase();

        const rows =
          await db.select(
            `
            SELECT
              ledger_entries.*,
              customers.name as customer_name
            FROM ledger_entries
            LEFT JOIN customers
              ON ledger_entries.customer_id =
                 customers.id
            ORDER BY ledger_entries.created_at DESC
            `,
          );

        const normalized =
          (
            rows as any[]
          ).map(
            (
              entry: any,
            ) => ({
              id: entry.id,

              type:
                entry.type,

              amount:
                Number(
                  entry.amount ||
                    0,
                ),

              createdAt:
                entry.created_at,

              referenceType:
                entry.reference_type,

              referenceId:
                entry.reference_id,

              customer:
                entry.customer_name
                  ? {
                      name:
                        entry.customer_name,
                    }
                  : undefined,
            }),
          );

        setEntries(
          normalized,
        );
      } catch (
        error
      ) {
        console.error(
          'Failed loading ledger',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadLedger();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-foreground/70 text-lg font-medium animate-pulse">
            Loading ledger...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Ledger"
            subtitle="Financial transaction history"
          />

          <Button
            onClick={
              loadLedger
            }
          >
            Refresh
          </Button>
        </div>

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
                      {entry.createdAt
                        ? new Date(
                            entry.createdAt,
                          ).toLocaleDateString()
                        : '-'}
                    </TableCell>

                    <TableCell>
                      <span className="font-medium">
                        {entry
                          .customer
                          ?.name ||
                          '-'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                          entry.type ===
                          'DEBIT'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {entry.type ===
                        'DEBIT'
                          ? 'Credit Sale'
                          : 'Payment'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-slate-600 font-medium">
                        {entry.referenceType ===
                        'SALE'
                          ? 'Sale'
                          : entry.referenceType ===
                            'PAYMENT'
                          ? 'Payment'
                          : '-'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold ${
                          entry.type ===
                          'DEBIT'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        <span className="text-base">
                          {entry.type ===
                          'DEBIT'
                            ? '↑'
                            : '↓'}
                        </span>

                        <span>
                          {entry.type ===
                          'DEBIT'
                            ? '-'
                            : '+'}
                          Rs.{' '}
                          {Number(
                            entry.amount ||
                              0,
                          ).toFixed(
                            2,
                          )}
                        </span>
                      </div>
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