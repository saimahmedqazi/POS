import {
  Process,
  Processor,
} from '@nestjs/bull';

import type { Job } from 'bull';

import {
  SyncStatus,
} from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { ProcessorRegistry } from '../processors/processor-registry';

@Processor('sync-events')
export class SyncWorker {
  constructor(
    private processorRegistry: ProcessorRegistry,

    private prisma: PrismaService,
  ) {}

  @Process('process-event')
  async handleProcessEvent(
    job: Job<{
      eventId: string;

      tenantId: string;

      eventType: string;

      payload: any;
    }>,
  ) {
    const {
      eventId,

      tenantId,

      eventType,

      payload,
    } = job.data;

    try {
      const processor =
        this.processorRegistry.getProcessor(
          eventType,
        );

      if (!processor) {
        return;
      }

      await processor.process(
        tenantId,

        payload,
      );

      await this.prisma.syncEvent.update({
        where: {
          id: eventId,
        },

        data: {
          status:
            SyncStatus.SYNCED,

          syncedAt:
            new Date(),
        },
      });
    } catch (error: any) {
      await this.prisma.syncEvent.update({
        where: {
          id: eventId,
        },

        data: {
          retryCount: {
            increment: 1,
          },

          errorMessage:
            error.message,

          status:
            SyncStatus.FAILED,
        },
      });

      throw error;
    }
  }
}