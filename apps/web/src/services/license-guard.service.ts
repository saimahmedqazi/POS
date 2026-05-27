import {
  getLocalLicense,
  isLocalLicenseExpired,
  verifyMachineLicense,
} from '../repositories/local-auth.repository';

import {
  validateLicenseOnline,
  canRunOffline,
} from './license-validation.service';

export async function checkLicenseStatus() {
  const license =
    await getLocalLicense();

  // NO LICENSE
  if (!license) {
    return {
      valid: false,

      reason:
        'NO_LICENSE',
    };
  }

  // MACHINE CHECK
  const validMachine =
    await verifyMachineLicense();

  if (!validMachine) {
    return {
      valid: false,

      reason:
        'INVALID_MACHINE',
    };
  }

  // LOCAL EXPIRY
  const expired =
    await isLocalLicenseExpired();

  if (expired) {
    return {
      valid: false,

      reason:
        'EXPIRED',
    };
  }

  // ONLINE VALIDATION
  try {
    await validateLicenseOnline();
  } catch (
    error
  ) {

    const offlineAllowed =
      await canRunOffline();

    if (
      !offlineAllowed
    ) {
      return {
        valid: false,

        reason:
          'LICENSE_INVALID',
      };
    }
  }

  return {
    valid: true,

    license,
  };
}