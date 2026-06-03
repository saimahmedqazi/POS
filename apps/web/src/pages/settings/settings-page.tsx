
import {
  useEffect,
  useState,
} from 'react';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';


import PageHeader from '../../components/ui/page-header';


import {
  createCloudBackup,
} from '../../services/cloud-backup.service';
import {
  getCloudBackups,
} from '../../services/cloud-restore.service';
import {
  getCloudBackupById,
  restoreCloudBackup,
} from '../../services/cloud-restore.service';



export default function SettingsPage() {



  useEffect(() => {
    handleLoadBackups();
  }, []);
  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');





  const [
    cloudBackups,
    setCloudBackups,
  ] = useState<any[]>([]);

  const [
    loadingBackups,
    setLoadingBackups,
  ] = useState(false);
  const [
    restoringBackupId,
    setRestoringBackupId,
  ] = useState<
    string | null
  >(null);

  async function handleLoadBackups() {
    try {
      setLoadingBackups(true);

      const backups =
        await getCloudBackups();

      setCloudBackups(
        backups,
      );
    } catch (
    error
    ) {
      console.error(
        error,
      );

      alert(
        'Failed loading backups',
      );
    } finally {
      setLoadingBackups(
        false,
      );
    }
  }










  async function handleCloudRestore(
    backupId: string,
  ) {
    const confirmed =
      confirm(
        'This will replace ALL local data. Continue?',
      );

    if (!confirmed) {
      return;
    }

    try {
      setRestoringBackupId(
        backupId,
      );

      const backupData =
        await getCloudBackupById(
          backupId,
        );

      await restoreCloudBackup(
        backupData,
      );

      alert(
        'Restore completed successfully. Please restart the application.',
      );
    } catch (error) {
      console.error(
        error,
      );

      alert(
        'Restore failed',
      );
    } finally {
      setRestoringBackupId(
        null,
      );
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          subtitle="Cloud backup and restore"
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
              onClick={async () => {
                try {
                  await createCloudBackup();
                  await handleLoadBackups();

                  setSuccessMessage(
                    'Cloud backup created successfully',
                  );
                } catch (
                error
                ) {
                  console.error(
                    error,
                  );

                  setSuccessMessage(
                    'Backup failed',
                  );
                }
              }}
            >
              Backup Now
            </Button>
            <Button
              variant="secondary"
              disabled={
                loadingBackups
              }
              onClick={
                handleLoadBackups
              }
            >
              {loadingBackups
                ? 'Loading...'
                : 'Restore Backup'}
            </Button>

          </div>
          {cloudBackups.length >
            0 && (
              <div className="mt-4 rounded-2xl border border-slate-200">
                {cloudBackups.map(
                  (
                    backup,
                  ) => (
                    <div
                      key={
                        backup.id
                      }
                      className="flex items-center justify-between p-4 border-b"
                    >
                      <div>
                        <div className="font-medium">
                          {new Date(
                            backup.created_at,
                          ).toLocaleString()}
                        </div>

                        <div className="text-xs text-slate-500">
                          Size:{' '}
                          {
                            backup.backup_size
                          }{' '}
                          bytes
                        </div>
                      </div>

                      <Button
                        variant="danger"
                        disabled={
                          restoringBackupId ===
                          backup.id
                        }
                        onClick={() =>
                          handleCloudRestore(
                            backup.id,
                          )
                        }
                      >
                        {restoringBackupId ===
                          backup.id
                          ? 'Restoring...'
                          : 'Restore'}
                      </Button>
                    </div>
                  ),
                )}
              </div>
            )}
        </Card>


      </div>


    </AppLayout>
  );
}