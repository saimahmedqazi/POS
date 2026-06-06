import { useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export default function UpdaterManager() {
  const [updateAvailable, setUpdateAvailable] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          setUpdateAvailable(update);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }

    // Delay the check slightly so it doesn't block startup rendering
    const timer = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timer);
  }, []);

  async function handleUpdate() {
    if (!updateAvailable) return;
    try {
      setDownloading(true);
      await updateAvailable.downloadAndInstall();
      await relaunch();
    } catch (error) {
      console.error('Failed to install update:', error);
      setDownloading(false);
    }
  }

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-surface border border-accent/30 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div>
        <h3 className="font-bold text-foreground">Update Available</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Version {updateAvailable.version} is ready to install.
        </p>
      </div>

      <button
        onClick={handleUpdate}
        disabled={downloading}
        className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
      >
        {downloading ? 'Installing...' : 'Restart to Update'}
      </button>
      
      <button
        onClick={() => setUpdateAvailable(null)}
        disabled={downloading}
        className="px-3 py-2 rounded-xl border border-border text-foreground text-sm hover:bg-surface-hover transition disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
