import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  LedgerEntryType,
  PaymentMethod,
} from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async recordPayment(
    tenantId: string,
    dto: CreatePaymentDto,
  ) {
    const customer =
      await this.prisma.customer.findFirst({
        where: {
          id: dto.customerId,
          tenantId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer not found',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const payment =
          await tx.payment.create({
            data: {
              tenantId,

              customerId:
                dto.customerId,

              amount: dto.amount,

              method:
                dto.method as PaymentMethod,

              note: dto.note,
            },
          });

        await tx.ledgerEntry.create({
          data: {
            tenantId,

            customerId:
              dto.customerId,

            type:
              LedgerEntryType.CREDIT,

            amount: dto.amount,

            referenceType:
              'PAYMENT',

            referenceId:
              payment.id,
          },
        });

        await tx.customer.update({
          where: {
            id: dto.customerId,
          },

          data: {
            currentBalance: {
              decrement:
                dto.amount,
            },
          },
        });

        return payment;
      },
    );
  }

  async findAll(
    tenantId: string,
  ) {
    return this.prisma.payment.findMany({
      where: {
        tenantId,
      },

      include: {
        customer: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}