import {
  isSetupComplete,
} from '../repositories/local-auth.repository';

import {
  getCurrentSession,
} from '../repositories/session.repository';

import {
  getProducts,
} from '../repositories/product.repository';

import {
  checkLicenseStatus,
} from './license-guard.service';

import {
  syncProductsToCloud,
} from './product-sync.service';

import {
  createCloudBackup,
} from './cloud-backup.service';

import {
  getCloudBackups,
} from './cloud-restore.service';

export type BootstrapStatus =
  | 'SETUP_REQUIRED'
  | 'LICENSE_REQUIRED'
  | 'LICENSE_INVALID'
  | 'LICENSE_EXPIRED'
  | 'LOGIN_REQUIRED'
  | 'READY';


async function runAutoBackup() {
  try {
    const backups =
      await getCloudBackups();

    const latest =
      backups?.[0];

    const oneDay =
      24 *
      60 *
      60 *
      1000;

    const shouldBackup =
      !latest ||
      Date.now() -
        new Date(
          latest.created_at,
        ).getTime() >
        oneDay;

    if (
      shouldBackup
    ) {
      await createCloudBackup();

      console.log(
        'Auto cloud backup created',
      );
    }
  } catch (
    error
  ) {
    console.error(
      'Auto backup failed:',
      error,
    );
  }
}

export async function bootstrapApp(): Promise<BootstrapStatus> {
  // SETUP CHECK
  const setupComplete =
    await isSetupComplete();

  if (!setupComplete) {
    return 'SETUP_REQUIRED';
  }

  // LICENSE CHECK
  const licenseStatus =
    await checkLicenseStatus();

  if (
    !licenseStatus.valid
  ) {
    switch (
      licenseStatus.reason
    ) {
      case 'NO_LICENSE':
        return 'LICENSE_REQUIRED';

      case 'INVALID_MACHINE':
        return 'LICENSE_INVALID';

      case 'EXPIRED':
        return 'LICENSE_EXPIRED';

      default:
        return 'LICENSE_INVALID';
    }
  }
void runAutoBackup();
  // SESSION CHECK
  const session =
    await getCurrentSession();

  if (!session) {
    return 'LOGIN_REQUIRED';
  }

  // PRODUCT SYNC
  try {
    const products =
      await getProducts();

    await syncProductsToCloud(
      products as any[],
    );

   
  } catch (
    error
  ) {
    console.error(
      'Product sync failed:',
      error,
    );

    /**
     * Do NOT block startup.
     * POS must continue working offline.
     */
  }

  return 'READY';
}