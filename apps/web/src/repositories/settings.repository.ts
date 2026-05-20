import {
  getDatabase,
} from '../lib/database';

export async function setSetting(
  key: string,
  value: string,
) {
  const db =
    getDatabase();

  await db.execute(
    `
    INSERT OR REPLACE INTO app_settings (
      key,
      value
    )
    VALUES (?, ?)
    `,
    [key, value],
  );
}

export async function getSetting(
  key: string,
) {
  const db =
    getDatabase();

  const rows =
    await db.select(
      `
      SELECT value
      FROM app_settings
      WHERE key = ?
      LIMIT 1
      `,
      [key],
    );

  return (
    rows as any[]
  )[0]?.value;
}