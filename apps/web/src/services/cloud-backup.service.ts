import {
  getDatabase,
} from '../lib/database';

import {
  supabaseAdmin,
} from './supabase-admin.service';

import {
  getLocalLicense,
} from '../repositories/local-auth.repository';

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

  createdAt:
    new Date().toISOString(),

  businessName:
    license.business_name ??
    'POS Business',

  products,
  customers,
  sales,
  saleItems,
  ledgerEntries,
  inventoryTransactions,
  appSettings,
};

  const backupJson =
    JSON.stringify(
      backupData,
    );

  const {
    error,
  } = await supabaseAdmin
    .from(
      'cloud_backups',
    )
    .insert({
      license_key:
        license.license_key,

      backup_version:
        Date.now(),

      backup_size:
        backupJson.length,

      backup_data:
        backupData,
    });

  if (error) {
    throw error;
  }

  // KEEP ONLY LATEST 30
  const {
    data: backups,
  } = await supabaseAdmin
    .from(
      'cloud_backups',
    )
    .select(
      'id',
    )
    .eq(
      'license_key',
      license.license_key,
    )
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (
    backups &&
    backups.length > 30
  ) {
    const idsToDelete =
      backups
        .slice(30)
        .map(
          (
            backup,
          ) =>
            backup.id,
        );

    await supabaseAdmin
      .from(
        'cloud_backups',
      )
      .delete()
      .in(
        'id',
        idsToDelete,
      );
  }

  return true;
}