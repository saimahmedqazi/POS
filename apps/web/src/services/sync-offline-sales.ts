import api from '../api/client';

import {
  db,
} from '../utils/db';

import {
  useAuthStore,
} from '../store/auth.store';

let syncing = false;

export async function syncOfflineSales() {
  if (syncing) {
    return;
  }

  if (!navigator.onLine) {
    return;
  }

  const token =
    useAuthStore.getState()
      .token;

  if (!token) {
    return;
  }

  syncing = true;

  try {
    console.log(
      'Starting offline sync...',
    );

    const pendingSales =
      await db.offlineSales
        .filter(
          (sale) =>
            !sale.serverSynced,
        )
        .toArray();

    console.log(
      'Pending sales:',
      pendingSales,
    );

    if (
      pendingSales.length === 0
    ) {
      return;
    }

    for (const sale of pendingSales) {
      try {
        console.log(
          'Syncing sale:',
          sale.id,
        );

        // DIRECT SALES API CALL
        await api.post(
          '/sales',
          sale.payload,
        );

        if (sale.id) {
          await db.offlineSales.update(
            sale.id,
            {
              synced: true,

              serverSynced:
                true,
            },
          );

          console.log(
            'Sale synced successfully:',
            sale.id,
          );
        }
      } catch (error) {
        console.error(
          'Failed syncing sale:',
          sale.id,
          error,
        );

        // DO NOT MARK AS SYNCED
        if (sale.id) {
          await db.offlineSales.update(
            sale.id,
            {
              synced: false,

              serverSynced:
                false,
            },
          );
        }
      }
    }

    console.log(
      'Offline sync complete',
    );
  } catch (error) {
    console.error(
      'Offline sync failed',
      error,
    );
  } finally {
    syncing = false;
  }
}