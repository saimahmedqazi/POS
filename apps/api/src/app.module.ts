import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SyncModule } from './modules/sync/sync.module';
import { BullModule } from '@nestjs/bull';

import { ConfigModule } from '@nestjs/config';
import { ReportsModule } from './modules/reports/reports.module';


@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),

BullModule.forRoot({
  redis: {
    host:
      process.env.REDISHOST,

    port: Number(
      process.env.REDISPORT,
    ),

    password:
      process.env.REDISPASSWORD,
  },
}),

  PrismaModule,

  AuthModule,

  ProductsModule,

  InventoryModule,

  SalesModule,

  CustomersModule,

  LedgerModule,

  PaymentsModule,

  SyncModule,

  ReportsModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}