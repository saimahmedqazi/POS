
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
import { useTheme } from '../../context/theme-context';
import Badge from '../../components/ui/badge';
import { check } from '@tauri-apps/plugin-updater';



export default function SettingsPage() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      setUpdateStatus('Checking for updates...');
      const update = await check();
      if (update) {
        setUpdateStatus(`Version ${update.version} available!`);
        // await update.downloadAndInstall();
      } else {
        setUpdateStatus('You are on the latest version.');
      }
    } catch (e: any) {
      console.error(e);
      setUpdateStatus('Update check failed (Is Updater configured?).');
    } finally {
      setIsCheckingUpdate(false);
    }
  };



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
          subtitle="Appearance, Backup and Restore"
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
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
              <div className="flex flex-wrap gap-3">
                {['light', 'dark', 'system'].map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? 'primary' : 'secondary'}
                    onClick={() => setTheme(t as any)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Accent Color</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'indigo', name: 'Indigo', color: 'bg-indigo-500' },
                  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
                  { id: 'violet', name: 'Violet', color: 'bg-violet-500' },
                  { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAccent(a.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      accent === a.id ? 'border-primary ring-2 ring-primary/20 bg-surface-hover' : 'border-border bg-surface hover:bg-surface-hover'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${a.color}`} />
                    <span className="font-medium text-sm">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">System Updates</h2>
              <p className="text-sm text-muted-foreground mt-1">Check for the latest version of POS ERP.</p>
            </div>
            {updateStatus && (
              <Badge variant={updateStatus.includes('failed') ? 'danger' : 'neutral'}>
                {updateStatus}
              </Badge>
            )}
          </div>
          <Button onClick={handleCheckUpdate} disabled={isCheckingUpdate}>
            {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Cloud Backup</h2>
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