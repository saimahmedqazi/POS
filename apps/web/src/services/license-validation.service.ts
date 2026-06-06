import { getMachineFingerprint } from './machine.service';
import { getLocalLicense, saveLicense } from '../repositories/local-auth.repository';
import { invokePosApi } from './api.service';

const OFFLINE_GRACE_DAYS = 7;

export async function validateLicenseOnline() {
  const localLicense = await getLocalLicense();

  if (!localLicense) {
    throw new Error('No local license');
  }

  const machineId = await getMachineFingerprint();

  await invokePosApi('validate-license', {}, localLicense.license_key);

  // UPDATE LOCAL CACHE
  await saveLicense({
    licenseKey: localLicense.license_key,
    machineId,
    businessName: localLicense.business_name || 'POS Client',
    expiresAt: localLicense.expires_at,
    lastValidatedAt: new Date().toISOString(),
  });

  return true;
}

export async function canRunOffline() {
  const localLicense =
    await getLocalLicense();

  if (!localLicense) {
    return false;
  }

  if (
    !localLicense.last_validated_at
  ) {
    return false;
  }

  const lastValidated =
    new Date(
      localLicense.last_validated_at,
    ).getTime();

  const diffDays =
    (
      Date.now() -
      lastValidated
    ) /
    (1000 *
      60 *
      60 *
      24);

  return (
    diffDays <=
    OFFLINE_GRACE_DAYS
  );
}