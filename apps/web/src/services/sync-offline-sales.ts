import api from '../api/client';

import {
  db,
} from '../utils/db';

import {
  useAuthStore,
} from '../store/auth.store';

let syncing = false;

export async function syncOfflineSales() {
  // prevent duplicate runs
  if (syncing) {
    return;
  }

  // must be online
  if (
    !navigator.onLine
  ) {
    return;
  }

  // must have token
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
      syncing = false;

      return;
    }

    for (const sale of pendingSales) {
      try {
        const event = {
          eventId:
            crypto.randomUUID(),

          eventType:
            'SALE_CREATED',

          payload:
            sale.payload,

          deviceId:
            'POS-WEB',
        };

        console.log(
          'Syncing event:',
          event,
        );

        await api.post(
          '/sync/push',
          {
            events: [
              event,
            ],
          },
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
            'Sale synced:',
            sale.id,
          );
        }
      } catch (error) {
        console.error(
          'Failed syncing sale:',
          sale.id,
          error,
        );
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