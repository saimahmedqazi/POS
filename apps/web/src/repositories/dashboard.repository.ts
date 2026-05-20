import {
  getDatabase,
} from '../lib/database';

const safeNumber = (
  value: any,
) =>
  Number.isFinite(
    Number(value),
  )
    ? Number(value)
    : 0;

export async function getDashboardStats() {
  const db =
    getDatabase();

  // TODAY SALES
  const salesResult =
    await db.select(
      `
      SELECT
        COUNT(*) as total_sales,
        COALESCE(
          SUM(final_amount),
          0
        ) as revenue
      FROM sales
      WHERE DATE(created_at)
      =
      DATE('now', 'localtime')
      `,
    );

  // TOTAL PRODUCTS
  const productsResult =
    await db.select(
      `
      SELECT COUNT(*) as total_products
      FROM products
      `,
    );

  // LOW STOCK
  const lowStockResult =
    await db.select(
      `
      SELECT COUNT(*) as low_stock
      FROM products
      WHERE quantity <= 5
      `,
    );

  // RECENT SALES
  const recentSales =
    await db.select(
      `
      SELECT
        id,
        customer_id,
        final_amount,
        payment_status,
        created_at
      FROM sales
      ORDER BY created_at DESC
      LIMIT 5
      `,
    );

  return {
    totalSales:
      safeNumber(
        (salesResult as any[])[0]
          ?.total_sales,
      ),

    revenue:
      safeNumber(
        (salesResult as any[])[0]
          ?.revenue,
      ),

    totalProducts:
      safeNumber(
        (productsResult as any[])[0]
          ?.total_products,
      ),

    lowStock:
      safeNumber(
        (lowStockResult as any[])[0]
          ?.low_stock,
      ),

    recentSales,
  };
}