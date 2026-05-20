import {
  BaseDirectory,
  mkdir,
  exists,
  copyFile,
  readDir,
  remove,
} from '@tauri-apps/plugin-fs';

import {
  open,
  save,
} from '@tauri-apps/plugin-dialog';
import {
  getDatabase,
} from '../lib/database';
import {
  appDataDir,
} from '@tauri-apps/api/path';

const DB_NAME =
  'pos.db';

const BACKUP_DIR =
  'backups';
export async function createBackup() {
  const db =
    getDatabase();

  const backupExists =
    await exists(
      BACKUP_DIR,
      {
        baseDir:
          BaseDirectory.AppData,
      },
    );

  if (!backupExists) {
    await mkdir(
      BACKUP_DIR,
      {
        recursive: true,
        baseDir:
          BaseDirectory.AppData,
      },
    );
  }

  const timestamp =
    new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);

  const appDir =
    await appDataDir();

  const backupPath =
    `${appDir}\\backups\\backup-${timestamp}.db`;

  // SQLITE-CREATED SNAPSHOT
  await db.execute(
    `VACUUM INTO '${backupPath.replace(
      /\\/g,
      '\\\\',
    )}'`,
  );

  return backupPath;
}

export async function getBackups() {
  const backupExists =
    await exists(
      BACKUP_DIR,
      {
        baseDir:
          BaseDirectory.AppData,
      },
    );

  if (!backupExists) {
    return [];
  }

  return await readDir(
    BACKUP_DIR,
    {
      baseDir:
        BaseDirectory.AppData,
    },
  );
}

export async function deleteBackup(
  path: string,
) {
  await remove(path, {
    baseDir:
      BaseDirectory.AppData,
  });
}

export async function exportDatabase() {
  const exportPath =
    await save({
      defaultPath:
        `pos-export-${Date.now()}.db`,
    });

  if (
    !exportPath ||
    typeof exportPath !==
      'string'
  ) {
    return null;
  }

  await copyFile(
    DB_NAME,
    exportPath,
    {
      fromPathBaseDir:
        BaseDirectory.AppData,
    },
  );

  return exportPath;
}

export async function importDatabase() {
  const selected =
    await open({
      multiple: false,
      filters: [
        {
          name: 'Database',
          extensions: ['db'],
        },
      ],
    });

  if (
    !selected ||
    typeof selected !==
      'string'
  ) {
    return null;
  }

  await copyFile(
    selected,
    DB_NAME,
    {
      toPathBaseDir:
        BaseDirectory.AppData,
    },
  );

  return true;
}