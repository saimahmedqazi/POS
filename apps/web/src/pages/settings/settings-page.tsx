import {
  useEffect,
  useState,
} from 'react';

import {
  appDataDir,
} from '@tauri-apps/api/path';

import {
  invoke,
} from '@tauri-apps/api/core';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Modal from '../../components/ui/modal';

import PageHeader from '../../components/ui/page-header';

import {
  createBackup,
  getBackups,
  deleteBackup,
  exportDatabase,
  importDatabase,
} from '../../services/backup.service';

type BackupFile = {
  name: string;

  path: string;
};

export default function SettingsPage() {
  const [
    backups,
    setBackups,
  ] = useState<
    BackupFile[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<BackupFile | null>(
    null,
  );

  const [
    restoreTarget,
    setRestoreTarget,
  ] = useState<BackupFile | null>(
    null,
  );

  const [
    importConfirmOpen,
    setImportConfirmOpen,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const loadBackups =
    async () => {
      try {
        const files =
          await getBackups();

        const appDir =
          await appDataDir();

        const backupDir =
          `${appDir}/backups`;

        const mapped =
          (
            files as any[]
          )
            .filter(
              (
                file,
              ) =>
                file.name,
            )
            .map(
              (
                file,
              ) => ({
                name:
                  file.name,

                path:
                  `${backupDir}/${file.name}`,
              }),
            );

        setBackups(
          mapped,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Failed loading backups',
        );
      }
    };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleBackup =
    async () => {
      try {
        setLoading(true);

        await createBackup();

        await loadBackups();

        setSuccessMessage(
          'Backup created successfully',
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Backup failed',
        );
      } finally {
        setLoading(false);
      }
    };

  const confirmDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setActionLoading(
          true,
        );

        await deleteBackup(
          deleteTarget.path,
        );

        await loadBackups();

        setSuccessMessage(
          'Backup deleted successfully',
        );

        setDeleteTarget(
          null,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Delete failed',
        );
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  const confirmRestore =
    async () => {
      if (
        !restoreTarget
      ) {
        return;
      }

      try {
        setActionLoading(
          true,
        );

        await invoke(
          'restore_database',
          {
            backupPath:
              restoreTarget.path,
          },
        );

        setSuccessMessage(
          'Backup restored successfully. Please reopen the app.',
        );

        setRestoreTarget(
          null,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Restore failed',
        );
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  const handleExport =
    async () => {
      try {
        setLoading(true);

        const exported =
          await exportDatabase();

        if (!exported) {
          return;
        }

        setSuccessMessage(
          'Database exported successfully',
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Export failed',
        );
      } finally {
        setLoading(false);
      }
    };

  const confirmImport =
    async () => {
      try {
        setActionLoading(
          true,
        );

        const imported =
          await importDatabase();

        if (!imported) {
          return;
        }

        setSuccessMessage(
          'Database imported successfully. Please restart the app.',
        );

        setImportConfirmOpen(
          false,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Import failed',
        );
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          subtitle="Backups and database tools"
        />

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div className="flex items-center justify-between">
              <span>
                {errorMessage}
              </span>

              <button
                onClick={() =>
                  setErrorMessage(
                    '',
                  )
                }
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <div className="flex items-center justify-between">
              <span>
                {
                  successMessage
                }
              </span>

              <button
                onClick={() =>
                  setSuccessMessage(
                    '',
                  )
                }
                className="text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <Card>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={
                handleBackup
              }
              disabled={
                loading
              }
            >
              {loading
                ? 'Creating...'
                : 'Create Backup'}
            </Button>

            <Button
              variant="secondary"
              onClick={
                handleExport
              }
              disabled={
                loading
              }
            >
              Export Database
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                setImportConfirmOpen(
                  true,
                )
              }
              disabled={
                loading
              }
            >
              Import Database
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Existing Backups
          </h2>

          <div className="space-y-3">
            {backups.map(
              (
                backup,
              ) => (
                <div
                  key={
                    backup.path
                  }
                  className="flex items-center justify-between border rounded-2xl p-4"
                >
                  <div>
                    <p className="font-medium">
                      {
                        backup.name
                      }
                    </p>

                    <p className="text-sm text-slate-500 break-all">
                      {
                        backup.path
                      }
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setRestoreTarget(
                          backup,
                        )
                      }
                    >
                      Restore
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() =>
                        setDeleteTarget(
                          backup,
                        )
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ),
            )}

            {backups.length ===
              0 && (
              <div className="text-slate-500">
                No backups found
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* DELETE MODAL */}
      <Modal
        open={!!deleteTarget}
        title="Delete Backup"
        onClose={() =>
          setDeleteTarget(
            null,
          )
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700 mb-2">
              Confirm Delete
            </p>

            <p className="text-sm text-slate-700 break-all">
              {
                deleteTarget?.name
              }
            </p>
          </div>

          <p className="text-sm text-slate-500">
            This backup will be permanently deleted.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteTarget(
                  null,
                )
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              disabled={
                actionLoading
              }
              onClick={
                confirmDelete
              }
            >
              {actionLoading
                ? 'Deleting...'
                : 'Delete Backup'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* RESTORE MODAL */}
      <Modal
        open={!!restoreTarget}
        title="Restore Backup"
        onClose={() =>
          setRestoreTarget(
            null,
          )
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-yellow-700 mb-2">
              Restore Confirmation
            </p>

            <p className="text-sm text-slate-700 break-all">
              {
                restoreTarget?.name
              }
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Current database will be replaced with this backup.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setRestoreTarget(
                  null,
                )
              }
            >
              Cancel
            </Button>

            <Button
              disabled={
                actionLoading
              }
              onClick={
                confirmRestore
              }
            >
              {actionLoading
                ? 'Restoring...'
                : 'Restore Backup'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal
        open={
          importConfirmOpen
        }
        title="Import Database"
        onClose={() =>
          setImportConfirmOpen(
            false,
          )
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700 mb-2">
              Dangerous Action
            </p>

            <p className="text-sm text-slate-700">
              Importing a database will replace the current database entirely.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setImportConfirmOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              disabled={
                actionLoading
              }
              onClick={
                confirmImport
              }
            >
              {actionLoading
                ? 'Importing...'
                : 'Import Database'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}