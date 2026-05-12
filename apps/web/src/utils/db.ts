import Dexie, {
  type Table,
} from 'dexie';

export type OfflineSale = {
  id?: number;

  payload: any;

  synced: boolean;

  serverSynced: boolean;

  createdAt: string;
};

export type CachedProduct = {
  id: string;

  name: string;

  salePrice: number;

  sku: string;

  barcode: string;
};

class PosDatabase extends Dexie {
  offlineSales!: Table<OfflineSale>;

  cachedProducts!: Table<CachedProduct>;

  constructor() {
    super('posDatabase');

    this.version(1).stores({
      offlineSales:
        '++id, synced, serverSynced, createdAt',

      cachedProducts:
        'id, name, sku, barcode',
    });
  }
}

export const db =
  new PosDatabase();