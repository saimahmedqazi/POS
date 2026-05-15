import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Input from '../../components/ui/input';

import Modal from '../../components/ui/modal';

import PageHeader from '../../components/ui/page-header';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/ui/table';

type Customer = {
  id: string;

  name: string;

  phone?: string;

  balance: number;
};

export default function CustomersPage() {
  const [
    customers,
    setCustomers,
  ] = useState<Customer[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const [
    customerName,
    setCustomerName,
  ] = useState('');

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState('');

  const fetchCustomers =
    async () => {
      try {
        const response =
          await api.get(
            '/customers',
          );

        setCustomers(
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer =
    async () => {
      try {
        await api.post(
          '/customers',
          {
            name: customerName,

            phone:
              customerPhone,

            type: 'VENDOR',

            creditLimit: 0,
          },
        );

        setCustomerName(
          '',
        );

        setCustomerPhone(
          '',
        );

        setCreateModalOpen(
          false,
        );

        fetchCustomers();
      } catch (
        error
      ) {
        console.error(
          error,
        );

        alert(
          'Failed to create customer',
        );
      }
    };

  const [
    paymentModalOpen,
    setPaymentModalOpen,
  ] = useState(false);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<any>(
    null,
  );

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState('');

  const handleReceivePayment =
    async () => {
      if (
        !selectedCustomer
      ) {
        return;
      }

      try {
        await api.post(
          '/ledger',
          {
            customerId:
              selectedCustomer.id,

            type: 'CREDIT',

            amount:
              Number(
                paymentAmount,
              ),

            referenceType:
              'PAYMENT',
          },
        );

        setPaymentModalOpen(
          false,
        );

        setPaymentAmount(
          '',
        );

        setSelectedCustomer(
          null,
        );

        const response =
          await api.get(
            '/customers',
          );

        setCustomers(
          response.data,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        alert(
          'Failed to receive payment',
        );
      }
    };

  if (loading) {
    return (
      <AppLayout>
        <div>
          Loading customers...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            title="Customers"
            subtitle="Customer accounts and balances"
          />

          <Button
            onClick={() =>
              setCreateModalOpen(
                true,
              )
            }
          >
            Add Customer
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHead>
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

                <th className="text-left p-4">
                  Actions
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {customers.map(
                (
                  customer,
                ) => (
                  <TableRow
                    key={
                      customer.id
                    }
                  >
                    <TableCell>
                      <span className="font-medium">
                        {
                          customer.name
                        }
                      </span>
                    </TableCell>

                    <TableCell>
                      {customer.phone ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`font-semibold ${
                          customer.balance >
                          0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        Rs.{' '}
                        {
                          customer.balance
                        }
                      </span>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="success"
                        className="px-3 py-2"
                        onClick={() => {
                          setSelectedCustomer(
                            customer,
                          );

                          setPaymentModalOpen(
                            true,
                          );
                        }}
                      >
                        Receive Payment
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}

              {customers.length ===
                0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-slate-500"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </Card>

        <Modal
          open={
            createModalOpen
          }
          title="Add Customer"
          onClose={() =>
            setCreateModalOpen(
              false,
            )
          }
        >
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Customer Name"
              value={
                customerName
              }
              onChange={(e) =>
                setCustomerName(
                  e.target
                    .value,
                )
              }
            />

            <Input
              type="text"
              placeholder="Phone Number"
              value={
                customerPhone
              }
              onChange={(e) =>
                setCustomerPhone(
                  e.target
                    .value,
                )
              }
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() =>
                setCreateModalOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              className="flex-1"
              onClick={
                handleCreateCustomer
              }
            >
              Create
            </Button>
          </div>
        </Modal>

        <Modal
          open={
            paymentModalOpen &&
            !!selectedCustomer
          }
          title="Receive Payment"
          onClose={() =>
            setPaymentModalOpen(
              false,
            )
          }
        >
          <p className="text-slate-600 mb-4">
            Customer:{' '}
            <span className="font-semibold">
              {
                selectedCustomer?.name
              }
            </span>
          </p>

          <p className="text-slate-600 mb-6">
            Current Balance:{' '}
            <span className="font-bold text-red-600">
              Rs.{' '}
              {
                selectedCustomer?.balance
              }
            </span>
          </p>

          <Input
            type="number"
            placeholder="Payment Amount"
            value={
              paymentAmount
            }
            onChange={(e) =>
              setPaymentAmount(
                e.target.value,
              )
            }
          />

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() =>
                setPaymentModalOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              className="flex-1"
              onClick={
                handleReceivePayment
              }
            >
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}