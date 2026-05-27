import {
  isSetupComplete,
} from '../repositories/local-auth.repository';

import {
  getCurrentSession,
} from '../repositories/session.repository';

import {
  checkLicenseStatus,
} from './license-guard.service';

export type BootstrapStatus =
  | 'SETUP_REQUIRED'
  | 'LICENSE_REQUIRED'
  | 'LICENSE_INVALID'
  | 'LICENSE_EXPIRED'
  | 'LOGIN_REQUIRED'
  | 'READY';

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

  // SESSION CHECK
  const session =
    await getCurrentSession();

  if (!session) {
    return 'LOGIN_REQUIRED';
  }

  return 'READY';
}