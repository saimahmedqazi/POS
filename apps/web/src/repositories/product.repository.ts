import {
  getDatabase,
} from '../lib/database';

const safeNumber = (
  value: any,
) => {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
};

export async function getProducts() {
  const db =
    getDatabase();

  return db.select(`
    SELECT *
    FROM products
    ORDER BY created_at DESC
  `);
}

export async function createProduct(
  product: {
    name: string;

    sku: string;

    barcode: string;

    salePrice: number;

    costPrice: number;

    quantity: number;
  },
) {
  const db =
    getDatabase();

  const name =
    product.name.trim();

  const sku =
    product.sku.trim();

  const barcode =
    product.barcode.trim();

  const salePrice =
    safeNumber(
      product.salePrice,
    );

  const costPrice =
    safeNumber(
      product.costPrice,
    );

  const quantity =
    Math.floor(
      safeNumber(
        product.quantity,
      ),
    );

  // VALIDATION
  if (!name) {
    throw new Error(
      'Product name required',
    );
  }

  if (
    salePrice < 0 ||
    costPrice < 0
  ) {
    throw new Error(
      'Invalid pricing',
    );
  }

  if (quantity < 0) {
    throw new Error(
      'Invalid quantity',
    );
  }

  // DUPLICATE CHECK
  const existing =
    await db.select(
      `
      SELECT id
      FROM products
      WHERE
        sku = ?
        OR barcode = ?
      LIMIT 1
      `,
      [
        sku,
        barcode,
      ],
    );

  if (
    (existing as any[])
      .length > 0
  ) {
    throw new Error(
      'SKU or barcode already exists',
    );
  }

  const id =
    crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO products (
      id,
      name,
      sku,
      barcode,
      sale_price,
      cost_price,
      quantity,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,

      name,

      sku,

      barcode,

      salePrice,

      costPrice,

      quantity,

      new Date().toISOString(),
    ],
  );

  return {
    id,

    name,

    sku,

    barcode,

    salePrice,

    costPrice,

    quantity,
  };
}

export async function updateProduct(
  product: any,
) {
  const db =
    getDatabase();

  const name =
    String(
      product.name || '',
    ).trim();

  const sku =
    String(
      product.sku || '',
    ).trim();

  const barcode =
    String(
      product.barcode || '',
    ).trim();

  const salePrice =
    safeNumber(
      product.salePrice,
    );

  const costPrice =
    safeNumber(
      product.costPrice,
    );

  const quantity =
    Math.floor(
      safeNumber(
        product.quantity,
      ),
    );

  // VALIDATION
  if (!name) {
    throw new Error(
      'Product name required',
    );
  }

  if (
    salePrice < 0 ||
    costPrice < 0
  ) {
    throw new Error(
      'Invalid pricing',
    );
  }

  if (quantity < 0) {
    throw new Error(
      'Invalid quantity',
    );
  }

  // DUPLICATE CHECK
  const existing =
    await db.select(
      `
      SELECT id
      FROM products
      WHERE
        (
          sku = ?
          OR barcode = ?
        )
        AND id != ?
      LIMIT 1
      `,
      [
        sku,
        barcode,
        product.id,
      ],
    );

  if (
    (existing as any[])
      .length > 0
  ) {
    throw new Error(
      'SKU or barcode already exists',
    );
  }

  await db.execute(
    `
    UPDATE products
    SET
      name = ?,
      sku = ?,
      barcode = ?,
      sale_price = ?,
      cost_price = ?,
      quantity = ?
    WHERE id = ?
    `,
    [
      name,

      sku,

      barcode,

      salePrice,

      costPrice,

      quantity,

      product.id,
    ],
  );

  return {
    ...product,

    name,

    sku,

    barcode,

    salePrice,

    costPrice,

    quantity,
  };
}

export async function adjustProductStock(
  productId: string,
  adjustment: number,
) {
  const db =
    getDatabase();

  const rows =
    await db.select(
      `
      SELECT *
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [productId],
    );

  const product =
    (rows as any[])[0];

  if (!product) {
    throw new Error(
      'Product not found',
    );
  }

  const newQuantity =
    Math.max(
      Math.floor(
        safeNumber(
          product.quantity,
        ) +
          safeNumber(
            adjustment,
          ),
      ),
      0,
    );

  await db.execute(
    `
    UPDATE products
    SET quantity = ?
    WHERE id = ?
    `,
    [
      newQuantity,
      productId,
    ],
  );

  return {
    ...product,

    quantity:
      newQuantity,
  };
}

export async function archiveProduct(
  productId: string,
) {
  const db =
    getDatabase();

  await db.execute(
    `
    DELETE FROM products
    WHERE id = ?
    `,
    [productId],
  );
}