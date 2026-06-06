import {
  supabaseAdmin,
} from './supabase-admin.service';

import {
  getMachineFingerprint,
} from './machine.service';

import {
  saveLicense,
} from '../repositories/local-auth.repository';

import {
  getSetting,
} from '../repositories/settings.repository';

export async function activateLicense(
  licenseKey: string,
) {
  const machineId =
    await getMachineFingerprint();

  // FIND LICENSE
  const {
    data: license,
    error,
  } = await supabaseAdmin
    .from('licenses')
    .select('*')
    .eq(
      'license_key',
      licenseKey,
    )
    .single();

  if (error || !license) {
    throw new Error(
      'Invalid license key',
    );
  }

  // STATUS CHECK
  if (
    !license.active
  ) {
    throw new Error(
      'License is disabled',
    );
  }

  if (
    license.status !==
    'ACTIVE'
  ) {
    throw new Error(
      'License inactive',
    );
  }

  // EXPIRY CHECK
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

  // MACHINE CHECK
  if (
    license.machine_id &&
    license.machine_id !==
      machineId
  ) {
    throw new Error(
      'License already activated on another device',
    );
  }

  const localBusinessName = await getSetting('business_name');
  const finalBusinessName = license.business_name || localBusinessName || 'POS Client';

  // ACTIVATE / VALIDATE
  const {
    error:
      updateError,
  } = await supabaseAdmin
    .from('licenses')
    .update({
      machine_id:
        machineId,

      business_name:
        finalBusinessName,

      activated_at:
        new Date().toISOString(),

      last_validated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      license.id,
    );

  if (updateError) {
    throw updateError;
  }

  // SAVE LOCAL CACHE
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

  return {
    success: true,

    businessName:
      license.business_name,

    expiresAt:
      license.expires_at,
  };
}