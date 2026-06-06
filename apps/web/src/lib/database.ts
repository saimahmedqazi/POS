import Database from '@tauri-apps/plugin-sql';

export let db: Database;

let initialized =
  false;

export async function initDatabase() {
  // PREVENT DUPLICATE INIT
  if (
    initialized &&
    db
  ) {
    return db;
  }

  db =
    await Database.load(
      'sqlite:pos.db',
    );

  // SQLITE PERFORMANCE
  await db.execute(`
    PRAGMA journal_mode = WAL
  `);

  await db.execute(`
    PRAGMA busy_timeout = 5000
  `);

  await db.execute(`
    PRAGMA synchronous = NORMAL
  `);

  await db.execute(`
    PRAGMA temp_store = MEMORY
  `);

  // PRODUCTS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      barcode TEXT,
      sku TEXT,
      sale_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    ALTER TABLE products
    ADD COLUMN quantity REAL NOT NULL DEFAULT 0
  `).catch(() => {});

  // CUSTOMERS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      current_balance REAL NOT NULL DEFAULT 0
    )
  `);

  await db.execute(`
    ALTER TABLE customers
    ADD COLUMN mobile_enabled INTEGER NOT NULL DEFAULT 0
  `).catch(() => {});

  await db.execute(`
    ALTER TABLE customers
    ADD COLUMN mobile_sync_id TEXT
  `).catch(() => {});

  // SALES
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      total_amount REAL NOT NULL,
      discount REAL NOT NULL,
      final_amount REAL NOT NULL,
      payment_status TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // SALE ITEMS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL
    )
  `);

  await db.execute(`
    ALTER TABLE sale_items
    ADD COLUMN product_name TEXT
  `).catch(() => {});

  // SYNC QUEUE
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // INVENTORY TRANSACTIONS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,

      product_id TEXT NOT NULL,

      type TEXT NOT NULL,

      quantity_change REAL NOT NULL,

      previous_quantity REAL NOT NULL,

      new_quantity REAL NOT NULL,

      reference_id TEXT,

      notes TEXT,

      created_at TEXT NOT NULL
    )
  `);

  // APP USERS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pin TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // LICENSES
  await db.execute(`
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,

      license_key TEXT NOT NULL,

      machine_id TEXT NOT NULL,

      business_name TEXT NOT NULL,

      expires_at TEXT NOT NULL,

      last_validated_at TEXT,

      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    ALTER TABLE licenses
    ADD COLUMN last_validated_at TEXT
  `).catch(() => {});

  await db.execute(`
    ALTER TABLE licenses
    DROP COLUMN activated
  `).catch(() => {});

  // LEDGER ENTRIES
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // APP SETTINGS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // INDEXES


  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_products_sku
    ON products(sku)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_products_barcode
    ON products(barcode)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_sales_created_at
    ON sales(created_at)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_sales_customer_id
    ON sales(customer_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id
    ON sale_items(sale_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_sale_items_product_id
    ON sale_items(product_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id
    ON inventory_transactions(product_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at
    ON inventory_transactions(created_at)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_ledger_customer_id
    ON ledger_entries(customer_id)
  `);

  initialized =
    true;

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error(
      'Database not initialized',
    );
  }

  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();

    initialized =
      false;
  }
}