import {
  isSetupComplete,
  hasLicense,
  isLicenseExpired,
  verifyMachineLicense,
} from '../repositories/local-auth.repository';

import {
  getCurrentSession,
} from '../repositories/session.repository';

export type BootstrapStatus =
  | 'SETUP_REQUIRED'
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
  const licensed =
    await hasLicense();

  if (!licensed) {
    return 'LICENSE_INVALID';
  }
  // EXPIRY CHECK
const expired =
  await isLicenseExpired();

if (expired) {
  return 'LICENSE_EXPIRED';
}

  // MACHINE VALIDATION
  const machineValid =
    await verifyMachineLicense();

  if (!machineValid) {
    return 'LICENSE_INVALID';
  }

  // SESSION CHECK
  const session =
    await getCurrentSession();

  if (!session) {
    return 'LOGIN_REQUIRED';
  }

  return 'READY';
}