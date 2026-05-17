import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../../common/prisma/prisma.service';

import {
  CreateProductDto,
} from './dto/create-product.dto';

import {
  UpdateProductDto,
} from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateProductDto,
  ) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const product =
            await tx.product.create({
              data: {
                tenantId,

                name:
                  dto.name.trim(),

                barcode:
                  dto.barcode?.trim() ||
                  null,

                sku:
                  dto.sku?.trim() ||
                  null,

                salePrice:
                  Number(
                    dto.salePrice,
                  ),

                costPrice:
                  Number(
                    dto.costPrice,
                  ),
              },
            });

          // AUTO CREATE INVENTORY ROW
          await tx.inventory.create({
            data: {
              tenantId,

              productId:
                product.id,

              quantity: 0,
            },
          });

          return tx.product.findUnique({
            where: {
              id: product.id,
            },

            include: {
              inventory: true,
            },
          });
        },
      );
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
        createdAt:
          'desc',
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
          ...(dto.name && {
            name:
              dto.name.trim(),
          }),

          ...(dto.barcode !==
            undefined && {
            barcode:
              dto.barcode?.trim() ||
              null,
          }),

          ...(dto.sku !==
            undefined && {
            sku:
              dto.sku?.trim() ||
              null,
          }),

          ...(dto.salePrice !==
            undefined && {
            salePrice:
              Number(
                dto.salePrice,
              ),
          }),

          ...(dto.costPrice !==
            undefined && {
            costPrice:
              Number(
                dto.costPrice,
              ),
          }),
        },

        include: {
          inventory: true,
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

        tenantId,
      },

      data: {
        isArchived: true,

        deletedAt:
          new Date(),
      },
    });
  }
}