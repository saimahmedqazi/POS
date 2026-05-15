import {
  useEffect,
  useState,
} from 'react';

import Badge from './ui/badge';

import {
  db,
} from '../utils/db';

export default function SyncStatus() {
  const [
    online,
    setOnline,
  ] = useState(
    navigator.onLine,
  );

  const [
    pendingCount,
    setPendingCount,
  ] = useState(0);

  const [
    syncing,
    setSyncing,
  ] = useState(false);

  useEffect(() => {
    const handleOnline =
      () => {
        setOnline(true);
      };

    const handleOffline =
      () => {
        setOnline(false);
      };

    window.addEventListener(
      'online',
      handleOnline,
    );

    window.addEventListener(
      'offline',
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline,
      );

      window.removeEventListener(
        'offline',
        handleOffline,
      );
    };
  }, []);

  useEffect(() => {
    const loadPending =
      async () => {
        try {
          const pendingSales =
            await db.offlineSales
              .filter(
                (sale) =>
                  !sale.serverSynced,
              )
              .toArray();

          const count =
            pendingSales.length;

          setPendingCount(
            count,
          );
        } catch (
          error
        ) {
          console.error(
            error,
          );
        }
      };

    loadPending();

    const interval =
      setInterval(
        loadPending,
        3000,
      );

    return () =>
      clearInterval(
        interval,
      );
  }, []);

  useEffect(() => {
    if (
      online &&
      pendingCount > 0
    ) {
      setSyncing(true);

      const timeout =
        setTimeout(() => {
          setSyncing(
            false,
          );
        }, 1500);

      return () =>
        clearTimeout(
          timeout,
        );
    }
  }, [
    online,
    pendingCount,
  ]);

  if (!online) {
    return (
      <div className="flex flex-col items-end">
        <Badge variant="danger">
          Offline
        </Badge>

        <span className="text-xs text-slate-500 mt-1">
          Sales cached locally
        </span>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="flex flex-col items-end">
        <Badge variant="warning">
          Syncing...
        </Badge>

        <span className="text-xs text-slate-500 mt-1">
          Uploading offline events
        </span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex flex-col items-end">
        <Badge variant="warning">
          Pending Sync (
          {
            pendingCount
          }
          )
        </Badge>

        <span className="text-xs text-slate-500 mt-1">
          Waiting for upload
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <Badge variant="success">
        Synced
      </Badge>

      <span className="text-xs text-slate-500 mt-1">
        All events uploaded
      </span>
    </div>
  );
}