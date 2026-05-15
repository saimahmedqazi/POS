import { Injectable } from '@nestjs/common';

import {
  SyncStatus,
} from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

import { PushSyncDto } from './dto/push-sync.dto';

import { ProcessorRegistry } from './processors/processor-registry';

import { InjectQueue } from '@nestjs/bull';

import type { Queue } from 'bull';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,

    private processorRegistry: ProcessorRegistry,

    @InjectQueue('sync-events')
    private syncQueue: Queue,
  ) {}

  async pushEvents(
    tenantId: string,
    dto: PushSyncDto,
  ) {
    const results: {
      eventId: string;
      status: string;
    }[] = [];

    for (const event of dto.events) {
      const existingEvent =
        await this.prisma.syncEvent.findUnique({
          where: {
            id: event.eventId,
          },
        });

      if (existingEvent) {
        results.push({
          eventId: event.eventId,

          status: 'IGNORED_DUPLICATE',
        });

        continue;
      }

      const createdEvent =
        await this.prisma.syncEvent.create({
          data: {
            id: event.eventId,

            tenantId,

            eventType:
              event.eventType,

            payload:
              event.payload,

            deviceId:
              event.deviceId,

            status:
              SyncStatus.PENDING,
          },
        });

      await this.syncQueue.add(
        'process-event',
        {
          eventId:
            createdEvent.id,

          tenantId,

          eventType:
            event.eventType,

          payload:
            event.payload,
        },
        {
          attempts: 5,

          backoff: {
            type: 'exponential',

            delay: 3000,
          },

          removeOnComplete: true,

          removeOnFail: false,
        },
      );

      results.push({
        eventId:
          createdEvent.id,

        status: 'QUEUED',
      });
    }

    return {
      success: true,

      results,
    };
  }

  async getPendingEvents(
    tenantId: string,
  ) {
    return this.prisma.syncEvent.findMany({
      where: {
        tenantId,

        status:
          SyncStatus.PENDING,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}