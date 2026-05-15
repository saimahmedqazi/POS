import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InventoryMovementType,
} from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

import {
  AdjustInventoryDto,
} from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async adjustStock(
    tenantId: string,
    dto: AdjustInventoryDto,
  ) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id: dto.productId,
          tenantId,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const inventory =
      await this.prisma.inventory.upsert({
        where: {
          tenantId_productId: {
            tenantId,
            productId: dto.productId,
          },
        },

        update: {
          quantity: {
            increment: dto.quantity,
          },
        },

        create: {
          tenantId,

          productId: dto.productId,

          quantity: dto.quantity,
        },
      });

    await this.prisma.inventoryMovement.create({
      data: {
        tenantId,

        productId: dto.productId,

        type:
          dto.type as InventoryMovementType,

        quantityChange: dto.quantity,

        referenceType: dto.referenceType,

        referenceId: dto.referenceId,
      },
    });

    return inventory;
  }

  async getInventory(
    tenantId: string,
  ) {
    return this.prisma.inventory.findMany({
      where: {
        tenantId,
      },

      include: {
        product: true,
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getMovements(
    tenantId: string,
  ) {
    return this.prisma.inventoryMovement.findMany({
      where: {
        tenantId,
      },

      include: {
        product: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}