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

  // TODAY SALES & COST
  const salesResult =
    await db.select(
      `
      SELECT
        COUNT(id) as total_sales,
        COALESCE(SUM(final_amount), 0) as revenue,
        (
          SELECT COALESCE(SUM(si.quantity * p.cost_price), 0)
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          LEFT JOIN products p ON si.product_id = p.id
          WHERE DATE(s.created_at, 'localtime') = DATE('now', 'localtime')
        ) as total_cost
      FROM sales
      WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime')
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

  // WEEKLY SALES (Last 7 Days)
  const weeklySales =
    await db.select(
      `
      SELECT
        DATE(created_at, 'localtime') as date,
        COALESCE(SUM(final_amount), 0) as revenue
      FROM sales
      WHERE DATE(created_at, 'localtime') >= date('now', 'localtime', '-7 days')
      GROUP BY DATE(created_at, 'localtime')
      ORDER BY date ASC
      `
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

    todayCost:
      safeNumber(
        (salesResult as any[])[0]
          ?.total_cost,
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
    weeklySales,
  };
}