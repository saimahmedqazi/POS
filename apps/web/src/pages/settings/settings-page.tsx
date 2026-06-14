
import {
  useEffect,
  useState,
} from 'react';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';


import PageHeader from '../../components/ui/page-header';

import Toast from '../../components/ui/toast';

import Modal from '../../components/ui/modal';


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
        setUpdateStatus(`Version ${update.version} available! Installing...`);
        await update.downloadAndInstall();
        setUpdateStatus(`Update installed. Please restart the app.`);
      } else {
        setUpdateStatus('You are on the latest version.');
      }
    } catch (e: any) {
      const errStr = e?.toString() || '';
      console.error("Updater error:", e);
      setUpdateStatus(`Update check failed: ${errStr}`);
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

  const [
    restoreConfirmOpen,
    setRestoreConfirmOpen,
  ] = useState(false);
  
  const [
    pendingRestoreId,
    setPendingRestoreId,
  ] = useState<string | null>(null);

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

      setErrorMessage(
        'Failed loading backups',
      );
    } finally {
      setLoadingBackups(
        false,
      );
    }
  }










  async function executeCloudRestore() {
    if (!pendingRestoreId) return;
    try {
      setRestoringBackupId(
        pendingRestoreId,
      );

      const backupData =
        await getCloudBackupById(
          pendingRestoreId,
        );

      await restoreCloudBackup(
        backupData,
      );

      setSuccessMessage(
        'Restore completed successfully. Reloading application...',
      );

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(
        error,
      );

      setErrorMessage(
        'Restore failed',
      );
    } finally {
      setRestoringBackupId(
        null,
      );
      setRestoreConfirmOpen(false);
      setPendingRestoreId(null);
    }
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <PageHeader
            title="Settings"
            subtitle="Appearance, Backup and Restore"
          />
        </div>

        <Modal
          open={restoreConfirmOpen}
          onClose={() => {
            setRestoreConfirmOpen(false);
            setPendingRestoreId(null);
          }}
          title="Restore Cloud Backup"
        >
          <div className="p-6">
            <p className="text-muted-foreground mb-6">
              ⚠️ This will permanently replace ALL local data with the selected cloud backup. A safety backup will be created first. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRestoreConfirmOpen(false);
                  setPendingRestoreId(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeCloudRestore}
                disabled={restoringBackupId !== null}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {restoringBackupId ? 'Restoring...' : 'Yes, Restore'}
              </button>
            </div>
          </div>
        </Modal>

        <Toast message={errorMessage} variant="error" onClose={() => setErrorMessage('')} />
        <Toast message={successMessage} variant="success" onClose={() => setSuccessMessage('')} />

        <div className="flex-1 overflow-y-auto pb-6 space-y-6 min-h-0">

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

                  setErrorMessage(
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
                : 'Refresh List'}
            </Button>

          </div>
          {cloudBackups.length >
            0 && (
              <div className="mt-4 rounded-2xl border border-border">
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
                        onClick={() => {
                          setPendingRestoreId(backup.id);
                          setRestoreConfirmOpen(true);
                        }}
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
      </div>


    </AppLayout>
  );
}