export interface SyncEventProcessor {
  process(
    tenantId: string,
    payload: any,
  ): Promise<void>;
}