import { Module } from '@nestjs/common';

import { SyncController } from './sync.controller';

import { SyncService } from './sync.service';

import { PrismaModule } from '../../common/prisma/prisma.module';

import { SaleCreatedProcessor } from './processors/sale-created.processor';

import { ProcessorRegistry } from './processors/processor-registry';

import { BullModule } from '@nestjs/bull';

import { SyncWorker } from './workers/sync.worker';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
  name: 'sync-events',
}),
  ],

  controllers: [
    SyncController,
  ],

  providers: [
  SyncService,

  SaleCreatedProcessor,

  ProcessorRegistry,

  SyncWorker,
],
})
export class SyncModule {}