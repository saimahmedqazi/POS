import {
  getDatabase,
} from '../lib/database';

export async function getCustomers() {
  const db =
    getDatabase();

  return db.select(
    `
    SELECT *
    FROM customers
    ORDER BY name ASC
    `,
  );
}

export async function createLocalCustomer(
  customer: {
    name: string;
    phone?: string;
  },
) {
  const db =
    getDatabase();

  const id =
    crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO customers (
      id,
      name,
      phone,
      current_balance
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      id,
      customer.name,
      customer.phone || '',
      0,
    ],
  );

  return {
    id,
    name: customer.name,
    phone:
      customer.phone || '',
    current_balance: 0,
  };
}

export async function updateLocalCustomer(
  id: string,
  data: {
    name: string;
    phone?: string;
  },
) {
  const db =
    getDatabase();

  await db.execute(
    `
    UPDATE customers
    SET
      name = ?,
      phone = ?
    WHERE id = ?
    `,
    [
      data.name,
      data.phone || '',
      id,
    ],
  );
}

export async function deleteLocalCustomer(
  id: string,
) {
  const db =
    getDatabase();

  await db.execute(
    `
    DELETE FROM customers
    WHERE id = ?
    `,
    [id],
  );
}

export async function receiveCustomerPayment(
  customerId: string,
  amount: number,
) {
  const db =
    getDatabase();

  await db.execute(
    `
    UPDATE customers
    SET current_balance =
      current_balance - ?
    WHERE id = ?
    `,
    [
      amount,
      customerId,
    ],
  );

  await db.execute(
    `
    INSERT INTO ledger_entries (
      id,
      customer_id,
      type,
      amount,
      reference_type,
      reference_id,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),
      customerId,
      'CREDIT',
      amount,
      'PAYMENT',
      crypto.randomUUID(),
      new Date().toISOString(),
    ],
  );
}

export async function enableCustomerMobileAccess(
  customerId: string,
  mobileSyncId: string,
) {
  const db =
    getDatabase();

  await db.execute(
    `
    UPDATE customers
    SET
      mobile_enabled = 1,
      mobile_sync_id = ?
    WHERE id = ?
    `,
    [
      mobileSyncId,
      customerId,
    ],
  );
}