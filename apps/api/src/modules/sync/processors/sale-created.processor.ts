import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../../../common/prisma/prisma.service';

import {
  SyncEventProcessor,
} from './sync-event.processor';

import {
  SalesService,
} from '../../sales/sales.service';

@Injectable()
export class SaleCreatedProcessor
  implements SyncEventProcessor
{
  constructor(
    private prisma: PrismaService,

    private salesService: SalesService,
  ) {}

  async process(
    tenantId: string,
    payload: any,
  ): Promise<void> {
    const existingSale =
      await this.prisma.sale.findUnique({
        where: {
          id:
            payload.saleId,
        },
      });

    if (existingSale) {
      return;
    }

    await this.salesService.createSale(
      tenantId,
      {
        customerId:
          payload.customerId,

        items:
          payload.items || [],

        discount:
          payload.discount || 0,

        paymentStatus:
          payload.paymentStatus,
      },
    );
  }
}