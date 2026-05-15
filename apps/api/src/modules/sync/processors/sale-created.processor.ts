import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../../../common/prisma/prisma.service';

import {
  SyncEventProcessor,
} from './sync-event.processor';

@Injectable()
export class SaleCreatedProcessor
  implements SyncEventProcessor
{
  constructor(
    private prisma: PrismaService,
  ) {}

  async process(
    tenantId: string,
    payload: any,
  ): Promise<void> {
    const existingSale =
      await this.prisma.sale.findUnique({
        where: {
          id: payload.saleId,
        },
      });

    if (existingSale) {
      return;
    }

    await this.prisma.sale.create({
      data: {
        id: payload.saleId,

        tenantId,

        totalAmount:
          payload.totalAmount,

        discount:
          payload.discount || 0,

        finalAmount:
          payload.finalAmount,

        paymentStatus:
          payload.paymentStatus,
      },
    });
  }
}