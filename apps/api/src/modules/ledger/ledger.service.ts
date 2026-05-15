import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  LedgerEntryType,
} from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';

@Injectable()
export class LedgerService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createEntry(
    tenantId: string,
    dto: CreateLedgerEntryDto,
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

    const entry =
      await this.prisma.ledgerEntry.create({
        data: {
          tenantId,

          customerId: dto.customerId,

          type:
            dto.type as LedgerEntryType,

          amount: dto.amount,

          referenceType:
            dto.referenceType,

          referenceId:
            dto.referenceId,
        },
      });

    const balanceChange =
      dto.type === 'DEBIT'
        ? dto.amount
        : -dto.amount;

    await this.prisma.customer.update({
      where: {
        id: dto.customerId,
      },

      data: {
        currentBalance: {
          increment: balanceChange,
        },
      },
    });

    return entry;
  }

  async getCustomerLedger(
    tenantId: string,
    customerId: string,
  ) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        tenantId,
        customerId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async findAll(
  tenantId: string,
) {
  return this.prisma.ledgerEntry.findMany({
    where: {
      tenantId,
    },

    include: {
      customer: {
        select: {
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}
}

