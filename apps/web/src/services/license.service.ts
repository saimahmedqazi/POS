import { getMachineFingerprint } from './machine.service';
import { saveLicense } from '../repositories/local-auth.repository';
import { getSetting } from '../repositories/settings.repository';
import { invokePosApi } from './api.service';

export async function activateLicense(licenseKey: string) {
  const machineId = await getMachineFingerprint();
  const localBusinessName = await getSetting('business_name');

  const result = await invokePosApi('activate-license', {
    businessName: localBusinessName || 'POS Client',
  }, licenseKey);

  // SAVE LOCAL CACHE
  await saveLicense({
    licenseKey,
    machineId,
    businessName: result.businessName || 'POS Client',
    expiresAt: result.expiresAt,
    lastValidatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    businessName: result.businessName,
    expiresAt: result.expiresAt,
  };
}