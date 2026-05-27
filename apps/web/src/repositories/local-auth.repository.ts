import {
  getDatabase,
} from '../lib/database';

export async function isSetupComplete() {
  const db =
    getDatabase();

  const users =
    await db.select(
      `
      SELECT *
      FROM app_users
      LIMIT 1
      `,
    );


  return (
    (users as any[])
      .length > 0
  );
}
export async function createLocalUser(
  data: {
    name: string;
    pin: string;
  },
) {
  const db =
    getDatabase();

  

  try {
    await db.execute(
      `
      INSERT INTO app_users (
        id,
        name,
        pin,
        role,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),

        data.name,

        data.pin,

        'OWNER',

        new Date().toISOString(),
      ],
    );

  
  } catch (error) {
    
    ;

    throw error;
  }
}

export async function loginLocalUser(
  pin: string,
) {
  const db =
    getDatabase();



  const allUsers =
    await db.select(
      `
      SELECT *
      FROM app_users
      `,
    );



  const matched =
    (allUsers as any[]).find(
      (u) =>
        String(
          u.pin,
        ).trim() ===
        String(pin).trim(),
    );


  return matched;
}
export async function saveLicense(
  data: {
    licenseKey: string;

    businessName: string;

    machineId: string;

    expiresAt: string;

    lastValidatedAt?: string;
  },
) {
  const db =
    getDatabase();

  // CLEAR OLD LICENSE CACHE
  await db.execute(`
    DELETE FROM licenses
  `);

  await db.execute(
    `
    INSERT INTO licenses (
      id,
      license_key,
      machine_id,
      business_name,
      expires_at,
      last_validated_at,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),

      data.licenseKey,

      data.machineId,

      data.businessName,

      data.expiresAt,

      data.lastValidatedAt ||
        new Date().toISOString(),

      new Date().toISOString(),
    ],
  );
}
export async function hasLicense() {
  const db =
    getDatabase();

  const licenses =
    await db.select(
      `
      SELECT COUNT(*) as count
      FROM licenses
      `,
    );

  return (
    Number(
      (licenses as any[])[0]
        ?.count || 0,
    ) > 0
  );
}

import {
  getMachineFingerprint,
} from '../services/machine.service';

export async function verifyMachineLicense() {
  const db =
    getDatabase();

  const licenses =
    await db.select(
      `
      SELECT *
      FROM licenses
      LIMIT 1
      `,
    );

  const license =
    (licenses as any[])[0];

  if (!license) {
    return false;
  }

  const currentMachineId =
    await getMachineFingerprint();

  return (
    license.machine_id ===
    currentMachineId
  );
}

export async function getUserById(
  id: string,
) {
  const db =
    getDatabase();

  const users =
    await db.select(
      `
      SELECT *
      FROM app_users
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

  return (users as any[])[0];
}

export async function isLicenseExpired() {
  const db =
    getDatabase();

  const licenses =
    await db.select(
      `
      SELECT *
      FROM licenses
      LIMIT 1
      `,
    );

  const license =
    (licenses as any[])[0];

  if (!license) {
    return true;
  }

  if (
    !license.expires_at
  ) {
    return true;
  }

  return (
    new Date(
      license.expires_at,
    ).getTime() <
    Date.now()
  );
}

export async function getLocalLicense() {
  const db =
    getDatabase();

  const licenses =
    await db.select(
      `
      SELECT *
      FROM licenses
      LIMIT 1
      `,
    );

  return (licenses as any[])[0];
}

export async function isLocalLicenseExpired() {
  const license =
    await getLocalLicense();

  if (!license) {
    return true;
  }

  if (
    !license.expires_at
  ) {
    return true;
  }

  return (
    new Date(
      license.expires_at,
    ).getTime() <
    Date.now()
  );
}