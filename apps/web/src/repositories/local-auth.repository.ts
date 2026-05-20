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

  console.log(
    'SETUP CHECK USERS:',
    users,
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

  console.log(
    'CREATING USER:',
    data,
  );

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

    const verify =
      await db.select(
        `
        SELECT *
        FROM app_users
        `,
      );

    console.log(
      'USERS AFTER INSERT:',
      verify,
    );
  } catch (error) {
    console.error(
      'CREATE USER FAILED:',
      error,
    );

    throw error;
  }
}

export async function loginLocalUser(
  pin: string,
) {
  const db =
    getDatabase();

  console.log(
    'LOGIN ATTEMPT PIN:',
    pin,
  );

  const allUsers =
    await db.select(
      `
      SELECT *
      FROM app_users
      `,
    );

  console.log(
    'ALL USERS:',
    allUsers,
  );

  const matched =
    (allUsers as any[]).find(
      (u) =>
        String(
          u.pin,
        ).trim() ===
        String(pin).trim(),
    );

  console.log(
    'MATCHED USER:',
    matched,
  );

  return matched;
}
export async function saveLicense(
  licenseKey: string,
  businessName: string,
  machineId: string,
) {
  const db =
    getDatabase();

  // 30 DAYS LICENSE
  const expiresAt =
    new Date(
      Date.now() +
        30 *
          24 *
          60 *
          60 *
          1000,
    ).toISOString();

  await db.execute(
    `
    INSERT INTO licenses (
      id,
      license_key,
      machine_id,
      activated,
      business_name,
      expires_at,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),

      licenseKey,

      machineId,

      1,

      businessName,

      expiresAt,

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
      WHERE activated = 1
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
      WHERE activated = 1
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
      WHERE activated = 1
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