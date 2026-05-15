import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getDailySales(
    tenantId: string,
  ) {
    const startOfDay =
      new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0,
    );

    const endOfDay =
      new Date();

    endOfDay.setHours(
      23,
      59,
      59,
      999,
    );

    const sales =
      await this.prisma.sale.findMany({
        where: {
          tenantId,

          createdAt: {
            gte:
              startOfDay,

            lte:
              endOfDay,
          },
        },
      });

    const totalRevenue =
      sales.reduce(
        (
          sum,
          sale,
        ) =>
          sum +
          sale.finalAmount,

        0,
      );

    const totalTransactions =
      sales.length;

    const averageOrderValue =
      totalTransactions > 0
        ? totalRevenue /
          totalTransactions
        : 0;

    return {
      date:
        startOfDay,

      totalRevenue,

      totalTransactions,

      averageOrderValue,
    };
  }

  async getInventoryValuation(
    tenantId: string,
  ) {
    const inventory =
      await this.prisma.inventory.findMany({
        where: {
          tenantId,
        },

        include: {
          product: true,
        },
      });

    const totalQuantity =
      inventory.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.quantity,

        0,
      );

    const totalCostValue =
      inventory.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.quantity *
            item.product.costPrice,

        0,
      );

    const totalSaleValue =
      inventory.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.quantity *
            item.product.salePrice,

        0,
      );

    const estimatedProfit =
      totalSaleValue -
      totalCostValue;

    return {
      totalQuantity,

      totalCostValue,

      totalSaleValue,

      estimatedProfit,
    };
  }

async getTopProducts(
  tenantId: string,
) {
  const topProducts =
    await this.prisma.saleItem.groupBy({
      by: ['productId'],

      where: {
        sale: {
          tenantId,
        },
      },

      _sum: {
        quantity: true,

        subtotal: true,
      },

      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },

      take: 10,
    });

  const productIds =
    topProducts.map(
      (item) =>
        item.productId,
    );

  const products =
    await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },

      select: {
        id: true,

        name: true,
      },
    });

  return topProducts.map(
    (item) => {
      const product =
        products.find(
          (p) =>
            p.id ===
            item.productId,
        );

      return {
        productId:
          item.productId,

        productName:
          product?.name ||
          'Unknown Product',

        totalQuantitySold:
          item._sum
            ?.quantity || 0,

        totalRevenue:
          item._sum
            ?.subtotal || 0,
      };
    },
  );
}
  async getProfitSummary(
    tenantId: string,
  ) {
    const saleItems =
      await this.prisma.saleItem.findMany({
        where: {
          tenantId,
        },

        include: {
          product: true,
        },
      });

    const totalRevenue =
      saleItems.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.subtotal,

        0,
      );

    const totalCost =
      saleItems.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.quantity *
            item.product.costPrice,

        0,
      );

    const grossProfit =
      totalRevenue -
      totalCost;

    const profitMargin =
      totalRevenue > 0
        ? (
            grossProfit /
            totalRevenue
          ) * 100
        : 0;

    return {
      totalRevenue,

      totalCost,

      grossProfit,

      profitMargin:
        Number(
          profitMargin.toFixed(
            2,
          ),
        ),
    };
  }

  async getCustomerBalances(
    tenantId: string,
  ) {
    const customers =
      await this.prisma.customer.findMany({
        where: {
          tenantId,
        },

        orderBy: {
          currentBalance:
            'desc',
        },
      });

    return customers.map(
      (
        customer,
      ) => ({
        customerId:
          customer.id,

        customerName:
          customer.name,

        currentBalance:
          customer.currentBalance,

        creditLimit:
          customer.creditLimit,

        balanceUtilization:
          customer.creditLimit > 0
            ? Number(
                (
                  (customer.currentBalance /
                    customer.creditLimit) *
                  100
                ).toFixed(2),
              )
            : 0,
      }),
    );
  }
}