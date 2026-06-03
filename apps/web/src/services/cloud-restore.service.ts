import {
  getDatabase,
} from '../lib/database';

import {
  createCloudBackup,
} from './cloud-backup.service';

import {
  supabaseAdmin,
} from './supabase-admin.service';

import {
  getLocalLicense,
} from '../repositories/local-auth.repository';


export async function restoreCloudBackup(
  backupData: any,
) {
  const db =
    getDatabase();

  // SAFETY BACKUP FIRST
  await createCloudBackup();

 

  try {
    // CLEAR TABLES
    await db.execute(
      'DELETE FROM sale_items',
    );

    await db.execute(
      'DELETE FROM sales',
    );

    await db.execute(
      'DELETE FROM ledger_entries',
    );

    await db.execute(
      'DELETE FROM inventory_transactions',
    );

    await db.execute(
      'DELETE FROM customers',
    );

    await db.execute(
      'DELETE FROM products',
    );

    await db.execute(
      'DELETE FROM app_settings',
    );

    // RESTORE PRODUCTS
    for (const row of backupData.products || []) {
      await db.execute(
        `
        INSERT INTO products
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.name,
          row.barcode,
          row.sku,
          row.sale_price,
          row.cost_price,
          row.quantity,
          row.created_at,
        ],
      );
    }

    // RESTORE CUSTOMERS
   for (const row of backupData.customers || []) {
  await db.execute(
    `
    INSERT INTO customers (
      id,
      name,
      phone,
      current_balance,
      mobile_enabled,
      mobile_sync_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      row.id,
      row.name,
      row.phone ?? '',
      row.current_balance ?? 0,
      row.mobile_enabled ?? 0,
      row.mobile_sync_id ?? null,
    ],
  );
}

    // RESTORE SALES
    for (const row of backupData.sales || []) {
      await db.execute(
        `
        INSERT INTO sales
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.customer_id,
          row.total_amount,
          row.discount,
          row.final_amount,
          row.payment_status,
          row.synced,
          row.created_at,
        ],
      );
    }

    // RESTORE SALE ITEMS
    for (const row of backupData.saleItems || []) {
      await db.execute(
        `
        INSERT INTO sale_items
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.sale_id,
          row.product_id,
          row.quantity,
          row.unit_price,
          row.subtotal,
        ],
      );
    }

    // RESTORE LEDGER
    for (const row of backupData.ledgerEntries || []) {
      await db.execute(
        `
        INSERT INTO ledger_entries
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.customer_id,
          row.type,
          row.amount,
          row.reference_type,
          row.reference_id,
          row.created_at,
        ],
      );
    }

    // RESTORE INVENTORY
    for (const row of backupData.inventoryTransactions || []) {
      await db.execute(
        `
        INSERT INTO inventory_transactions
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.product_id,
          row.type,
          row.quantity_change,
          row.previous_quantity,
          row.new_quantity,
          row.reference_id,
          row.notes,
          row.created_at,
        ],
      );
    }

    // RESTORE SETTINGS
    for (const row of backupData.appSettings || []) {
      await db.execute(
        `
        INSERT INTO app_settings
        VALUES (?, ?)
        `,
        [
          row.key,
          row.value,
        ],
      );
    }

    

    return true;
} catch (error) {
  console.error(
    'RESTORE FAILED:',
    error,
  );

  throw error;
}
}
export async function getCloudBackups() {
  const license =
    await getLocalLicense();

  if (
    !license?.license_key
  ) {
    throw new Error(
      'No active license found',
    );
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      'cloud_backups',
    )
    .select(`
      id,
      backup_version,
      backup_size,
      created_at
    `)
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

  if (error) {
    throw error;
  }

  return data || [];
}
export async function getCloudBackupById(
  backupId: string,
) {
  const license =
    await getLocalLicense();

  if (
    !license?.license_key
  ) {
    throw new Error(
      'No active license found',
    );
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      'cloud_backups',
    )
    .select(
      'backup_data',
    )
    .eq(
      'id',
      backupId,
    )
    .eq(
      'license_key',
      license.license_key,
    )
    .single();

  if (error) {
    throw error;
  }

  return data.backup_data;
}