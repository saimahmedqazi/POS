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
  enableCustomerMobileAccess,
} from '../../repositories/customer.repository';

import {
  createRetailerAccount,
} from '../../services/retailer.service';

import {
  getRetailersMap,
  setRetailerDisabledState,
} from '../../services/retailer-management.service';

type Customer = {
  id: string;

  name: string;

  phone?: string;

  current_balance: number;

  mobile_enabled?: number;

  mobile_sync_id?: string;

  retailer_disabled?: boolean;
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
    saving,
    setSaving,
  ] = useState(false);

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const [
    paymentModalOpen,
    setPaymentModalOpen,
  ] = useState(false);

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    credentialsModalOpen,
    setCredentialsModalOpen,
  ] = useState(false);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    customerName,
    setCustomerName,
  ] = useState('');

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState('');

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState('');

  const [
    mobileEnabled,
    setMobileEnabled,
  ] = useState(false);

  const [
    retailerPassword,
    setRetailerPassword,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    createdRetailerCredentials,
    setCreatedRetailerCredentials,
  ] = useState<{
    phone: string;

    password: string;
  } | null>(null);

 const fetchCustomers =
  async () => {
    try {
      const [
        localCustomers,
        retailersMap,
      ] =
        await Promise.all(
          [
            getCustomers(),

            getRetailersMap(),
          ],
        );

      setCustomers(
        (
          localCustomers as any[]
        ).map(
          (
            customer: any,
          ) => {
            const retailer =
              retailersMap.get(
                customer.id,
              );

            return {
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

              mobile_enabled:
                Number(
                  customer.mobile_enabled ||
                    0,
                ),

              mobile_sync_id:
                customer.mobile_sync_id,

              retailer_disabled:
                retailer?.disabled ||
                false,
            };
          },
        ),
      );
    } catch (
      error
    ) {
      console.error(
        error,
      );

      setErrorMessage(
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

      setRetailerPassword(
        '',
      );

      setMobileEnabled(
        false,
      );

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

      setErrorMessage(
        '',
      );

      setSuccessMessage(
        '',
      );

      if (!name) {
        setErrorMessage(
          'Customer name is required',
        );

        return;
      }

      if (
        name.length < 2
      ) {
        setErrorMessage(
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
        setErrorMessage(
          'Invalid phone number',
        );

        return;
      }

      if (
        mobileEnabled
      ) {
        if (!phone) {
          setErrorMessage(
            'Phone number required for retailer access',
          );

          return;
        }

        if (
          retailerPassword.length <
          6
        ) {
          setErrorMessage(
            'Retailer password must be at least 6 characters',
          );

          return;
        }
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

          setSuccessMessage(
            'Customer updated successfully',
          );
        } else {
          const createdCustomer =
            await createLocalCustomer(
              {
                name,

                phone,
              },
            );

          if (
            mobileEnabled
          ) {
            const retailer =
              await createRetailerAccount(
                {
                  customerLocalId:
                    createdCustomer.id,

                  businessName:
                    name,

                  phone,

                  password:
                    retailerPassword,
                },
              );

            await enableCustomerMobileAccess(
              createdCustomer.id,
              retailer.retailerId,
            );

            setCreatedRetailerCredentials(
              {
                phone:
                  retailer.normalizedPhone,

                password:
                  retailerPassword,
              },
            );

            setCredentialsModalOpen(
              true,
            );
          }

          setSuccessMessage(
            'Customer created successfully',
          );
        }

        resetForm();

        setCreateModalOpen(
          false,
        );

        fetchCustomers();
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          error?.message ||
            'Failed saving customer',
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDeleteCustomer =
    async () => {
      if (
        !selectedCustomer
      ) {
        return;
      }

      if (
        selectedCustomer.current_balance !== 0
      ) {
        setErrorMessage(
          'Cannot delete customer with an outstanding balance. Please settle the balance first.',
        );
        setDeleteModalOpen(
          false,
        );
        return;
      }

      try {
        setSaving(true);

        await deleteLocalCustomer(
          selectedCustomer.id,
        );

        setDeleteModalOpen(
          false,
        );

        setSelectedCustomer(
          null,
        );

        setSuccessMessage(
          'Customer deleted successfully',
        );

        fetchCustomers();
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Failed deleting customer',
        );
      } finally {
        setSaving(false);
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
        setErrorMessage(
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

        setPaymentAmount(
          '',
        );

        setSelectedCustomer(
          null,
        );

        setSuccessMessage(
          'Payment received successfully',
        );

        fetchCustomers();
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
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

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div className="flex items-center justify-between">
              <span>
                {errorMessage}
              </span>

              <button
                onClick={() =>
                  setErrorMessage(
                    '',
                  )
                }
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <div className="flex items-center justify-between">
              <span>
                {successMessage}
              </span>

              <button
                onClick={() =>
                  setSuccessMessage(
                    '',
                  )
                }
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
                      <div>
                        <div className="font-medium">
                          {
                            customer.name
                          }
                        </div>

                        {customer.mobile_enabled ===
  1 && (
  <div className="mt-2">
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        customer.retailer_disabled
          ? 'bg-red-100 text-red-700'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      {customer.retailer_disabled
        ? 'Mobile Disabled'
        : 'Mobile Enabled'}
    </span>
  </div>
)}
                      </div>
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
                      <div className="flex gap-2 flex-wrap">
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
    disabled={customer.current_balance !== 0}
    title={customer.current_balance !== 0 ? "Cannot delete customer with an outstanding balance" : "Delete customer"}
    onClick={() => {
      setSelectedCustomer(
        customer,
      );

      setDeleteModalOpen(
        true,
      );
    }}
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

  {customer.mobile_enabled ===
    1 && (
    <Button
      variant="secondary"
      className={`px-3 py-2 ${
        customer.retailer_disabled
          ? 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
          : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
      }`}
      disabled={saving}
      onClick={async () => {
        try {
          setSaving(true);

          await setRetailerDisabledState(
            customer.mobile_sync_id!,
            !customer.retailer_disabled,
          );

          setSuccessMessage(
            customer.retailer_disabled
              ? 'Retailer enabled successfully'
              : 'Retailer disabled successfully',
          );

          await fetchCustomers();
        } catch (
          error
        ) {
          console.error(
            error,
          );

          setErrorMessage(
            'Failed updating retailer status',
          );
        } finally {
          setSaving(false);
        }
      }}
    >
      {customer.retailer_disabled
        ? 'Enable App'
        : 'Disable App'}
    </Button>
  )}
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

            {!editingCustomer && (
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      mobileEnabled
                    }
                    onChange={(e) =>
                      setMobileEnabled(
                        e.target
                          .checked,
                      )
                    }
                  />

                  <span className="font-medium">
                    Enable Mobile Ordering
                  </span>
                </label>

                {mobileEnabled && (
                  <div className="mt-4">
                    <Input
                      type="password"
                      placeholder="Retailer Password"
                      value={
                        retailerPassword
                      }
                      onChange={(e) =>
                        setRetailerPassword(
                          e.target
                            .value,
                        )
                      }
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      Retailer will use
                      phone + password
                      to login into mobile app.
                    </p>
                  </div>
                )}
              </div>
            )}
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

        <Modal
          open={
            deleteModalOpen &&
            !!selectedCustomer
          }
          title="Delete Customer"
          onClose={() =>
            setDeleteModalOpen(
              false,
            )
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">
                Are you sure you want to delete this customer?
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>
                    Name:
                  </strong>{' '}
                  {
                    selectedCustomer?.name
                  }
                </p>

                <p>
                  <strong>
                    Phone:
                  </strong>{' '}
                  {selectedCustomer?.phone ||
                    '-'}
                </p>

                <p>
                  <strong>
                    Balance:
                  </strong>{' '}
                  Rs.{' '}
                  {Number(
                    selectedCustomer?.current_balance ||
                      0,
                  ).toFixed(
                    2,
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  setDeleteModalOpen(
                    false,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                className="flex-1"
                disabled={saving}
                onClick={
                  handleDeleteCustomer
                }
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={
            credentialsModalOpen
          }
          title="Retailer Account Created"
          onClose={() =>
            setCredentialsModalOpen(
              false,
            )
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-700 mb-3">
                Retailer Credentials
              </p>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>
                    Phone:
                  </strong>{' '}
                  {
                    createdRetailerCredentials?.phone
                  }
                </p>

                <p>
                  <strong>
                    Password:
                  </strong>{' '}
                  {
                    createdRetailerCredentials?.password
                  }
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Share these credentials with the retailer for mobile app login.
            </p>

            <Button
              className="w-full"
              onClick={() =>
                setCredentialsModalOpen(
                  false,
                )
              }
            >
              Done
            </Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}