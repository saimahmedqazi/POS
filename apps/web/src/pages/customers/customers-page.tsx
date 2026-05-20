import {
  useEffect,
  useState,
} from 'react';

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

import {
  getCustomers,
  createLocalCustomer,
  updateLocalCustomer,
  deleteLocalCustomer,
  receiveCustomerPayment,
} from '../../repositories/customer.repository';

type Customer = {
  id: string;

  name: string;

  phone?: string;

  current_balance: number;
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

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    paymentModalOpen,
    setPaymentModalOpen,
  ] = useState(false);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const fetchCustomers =
    async () => {
      try {
        const localCustomers =
          await getCustomers();

        setCustomers(
          (
            localCustomers as any[]
          ).map(
            (
              customer: any,
            ) => ({
              id: customer.id,

              name:
                customer.name,

              phone:
                customer.phone,

              current_balance:
                Number(
                  customer.current_balance ||
                    0,
                ),
            }),
          ),
        );
      } catch (
        error
      ) {
        console.error(
          'Failed loading customers',
          error,
        );

        alert(
          'Failed loading customers',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm =
    () => {
      setCustomerName('');

      setCustomerPhone('');

      setEditingCustomer(
        null,
      );
    };

  const handleCreateCustomer =
    async () => {
      const name =
        customerName.trim();

      const phone =
        customerPhone.trim();

      if (!name) {
        alert(
          'Customer name is required',
        );

        return;
      }

      if (
        name.length < 2
      ) {
        alert(
          'Customer name too short',
        );

        return;
      }

      if (
        phone &&
        !/^[0-9+\-\s]+$/.test(
          phone,
        )
      ) {
        alert(
          'Invalid phone number',
        );

        return;
      }

      try {
        setSaving(true);

        if (
          editingCustomer
        ) {
          await updateLocalCustomer(
            editingCustomer.id,
            {
              name,

              phone,
            },
          );
        } else {
          await createLocalCustomer(
            {
              name,

              phone,
            },
          );
        }

        resetForm();

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
          'Failed saving customer',
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDeleteCustomer =
    async (
      customer: Customer,
    ) => {
      const confirmed =
        window.confirm(
          `Delete customer?\n\n` +
            `Name: ${customer.name}\n` +
            `Phone: ${
              customer.phone ||
              '-'
            }\n` +
            `Balance: Rs. ${Number(
              customer.current_balance ||
                0,
            ).toFixed(2)}`,
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteLocalCustomer(
          customer.id,
        );

        fetchCustomers();
      } catch (
        error
      ) {
        console.error(
          error,
        );

        alert(
          'Failed deleting customer',
        );
      }
    };

  const handleReceivePayment =
    async () => {
      if (
        !selectedCustomer
      ) {
        return;
      }

      const amount =
        Number(
          paymentAmount,
        );

      if (
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        alert(
          'Invalid payment amount',
        );

        return;
      }

      try {
        setSaving(true);

        await receiveCustomerPayment(
          selectedCustomer.id,
          amount,
        );

        setPaymentModalOpen(
          false,
        );

        setPaymentAmount('');

        setSelectedCustomer(
          null,
        );

        fetchCustomers();
      } catch (
        error
      ) {
        console.error(
          error,
        );

        alert(
          'Failed receiving payment',
        );
      } finally {
        setSaving(false);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Customers"
            subtitle="Customer accounts and balances"
          />

          <Button
            onClick={() => {
              resetForm();

              setCreateModalOpen(
                true,
              );
            }}
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
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold ${
                          customer.current_balance >
                          0
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        <span className="text-base">
                          {customer.current_balance >
                          0
                            ? '↑'
                            : '✓'}
                        </span>

                        <span>
                          Rs.{' '}
                          {Number(
                            customer.current_balance ||
                              0,
                          ).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => {
                            setEditingCustomer(
                              customer,
                            );

                            setCustomerName(
                              customer.name,
                            );

                            setCustomerPhone(
                              customer.phone ||
                                '',
                            );

                            setCreateModalOpen(
                              true,
                            );
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          className="px-3 py-2"
                          onClick={() =>
                            handleDeleteCustomer(
                              customer,
                            )
                          }
                        >
                          Delete
                        </Button>

                        <Button
                          variant="success"
                          className="px-3 py-2"
                          disabled={
                            Number(
                              customer.current_balance ||
                                0,
                            ) <= 0
                          }
                          onClick={() => {
                            setSelectedCustomer(
                              customer,
                            );

                            setPaymentAmount(
                              '',
                            );

                            setPaymentModalOpen(
                              true,
                            );
                          }}
                        >
                          Payment
                        </Button>
                      </div>
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
          title={
            editingCustomer
              ? 'Edit Customer'
              : 'Add Customer'
          }
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
              disabled={saving}
              onClick={
                handleCreateCustomer
              }
            >
              {editingCustomer
                ? 'Update'
                : 'Create'}
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

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 text-red-700 font-semibold">
              <span>
                ↑
              </span>

              <span>
                Outstanding:
                {' '}
                Rs.{' '}
                {Number(
                  selectedCustomer?.current_balance ||
                    0,
                ).toFixed(
                  2,
                )}
              </span>
            </div>
          </div>

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
              disabled={saving}
              onClick={
                handleReceivePayment
              }
            >
              Confirm Payment
            </Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}