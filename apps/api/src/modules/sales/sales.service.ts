import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  InventoryMovementType,
  LedgerEntryType,
  PaymentStatus,
} from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createSale(
    tenantId: string,
    dto: CreateSaleDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        let totalAmount = 0;

        for (const item of dto.items) {
          const inventory =
            await tx.inventory.findFirst({
              where: {
                tenantId,

                productId: item.productId,
              },
            });

          if (!inventory) {
            throw new BadRequestException(
              'Inventory not found',
            );
          }

          if (
            inventory.quantity <
            item.quantity
          ) {
            throw new BadRequestException(
              'Insufficient stock',
            );
          }

          totalAmount +=
            item.quantity *
            item.unitPrice;
        }

        const finalAmount =
          totalAmount - dto.discount;

        const sale =
          await tx.sale.create({
            data: {
  tenantId,

  customerId:
    dto.customerId,

  totalAmount,

  discount: dto.discount,

  finalAmount,

  paymentStatus:
    dto.paymentStatus as PaymentStatus,
},
          });

        for (const item of dto.items) {
          const subtotal =
            item.quantity *
            item.unitPrice;

          await tx.saleItem.create({
            data: {
              tenantId,

              saleId: sale.id,

              productId: item.productId,

              quantity: item.quantity,

              unitPrice: item.unitPrice,

              subtotal,
            },
          });

          await tx.inventory.update({
            where: {
              tenantId_productId: {
                tenantId,

                productId:
                  item.productId,
              },
            },

            data: {
              quantity: {
                decrement:
                  item.quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              tenantId,

              productId:
                item.productId,

              type:
                InventoryMovementType.SALE,

              quantityChange:
                -item.quantity,

              referenceType: 'SALE',

              referenceId: sale.id,
            },
          });
        }
if (
  dto.paymentStatus ===
    PaymentStatus.CREDIT &&
  dto.customerId
) {
  await tx.ledgerEntry.create({
    data: {
      tenantId,

      customerId:
        dto.customerId,

      type:
        LedgerEntryType.DEBIT,

      amount:
        finalAmount,

      referenceType:
        'SALE',

      referenceId:
        sale.id,
    },
  });

  await tx.customer.update({
    where: {
      id: dto.customerId,
    },

    data: {
      currentBalance: {
        increment:
          finalAmount,
      },
    },
  });
}
        return sale;
      },
    );
  }

  async findAll(
    tenantId: string,
  ) {
    return this.prisma.sale.findMany({
      where: {
        tenantId,
      },

      include: {
  customer: true,

  items: {
    include: {
      product: true,
    },
  },
},
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}