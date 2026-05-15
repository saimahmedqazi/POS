import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async create(
    tenantId: string,
    dto: CreateProductDto,
  ) {
    try {
      return await this.prisma.product.create({
        data: {
          tenantId,

          name: dto.name,

          barcode:
            dto.barcode,

          sku: dto.sku,

          salePrice:
            dto.salePrice,

          costPrice:
            dto.costPrice,
        },
      });
    } catch (
    error: any
    ) {
      if (
        error.code ===
        'P2002'
      ) {
        throw new BadRequestException(
          'SKU or barcode already exists',
        );
      }

      throw error;
    }
  }

  async findAll(
    tenantId: string,
  ) {
    return this.prisma.product.findMany({
      where: {
        tenantId,

        isArchived: false,

        deletedAt: null,
      },

      include: {
        inventory: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async update(
    tenantId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    try {
      return await this.prisma.product.update({
        where: {
          id: productId,

          tenantId,
        },

        data: {
          ...dto,
        },
      });
    } catch (
    error: any
    ) {
      if (
        error.code ===
        'P2002'
      ) {
        throw new BadRequestException(
          'SKU or barcode already exists',
        );
      }

      throw error;
    }
  }
  async archive(
  tenantId: string,
  productId: string,
) {
  return this.prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      isArchived: true,

      deletedAt:
        new Date(),
    },
  });
}
}