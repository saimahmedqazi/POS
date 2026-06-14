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
      Number(value || 0).toFixed(
        2,
      ),
    );

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
            item.unitPrice,
          );

        if (
          quantity <= 0
        ) {
          throw new Error(
            'Invalid quantity',
          );
        }

        if (
          !Number.isFinite(
            unitPrice,
          )
        ) {
          throw new Error(
            'Invalid price',
          );
        }

        return {
          productId:
            item.productId,

          productName:
            item.name,

          quantity,

          unitPrice,
        };
      },
    );

  // VALIDATE STOCK BEFORE ANY WRITE
  for (const item of sanitizedItems) {
    const rows =
      await db.select(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [item.productId],
      );

    const product =
      (rows as any[])[0];

    if (!product) {
      throw new Error(
        'Product not found',
      );
    }

    const stock =
      Number(
        product.quantity ||
          0,
      );

    if (
      stock <
      item.quantity
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}`,
      );
    }
  }

  const totalAmount =
    safeMoney(
      sanitizedItems.reduce(
        (
          sum: number,
          item: any,
        ) =>
          sum +
          item.quantity *
            item.unitPrice,
        0,
      ),
    );

  const discount =
    safeMoney(
      salePayload.discount ||
        0,
    );

  const finalAmount =
    safeMoney(
      totalAmount -
        discount,
    );

  try {
    // BEGIN TRANSACTION
    await db.execute('BEGIN TRANSACTION');

    // CREATE SALE
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

    // CUSTOMER CREDIT
    if (
      salePayload.paymentStatus ===
        'CREDIT' &&
      salePayload.customerId
    ) {
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

    // ITEMS + STOCK
    for (const item of sanitizedItems) {
      const subtotal =
        safeMoney(
          item.quantity *
            item.unitPrice,
        );

      // INSERT SALE ITEM
      await db.execute(
        `
        INSERT INTO sale_items (
          id,
          sale_id,
          product_id,
          product_name,
          quantity,
          unit_price,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),

          salePayload.saleId,

          item.productId,

          item.productName,

          item.quantity,

          item.unitPrice,

          subtotal,
        ],
      );

      // GET CURRENT STOCK
      const stockRows =
        await db.select(
          `
          SELECT quantity
          FROM products
          WHERE id = ?
          LIMIT 1
          `,
          [item.productId],
        );

      const currentStock =
        Number(
          (
            stockRows as any[]
          )[0]?.quantity ||
            0,
        );

      const newStock =
        currentStock -
        item.quantity;

      // UPDATE STOCK
      await db.execute(
        `
        UPDATE products
        SET quantity = ?
        WHERE id = ?
        `,
        [
          newStock,
          item.productId,
        ],
      );

      // INVENTORY HISTORY
      await db.execute(
        `
        INSERT INTO inventory_transactions (
          id,
          product_id,
          type,
          quantity_change,
          previous_quantity,
          new_quantity,
          reference_id,
          notes,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),

          item.productId,

          'SALE',

          -item.quantity,

          currentStock,

          newStock,

          salePayload.saleId,

          'POS sale deduction',

          new Date().toISOString(),
        ],
      );

      // SMALL DELAY TO PREVENT SQLITE LOCK
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            15,
          ),
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

    // COMMIT TRANSACTION
    await db.execute('COMMIT');

    return {
      success: true,
    };
  } catch (error) {
    // ROLLBACK EVERYTHING ON FAILURE
    await db.execute('ROLLBACK').catch(() => {});
    throw error;
  }
}

export async function getLocalSales() {
  const db =
    getDatabase();

  const sales =
    await db.select(
      `
      SELECT 
        s.*,
        c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
      `,
    );

  for (const sale of sales as any[]) {
    if (sale.customer_name) {
      sale.customer = {
        name: sale.customer_name,
      };
    }

    const items =
      await db.select(
        `
        SELECT 
          si.*,
          COALESCE(si.product_name, p.name) as product_name
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
        `,
        [sale.id],
      );

    sale.items = items;
  }

  return sales;
}

export async function revertLocalSale(saleId: string) {
  const db = getDatabase();

  const saleRows = await db.select(
    `
    SELECT *
    FROM sales
    WHERE id = ?
    LIMIT 1
    `,
    [saleId]
  ) as any[];

  const sale = saleRows[0];

  if (!sale) {
    throw new Error('Sale not found');
  }

  if (sale.payment_status === 'RETURNED' || sale.payment_status === 'REVERTED') {
    throw new Error('Sale is already reverted');
  }

  // 1. REVERSE CUSTOMER CREDIT
  if (sale.payment_status === 'CREDIT' && sale.customer_id) {
    await db.execute(
      `
      UPDATE customers
      SET current_balance = current_balance - ?
      WHERE id = ?
      `,
      [sale.final_amount, sale.customer_id]
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
        sale.customer_id,
        'CREDIT',
        sale.final_amount,
        'RETURN',
        sale.id,
        new Date().toISOString(),
      ]
    );
  }

  // 2. UPDATE SALE STATUS
  await db.execute(
    `
    UPDATE sales
    SET payment_status = 'RETURNED'
    WHERE id = ?
    `,
    [sale.id]
  );

  // 3. RESTORE INVENTORY
  const items = await db.select(
    `
    SELECT *
    FROM sale_items
    WHERE sale_id = ?
    `,
    [sale.id]
  ) as any[];

  for (const item of items) {
    const stockRows = await db.select(
      `
      SELECT quantity
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [item.product_id]
    ) as any[];

    const currentStock = Number(stockRows[0]?.quantity || 0);
    const newStock = currentStock + item.quantity;

    await db.execute(
      `
      UPDATE products
      SET quantity = ?
      WHERE id = ?
      `,
      [newStock, item.product_id]
    );

    await db.execute(
      `
      INSERT INTO inventory_transactions (
        id,
        product_id,
        type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reference_id,
        notes,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),
        item.product_id,
        'RETURN',
        item.quantity,
        currentStock,
        newStock,
        sale.id,
        'POS sale reverted',
        new Date().toISOString(),
      ]
    );
  }

  // 4. SYNC QUEUE
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
      'SALE_REVERTED',
      JSON.stringify({ saleId: sale.id }),
      0,
      new Date().toISOString(),
    ]
  );

  return { success: true };
}