import {
  getDatabase,
} from '../lib/database';

import {
  getLocalLicense,
} from '../repositories/local-auth.repository';
import { invokePosApi } from './api.service';

export async function createCloudBackup() {
  const db =
    getDatabase();

  const license =
    await getLocalLicense();

  if (
    !license?.license_key
  ) {
    throw new Error(
      'No active license found',
    );
  }

  const [
    products,
    customers,
    sales,
    saleItems,
    ledgerEntries,
    inventoryTransactions,
    appSettings,
  ] = await Promise.all([
    db.select(
      'SELECT * FROM products',
    ),

    db.select(
      'SELECT * FROM customers',
    ),

    db.select(
      'SELECT * FROM sales',
    ),

    db.select(
      'SELECT * FROM sale_items',
    ),

    db.select(
      'SELECT * FROM ledger_entries',
    ),

    db.select(
      'SELECT * FROM inventory_transactions',
    ),

    db.select(
      'SELECT * FROM app_settings',
    ),
  ]);

  const backupData = {
    version: 1,
    createdAt: new Date().toISOString(),
    businessName: license.business_name ?? 'POS Business',
    products,
    customers,
    sales,
    saleItems,
    ledgerEntries,
    inventoryTransactions,
    appSettings,
  };

  await invokePosApi('create-cloud-backup', { backupData }, license.license_key);

  return true;
}