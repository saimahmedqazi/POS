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

  

console.log(
  'ACTIVE SQLITE DB:',
  'sqlite:pos.db',
);

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
      machine_id TEXT,
      activated INTEGER NOT NULL DEFAULT 0,
      business_name TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL
    )
  `);

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

  initialized =
    true;

  console.log(
    'SQLite database initialized',
  );

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