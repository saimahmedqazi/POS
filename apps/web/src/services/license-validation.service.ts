import {
  supabaseAdmin,
} from './supabase-admin.service';

import {
  getMachineFingerprint,
} from './machine.service';

import {
  getLocalLicense,
  saveLicense,
} from '../repositories/local-auth.repository';

const OFFLINE_GRACE_DAYS =
  7;

export async function validateLicenseOnline() {
  const localLicense =
    await getLocalLicense();

  if (!localLicense) {
    throw new Error(
      'No local license',
    );
  }

  const machineId =
    await getMachineFingerprint();

  const {
    data: license,
    error,
  } = await supabaseAdmin
    .from('licenses')
    .select('*')
    .eq(
      'license_key',
      localLicense.license_key,
    )
    .single();

  if (error || !license) {
    throw new Error(
      'License not found',
    );
  }

  // STATUS
  if (
    !license.active
  ) {
    throw new Error(
      'License disabled',
    );
  }

  // MACHINE
  if (
    license.machine_id !==
    machineId
  ) {
    throw new Error(
      'Machine mismatch',
    );
  }

  // EXPIRY
  if (
    !license.expires_at
  ) {
    throw new Error(
      'License expiry missing',
    );
  }

  const expiresAt =
    new Date(
      license.expires_at,
    );

  if (
    expiresAt.getTime() <
    Date.now()
  ) {
    throw new Error(
      'License expired',
    );
  }

  // UPDATE CLOUD
  await supabaseAdmin
    .from('licenses')
    .update({
      last_validated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      license.id,
    );

  // UPDATE LOCAL CACHE
  await saveLicense({
    licenseKey:
      license.license_key,

    machineId,

    businessName:
      license.business_name ||
      'POS Client',

    expiresAt:
      license.expires_at,

    lastValidatedAt:
      new Date().toISOString(),
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