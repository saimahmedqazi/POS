import {
  getDatabase,
} from '../lib/database';

export async function createLocalSale(
  salePayload: any,
) {
  const db =
    getDatabase();

  const safeMoney = (
    value: number,
  ) =>
    Number(
      value.toFixed(2),
    );

  // VALIDATE ITEMS
  if (
    !Array.isArray(
      salePayload.items,
    ) ||
    salePayload.items
      .length === 0
  ) {
    throw new Error(
      'Cart is empty',
    );
  }
  

  // SANITIZE ITEMS
  const sanitizedItems =
    salePayload.items.map(
      (item: any) => {
        const quantity =
          Math.floor(
            Number(
              item.quantity,
            ),
          );

        const unitPrice =
          safeMoney(
            Number(
              item.unitPrice,
            ),
          );

        if (
          !Number.isFinite(
            quantity,
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            'Invalid quantity',
          );
        }

        if (
          !Number.isFinite(
            unitPrice,
          ) ||
          unitPrice < 0
        ) {
          throw new Error(
            'Invalid price',
          );
        }

        return {
          productId:
            item.productId,

          quantity,

          unitPrice,
        };
      },
    );

  const totalAmount =
    safeMoney(
      sanitizedItems.reduce(
        (
          sum: number,
          item: any,
        ) =>
          sum +
          safeMoney(
            item.quantity *
              item.unitPrice,
          ),
        0,
      ),
    );

  const discount =
    safeMoney(
      Number(
        salePayload.discount ||
          0,
      ),
    );

  const finalAmount =
    safeMoney(
      totalAmount -
        discount,
    );

  if (finalAmount < 0) {
    throw new Error(
      'Invalid final amount',
    );
  }

  // STOCK VALIDATION
  for (const item of sanitizedItems) {
    const products =
      await db.select(
        `
        SELECT quantity
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [
          item.productId,
        ],
      );

    const product =
      (
        products as any[]
      )[0];

    if (!product) {
      throw new Error(
        'Product not found',
      );
    }

    const currentStock =
      Number(
        product.quantity ||
          0,
      );

    if (
      currentStock <
      item.quantity
    ) {
      throw new Error(
        'Insufficient stock',
      );
    }
  }

  // INSERT SALE
  await db.execute(
    `
    INSERT INTO sales (
      id,
      customer_id,
      total_amount,
      discount,
      final_amount,
      payment_status,
      synced,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      salePayload.saleId,

      salePayload.customerId ||
        null,

      totalAmount,

      discount,

      finalAmount,

      salePayload.paymentStatus,

      0,

      new Date().toISOString(),
    ],
  );
// CREDIT CUSTOMER LEDGER
if (
  salePayload.paymentStatus ===
    'CREDIT' &&
  salePayload.customerId
) {
  // UPDATE CUSTOMER BALANCE
  await db.execute(
    `
    UPDATE customers
    SET current_balance =
      current_balance + ?
    WHERE id = ?
    `,
    [
      finalAmount,
      salePayload.customerId,
    ],
  );

  // CREATE LEDGER ENTRY
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

      salePayload.customerId,

      'DEBIT',

      finalAmount,

      'SALE',

      salePayload.saleId,

      new Date().toISOString(),
    ],
  );
}
  // INSERT ITEMS + UPDATE STOCK
  for (const item of sanitizedItems) {
    const subtotal =
      safeMoney(
        item.quantity *
          item.unitPrice,
      );

    await db.execute(
      `
      INSERT INTO sale_items (
        id,
        sale_id,
        product_id,
        quantity,
        unit_price,
        subtotal
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),

        salePayload.saleId,

        item.productId,

        item.quantity,

        item.unitPrice,

        subtotal,
      ],
    );

    await db.execute(
      `
      UPDATE products
      SET quantity =
        MAX(quantity - ?, 0)
      WHERE id = ?
      `,
      [
        item.quantity,
        item.productId,
      ],
    );
  }

  // SYNC QUEUE
  await db.execute(
    `
    INSERT INTO sync_queue (
      id,
      event_type,
      payload,
      synced,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),

      'SALE_CREATED',

      JSON.stringify(
        salePayload,
      ),

      0,

      new Date().toISOString(),
    ],
  );
}

export async function getLocalSales() {
  const db =
    getDatabase();

  const sales =
    await db.select(
      `
      SELECT *
      FROM sales
      ORDER BY created_at DESC
      `,
    );

  for (const sale of sales as any[]) {
    const items =
      await db.select(
        `
        SELECT *
        FROM sale_items
        WHERE sale_id = ?
        `,
        [sale.id],
      );

    sale.items = items;
  }

  return sales;
}